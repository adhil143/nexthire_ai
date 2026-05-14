import { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { Target, FileText, Briefcase, Loader2, CheckCircle, AlertTriangle, TrendingUp, Trash2, ArrowRight } from 'lucide-react';

const JobMatcher = () => {
  const [matches, setMatches] = useState([]);
  const [currentMatch, setCurrentMatch] = useState(null);
  const [resumes, setResumes] = useState([]);
  
  const [inputType, setInputType] = useState('select'); // 'select' or 'paste'
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [matchesRes, resumesRes] = await Promise.all([
        api.get('/matcher/'),
        api.get('/resumes/')
      ]);
      setMatches(matchesRes.data);
      setResumes(resumesRes.data);
      if (resumesRes.data.length > 0) {
        setSelectedResumeId(resumesRes.data[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  const selectMatch = (match) => {
    try {
      const parsedData = JSON.parse(match.content_json);
      setCurrentMatch({ ...match, parsedData });
    } catch (e) {
      console.error('Failed to parse match JSON');
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!jobDescription.trim() || analyzing) return;
    if (inputType === 'select' && !selectedResumeId) return;
    if (inputType === 'paste' && !resumeText.trim()) return;

    setAnalyzing(true);
    try {
      const payload = {
        job_description: jobDescription.trim()
      };
      if (inputType === 'select') {
        payload.resume_id = selectedResumeId;
      } else {
        payload.resume_text = resumeText.trim();
      }

      const res = await api.post('/matcher/analyze', payload);
      const newMatch = res.data;
      setMatches([newMatch, ...matches]);
      selectMatch(newMatch);
      // Clear inputs
      setJobDescription('');
      if (inputType === 'paste') setResumeText('');
    } catch (error) {
      console.error('Failed to analyze match', error);
      alert('Error analyzing match. Make sure you have quota.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this match record?')) return;
    
    try {
      await api.delete(`/matcher/${id}`);
      setMatches(matches.filter(m => m.id !== id));
      if (currentMatch && currentMatch.id === id) {
        setCurrentMatch(null);
      }
    } catch (error) {
      console.error('Failed to delete match', error);
    }
  };

  // Helper to determine score color
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-rose-500 dark:text-rose-400';
  };
  const getBgColor = (score) => {
    if (score >= 80) return 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200';
    if (score >= 60) return 'bg-amber-50 dark:bg-amber-900/30 border-amber-200';
    return 'bg-rose-50 dark:bg-rose-900/30 border-rose-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 font-sans flex flex-col">
      <Navbar />
      
      <main className="max-w-7xl mx-auto w-full flex-grow flex flex-col md:flex-row p-4 sm:p-6 lg:p-8 gap-6 h-[calc(100vh-64px)]">
        
        {/* Sidebar: History */}
        <div className="w-full md:w-1/4 md:min-w-[300px] bg-white/70 backdrop-blur-xl dark:bg-slate-900/60 rounded-2xl shadow-sm border border-white/50 dark:border-white/10 flex flex-col overflow-hidden shrink-0">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
              <Target className="w-5 h-5 mr-2 text-indigo-500 dark:text-indigo-400" /> Match History
            </h2>
          </div>
          
          <div className="flex-grow overflow-y-auto p-4 space-y-2">
            {loading ? (
              <div className="flex justify-center p-4"><Loader2 className="animate-spin text-indigo-500 dark:text-indigo-400" /></div>
            ) : matches.length === 0 ? (
              <div className="text-center py-10 px-4">
                <Target className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">No matches yet.</p>
                <p className="text-xs text-slate-400 mt-1">Analyze a job description to see your fit.</p>
              </div>
            ) : (
              matches.map(match => (
                <div
                  key={match.id}
                  onClick={() => selectMatch(match)}
                  className={`flex items-center p-3 rounded-xl cursor-pointer transition-all border group ${
                    currentMatch?.id === match.id 
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 shadow-sm' 
                      : 'bg-white/70 backdrop-blur-xl dark:bg-slate-900/60 border-slate-100 dark:border-slate-800 hover:border-indigo-100 hover:bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900'
                  }`}
                >
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm mr-3 flex-shrink-0 ${getScoreColor(match.match_score)} bg-white/70 backdrop-blur-xl dark:bg-slate-900/60 shadow-sm border border-slate-100 dark:border-slate-800`}>
                    {match.match_score}
                  </div>
                  <div className="flex-grow min-w-0">
                    <h4 className={`font-semibold text-sm truncate ${currentMatch?.id === match.id ? 'text-indigo-900' : 'text-slate-700 dark:text-slate-300'}`}>
                      {match.job_title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">{new Date(match.created_at).toLocaleDateString()}</p>
                  </div>
                  <button 
                    onClick={(e) => handleDelete(match.id, e)}
                    className="text-slate-300 hover:text-rose-500 dark:text-rose-400 transition-colors opacity-0 group-hover:opacity-100 p-2 rounded-md hover:bg-rose-50 dark:bg-rose-900/30 flex-shrink-0 ml-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-grow flex flex-col gap-6 overflow-hidden">
          
          {/* Input Area (Only visible if no match is currently selected, or we want to allow new analysis from here) */}
          {!currentMatch ? (
            <div className="h-full flex flex-col bg-white/70 backdrop-blur-xl dark:bg-slate-900/60 p-6 rounded-2xl shadow-sm border border-white/50 dark:border-white/10 overflow-y-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Resume vs Job Description</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Paste a job description to see if your resume is a perfect match.</p>
              </div>
              
              <form onSubmit={handleAnalyze} className="flex-grow flex flex-col space-y-6 max-w-4xl mx-auto w-full">
                
                {/* Resume Source Selection */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-indigo-500 dark:text-indigo-400" /> 1. Provide Your Resume
                    </label>
                    <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                      <button 
                        type="button" 
                        onClick={() => setInputType('select')}
                        className={`text-xs px-3 py-1 rounded-md font-medium transition-colors ${inputType === 'select' ? 'bg-white/70 backdrop-blur-xl dark:bg-slate-900/60 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-300'}`}
                      >
                        Select Uploaded
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setInputType('paste')}
                        className={`text-xs px-3 py-1 rounded-md font-medium transition-colors ${inputType === 'paste' ? 'bg-white/70 backdrop-blur-xl dark:bg-slate-900/60 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-300'}`}
                      >
                        Paste Text
                      </button>
                    </div>
                  </div>

                  {inputType === 'select' ? (
                    resumes.length === 0 ? (
                      <div className="p-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 rounded-xl text-amber-700 dark:text-amber-300 text-sm">
                        No resumes found. Please upload one in the Dashboard or choose "Paste Text".
                      </div>
                    ) : (
                      <select 
                        value={selectedResumeId}
                        onChange={(e) => setSelectedResumeId(e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/70 backdrop-blur-xl dark:bg-slate-900/60"
                      >
                        {resumes.map(r => (
                          <option key={r.id} value={r.id}>{r.filename}</option>
                        ))}
                      </select>
                    )
                  ) : (
                    <textarea 
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      placeholder="Paste your raw resume text here..."
                      className="w-full h-32 p-4 rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 text-sm"
                    />
                  )}
                </div>

                {/* Job Description Input */}
                <div className="space-y-3 flex-grow flex flex-col">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center">
                    <Briefcase className="w-4 h-4 mr-2 text-indigo-500 dark:text-indigo-400" /> 2. Paste Job Description
                  </label>
                  <textarea 
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the full job description here..."
                    className="w-full flex-grow min-h-[200px] p-4 rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 text-sm"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={analyzing || (!jobDescription.trim()) || (inputType === 'select' && !selectedResumeId) || (inputType === 'paste' && !resumeText.trim())}
                  className="w-full bg-indigo-600 text-white font-semibold rounded-xl py-4 hover:bg-indigo-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center shadow-md"
                >
                  {analyzing ? <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Analyzing Match...</> : 'Analyze Compatibility'}
                </button>
              </form>
            </div>
          ) : (
            // Results Display
            <div className="h-full flex flex-col bg-white/70 backdrop-blur-xl dark:bg-slate-900/60 rounded-2xl shadow-sm border border-white/50 dark:border-white/10 overflow-y-auto relative">
              
              {/* Top Banner & Score */}
              <div className={`p-8 border-b flex flex-col md:flex-row items-center md:justify-between gap-6 relative overflow-hidden shrink-0 ${getBgColor(currentMatch.match_score)}`}>
                <button 
                  onClick={() => setCurrentMatch(null)}
                  className="absolute top-4 right-4 text-xs font-semibold px-3 py-1.5 bg-white/70 backdrop-blur-xl dark:bg-slate-900/60 rounded-lg shadow-sm hover:bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 transition-colors flex items-center"
                >
                  <ArrowRight className="w-3 h-3 mr-1 rotate-180" /> New Analysis
                </button>
                
                <div className="text-center md:text-left z-10">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Target Role</span>
                  <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1 mb-2">{currentMatch.job_title}</h2>
                  <p className="text-sm text-slate-700 dark:text-slate-300 max-w-xl leading-relaxed">{currentMatch.parsedData.summary}</p>
                </div>
                
                <div className="z-10 flex flex-col items-center justify-center bg-white/70 backdrop-blur-xl dark:bg-slate-900/60 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 shrink-0">
                  <div className={`text-5xl font-black ${getScoreColor(currentMatch.match_score)}`}>
                    {currentMatch.match_score}<span className="text-2xl text-slate-300 font-bold">%</span>
                  </div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">ATS Score</span>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Missing Skills */}
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center border-b pb-2">
                    <AlertTriangle className="w-5 h-5 mr-2 text-rose-500 dark:text-rose-400" /> Missing Skills
                  </h3>
                  {currentMatch.parsedData.missing_skills?.length === 0 ? (
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl text-emerald-700 dark:text-emerald-300 text-sm flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2" /> You have all the core skills listed!
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {currentMatch.parsedData.missing_skills?.map((skill, i) => (
                        <span key={i} className="px-3 py-1.5 text-sm font-semibold bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 rounded-lg border border-rose-100 shadow-sm cursor-default">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Improvement Suggestions */}
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center border-b pb-2">
                    <TrendingUp className="w-5 h-5 mr-2 text-indigo-500 dark:text-indigo-400" /> How to Improve
                  </h3>
                  <ul className="space-y-4">
                    {currentMatch.parsedData.improvement_suggestions?.map((sugg, i) => (
                      <li key={i} className="bg-indigo-50 dark:bg-indigo-900/30/50 rounded-xl p-4 border border-indigo-50/50 text-sm text-slate-700 dark:text-slate-300 leading-relaxed flex items-start">
                        <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 mr-3 mt-0.5">{i+1}</span>
                        {sugg}
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default JobMatcher;
