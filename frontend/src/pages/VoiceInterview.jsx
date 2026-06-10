import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { Mic, Play, Square, Loader2, FileText, CheckCircle, AlertTriangle, Activity, Volume2, VolumeX, Sparkles } from 'lucide-react';

const MiniRadialGauge = ({ value, max, label, color = "stroke-purple-500" }) => {
  const radius = 35;
  const stroke = 5;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const val = Math.min(value, max);
  const strokeDashoffset = circumference - (val / max) * circumference;

  return (
    <div className="flex flex-col items-center justify-center relative">
      <svg height={radius * 2} width={radius * 2} className="transform -rotate-90 filter drop-shadow-[0_0_4px_rgba(168,85,247,0.2)]">
        <circle
          className="stroke-slate-200/50 dark:stroke-slate-800/40"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          className={color}
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease-in-out' }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-[10px] font-black text-slate-800 dark:text-white">{value}</span>
        <span className="text-[6px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          {label}
        </span>
      </div>
    </div>
  );
};

const VoiceInterview = () => {
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Voice State
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  
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
    if (isMuted) return;
    if (synthRef.current.speaking) {
      synthRef.current.cancel();
    }
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = synthRef.current.getVoices();
    const voice = voices.find(v => v.lang === 'en-US' && v.name.includes('Google')) || voices[0];
    if (voice) utterance.voice = voice;
    utterance.rate = 1.05;
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
    synthRef.current.cancel();

    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (e) {
      console.error(e);
    }
  };

  const stopListeningAndSubmit = async () => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    setIsListening(false);

    const finalFullText = (transcript + ' ' + interimTranscript).trim();
    if (!finalFullText) return;

    const durationMinutes = (Date.now() - startTime) / 60000;
    const wordCount = finalFullText.split(/\s+/).length;
    const calculatedWpm = durationMinutes > 0 ? Math.round(wordCount / durationMinutes) : 125;
    setWpm(calculatedWpm);

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
      setTurns(prev => [...prev, { type: 'feedback', feedback: "Failed to evaluate speech response. Please try again.", score: 0 }]);
    } finally {
      setEvaluating(false);
      setTranscript('');
      setInterimTranscript('');
    }
  };

  const endSessionManually = () => {
    if (window.confirm("Do you want to end this voice session?")) {
      synthRef.current.cancel();
      setSession(null);
      setTurns([]);
      setWpm(0);
      setFillerCount(0);
    }
  };

  const lastUserTurn = turns.filter(t => t.type === 'user').pop();

  return (
    <div className="min-h-screen flex flex-col bg-[#05060b] text-slate-100 font-sans">
      <Navbar />
      
      <main className="max-w-6xl mx-auto w-full flex-grow p-6 lg:p-8 flex flex-col overflow-hidden md:h-[calc(100vh-80px)]">
        
        {!session ? (
          /* Start Screen Layout */
          <div className="glass-panel p-8 max-w-xl mx-auto w-full mt-12 shadow-2xl relative overflow-hidden bg-gradient-to-br from-purple-950/5 via-[#0d1020]/95 to-cyan-950/5 backdrop-blur-xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500"></div>
            
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-purple-500/10 rounded-3xl flex items-center justify-center mb-6 border border-purple-500/20 shadow-md">
                <Mic className="w-8 h-8 text-purple-400 filter drop-shadow-[0_0_4px_rgba(168,85,247,0.4)]" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Voice Mock Interview</h2>
              <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed font-light">
                Practice speech fluency, control your pace, eliminate filler words, and gain interview confidence with real-time AI audio feedback.
              </p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center mb-2">
                  <FileText className="w-4 h-4 mr-2 text-purple-400" /> Select Resume Context (Optional)
                </label>
                {loading ? (
                  <div className="p-3 border border-white/5 rounded-xl flex items-center justify-center"><Loader2 className="animate-spin text-purple-500" /></div>
                ) : (
                  <select 
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    className="glass-input w-full py-3 text-xs font-bold"
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
                className="glass-button w-full flex items-center justify-center py-4 text-base shadow-lg shadow-purple-500/25"
              >
                <Play className="w-5 h-5 mr-2" /> Start Voice Session
              </button>
            </div>
          </div>
        ) : (
          /* Live Screen Layout */
          <div className="flex-grow glass-panel flex flex-col overflow-hidden relative md:h-full bg-gradient-to-b from-[#0d1020]/40 to-[#05060b]/40">
            
            {/* Top Dashboard Bar */}
            <div className="p-4 bg-slate-950/70 border-b border-white/5 flex justify-between items-center z-10 shadow-sm shrink-0">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-300">Live Interview telemetry</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className="flex items-center bg-white/5 px-3 py-1.5 rounded-xl border border-white/5 text-xs font-bold font-mono">
                  <Activity className="w-4 h-4 text-cyan-400 mr-1.5" />
                  WPM: {isListening ? '...' : wpm}
                </span>
                <span className="flex items-center bg-white/5 px-3 py-1.5 rounded-xl border border-white/5 text-xs font-bold font-mono">
                  <AlertTriangle className="w-4 h-4 text-amber-500 mr-1.5" />
                  Fillers: {fillerCount}
                </span>
              </div>
            </div>

            {/* Content Body: Left Visual and Right Transcript Panels */}
            <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
              
              {/* Left Column: Visual Wave Sphere */}
              <div className="flex-grow flex flex-col items-center justify-center p-8 border-b md:border-b-0 md:border-r border-white/5 bg-black/10">
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 mb-8">
                  {isListening ? 'Active Coach: Listening' : evaluating ? 'Active Coach: Evaluating' : 'Active Coach: Speaking'}
                </span>
                
                {/* Wave Sphere */}
                <div className="relative flex items-center justify-center">
                  <div className={`w-40 h-40 rounded-full flex items-center justify-center transition-all duration-500 ${isListening ? 'voice-wave-active' : 'voice-wave-sphere'}`}>
                    <Mic className={`w-10 h-10 transition-all ${isListening ? 'text-cyan-400 scale-110' : 'text-purple-400'}`} />
                  </div>
                  
                  {/* Outer Ripple Rings */}
                  {isListening && (
                    <>
                      <div className="absolute inset-[-10px] rounded-full border border-cyan-500/30 blur-[2px] animate-ping opacity-60"></div>
                      <div className="absolute inset-[-25px] rounded-full border border-purple-500/20 blur-[4px] animate-ping opacity-30" style={{ animationDelay: '0.4s' }}></div>
                    </>
                  )}
                  {evaluating && (
                    <div className="absolute inset-[-5px] rounded-full border border-dashed border-purple-500/30 animate-spin"></div>
                  )}
                </div>

                <p className="mt-8 text-xs font-bold text-slate-400 uppercase tracking-wider text-center max-w-xs leading-normal">
                  {isListening ? 'Speak clearly into your microphone' : evaluating ? 'AI coach is evaluating your response...' : 'AI coach is speaking...'}
                </p>
              </div>

              {/* Right Column: Transcript & Metrics summary */}
              <div className="w-full md:w-1/3 flex flex-col overflow-hidden h-[300px] md:h-full bg-slate-950/20">
                
                {/* Transcript panel */}
                <div className="flex-grow overflow-y-auto p-4 space-y-4 border-b border-white/5">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 block mb-2">Real-time Transcript</span>
                  
                  {turns.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No responses recorded yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {turns.map((turn, i) => {
                        if (turn.type === 'ai') {
                          return (
                            <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/5 text-[11px] leading-relaxed">
                              <span className="font-extrabold text-purple-400 block mb-1">Coach:</span>
                              "{turn.content}"
                            </div>
                          );
                        }
                        if (turn.type === 'user') {
                          return (
                            <div key={i} className="bg-purple-500/10 p-3 rounded-xl border border-purple-500/20 text-[11px] leading-relaxed">
                              <span className="font-extrabold text-purple-400 block mb-1">You:</span>
                              "{turn.content}"
                              <span className="block mt-1 font-mono text-[8px] text-slate-500">Pace: {turn.wpm} WPM • Fillers: {turn.fillers}</span>
                            </div>
                          );
                        }
                        if (turn.type === 'feedback') {
                          return (
                            <div key={i} className="bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/20 text-[11px] leading-relaxed">
                              <span className="font-extrabold text-emerald-400 block mb-1 flex items-center">
                                <Sparkles className="w-3 h-3 mr-1 text-emerald-400" /> Evaluation ({turn.score}%):
                              </span>
                              {turn.feedback}
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  )}
                  {isListening && (
                    <div className="text-[11px] text-slate-300 italic animate-pulse">
                      <span className="font-extrabold text-cyan-400 block mb-1">Transcribing...</span>
                      "{transcript} {interimTranscript}"
                    </div>
                  )}
                </div>

                {/* Post-interview Summary */}
                <div className="p-4 bg-slate-950/45 shrink-0">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 block mb-3">Telemetry Averages</span>
                  <div className="flex justify-around items-center gap-4">
                    <MiniRadialGauge 
                      value={lastUserTurn ? lastUserTurn.wpm : wpm} 
                      max={200} 
                      label="WPM" 
                      color="stroke-cyan-500" 
                    />
                    <MiniRadialGauge 
                      value={lastUserTurn ? lastUserTurn.fillers : fillerCount} 
                      max={10} 
                      label="Fillers" 
                      color="stroke-purple-500" 
                    />
                  </div>
                </div>

              </div>

            </div>

            {/* Bottom Controls */}
            <div className="p-4 bg-white/5 border-t border-white/5 flex items-center justify-between shrink-0">
              
              {/* Mute toggle */}
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
                  isMuted 
                    ? 'bg-rose-500/20 border-rose-500/30 text-rose-500' 
                    : 'bg-white/5 border-white/5 hover:bg-white/10'
                }`}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span>{isMuted ? 'Muted' : 'Mute Voice'}</span>
              </button>

              {/* Mic Main Toggle */}
              <button
                onClick={toggleListening}
                disabled={evaluating}
                className={`px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center transition-all disabled:opacity-40 ${
                  isListening 
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-500/25 scale-95' 
                    : 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/25'
                }`}
              >
                {isListening ? (
                  <>
                    <Square className="w-4 h-4 mr-2 fill-current" />
                    <span>Done Speaking</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 mr-2" />
                    <span>Start Talking</span>
                  </>
                )}
              </button>

              {/* End Session */}
              <button
                onClick={endSessionManually}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-white/5 hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/20 transition-colors"
              >
                End Session
              </button>

            </div>

          </div>
        )}
      </main>
    </div>
  );
};

export default VoiceInterview;
