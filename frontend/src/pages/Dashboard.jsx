import { useState, useEffect, useRef, useMemo } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { 
  Upload, FileText, Loader2, Trash2, FileUp, 
  CheckCircle, AlertCircle, TrendingUp, Star, 
  BarChart3, Activity, Award
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import useDarkMode from '../hooks/useDarkMode';

const Dashboard = () => {
  const { theme } = useDarkMode();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const response = await api.get('/resumes/');
      setResumes(response.data);
    } catch (error) {
      console.error('Failed to fetch resumes:', error);
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
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      fetchResumes();
    } catch (error) {
      console.error('Failed to upload resume:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
      fetchResumes();
    } catch (error) {
      console.error('Failed to delete resume:', error);
    }
  };

  // ---- Analytics Data Processing ----
  const parsedResumes = useMemo(() => {
    return resumes.map(r => {
      let data = {};
      try { data = JSON.parse(r.analysis_result); } catch (e) { /* ignore */ }
      return {
        ...r,
        parsedData: {
          ats_score: data.ats_score || 0,
          skills: data.skills || [],
          missing_keywords: data.missing_keywords || [],
          improvement_suggestions: data.improvement_suggestions || [],
          summary: data.summary || 'No summary available.'
        }
      };
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // Latest first
  }, [resumes]);

  const latestResume = parsedResumes[0];

  const { avgScore, topSkillsData, scoreHistoryData } = useMemo(() => {
    if (parsedResumes.length === 0) return { avgScore: 0, topSkillsData: [], scoreHistoryData: [] };

    // Average Score
    const totalScore = parsedResumes.reduce((sum, r) => sum + r.parsedData.ats_score, 0);
    const avgScore = Math.round(totalScore / parsedResumes.length);

    // Skills aggregation
    const skillCounts = {};
    parsedResumes.forEach(r => {
      r.parsedData.skills.forEach(skill => {
        const s = skill.trim().toLowerCase();
        skillCounts[s] = (skillCounts[s] || 0) + 1;
      });
    });
    const topSkillsData = Object.entries(skillCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6); // Top 6 skills

    // Score History (chronological order)
    const scoreHistoryData = [...parsedResumes]
      .reverse()
      .map((r, index) => ({
        name: `Res ${index + 1}`,
        score: r.parsedData.ats_score,
        date: new Date(r.created_at).toLocaleDateString()
      }));

    return { avgScore, topSkillsData, scoreHistoryData };
  }, [parsedResumes]);

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/50 border-emerald-200';
    if (score >= 60) return 'text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/50 border-amber-200';
    return 'text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/50 border-rose-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 font-sans">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header & Upload Bar */}
        <div className="bg-white/70 backdrop-blur-xl dark:bg-slate-900/60 rounded-2xl shadow-sm border border-white/50 dark:border-white/10 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Analytics Dashboard</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Track your resume improvements and AI insights.</p>
          </div>
          
          <div 
            className={`flex-grow md:max-w-md w-full flex justify-center px-4 py-4 border-2 border-dashed rounded-xl transition-colors ${
              dragActive ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'border-slate-300 dark:border-slate-700 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 hover:bg-slate-100 dark:bg-slate-800'
            } ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !uploading && fileInputRef.current?.click()}
          >
            <div className="flex items-center space-x-3 text-center">
              {uploading ? (
                <Loader2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400 animate-spin" />
              ) : (
                <FileUp className={`h-6 w-6 transition-colors ${dragActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
              )}
              <div className="flex text-sm text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-indigo-600 hover:text-indigo-400">
                  {uploading ? 'Analyzing...' : 'Upload new resume'}
                </span>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="sr-only" accept=".txt,.pdf,.docx" disabled={uploading} />
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin h-10 w-10 text-indigo-600 dark:text-indigo-400" />
          </div>
        ) : parsedResumes.length === 0 ? (
          <div className="text-center bg-white/70 backdrop-blur-xl dark:bg-slate-900/60 rounded-2xl shadow-sm border border-white/50 dark:border-white/10 p-20">
            <div className="mx-auto h-24 w-24 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-6">
              <BarChart3 className="h-12 w-12 text-indigo-500 dark:text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">No Analytics Available</h3>
            <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-sm mx-auto">Upload your first resume using the dropzone above to instantly generate your ATS score and skill insights!</p>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="bg-white/70 backdrop-blur-xl dark:bg-slate-900/60 rounded-2xl p-6 shadow-sm border border-white/50 dark:border-white/10 flex items-center space-x-4">
                <div className="h-12 w-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                  <FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Uploads</p>
                  <h4 className="text-2xl font-bold text-slate-900 dark:text-white">{parsedResumes.length}</h4>
                </div>
              </div>
              <div className="bg-white/70 backdrop-blur-xl dark:bg-slate-900/60 rounded-2xl p-6 shadow-sm border border-white/50 dark:border-white/10 flex items-center space-x-4">
                <div className="h-12 w-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                  <Activity className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Average ATS Score</p>
                  <h4 className="text-2xl font-bold text-slate-900 dark:text-white">{avgScore}%</h4>
                </div>
              </div>
              <div className="bg-white/70 backdrop-blur-xl dark:bg-slate-900/60 rounded-2xl p-6 shadow-sm border border-white/50 dark:border-white/10 flex items-center space-x-4">
                <div className="h-12 w-12 bg-amber-50 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                  <Award className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Latest Score</p>
                  <h4 className="text-2xl font-bold text-slate-900 dark:text-white">{latestResume.parsedData.ats_score}%</h4>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Line Chart */}
              <div className="bg-white/70 backdrop-blur-xl dark:bg-slate-900/60 rounded-2xl p-6 shadow-sm border border-white/50 dark:border-white/10">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-6 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-indigo-500 dark:text-indigo-400" /> ATS Score Trend
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={scoreHistoryData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 12}} dy={10} />
                      <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 12}} dx={-10} />
                      <Tooltip 
                        contentStyle={{ 
                          borderRadius: '12px', 
                          border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)', 
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                          backgroundColor: theme === 'dark' ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)', 
                          color: theme === 'dark' ? '#f8fafc' : '#0f172a' 
                        }}
                        itemStyle={{ color: '#6366f1' }}
                        labelStyle={{ color: theme === 'dark' ? '#94a3b8' : '#64748b', marginBottom: '4px' }}
                      />
                      <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: theme === 'dark' ? '#0f172a' : '#fff' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top Skills List */}
              <div className="bg-white/70 backdrop-blur-xl dark:bg-slate-900/60 rounded-2xl p-6 shadow-sm border border-white/50 dark:border-white/10 flex flex-col">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-indigo-500 dark:text-indigo-400" /> Top Extracted Skills
                </h3>
                <div className="flex-grow flex flex-col justify-center space-y-3">
                  {topSkillsData.length === 0 ? (
                    <p className="text-slate-500 dark:text-slate-400 text-sm text-center">No skills extracted yet.</p>
                  ) : (
                    topSkillsData.map((skill, index) => {
                      // Calculate percentage for a subtle background bar effect
                      const maxCount = topSkillsData[0].count;
                      const percentage = Math.round((skill.count / maxCount) * 100);
                      
                      return (
                        <div key={index} className="relative w-full bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 flex items-center justify-between p-3 z-0">
                          {/* Progress Bar Background */}
                          <div 
                            className="absolute top-0 left-0 h-full bg-indigo-50 dark:bg-indigo-900/30/80 -z-10 rounded-xl transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          ></div>
                          
                          <span className="font-semibold text-slate-700 dark:text-slate-300 capitalize text-sm">{skill.name}</span>
                          <span className="bg-white/70 backdrop-blur-xl dark:bg-slate-900/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">
                            {skill.count} {skill.count === 1 ? 'mention' : 'mentions'}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Row: Latest Resume Insights & History */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Latest Resume Insights */}
              <div className="lg:col-span-2 bg-white/70 backdrop-blur-xl dark:bg-slate-900/60 rounded-2xl shadow-sm border border-white/50 dark:border-white/10 overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Latest Resume Insights</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{latestResume.filename} • {new Date(latestResume.created_at).toLocaleString()}</p>
                  </div>
                  <div className={`px-4 py-1.5 text-lg font-bold rounded-full border shadow-sm ${getScoreColor(latestResume.parsedData.ats_score)}`}>
                    {latestResume.parsedData.ats_score}% ATS
                  </div>
                </div>
                
                <div className="p-6 space-y-6 flex-grow">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1.5 text-indigo-500 dark:text-indigo-400" /> Skills Found
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {latestResume.parsedData.skills.map((skill, i) => (
                          <span key={i} className="px-3 py-1 text-xs font-semibold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 rounded-full border border-indigo-100">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1.5 text-rose-500 dark:text-rose-400" /> Missing Keywords
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {latestResume.parsedData.missing_keywords.map((kw, i) => (
                          <span key={i} className="px-3 py-1 text-xs font-semibold bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 rounded-full border border-rose-100">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1.5 text-emerald-500" /> Suggestions for Improvement
                    </h5>
                    <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-2 pl-6 list-disc marker:text-emerald-400">
                      {latestResume.parsedData.improvement_suggestions.map((sugg, i) => (
                        <li key={i} className="leading-relaxed">{sugg}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                     <p className="text-sm text-slate-600 dark:text-slate-400 italic bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                       "{latestResume.parsedData.summary}"
                     </p>
                  </div>
                </div>
              </div>

              {/* Upload History List */}
              <div className="bg-white/70 backdrop-blur-xl dark:bg-slate-900/60 rounded-2xl shadow-sm border border-white/50 dark:border-white/10 overflow-hidden flex flex-col h-[600px]">
                <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Upload History</h3>
                </div>
                <div className="overflow-y-auto flex-grow p-2">
                  <div className="space-y-1">
                    {parsedResumes.map((resume) => (
                      <div key={resume.id} className="flex items-center justify-between p-3 hover:bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 rounded-xl transition-colors group">
                        <div className="flex items-center min-w-0 pr-3">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-xs mr-3 flex-shrink-0 ${getScoreColor(resume.parsedData.ats_score)}`}>
                            {resume.parsedData.ats_score}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate" title={resume.filename}>
                              {resume.filename}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                              {new Date(resume.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(resume.id)}
                          className="text-slate-300 hover:text-rose-500 dark:text-rose-400 p-2 rounded-lg hover:bg-rose-50 dark:bg-rose-900/30 transition-colors opacity-0 group-hover:opacity-100"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
