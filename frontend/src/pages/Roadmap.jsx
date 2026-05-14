import { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { Map, MapPin, Briefcase, Target, Loader2, Search, Trash2, Clock, CheckCircle } from 'lucide-react';

const RoadmapPage = () => {
  const [roadmaps, setRoadmaps] = useState([]);
  const [currentRoadmap, setCurrentRoadmap] = useState(null);
  const [targetRole, setTargetRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const fetchRoadmaps = async () => {
    setLoading(true);
    try {
      const res = await api.get('/roadmaps/');
      setRoadmaps(res.data);
      if (res.data.length > 0 && !currentRoadmap) {
        selectRoadmap(res.data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch roadmaps', error);
    } finally {
      setLoading(false);
    }
  };

  const selectRoadmap = (roadmap) => {
    try {
      const parsedData = JSON.parse(roadmap.content_json);
      setCurrentRoadmap({ ...roadmap, parsedData });
    } catch (e) {
      console.error('Failed to parse roadmap JSON');
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!targetRole.trim() || generating) return;

    setGenerating(true);
    try {
      const res = await api.post('/roadmaps/generate', { target_role: targetRole.trim() });
      const newRoadmap = res.data;
      setRoadmaps([newRoadmap, ...roadmaps]);
      selectRoadmap(newRoadmap);
      setTargetRole('');
    } catch (error) {
      console.error('Failed to generate roadmap', error);
      alert('Error generating roadmap. Please check your API quota or try again later.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this roadmap?')) return;
    
    try {
      await api.delete(`/roadmaps/${id}`);
      setRoadmaps(roadmaps.filter(r => r.id !== id));
      if (currentRoadmap && currentRoadmap.id === id) {
        setCurrentRoadmap(null);
      }
    } catch (error) {
      console.error('Failed to delete roadmap', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 font-sans flex flex-col">
      <Navbar />
      
      <main className="max-w-7xl mx-auto w-full flex-grow flex flex-col md:flex-row p-4 sm:p-6 lg:p-8 gap-6 h-[calc(100vh-64px)]">
        
        {/* Sidebar: History */}
        <div className="w-full md:w-1/4 md:min-w-[300px] bg-white/70 backdrop-blur-xl dark:bg-slate-900/60 rounded-2xl shadow-sm border border-white/50 dark:border-white/10 flex flex-col overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
              <Map className="w-5 h-5 mr-2 text-indigo-500 dark:text-indigo-400" /> Career Roadmaps
            </h2>
          </div>
          
          <div className="flex-grow overflow-y-auto p-4 space-y-2">
            {loading ? (
              <div className="flex justify-center p-4"><Loader2 className="animate-spin text-indigo-500 dark:text-indigo-400" /></div>
            ) : roadmaps.length === 0 ? (
              <div className="text-center py-10 px-4">
                <MapPin className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">No roadmaps generated yet.</p>
                <p className="text-xs text-slate-400 mt-1">Search for a role to generate your first path.</p>
              </div>
            ) : (
              roadmaps.map(roadmap => (
                <div
                  key={roadmap.id}
                  onClick={() => selectRoadmap(roadmap)}
                  className={`flex flex-col p-3 rounded-xl cursor-pointer transition-all border group ${
                    currentRoadmap?.id === roadmap.id 
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 shadow-sm' 
                      : 'bg-white/70 backdrop-blur-xl dark:bg-slate-900/60 border-slate-100 dark:border-slate-800 hover:border-indigo-100 hover:bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <h4 className={`font-semibold text-sm truncate pr-2 ${currentRoadmap?.id === roadmap.id ? 'text-indigo-900' : 'text-slate-700 dark:text-slate-300'}`}>
                      {roadmap.target_role}
                    </h4>
                    <button 
                      onClick={(e) => handleDelete(roadmap.id, e)}
                      className="text-slate-300 hover:text-rose-500 dark:text-rose-400 transition-colors opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-rose-50 dark:bg-rose-900/30"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{new Date(roadmap.created_at).toLocaleDateString()}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-grow flex flex-col gap-6 overflow-hidden">
          
          {/* Search Bar / Input Area */}
          <div className="bg-white/70 backdrop-blur-xl dark:bg-slate-900/60 p-6 rounded-2xl shadow-sm border border-white/50 dark:border-white/10 flex flex-col items-center justify-center relative overflow-hidden flex-none">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2 text-center">Where do you want your career to go?</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 text-center max-w-lg">Enter your dream job title and our AI will build a personalized, step-by-step learning roadmap just for you.</p>
            
            <form onSubmit={handleGenerate} className="w-full max-w-2xl relative flex items-center">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Target className="h-5 w-5 text-indigo-400" />
              </div>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g., Senior Full Stack Developer, AI Engineer..."
                className="block w-full pl-11 pr-32 py-4 border-2 border-white/50 dark:border-white/10 rounded-2xl leading-5 bg-white/70 backdrop-blur-xl dark:bg-slate-900/60 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-0 sm:text-lg transition-colors font-medium shadow-sm"
                disabled={generating}
              />
              <button
                type="submit"
                disabled={!targetRole.trim() || generating}
                className="absolute right-2 top-2 bottom-2 bg-indigo-600 text-white font-semibold rounded-xl px-6 hover:bg-indigo-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center shadow-sm"
              >
                {generating ? <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Generating</> : 'Generate Path'}
              </button>
            </form>
          </div>

          {/* Visual Roadmap Display */}
          <div className="flex-grow bg-white/70 backdrop-blur-xl dark:bg-slate-900/60 rounded-2xl shadow-sm border border-white/50 dark:border-white/10 overflow-y-auto">
            {!currentRoadmap ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <Map className="w-16 h-16 mb-4 text-slate-200" />
                <p className="text-lg font-medium">Your personalized roadmap will appear here.</p>
              </div>
            ) : (
              <div className="p-8 max-w-4xl mx-auto">
                
                <div className="mb-10 text-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 mb-4 border border-indigo-200">
                    <Clock className="w-3.5 h-3.5 mr-1" /> Estimated Timeline: {currentRoadmap.parsedData.timeline}
                  </span>
                  <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
                    The path to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">{currentRoadmap.target_role}</span>
                  </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  
                  {/* Left Column: Vertical Timeline */}
                  <div className="lg:col-span-2">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center border-b pb-2">
                      <MapPin className="w-5 h-5 mr-2 text-indigo-500 dark:text-indigo-400" /> Learning Phases
                    </h3>
                    
                    <div className="relative border-l-2 border-indigo-100 ml-3 space-y-8 pb-4">
                      {currentRoadmap.parsedData.roadmap_steps?.map((step, idx) => (
                        <div key={idx} className="relative pl-8 group">
                          <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-white/70 backdrop-blur-xl dark:bg-slate-900/60 border-4 border-indigo-500 shadow-[0_0_0_4px_white] transition-transform group-hover:scale-125"></div>
                          <div className="bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 rounded-xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm transition-shadow hover:shadow-md">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="text-lg font-bold text-slate-900 dark:text-white">{step.title}</h4>
                              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/50 px-2.5 py-1 rounded-full">
                                Phase {idx + 1}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{step.description}</p>
                            <p className="text-xs font-medium text-slate-400 mt-3 flex items-center">
                              <Clock className="w-3 h-3 mr-1" /> {step.duration}
                            </p>
                          </div>
                        </div>
                      ))}
                      {/* Destination dot */}
                      <div className="absolute -left-[13px] -bottom-2 h-6 w-6 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg border-2 border-white">
                        <Target className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Skills & Projects */}
                  <div className="space-y-8">
                    
                    {/* Skills Grid */}
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center border-b pb-2">
                        <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" /> Core Skills to Master
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {currentRoadmap.parsedData.skills?.map((skill, i) => (
                          <span key={i} className="px-3 py-1.5 text-sm font-semibold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg border border-emerald-100 shadow-sm hover:bg-emerald-100 dark:bg-emerald-900/50 transition-colors cursor-default">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Projects Cards */}
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center border-b pb-2">
                        <Briefcase className="w-4 h-4 mr-2 text-amber-500" /> Portfolio Projects
                      </h3>
                      <div className="space-y-4">
                        {currentRoadmap.parsedData.projects?.map((proj, i) => (
                          <div key={i} className="bg-amber-50 dark:bg-amber-900/30 rounded-xl p-4 border border-amber-100 shadow-sm relative overflow-hidden group">
                            <div className="absolute right-0 top-0 w-10 h-10 bg-amber-100 dark:bg-amber-900/50 rounded-bl-3xl -z-10 transition-transform group-hover:scale-150"></div>
                            <h4 className="text-sm font-bold text-amber-900 mb-1">{proj.name}</h4>
                            <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">{proj.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default RoadmapPage;
