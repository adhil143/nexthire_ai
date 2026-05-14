import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { Send, User as UserIcon, Bot, FileText, Loader2, Plus, MessageSquare } from 'lucide-react';

const InterviewCoach = () => {
  const [interviews, setInterviews] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [creating, setCreating] = useState(false);
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
    try {
      const res = await api.post(`/interviews/start/${resumeId}`);
      setInterviews([res.data, ...interviews]);
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
    if (session.chat_history) {
      try {
        setMessages(JSON.parse(session.chat_history));
      } catch (e) {
        setMessages([]);
      }
    } else {
      setMessages([]);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !currentSession || sending) return;

    const userMessage = { role: 'user', content: inputValue.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setSending(true);

    try {
      const res = await api.post(`/interviews/${currentSession.id}/message`, {
        message: userMessage.content
      });
      if (res.data.chat_history) {
        setMessages(JSON.parse(res.data.chat_history));
      }
    } catch (error) {
      console.error('Failed to send message', error);
      alert('Failed to send message.');
      // Revert the optimistic update if failed
      setMessages(prev => prev.filter(msg => msg !== userMessage));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 font-sans flex flex-col">
      <Navbar />
      
      <main className="max-w-7xl mx-auto w-full flex-grow flex p-4 sm:p-6 lg:p-8 gap-6 h-[calc(100vh-64px)]">
        
        {/* Sidebar */}
        <div className="w-1/3 max-w-sm bg-white/70 backdrop-blur-xl dark:bg-slate-900/60 rounded-2xl shadow-sm border border-white/50 dark:border-white/10 flex flex-col overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">AI Coach Sessions</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Practice interviews based on your resume.</p>
          </div>
          
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Start New</h3>
            {resumes.length === 0 ? (
              <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 p-2 rounded-lg">Upload a resume in the Dashboard first.</p>
            ) : (
              <div className="space-y-2">
                {resumes.map(r => (
                  <button
                    key={r.id}
                    onClick={() => startNewInterview(r.id)}
                    disabled={creating}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-indigo-50 dark:bg-indigo-900/30 border border-transparent hover:border-indigo-100 transition-colors text-left group"
                  >
                    <div className="flex items-center min-w-0">
                      <FileText className="h-4 w-4 text-indigo-400 mr-2 flex-shrink-0" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{r.filename}</span>
                    </div>
                    {creating ? <Loader2 className="h-4 w-4 animate-spin text-indigo-400" /> : <Plus className="h-4 w-4 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-grow overflow-y-auto p-4">
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Past Sessions</h3>
            {loading ? (
              <div className="flex justify-center p-4"><Loader2 className="animate-spin text-indigo-500 dark:text-indigo-400" /></div>
            ) : interviews.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No sessions yet.</p>
            ) : (
              <div className="space-y-2">
                {interviews.map(session => (
                  <button
                    key={session.id}
                    onClick={() => selectSession(session)}
                    className={`w-full flex items-center p-3 rounded-xl transition-colors text-left border ${
                      currentSession?.id === session.id 
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 text-indigo-700' 
                        : 'bg-white/70 backdrop-blur-xl dark:bg-slate-900/60 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900'
                    }`}
                  >
                    <MessageSquare className={`h-5 w-5 mr-3 flex-shrink-0 ${currentSession?.id === session.id ? 'text-indigo-500 dark:text-indigo-400' : 'text-slate-400'}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">Session #{session.id}</p>
                      <p className={`text-xs truncate ${currentSession?.id === session.id ? 'text-indigo-400' : 'text-slate-400'}`}>
                        {new Date(session.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-grow bg-white/70 backdrop-blur-xl dark:bg-slate-900/60 rounded-2xl shadow-sm border border-white/50 dark:border-white/10 flex flex-col overflow-hidden">
          {!currentSession ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900/50">
              <div className="h-20 w-20 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mb-6">
                <Bot className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Welcome to your AI Interview Coach</h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-md">Select a past session from the sidebar, or start a new one by selecting a resume. The AI will tailor the interview questions strictly to your experience.</p>
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white/70 backdrop-blur-xl dark:bg-slate-900/60 flex justify-between items-center shadow-sm z-10">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Mock Interview Session</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Based on Resume ID: {currentSession.resume_id}</p>
                </div>
              </div>
              
              <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900/50">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center mt-1 ${
                        msg.role === 'user' ? 'bg-indigo-100 dark:bg-indigo-900/50 ml-3' : 'bg-emerald-100 dark:bg-emerald-900/50 mr-3'
                      }`}>
                        {msg.role === 'user' ? <UserIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" /> : <Bot className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
                      </div>
                      <div className={`p-4 rounded-2xl ${
                        msg.role === 'user' 
                          ? 'bg-indigo-600 text-white rounded-tr-none' 
                          : 'bg-white/70 backdrop-blur-xl dark:bg-slate-900/60 border border-white/50 dark:border-white/10 text-slate-800 dark:text-slate-100 rounded-tl-none shadow-sm'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {sending && (
                  <div className="flex justify-start">
                    <div className="flex max-w-[80%] flex-row">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center mt-1 bg-emerald-100 dark:bg-emerald-900/50 mr-3">
                        <Bot className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="p-4 rounded-2xl bg-white/70 backdrop-blur-xl dark:bg-slate-900/60 border border-white/50 dark:border-white/10 text-slate-800 dark:text-slate-100 rounded-tl-none shadow-sm flex items-center space-x-2">
                         <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                         <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                         <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 bg-white/70 backdrop-blur-xl dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800">
                <form onSubmit={sendMessage} className="flex space-x-4">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type your answer here..."
                    className="flex-grow p-3 rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow text-sm"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || sending}
                    className="bg-indigo-600 text-white px-5 py-3 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default InterviewCoach;
