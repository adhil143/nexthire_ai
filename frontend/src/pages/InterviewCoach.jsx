import { useState, useEffect, useRef, useMemo } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { Send, Bot, FileText, Loader2, Plus, MessageSquare, CheckCircle, Award, Target, Activity } from 'lucide-react';

const InterviewCoach = () => {
  const [interviews, setInterviews] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [creating, setCreating] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [interviewsRes, resumesRes] = await Promise.all([
        api.get('/interviews/'),
        api.get('/resumes/')
      ]);
      setInterviews(interviewsRes.data);
      setResumes(resumesRes.data);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  const startNewInterview = async (resumeId) => {
    setCreating(true);
    setIsEnded(false);
    try {
      const res = await api.post(`/interviews/start/${resumeId}`);
      setInterviews(prev => [res.data, ...prev]);
      selectSession(res.data);
    } catch (error) {
      console.error('Failed to start interview', error);
      alert('Error starting interview. Make sure you have quota.');
    } finally {
      setCreating(false);
    }
  };

  const selectSession = (session) => {
    setCurrentSession(session);
    setIsEnded(false);
    if (session.chat_history) {
      try {
        const parsed = JSON.parse(session.chat_history);
        setMessages(parsed);
        const lastMsg = parsed[parsed.length - 1]?.content || '';
        if (lastMsg.toLowerCase().includes('final score') || lastMsg.toLowerCase().includes('interview summary')) {
          setIsEnded(true);
        }
      } catch (e) {
        setMessages([]);
      }
    } else {
      setMessages([]);
    }
  };

  const sendMessage = async (e, customMessage = null) => {
    if (e) e.preventDefault();
    const messageText = customMessage || inputValue.trim();
    if (!messageText || !currentSession || sending) return;

    const userMessage = { role: 'user', content: messageText };
    setMessages(prev => [...prev, userMessage]);
    if (!customMessage) setInputValue('');
    setSending(true);

    try {
      const res = await api.post(`/interviews/${currentSession.id}/message`, {
        message: messageText
      });
      if (res.data.chat_history) {
        const parsed = JSON.parse(res.data.chat_history);
        setMessages(parsed);
        setCurrentSession(res.data);
        setInterviews(prev => prev.map(item => item.id === res.data.id ? res.data : item));
        
        const lastMsg = parsed[parsed.length - 1]?.content || '';
        if (lastMsg.toLowerCase().includes('final score') || lastMsg.toLowerCase().includes('evaluation summary')) {
          setIsEnded(true);
        }
      }
    } catch (error) {
      console.error('Failed to send message', error);
      alert('Failed to send message.');
      setMessages(prev => prev.filter(msg => msg !== userMessage));
    } finally {
      setSending(false);
    }
  };

  const handleEndInterview = async () => {
    if (!window.confirm("Are you sure you want to end the interview and generate evaluation feedback?")) return;
    setIsEnded(true);
    await sendMessage(null, "Please end the interview and provide: 1) A Performance Score out of 100, 2) Strengths, and 3) Actionable improvement feedback.");
  };

  // Helper values
  const currentResumeFilename = useMemo(() => {
    if (!currentSession) return '';
    const res = resumes.find(r => r.id === currentSession.resume_id);
    return res ? res.filename : 'Resume Context';
  }, [currentSession, resumes]);

  const questionCounter = useMemo(() => {
    const questionsCount = messages.filter(m => m.role === 'model').length;
    return questionsCount === 0 ? 1 : Math.min(questionsCount, 10);
  }, [messages]);

  return (
    <div className="min-h-screen flex flex-col bg-[#05060b] text-slate-100 font-sans">
      <Navbar />
      
      <main className="max-w-6xl mx-auto w-full flex-grow flex flex-col md:flex-row p-6 lg:p-8 gap-8 overflow-hidden md:h-[calc(100vh-80px)]">
        
        {/* Sidebar: AI Coach Sessions */}
        <div className="w-full md:w-1/4 md:min-w-[280px] glass-panel flex flex-col overflow-hidden shrink-0 h-[300px] md:h-full">
          <div className="p-4 border-b border-white/5 bg-white/5">
            <h2 className="text-xs font-extrabold text-slate-300 uppercase tracking-widest flex items-center">
              <Bot className="w-4 h-4 mr-2 text-purple-400" /> AI Coach Sessions
            </h2>
            <p className="text-[9px] text-slate-500 mt-1">Select a session context to train</p>
          </div>
          
          {/* Start New Session */}
          <div className="p-4 border-b border-white/5 bg-purple-500/5 space-y-3">
            <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest block">Start Session</span>
            {resumes.length === 0 ? (
              <p className="text-[10px] text-amber-500 font-semibold bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
                Upload a resume in the Dashboard first.
              </p>
            ) : (
              <div className="space-y-2 max-h-28 overflow-y-auto pr-1">
                {resumes.map(r => (
                  <button
                    key={r.id}
                    onClick={() => startNewInterview(r.id)}
                    disabled={creating}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-purple-500/10 text-left transition-colors group border border-white/5 hover:border-purple-500/20"
                  >
                    <div className="flex items-center min-w-0">
                      <FileText className="h-4 w-4 text-purple-400 mr-2.5 shrink-0" />
                      <span className="text-xs font-bold text-slate-300 truncate">{r.filename}</span>
                    </div>
                    {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin text-purple-500" /> : <Plus className="h-3.5 w-3.5 text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Past Sessions List */}
          <div className="flex-grow overflow-y-auto p-4 space-y-3">
            <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest block">Past Sessions</span>
            {loading ? (
              <div className="flex justify-center py-4"><Loader2 className="animate-spin text-purple-500" /></div>
            ) : interviews.length === 0 ? (
              <p className="text-xs text-slate-500 italic text-center py-6">No sessions yet.</p>
            ) : (
              <div className="space-y-2">
                {interviews.map(session => (
                  <button
                    key={session.id}
                    onClick={() => selectSession(session)}
                    className={`w-full flex items-center p-3.5 rounded-xl transition-all border ${
                      currentSession?.id === session.id 
                        ? 'bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border-purple-500/30 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.05)]' 
                        : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <MessageSquare className={`h-4.5 w-4.5 mr-3 shrink-0 ${currentSession?.id === session.id ? 'text-purple-400' : 'text-slate-500'}`} />
                    <div className="min-w-0 text-left">
                      <p className="text-xs font-bold text-slate-200">Session #{session.id}</p>
                      <p className="text-[9px] text-slate-500">{new Date(session.created_at).toLocaleDateString()}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center Panel: Chat Box */}
        <div className="flex-grow glass-panel flex flex-col overflow-hidden h-[450px] md:h-full bg-gradient-to-b from-[#0d1020]/40 to-[#05060b]/40">
          {!currentSession ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-8 bg-purple-500/5">
              <div className="h-16 w-16 bg-purple-500/10 rounded-3xl flex items-center justify-center mb-6 border border-purple-500/20 shadow-md">
                <Bot className="h-8 w-8 text-purple-400 filter drop-shadow-[0_0_4px_rgba(168,85,247,0.4)]" />
              </div>
              <h2 className="text-xl font-extrabold text-white mb-2">Welcome to AI Chat Coach</h2>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed font-light">
                Select an active session from the sidebar or start a new interview by selecting a resume context to begin practicing.
              </p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center shadow-sm shrink-0">
                <div className="min-w-0">
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-300">Active Interview</h3>
                  <p className="text-[10px] text-purple-400 font-bold truncate mt-0.5">{currentResumeFilename}</p>
                </div>
              </div>
              
              {/* Messages viewport */}
              <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-black/10">
                {messages.map((msg, idx) => {
                  const isUser = msg.role === 'user';
                  const isEvaluation = !isUser && (msg.content.toLowerCase().includes('final score') || msg.content.toLowerCase().includes('evaluation summary'));
                  
                  if (isEvaluation) {
                    return (
                      <div key={idx} className="w-full max-w-2xl mx-auto my-6 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-6 shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
                        <h4 className="font-extrabold text-xs text-emerald-400 uppercase tracking-widest flex items-center mb-3">
                          <CheckCircle className="w-4 h-4 mr-2" /> Final Performance Evaluation
                        </h4>
                        <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                          {msg.content}
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center mt-1 ${
                          isUser ? 'bg-purple-500/15 ml-3' : 'bg-indigo-500/15 mr-3'
                        }`}>
                          {isUser ? <User className="h-4.5 w-4.5 text-purple-400" /> : <Bot className="h-4.5 w-4.5 text-indigo-400" />}
                        </div>
                        <div className={`p-4 rounded-2xl text-xs leading-relaxed shadow-sm ${
                          isUser 
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-none shadow-purple-600/10' 
                            : 'bg-white/5 border border-white/5 text-slate-200 rounded-tl-none'
                        }`}>
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {sending && (
                  <div className="flex justify-start">
                    <div className="flex max-w-[80%] flex-row">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center mt-1 bg-indigo-500/15 mr-3">
                        <Bot className="h-4.5 w-4.5 text-indigo-400" />
                      </div>
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/5 rounded-tl-none shadow-sm flex items-center space-x-1.5">
                         <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce"></div>
                         <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                         <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 bg-white/5 border-t border-white/5 shrink-0">
                <form onSubmit={sendMessage} className="flex space-x-3">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={isEnded ? "This interview has concluded. Start a new session." : "Type your response here..."}
                    className="flex-grow glass-input py-3 text-xs"
                    disabled={sending || isEnded}
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || sending || isEnded}
                    className="glass-button py-3 px-6 flex items-center justify-center disabled:opacity-40"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>

        {/* Right Panel: Control Panel */}
        {currentSession && (
          <div className="w-full md:w-1/4 md:min-w-[240px] glass-panel p-6 flex flex-col justify-between shrink-0 h-fit md:h-full">
            <div className="space-y-6">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 pb-3 border-b border-white/5">
                Parameters
              </h3>

              {/* Status parameters */}
              <div className="space-y-4">
                <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-400">Interviewer</span>
                  <span className="font-bold text-white flex items-center">
                    <Bot className="w-3.5 h-3.5 mr-1.5 text-purple-400" /> AI Coach
                  </span>
                </div>
                <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-400">Context</span>
                  <span className="font-bold text-white truncate max-w-[100px]" title={currentResumeFilename}>
                    {currentResumeFilename.split('.')[0] || 'Developer'}
                  </span>
                </div>
                <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-400">Progress</span>
                  <span className="font-bold text-white flex items-center">
                    <Target className="w-3.5 h-3.5 mr-1.5 text-indigo-400" /> {questionCounter} / 10
                  </span>
                </div>
                <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-400">Status</span>
                  <span className={`flex items-center px-2 py-0.5 font-bold text-[10px] rounded-full ${isEnded ? 'bg-slate-500/10 text-slate-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                    {!isEnded && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse mr-1.5"></span>}
                    {isEnded ? 'Completed' : 'Active'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-3 pt-6 border-t border-white/5 mt-6">
              <button
                onClick={handleEndInterview}
                disabled={sending || isEnded}
                className="w-full py-3 px-4 rounded-xl font-bold bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs border border-rose-400/20 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
              >
                End Interview
              </button>
              
              <button
                onClick={() => handleEndInterview()}
                disabled={sending || isEnded}
                className="w-full py-3 px-4 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs border border-purple-400/20 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
              >
                Generate Feedback
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

// Loader helper
const User = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

export default InterviewCoach;
