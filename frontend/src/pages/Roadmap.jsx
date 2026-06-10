import { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { Map, MapPin, Briefcase, Loader2, Search, Trash2, Clock, BookOpen, Check } from 'lucide-react';

const RoadmapPage = () => {
  const [roadmaps, setRoadmaps] = useState([]);
  const [currentRoadmap, setCurrentRoadmap] = useState(null);
  const [targetRole, setTargetRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  
  // Interactive skills completion state
  const [completedSkills, setCompletedSkills] = useState({});

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const fetchRoadmaps = async () => {
    setLoading(true);
    try {
      const res = await api.get('/roadmaps/');
      setRoadmaps(res.data);
      if (res.data.length > 0) {
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
      setRoadmaps(prev => [newRoadmap, ...prev]);
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

  const toggleSkillLocal = (skillName) => {
    setCompletedSkills(prev => ({
      ...prev,
      [skillName]: !prev[skillName]
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#05060b] text-slate-100 font-sans">
      <Navbar />
      
      <main className="max-w-6xl mx-auto w-full flex-grow flex flex-col md:flex-row p-6 lg:p-8 gap-8 overflow-hidden md:h-[calc(100vh-80px)]">
        
        {/* Sidebar: Roadmap History */}
        <div className="w-full md:w-1/4 md:min-w-[280px] glass-panel flex flex-col overflow-hidden shrink-0 h-[280px] md:h-full">
          <div className="p-4 border-b border-white/5 bg-white/5">
            <h2 className="text-xs font-extrabold text-slate-300 flex items-center uppercase tracking-widest">
              <Map className="w-4 h-4 mr-2 text-purple-400" /> Career Paths
            </h2>
          </div>
          
          <div className="flex-grow overflow-y-auto p-4 space-y-2">
            {loading ? (
              <div className="flex justify-center py-4"><Loader2 className="animate-spin text-purple-500" /></div>
            ) : roadmaps.length === 0 ? (
              <div className="text-center py-12 text-slate-500 space-y-3">
                <MapPin className="h-8 w-8 mx-auto opacity-40 text-purple-400" />
                <p className="text-xs font-bold uppercase tracking-widest">No timelines</p>
                <p className="text-[9px] font-light">Search for a role to generate one.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {roadmaps.map(roadmap => (
                  <div
                    key={roadmap.id}
                    onClick={() => selectRoadmap(roadmap)}
                    className={`flex flex-col p-3.5 rounded-xl cursor-pointer transition-all border group ${
                      currentRoadmap?.id === roadmap.id 
                        ? 'bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border-purple-500/30 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.05)]' 
                        : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-xs truncate pr-2 text-slate-200">
                        {roadmap.target_role}
                      </h4>
                      <button 
                        onClick={(e) => handleDelete(roadmap.id, e)}
                        className="text-slate-500 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-rose-500/10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[9px] text-slate-500 mt-1.5">{new Date(roadmap.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-grow flex flex-col gap-6 overflow-hidden md:h-full">
          
          {/* Top Search Banner */}
          <div className="glass-panel p-5 relative overflow-hidden shrink-0 bg-gradient-to-br from-[#0d1020]/30 to-[#05060b]/30">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500"></div>
            
            <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-grow w-full">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-purple-400" />
                </div>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="Enter dream career path... (e.g. Cloud Lead, DevOps Specialist)"
                  className="glass-input pl-10 pr-4 py-3 w-full text-xs font-bold"
                  disabled={generating}
                />
              </div>
              <button
                type="submit"
                disabled={!targetRole.trim() || generating}
                className="glass-button py-3 px-6 text-xs w-full sm:w-auto shrink-0 shadow-lg shadow-purple-500/25 flex items-center justify-center"
              >
                {generating ? <><Loader2 className="w-4 h-4 animate-spin mr-1.5" /> Building...</> : 'Generate Timeline'}
              </button>
            </form>
          </div>

          {/* Visual Roadmap TIMELINE viewport */}
          <div className="flex-grow glass-panel overflow-y-auto p-6 md:h-full bg-gradient-to-b from-[#0d1020]/20 to-[#05060b]/20">
            {!currentRoadmap ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 p-8 border border-dashed border-white/5 rounded-2xl">
                <Map className="w-12 h-12 mb-4 opacity-40 text-purple-400" />
                <h4 className="font-extrabold text-xs uppercase tracking-widest text-slate-300">Interactive Career Roadmaps</h4>
                <p className="text-[10px] max-w-xs mt-1.5 leading-normal font-light">
                  Generate your custom career path tree using the input search bar above.
                </p>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto space-y-6">
                
                {/* Header Info */}
                <div className="text-center pb-6 border-b border-white/5">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[9px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <Clock className="w-3.5 h-3.5 mr-1.5" /> Timeline: {currentRoadmap.parsedData.timeline || '6 Months'}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-4">
                    Path to <span className="text-gradient-primary">{currentRoadmap.target_role}</span>
                  </h2>
                </div>

                {/* Content Layout Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Left Column: Visual timeline tree */}
                  <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-4">
                      Learning Phases
                    </h3>

                    <div className="relative border-l border-purple-500/30 dark:border-purple-500/10 ml-4 space-y-6 pb-6 pt-2">
                      
                      {currentRoadmap.parsedData.roadmap_steps?.map((step, idx) => {
                        const isCompleted = idx === 0;
                        const isFocused = idx === 1 || idx === 2;
                        
                        return (
                          <div key={idx} className="relative pl-8 group">
                            
                            {/* Connector dot */}
                            <div className={`absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full flex items-center justify-center border transition-all ${
                              isCompleted 
                                ? 'bg-purple-600 border-white dark:border-[#05060b]' 
                                : isFocused
                                ? 'bg-[#05060b] border-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)] scale-110'
                                : 'bg-slate-700 border-transparent'
                            }`}>
                              {isCompleted && <Check className="w-1.5 h-1.5 text-white" />}
                            </div>

                            {/* Phase details card */}
                            <div className={`glass-card p-5 transition-all hover:border-purple-500/30 ${
                              isFocused 
                                ? 'border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.1)] bg-purple-500/5' 
                                : 'opacity-90'
                            }`}>
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-extrabold text-sm text-slate-200">{step.title}</h4>
                                <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${
                                  isCompleted
                                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                                    : isFocused
                                    ? 'bg-purple-500/15 text-purple-400 border border-purple-500/20'
                                    : 'bg-white/5 text-slate-500'
                                }`}>
                                  Phase {idx + 1}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 font-light leading-relaxed">{step.description}</p>
                              
                              <div className="flex justify-between items-center mt-4 pt-3 border-t border-white/5 text-[9px] font-bold">
                                <span className="text-slate-500 flex items-center">
                                  <Clock className="w-3.5 h-3.5 mr-1" /> {step.duration}
                                </span>
                                
                                {isFocused && idx === 2 && (
                                  <span className="text-purple-400 flex items-center cursor-pointer hover:underline">
                                    <BookOpen className="w-3.5 h-3.5 mr-1" /> View Resource
                                  </span>
                                )}
                              </div>
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: Interactive checklists & projects */}
                  <div className="space-y-6">
                    
                    {/* Interactive Checklist */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
                        Checklist
                      </h3>
                      
                      <div className="glass-card p-5 space-y-4">
                        <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block border-b border-white/5 pb-2">
                          Core Skills Checklist
                        </span>
                        
                        <div className="space-y-3 max-h-48 overflow-y-auto">
                          {currentRoadmap.parsedData.skills?.map((skill, i) => {
                            const isDone = !!completedSkills[skill];
                            return (
                              <label 
                                key={i} 
                                className="flex items-center space-x-3 cursor-pointer text-xs group"
                              >
                                <input 
                                  type="checkbox" 
                                  checked={isDone}
                                  onChange={() => toggleSkillLocal(skill)}
                                  className="w-4 h-4 rounded border-white/10 bg-[#070914]/40 text-purple-600 focus:ring-0 focus:ring-offset-0 focus:outline-none"
                                />
                                <span className={`font-bold transition-all text-slate-300 group-hover:text-purple-400 ${isDone ? 'line-through text-slate-500' : ''}`}>
                                  {skill}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Portfolio Projects card */}
                    {currentRoadmap.parsedData.projects && currentRoadmap.parsedData.projects.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
                          Portfolio Projects
                        </h3>
                        <div className="space-y-3">
                          {currentRoadmap.parsedData.projects.map((proj, i) => (
                            <div key={i} className="glass-card p-5 relative overflow-hidden group">
                              <div className="absolute right-0 top-0 w-8 h-8 bg-amber-500/10 rounded-bl-2xl -z-10 group-hover:scale-125 transition-transform"></div>
                              <h4 className="text-xs font-extrabold text-amber-400 flex items-center mb-1.5">
                                <Briefcase className="w-3.5 h-3.5 mr-1.5" /> {proj.name}
                              </h4>
                              <p className="text-[11px] text-slate-400 leading-relaxed font-light">{proj.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

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
