import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { Mic, MicOff, Play, Square, Loader2, Award, FileText, CheckCircle, AlertTriangle, Activity } from 'lucide-react';

const VoiceInterview = () => {
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Voice State
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  
  // Metrics State
  const [startTime, setStartTime] = useState(null);
  const [fillerCount, setFillerCount] = useState(0);
  const [wpm, setWpm] = useState(0);

  // Chat/Feedback History
  const [turns, setTurns] = useState([]);
  const [evaluating, setEvaluating] = useState(false);

  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  useEffect(() => {
    fetchResumes();
    setupSpeechRecognition();
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      synthRef.current.cancel();
    };
  }, []);

  const fetchResumes = async () => {
    try {
      const res = await api.get('/resumes/');
      setResumes(res.data);
      if (res.data.length > 0) {
        setSelectedResumeId(res.data[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch resumes', error);
    } finally {
      setLoading(false);
    }
  };

  const setupSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support the Web Speech API. Please use Google Chrome.");
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let finalStr = '';
      let interimStr = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalStr += event.results[i][0].transcript;
        } else {
          interimStr += event.results[i][0].transcript;
        }
      }
      if (finalStr) {
        setTranscript(prev => prev + ' ' + finalStr);
        countFillers(finalStr);
      }
      setInterimTranscript(interimStr);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      // If we stop it manually, isListening will be false. 
      // If it stops automatically, we should update state.
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  };

  const countFillers = (text) => {
    const fillerWords = ['um', 'uh', 'like', 'you know', 'basically', 'actually', 'literally'];
    let count = 0;
    const words = text.toLowerCase().split(/\s+/);
    words.forEach(word => {
      if (fillerWords.includes(word.replace(/[^a-z]/g, ''))) {
        count++;
      }
    });
    setFillerCount(prev => prev + count);
  };

  const startSession = async () => {
    setLoading(true);
    try {
      const res = await api.post('/voice/start', { resume_id: selectedResumeId || null });
      setSession(res.data);
      
      const history = JSON.parse(res.data.history_json || '[]');
      if (history.length > 0) {
        const firstMsg = history[0].content;
        setTurns([{ type: 'ai', content: firstMsg }]);
        speakText(firstMsg);
      }
    } catch (error) {
      console.error("Failed to start session", error);
      alert("Error starting voice session.");
    } finally {
      setLoading(false);
    }
  };

  const speakText = (text) => {
    if (synthRef.current.speaking) {
      synthRef.current.cancel();
    }
    const utterance = new SpeechSynthesisUtterance(text);
    // Try to find a good English voice
    const voices = synthRef.current.getVoices();
    const voice = voices.find(v => v.lang === 'en-US' && v.name.includes('Google')) || voices[0];
    if (voice) utterance.voice = voice;
    utterance.rate = 1.0;
    synthRef.current.speak(utterance);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListeningAndSubmit();
    } else {
      startListening();
    }
  };

  const startListening = () => {
    setTranscript('');
    setInterimTranscript('');
    setFillerCount(0);
    setStartTime(Date.now());
    
    // Stop AI speaking if it still is
    synthRef.current.cancel();

    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (e) {
      console.error(e);
    }
  };

  const stopListeningAndSubmit = async () => {
    recognitionRef.current.stop();
    setIsListening(false);

    const finalFullText = (transcript + ' ' + interimTranscript).trim();
    if (!finalFullText) return;

    // Calculate WPM
    const durationMinutes = (Date.now() - startTime) / 60000;
    const wordCount = finalFullText.split(/\s+/).length;
    const calculatedWpm = durationMinutes > 0 ? Math.round(wordCount / durationMinutes) : 0;
    setWpm(calculatedWpm);

    // Add user turn to UI immediately
    setTurns(prev => [...prev, { type: 'user', content: finalFullText, wpm: calculatedWpm, fillers: fillerCount }]);
    
    setEvaluating(true);
    try {
      const res = await api.post('/voice/evaluate', {
        session_id: session.id,
        transcript: finalFullText,
        wpm: calculatedWpm,
        filler_count: fillerCount
      });

      const { feedback, confidence_score, next_question } = res.data;
      
      setTurns(prev => [...prev, { 
        type: 'feedback', 
        feedback, 
        score: confidence_score 
      }, {
        type: 'ai',
        content: next_question
      }]);

      speakText(next_question);

    } catch (error) {
      console.error("Failed to evaluate", error);
      setTurns(prev => [...prev, { type: 'feedback', feedback: "Error evaluating response.", score: 0 }]);
    } finally {
      setEvaluating(false);
      setTranscript('');
      setInterimTranscript('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 font-sans flex flex-col">
      <Navbar />
      
      <main className="max-w-7xl mx-auto w-full flex-grow p-4 sm:p-6 lg:p-8 flex flex-col h-[calc(100vh-64px)]">
        
        {!session ? (
          <div className="bg-white/70 backdrop-blur-xl dark:bg-slate-900/60 p-8 rounded-2xl shadow-sm border border-white/50 dark:border-white/10 max-w-2xl mx-auto w-full mt-10">
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mb-4">
                <Mic className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Voice Mock Interview</h2>
              <p className="text-slate-500 dark:text-slate-400">Practice your speaking skills with real-time AI feedback on your pace, filler words, and confidence.</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center mb-2">
                  <FileText className="w-4 h-4 mr-2 text-indigo-500 dark:text-indigo-400" /> Select Resume Context (Optional)
                </label>
                {loading ? (
                  <div className="p-3 border rounded-xl flex items-center justify-center"><Loader2 className="animate-spin text-indigo-500 dark:text-indigo-400" /></div>
                ) : (
                  <select 
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/70 backdrop-blur-xl dark:bg-slate-900/60"
                  >
                    <option value="">General Interview (No Resume)</option>
                    {resumes.map(r => (
                      <option key={r.id} value={r.id}>{r.filename}</option>
                    ))}
                  </select>
                )}
              </div>
              
              <button
                onClick={startSession}
                disabled={loading}
                className="w-full bg-indigo-600 text-white font-bold rounded-xl py-4 hover:bg-indigo-700 transition-colors shadow-md flex items-center justify-center text-lg"
              >
                <Play className="w-5 h-5 mr-2" /> Start Voice Session
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full bg-white/70 backdrop-blur-xl dark:bg-slate-900/60 rounded-2xl shadow-sm border border-white/50 dark:border-white/10 overflow-hidden relative">
            
            {/* Header */}
            <div className="p-4 bg-slate-900 dark:bg-slate-900/90 text-white flex justify-between items-center shrink-0 z-10 shadow-md">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-3"></div>
                <h3 className="font-bold">Live Interview Session</h3>
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <span className="flex items-center bg-slate-800 dark:bg-slate-800/80 px-3 py-1 rounded-md">
                  <Activity className="w-4 h-4 text-emerald-400 mr-2" />
                  WPM: <span className="font-mono ml-1 font-bold">{isListening ? (Date.now() - startTime > 5000 ? Math.round((transcript.split(/\s+/).length) / ((Date.now() - startTime) / 60000)) : 0) : wpm}</span>
                </span>
                <span className="flex items-center bg-slate-800 dark:bg-slate-800/80 px-3 py-1 rounded-md">
                  <AlertTriangle className="w-4 h-4 text-amber-400 mr-2" />
                  Fillers: <span className="font-mono ml-1 font-bold text-amber-400">{fillerCount}</span>
                </span>
              </div>
            </div>

            {/* Chat/Transcript Area */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
              {turns.map((turn, idx) => (
                <div key={idx} className={`flex flex-col ${turn.type === 'user' ? 'items-end' : 'items-start'}`}>
                  
                  {turn.type === 'ai' && (
                    <div className="max-w-[80%] flex flex-col">
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1 ml-1 uppercase tracking-wider">Interviewer</span>
                      <div className="bg-white/70 backdrop-blur-xl dark:bg-slate-900/60 p-4 rounded-2xl rounded-tl-sm border border-white/50 dark:border-white/10 shadow-sm text-slate-800 dark:text-slate-100 leading-relaxed text-lg">
                        {turn.content}
                      </div>
                    </div>
                  )}

                  {turn.type === 'user' && (
                    <div className="max-w-[80%] flex flex-col items-end">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 mr-1 uppercase tracking-wider">You Said</span>
                      <div className="bg-indigo-600 text-white p-4 rounded-2xl rounded-tr-sm shadow-sm leading-relaxed text-lg">
                        "{turn.content}"
                      </div>
                      <div className="flex text-xs text-slate-400 mt-2 space-x-3 font-mono">
                        <span>Speed: {turn.wpm} WPM</span>
                        <span>Fillers: {turn.fillers}</span>
                      </div>
                    </div>
                  )}

                  {turn.type === 'feedback' && (
                    <div className="max-w-[90%] w-full mx-auto mt-4 mb-8">
                      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-3 border-b border-emerald-200/50 pb-3">
                          <h4 className="font-bold text-emerald-800 flex items-center">
                            <Award className="w-5 h-5 mr-2 text-emerald-600 dark:text-emerald-400" /> AI Evaluation
                          </h4>
                          <div className="flex items-center bg-white/70 backdrop-blur-xl dark:bg-slate-900/60 px-3 py-1 rounded-full border border-emerald-100 shadow-sm">
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase mr-2">Confidence</span>
                            <span className="text-lg font-black text-emerald-700 dark:text-emerald-300">{turn.score}%</span>
                          </div>
                        </div>
                        <p className="text-emerald-900 text-sm leading-relaxed">{turn.feedback}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {/* Active Listening Indicator */}
              {isListening && (
                <div className="flex flex-col items-end animate-in fade-in slide-in-from-bottom-4 duration-300">
                   <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 mr-1 uppercase tracking-wider flex items-center">
                     <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
                     Recording...
                   </span>
                   <div className="bg-indigo-600/10 border border-indigo-200 text-indigo-900 p-4 rounded-2xl rounded-tr-sm shadow-sm leading-relaxed text-lg max-w-[80%]">
                     {transcript} <span className="text-indigo-400">{interimTranscript}</span>
                     <span className="inline-block w-2 h-5 ml-1 bg-indigo-500 animate-pulse align-middle"></span>
                   </div>
                </div>
              )}
              
              {evaluating && (
                <div className="flex items-center text-slate-500 dark:text-slate-400 font-medium p-4">
                  <Loader2 className="w-5 h-5 animate-spin mr-3 text-indigo-500 dark:text-indigo-400" /> AI is evaluating your response...
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="p-6 bg-white/70 backdrop-blur-xl dark:bg-slate-900/60 border-t border-white/50 dark:border-white/10 shrink-0 flex flex-col items-center justify-center">
              <button
                onClick={toggleListening}
                disabled={evaluating}
                className={`group relative flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300 shadow-lg ${
                  isListening 
                    ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30 ring-4 ring-red-100' 
                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isListening ? (
                  <Square className="w-8 h-8 text-white fill-current" />
                ) : (
                  <Mic className="w-8 h-8 text-white" />
                )}
                
                {/* Ping animation when listening */}
                {isListening && (
                  <div className="absolute inset-0 rounded-full border-4 border-red-500 opacity-20 animate-ping"></div>
                )}
              </button>
              
              <p className="mt-4 font-semibold text-slate-600 dark:text-slate-400">
                {isListening ? 'Tap to Stop & Evaluate' : 'Tap to Answer'}
              </p>
            </div>

          </div>
        )}
      </main>
    </div>
  );
};

export default VoiceInterview;
