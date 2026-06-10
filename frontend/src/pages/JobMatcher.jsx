import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { Target, FileText, Loader2, CheckCircle, AlertTriangle, TrendingUp, Trash2, Upload } from 'lucide-react';

const RadialMatchGauge = ({ value, label }) => {
  const radius = 60;
  const stroke = 6;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center relative">
      <svg height={radius * 2} width={radius * 2} className="transform -rotate-90 filter drop-shadow-[0_0_8px_rgba(168,85,247,0.3)]">
        <circle
          className="stroke-slate-200/50 dark:stroke-slate-800/40"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke="url(#matchGaugeGrad)"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease-in-out' }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <defs>
          <linearGradient id="matchGaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="50%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-xl font-black text-slate-800 dark:text-white">{value}%</span>
        <span className="text-[7px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5 text-center">
          {label}
        </span>
      </div>
    </div>
  );
};

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
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef(null);

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
    if (e) e.preventDefault();
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
      setMatches(prev => [newMatch, ...prev]);
      selectMatch(newMatch);
      setJobDescription('');
      if (inputType === 'paste') setResumeText('');
    } catch (error) {
      console.error('Failed to analyze match', error);
      alert('Error analyzing compatibility. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleResumeDirectUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const resumesRes = await api.get('/resumes/');
      setResumes(resumesRes.data);
      setSelectedResumeId(res.data.id);
      setInputType('select');
    } catch (error) {
      console.error('Failed to upload resume', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleResumeDirectUpload(e.dataTransfer.files[0]);
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

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (score >= 60) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#05060b] text-slate-100 font-sans">
      <Navbar />
      
      <main className="max-w-6xl mx-auto w-full flex-grow flex flex-col md:flex-row p-6 lg:p-8 gap-8 overflow-hidden md:h-[calc(100vh-80px)]">
        
        {/* Sidebar: Match History */}
        <div className="w-full md:w-1/4 md:min-w-[280px] glass-panel flex flex-col overflow-hidden shrink-0 h-[300px] md:h-full">
          <div className="p-4 border-b border-white/5 bg-white/5">
            <h2 className="text-xs font-extrabold text-slate-300 flex items-center uppercase tracking-widest">
              <Target className="w-4 h-4 mr-2 text-purple-400" /> Match History
            </h2>
          </div>
          
          <div className="flex-grow overflow-y-auto p-4 space-y-2">
            {loading ? (
              <div className="flex justify-center py-4"><Loader2 className="animate-spin text-purple-500" /></div>
            ) : matches.length === 0 ? (
              <div className="text-center py-12 text-slate-500 space-y-3">
                <Target className="h-8 w-8 mx-auto opacity-40 text-purple-400" />
                <p className="text-xs font-bold uppercase tracking-widest">No matches yet</p>
                <p className="text-[9px] font-light">Evaluate a CV compatibility above.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {matches.map(match => (
                  <div
                    key={match.id}
                    onClick={() => selectMatch(match)}
                    className={`flex items-center p-3 rounded-xl cursor-pointer transition-all border group ${
                      currentMatch?.id === match.id 
                        ? 'bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border-purple-500/30 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.05)]' 
                        : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs mr-3 flex-shrink-0 border ${getScoreColor(match.match_score)}`}>
                      {match.match_score}
                    </div>
                    <div className="flex-grow min-w-0">
                      <h4 className="font-bold text-xs truncate text-slate-200">
                        {match.job_title}
                      </h4>
                      <p className="text-[9px] text-slate-500 mt-1">{new Date(match.created_at).toLocaleDateString()}</p>
                    </div>
                    <button 
                      onClick={(e) => handleDelete(match.id, e)}
                      className="text-slate-500 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-rose-500/10 flex-shrink-0 ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content Pane */}
        <div className="flex-grow flex flex-col md:flex-row gap-8 overflow-hidden md:h-full">
          
          {/* Left Sub-card: Inputs */}
          <div className="w-full md:w-1/2 glass-panel p-6 flex flex-col justify-between overflow-y-auto space-y-5 md:h-full bg-gradient-to-b from-[#0d1020]/20 to-[#05060b]/20">
            <div className="space-y-5">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Match Settings</h3>
              
              {/* Dropzone area */}
              <div 
                className={`flex flex-col items-center justify-center py-6 px-4 border-2 border-dashed rounded-xl transition-all ${
                  dragActive ? 'border-purple-500 bg-purple-500/5' : 'border-white/10 hover:bg-white/5 hover:border-purple-500/30'
                } cursor-pointer`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => !uploading && fileInputRef.current?.click()}
              >
                {uploading ? (
                  <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-2" />
                ) : (
                  <Upload className="w-8 h-8 text-purple-400 mb-2" />
                )}
                <span className="text-xs font-bold text-slate-200">
                  {uploading ? 'Uploading...' : 'Upload CV File'}
                </span>
                <span className="text-[10px] text-slate-500 mt-1">Drag PDF or DOCX file here</span>
                <input type="file" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && handleResumeDirectUpload(e.target.files[0])} className="sr-only" accept=".pdf,.docx,.txt" disabled={uploading} />
              </div>

              {/* Resume Selector */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-bold text-slate-300">Resume Source</label>
                  <div className="flex bg-white/5 p-0.5 rounded-lg border border-white/5">
                    <button 
                      type="button" 
                      onClick={() => setInputType('select')}
                      className={`text-[9px] px-2.5 py-1 rounded-md font-bold transition-all ${inputType === 'select' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      Selected
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setInputType('paste')}
                      className={`text-[9px] px-2.5 py-1 rounded-md font-bold transition-all ${inputType === 'paste' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      Raw Text
                    </button>
                  </div>
                </div>

                {inputType === 'select' ? (
                  resumes.length === 0 ? (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500 text-xs font-semibold">
                      Please upload a resume first using the dropzone.
                    </div>
                  ) : (
                    <select 
                      value={selectedResumeId}
                      onChange={(e) => setSelectedResumeId(e.target.value)}
                      className="glass-input w-full py-2.5 text-xs font-bold"
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
                    placeholder="Paste raw resume text here..."
                    className="glass-input w-full h-24 text-xs resize-none"
                  />
                )}
              </div>

              {/* Job Description Textarea */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">Job Description</label>
                <textarea 
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste details of target role..."
                  className="glass-input w-full h-36 text-xs resize-none"
                />
              </div>
            </div>

            <button
              onClick={() => handleAnalyze()}
              disabled={analyzing || (!jobDescription.trim()) || (inputType === 'select' && !selectedResumeId) || (inputType === 'paste' && !resumeText.trim())}
              className="glass-button w-full flex items-center justify-center py-3 text-xs"
            >
              {analyzing ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Evaluating Compatibility...</>
              ) : (
                'Analyze Compatibility'
              )}
            </button>
          </div>

          {/* Right Sub-card: Results */}
          <div className="w-full md:w-1/2 glass-panel p-6 flex flex-col justify-between overflow-y-auto md:h-full bg-gradient-to-b from-[#0d1020]/20 to-[#05060b]/20">
            
            {currentMatch ? (
              <div className="flex-grow flex flex-col justify-between space-y-6 h-full">
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-5">
                    ATS Audit Results
                  </h3>
                  
                  {/* Gauge & Match Info */}
                  <div className="flex flex-col sm:flex-row items-center justify-around bg-purple-500/5 border border-purple-500/10 rounded-xl p-5 gap-6">
                    <RadialMatchGauge value={currentMatch.match_score} label="Match Score" />
                    <div className="text-center sm:text-left">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Target Role</span>
                      <h4 className="text-lg font-extrabold text-slate-100 truncate max-w-[180px]">{currentMatch.job_title}</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed mt-2 max-w-[200px] line-clamp-3 font-light">
                        {currentMatch.parsedData.summary}
                      </p>
                    </div>
                  </div>

                  {/* Matched vs Missing Skills Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                    {/* Matched Skills */}
                    <div className="space-y-3.5">
                      <span className="text-[9px] font-extrabold uppercase tracking-widest text-emerald-400 flex items-center">
                        <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Matched Skills
                      </span>
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                        {currentMatch.parsedData.matched_skills && currentMatch.parsedData.matched_skills.length > 0 ? (
                          currentMatch.parsedData.matched_skills.map((skill, i) => (
                            <span key={i} className="px-2.5 py-1 text-[9px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-md">
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-slate-500 italic">None detected</span>
                        )}
                      </div>
                    </div>

                    {/* Missing Skills */}
                    <div className="space-y-3.5">
                      <span className="text-[9px] font-extrabold uppercase tracking-widest text-rose-400 flex items-center">
                        <AlertTriangle className="w-3.5 h-3.5 mr-1.5" /> Missing Skills
                      </span>
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                        {currentMatch.parsedData.missing_skills && currentMatch.parsedData.missing_skills.length > 0 ? (
                          currentMatch.parsedData.missing_skills.map((skill, i) => (
                            <span key={i} className="px-2.5 py-1 text-[9px] font-bold bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-md">
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-emerald-400 font-bold">All skills matched!</span>
                        )}
                      </div>
                    </div>
                  </div>

                </div>

                {/* Optimization Checklist */}
                <div className="border-t border-white/5 pt-4">
                  <h4 className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 mb-3 flex items-center">
                    <TrendingUp className="w-3.5 h-3.5 mr-1.5 text-purple-400" /> Optimization checklist
                  </h4>
                  <ul className="space-y-3 max-h-36 overflow-y-auto pr-1">
                    {currentMatch.parsedData.improvement_suggestions && currentMatch.parsedData.improvement_suggestions.length > 0 ? (
                      currentMatch.parsedData.improvement_suggestions.map((sugg, i) => (
                        <li key={i} className="text-[11px] leading-relaxed text-slate-300 flex items-start font-light">
                          <span className="w-4 h-4 rounded bg-purple-500/10 text-purple-400 font-bold flex items-center justify-center text-[9px] mr-2.5 shrink-0 mt-0.5 border border-purple-500/20">
                            {i + 1}
                          </span>
                          <span>{sugg}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-xs text-slate-500 italic">No optimizations suggested. Excellent fit!</li>
                    )}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center text-center text-slate-500 p-6 h-full border border-dashed border-white/5 rounded-2xl">
                <Target className="w-12 h-12 mb-4 opacity-40 text-purple-400" />
                <h4 className="font-extrabold text-xs uppercase tracking-widest text-slate-300">ATS Analysis telemetry</h4>
                <p className="text-[10px] max-w-[200px] mt-1 leading-normal font-light">
                  Upload a resume and paste a job description on the left, then click analyze to generate compatibility.
                </p>
              </div>
            )}
          </div>

        </div>

      </main>
    </div>
  );
};

export default JobMatcher;
