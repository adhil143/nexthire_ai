import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { 
  Upload, FileText, Loader2, Trash2, 
  CheckCircle, AlertCircle, TrendingUp, Star, 
  BarChart3, Activity, Award, User, MessageSquare, Target, Map, Plus, ChevronRight, Sparkles
} from 'lucide-react';
import { getCurrentUser, getCurrentUserToken } from '../services/auth';

const RadialGauge = ({ value, label }) => {
  const radius = 65;
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
          stroke="url(#dashboardGaugeGrad)"
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
          <linearGradient id="dashboardGaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="50%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-slate-800 dark:text-white">{value}%</span>
        <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5 text-center max-w-[80px]">
          {label}
        </span>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  
  // Data States
  const [resumes, setResumes] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [roadmaps, setRoadmaps] = useState([]);
  const [matches, setMatches] = useState([]);
  const [user, setUser] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchDashboardData();
    const token = getCurrentUserToken();
    if (token) {
      getCurrentUser()
        .then((data) => setUser(data))
        .catch((err) => console.error(err));
    }
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [resumesRes, interviewsRes, roadmapsRes, matchesRes] = await Promise.all([
        api.get('/resumes/'),
        api.get('/interviews/'),
        api.get('/roadmaps/'),
        api.get('/matcher/')
      ]);
      setResumes(resumesRes.data);
      setInterviews(interviewsRes.data);
      setRoadmaps(roadmapsRes.data);
      setMatches(matchesRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateAndUpload = async (file) => {
    if (!file) return;
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    const ext = file.name.split('.').pop().toLowerCase();
    
    if (!validTypes.includes(file.type) && !['pdf', 'docx', 'txt'].includes(ext)) {
      alert('Only PDF, DOCX, and TXT files are supported.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds the 5MB limit.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const resumesRes = await api.get('/resumes/');
      setResumes(resumesRes.data);
    } catch (error) {
      console.error('Failed to upload resume:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileUpload = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndUpload(e.target.files[0]);
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
      validateAndUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) return;
    try {
      await api.delete(`/resumes/${id}`);
      setResumes(resumes.filter(r => r.id !== id));
    } catch (error) {
      console.error('Failed to delete resume:', error);
    }
  };

  // Process data for KPIs
  const parsedResumes = useMemo(() => {
    return resumes.map(r => {
      let data = {};
      try { data = JSON.parse(r.analysis_result); } catch (e) { /* ignore */ }
      return {
        ...r,
        ats_score: data.ats_score || 0,
      };
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [resumes]);

  const avgScore = useMemo(() => {
    if (parsedResumes.length === 0) return 0;
    const totalScore = parsedResumes.reduce((sum, r) => sum + r.ats_score, 0);
    return Math.round(totalScore / parsedResumes.length);
  }, [parsedResumes]);

  // Latest Career Roadmap
  const latestRoadmap = useMemo(() => {
    if (roadmaps.length === 0) return null;
    try {
      const rm = roadmaps[0];
      const parsedData = JSON.parse(rm.content_json);
      return { ...rm, parsedData };
    } catch (e) {
      return null;
    }
  }, [roadmaps]);

  // Recent activity list
  const recentActivities = useMemo(() => {
    const list = [];
    interviews.slice(0, 2).forEach(item => {
      list.push({
        id: `int-${item.id}`,
        title: `Mock Interview (Session #${item.id})`,
        score: 85,
        date: new Date(item.created_at),
        type: 'interview'
      });
    });
    matches.slice(0, 2).forEach(item => {
      list.push({
        id: `mat-${item.id}`,
        title: `Resume Match (${item.job_title})`,
        score: item.match_score,
        date: new Date(item.created_at),
        type: 'match'
      });
    });
    return list.sort((a, b) => b.date - a.date).slice(0, 3);
  }, [interviews, matches]);

  return (
    <div className="min-h-screen flex flex-col bg-[#05060b] text-slate-100 font-sans">
      <Navbar />

      <main className="flex-grow max-w-6xl w-full mx-auto px-4 sm:px-6 py-10 flex flex-col justify-start space-y-8 z-10">
        
        {loading ? (
          <div className="flex-grow flex items-center justify-center h-96">
            <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
          </div>
        ) : (
          <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
            
            {/* Ambient Welcome Hero Banner */}
            <div className="relative rounded-3xl border border-white/5 bg-gradient-to-r from-purple-950/15 via-[#0d1020]/90 to-cyan-950/10 p-8 sm:p-10 overflow-hidden shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500"></div>
              <div className="absolute right-0 top-0 w-80 h-80 bg-purple-500/10 rounded-full blur-[90px] -z-10"></div>
              
              <div className="flex flex-col md:flex-row items-center md:justify-between gap-6">
                <div className="space-y-3 text-center md:text-left">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-purple-500/20 bg-purple-500/5 text-purple-400 font-bold text-[10px] uppercase tracking-wider">
                    <Sparkles className="w-3 h-3" /> Command Center
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight capitalize">
                    Welcome back, {user ? user.email.split('@')[0] : 'Professional'}
                  </h2>
                  <p className="text-slate-400 font-light max-w-xl text-sm leading-relaxed">
                    Your readiness profile is configured. Use the AI coaches to optimize your resume keywords, practice mock questions, and check off learning goals.
                  </p>
                </div>
                
                <div className="flex items-center space-x-6 shrink-0">
                  <div className="text-center bg-white/5 border border-white/5 rounded-2xl p-4 min-w-[100px] backdrop-blur-sm">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Interviews</span>
                    <span className="text-3xl font-black text-white">{interviews.length}</span>
                  </div>
                  <div className="text-center bg-white/5 border border-white/5 rounded-2xl p-4 min-w-[100px] backdrop-blur-sm">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Matches</span>
                    <span className="text-3xl font-black text-white">{matches.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Spacious Staggered Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Column 1: Analytics & ATS gauge */}
              <div className="glass-panel p-6 flex flex-col justify-between space-y-6">
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-6 flex items-center">
                    <Award className="w-4 h-4 mr-2 text-purple-400" /> ATS Compatibility
                  </h3>
                  <div className="py-6 flex justify-center">
                    <RadialGauge value={avgScore} label="Avg Score" />
                  </div>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-xl p-4 text-xs text-slate-400 leading-normal">
                  <p className="font-semibold text-slate-300 mb-1">ATS Profile Status</p>
                  {parsedResumes.length > 0 ? (
                    <span>Based on your latest upload: <strong className="text-white">{parsedResumes[0].filename}</strong>. Keep skills updated to boost scores.</span>
                  ) : (
                    <span>No resumes uploaded yet. Upload your CV below to generate a baseline.</span>
                  )}
                </div>
              </div>

              {/* Column 2: Recent Activity Timeline */}
              <div className="glass-panel p-6 flex flex-col justify-between space-y-6">
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-6 flex items-center">
                    <Activity className="w-4 h-4 mr-2 text-indigo-400" /> Activity Log
                  </h3>
                  
                  {recentActivities.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 italic text-xs">
                      No activities yet. Start a session or check compatibility to log events.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentActivities.map((act) => (
                        <div key={act.id} className="p-3 bg-white/5 border border-white/5 rounded-xl hover:border-purple-500/20 transition-all space-y-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-200 truncate max-w-[160px]" title={act.title}>{act.title}</span>
                            <span className="font-mono font-bold text-purple-400">{act.score}%</span>
                          </div>
                          <div className="w-full bg-slate-800/60 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full" 
                              style={{ width: `${act.score}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="border-t border-white/5 pt-4 flex justify-between items-center text-xs">
                  <span className="text-slate-400">Speech & CV Analytics</span>
                  <Link to="/voice-coach" className="text-purple-400 font-bold hover:underline flex items-center group">
                    <span>Practice Coach</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Column 3: Roadmap Progress Card */}
              <div className="glass-panel p-6 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center">
                    <Map className="w-4 h-4 mr-2 text-cyan-400" /> Roadmap Tracker
                  </h3>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Target Role</span>
                    <span className="text-xl font-extrabold text-white leading-tight block truncate">
                      {latestRoadmap ? latestRoadmap.target_role : "AI Lead Specialist"}
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-xs font-bold font-mono text-purple-400">
                      <span>Completion</span>
                      <span>65%</span>
                    </div>
                    <div className="w-full bg-slate-800/60 h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-purple-500 to-cyan-500 h-full rounded-full" style={{ width: '65%' }} />
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => navigate('/voice-coach')}
                  className="glass-button w-full flex items-center justify-center py-3 text-xs shadow-lg shadow-purple-500/10"
                >
                  <Plus className="w-4 h-4 mr-1.5" /> Start New Session
                </button>
              </div>

            </div>

            {/* Resume Upload & History Manager (Sleek Bottom Section) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Drag/Drop Zone Card (Spans 1 Column) */}
              <div className="glass-panel p-6 flex flex-col justify-between space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center">
                  <Upload className="w-4 h-4 mr-2 text-purple-400" /> Add Resume
                </h3>
                
                <div 
                  className={`flex-grow flex flex-col items-center justify-center py-10 px-4 border-2 border-dashed rounded-xl transition-all ${
                    dragActive ? 'border-purple-500 bg-purple-500/5' : 'border-white/10 hover:bg-white/5 hover:border-purple-500/30'
                  } cursor-pointer`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => !uploading && fileInputRef.current?.click()}
                >
                  {uploading ? (
                    <Loader2 className="w-8 h-8 animate-spin text-purple-400 mb-3" />
                  ) : (
                    <Upload className="w-8 h-8 text-purple-400 mb-3" />
                  )}
                  <span className="text-xs font-bold text-slate-200 text-center">
                    {uploading ? 'Analyzing Resume...' : 'Drop resume file or browse'}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1">PDF, DOCX, TXT (Max 5MB)</span>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="sr-only" accept=".txt,.pdf,.docx" disabled={uploading} />
                </div>
              </div>

              {/* Upload History List (Spans 2 Columns) */}
              <div className="glass-panel p-6 lg:col-span-2 flex flex-col justify-between space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center justify-between">
                  <span className="flex items-center"><FileText className="w-4 h-4 mr-2 text-indigo-400" /> Document Archive</span>
                  <span className="bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-md text-[10px] font-bold">
                    {resumes.length} {resumes.length === 1 ? 'document' : 'documents'}
                  </span>
                </h3>

                <div className="flex-grow overflow-y-auto max-h-48 pr-1">
                  {parsedResumes.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-slate-500 italic text-xs py-10">
                      No files uploaded. Drop a file on the left to begin.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {parsedResumes.map((r) => (
                        <div key={r.id} className="glass-card p-4 flex items-center justify-between group hover:border-purple-500/30">
                          <div className="flex items-center min-w-0 pr-2">
                            <FileText className="w-8 h-8 text-purple-400 mr-3 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs font-bold truncate text-slate-200" title={r.filename}>{r.filename}</p>
                              <p className="text-[9px] text-slate-500">{new Date(r.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 shrink-0">
                            <span className="text-[10px] font-mono font-bold bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-md">
                              {r.ats_score}%
                            </span>
                            <button
                              onClick={() => handleDelete(r.id)}
                              className="text-slate-500 hover:text-rose-500 p-1.5 rounded-md hover:bg-rose-500/10 transition-colors"
                              title="Delete document"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
