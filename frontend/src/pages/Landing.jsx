import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Upload, FileText, CheckCircle, Play, Target, Map, Mic, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';
import { getCurrentUserToken } from '../services/auth';

const Landing = () => {
  const navigate = useNavigate();
  const token = getCurrentUserToken();
  const [demoFile, setDemoFile] = useState(null);
  const [demoUploading, setDemoUploading] = useState(false);
  const [demoSuccess, setDemoSuccess] = useState(false);

  // Smooth scroll helper
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDemoUpload = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setDemoFile(file);
      setDemoUploading(true);
      setTimeout(() => {
        setDemoUploading(false);
        setDemoSuccess(true);
        setTimeout(() => {
          // Redirect to register after successful demo upload
          navigate('/register');
        }, 1500);
      }, 2000);
    }
  };

  const companies = [
    'Google', 'Microsoft', 'Meta', 'Goldman Sachs', 
    'McKinsey', 'Netflix', 'Apple', 'Deloitte', 
    'Harvard', 'MIT', 'Stanford', 'Yale'
  ];

  return (
    <div className="min-h-screen text-slate-100 bg-[#05060b] relative overflow-x-hidden font-sans">
      {/* Background radial glow meshes */}
      <div className="fixed inset-0 -z-20 bg-[#05060b]" />
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[60vw] h-[60vw] max-w-[800px] bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.12)_0%,transparent_70%)] rounded-full blur-[130px] opacity-90" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[70vw] h-[70vw] max-w-[900px] bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1)_0%,transparent_75%)] rounded-full blur-[150px] opacity-80" />
        <div className="absolute top-[35%] left-[10%] w-[45vw] h-[45vw] max-w-[600px] bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.06)_0%,transparent_70%)] rounded-full blur-[120px] opacity-70" />
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      {/* Floating Glass Header */}
      <header className="sticky top-0 z-50 w-full py-3 sm:py-4 px-4 backdrop-blur-md border-b border-white/5 bg-[#05060b]/30">
        <nav className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <svg className="w-8 h-8 filter drop-shadow-[0_0_6px_rgba(168,85,247,0.5)]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="nGradLanding" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="50%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
              <path d="M25 80V20H40L65 65V20H80V80H65L40 35V80H25Z" fill="url(#nGradLanding)" />
            </svg>
            <span className="text-lg font-black tracking-wider text-white">
              NextHire<span className="text-purple-400">AI</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => scrollToSection('features')} className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">
              Features
            </button>
            <button onClick={() => scrollToSection('how-it-works')} className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">
              How It Works
            </button>
            <button onClick={() => scrollToSection('testimonials')} className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">
              Impact
            </button>
          </div>

          <div className="flex items-center space-x-4">
            {token ? (
              <Link to="/dashboard" className="px-5 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-xs sm:text-sm font-bold text-white transition-all">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-xs sm:text-sm font-bold text-slate-300 hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link to="/register" className="px-4 py-2 rounded-full text-xs sm:text-sm font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/20 border border-purple-400/20 transition-all active:scale-95">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 sm:pb-24 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column Text content */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 sm:space-y-8">
            {/* Announcement Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-purple-500/20 bg-gradient-to-r from-purple-500/5 to-indigo-500/5 backdrop-blur-sm shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span className="text-xs font-semibold text-slate-300">
                🎉 Trusted by over 50,000 job candidates
              </span>
            </div>

            <h1 className="text-white font-extrabold tracking-tight text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[80px] leading-[1.1] sm:leading-tight md:leading-[1.1]">
              Meet Next<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400">Hire AI</span>
            </h1>

            <p className="text-slate-300 font-light text-base sm:text-xl md:text-2xl lg:text-[22px] leading-relaxed max-w-xl">
              Turn any resume into step-by-step career learning roadmaps, interactive ATS match analytics, and live voice mock interviews.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-xl shadow-purple-500/25 flex items-center justify-center space-x-2 group border border-purple-400/20 transition-all active:scale-[0.98]"
              >
                <span>Get Started - It's Free</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <button
                onClick={() => scrollToSection('features')}
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all"
              >
                Explore Features
              </button>
            </div>
          </div>

          {/* Right Column Interactive Demo Card */}
          <div className="w-full max-w-md mx-auto lg:ml-auto">
            <div className="relative rounded-2xl border border-white/10 shadow-[0_0_50px_-10px_rgba(168,85,247,0.3)] p-6 bg-gradient-to-br from-purple-950/10 via-[#0a0c16]/80 to-indigo-950/10 backdrop-blur-xl animate-[pulse_6s_infinite_ease-in-out]">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500 rounded-t-2xl"></div>
              
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Live Uploader Demo</span>
              </div>

              <div className="flex flex-col items-center justify-center py-12 px-6 border-2 border-dashed border-white/10 hover:border-purple-500/40 rounded-xl bg-[#070914]/40 hover:bg-[#070914]/80 transition-all cursor-pointer relative group">
                <input 
                  type="file" 
                  accept=".pdf,.docx,.txt" 
                  onChange={handleDemoUpload} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  disabled={demoUploading || demoSuccess}
                />

                {demoUploading ? (
                  <>
                    <Loader2 className="w-12 h-12 text-purple-400 animate-spin mb-4" />
                    <p className="text-sm font-bold text-slate-200">AI is analyzing formatting...</p>
                    <p className="text-xs text-slate-400 mt-1">Extracting skill profile</p>
                  </>
                ) : demoSuccess ? (
                  <>
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mb-4">
                      <CheckCircle className="w-6 h-6 text-emerald-400" />
                    </div>
                    <p className="text-sm font-bold text-emerald-400">Analysis complete!</p>
                    <p className="text-xs text-slate-400 mt-1">Redirecting to personalized coach...</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
                    <p className="text-sm font-bold text-slate-200">
                      {demoFile ? demoFile.name : 'Upload your resume'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1.5 text-center">
                      Supports PDF, DOCX or TXT. Get your ATS score instantly.
                    </p>
                  </>
                )}
              </div>

              {/* Demo metrics snapshot */}
              <div className="mt-6 pt-5 border-t border-white/5 grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Average Score</span>
                  <span className="text-xl font-black text-white">82%</span>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Salary Increase</span>
                  <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">+24%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Infinite Logo Scroll Marquee */}
      <section className="py-12 border-y border-white/5 bg-slate-950/20">
        <h3 className="text-center text-xs font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-8">
          NextHire candidates get hired at industry leaders
        </h3>
        
        <div className="relative w-full h-[40px] overflow-hidden" style={{ maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)' }}>
          <div className="absolute flex animate-infinite-scroll whitespace-nowrap">
            <div className="flex gap-16 items-center px-8">
              {companies.map((company, index) => (
                <span key={index} className="text-2xl font-black tracking-widest text-slate-400/35 hover:text-slate-300 transition-colors uppercase font-mono">
                  {company}
                </span>
              ))}
            </div>
            <div className="flex gap-16 items-center px-8">
              {companies.map((company, index) => (
                <span key={`dup-${index}`} className="text-2xl font-black tracking-widest text-slate-400/35 hover:text-slate-300 transition-colors uppercase font-mono">
                  {company}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <span className="text-xs uppercase font-extrabold tracking-widest text-purple-400">Everything You Need</span>
          <h2 className="text-white font-extrabold text-3xl sm:text-4xl md:text-5xl leading-tight">
            The last career assistant you'll ever need
          </h2>
          <p className="text-slate-300 font-light text-base sm:text-lg">
            Say goodbye to generalized advice. NextHire AI builds customized training parameters directly from your unique professional profile.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1 */}
          <div className="glass-card p-8 flex flex-col justify-between hover:scale-[1.02] cursor-pointer group">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 group-hover:bg-purple-500/20 transition-all">
                <Target className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
                Intelligent ATS Matcher
              </h3>
              <p className="text-slate-300 font-light text-sm leading-relaxed">
                Paste any job description and instantly verify your compatibility. Obtain clear, structural lists of missing keywords, matching strengths, and resume alignment advice.
              </p>
            </div>
            <Link to="/register" className="mt-6 flex items-center text-xs font-bold uppercase tracking-wider text-purple-400 hover:text-purple-300 transition-colors">
              <span>Try Job Matcher</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Link>
          </div>

          {/* Card 2 */}
          <div className="glass-card p-8 flex flex-col justify-between hover:scale-[1.02] cursor-pointer group">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-all">
                <Mic className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                Voice Coach Engine
              </h3>
              <p className="text-slate-300 font-light text-sm leading-relaxed">
                Connect your microphone and undergo dynamic, real-time mock interviews. Get instant analytics on your speaking pace (WPM), speech filler words, and answer quality scores.
              </p>
            </div>
            <Link to="/register" className="mt-6 flex items-center text-xs font-bold uppercase tracking-wider text-indigo-400 hover:text-indigo-300 transition-colors">
              <span>Practice Voice Coach</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Link>
          </div>

          {/* Card 3 */}
          <div className="glass-card p-8 flex flex-col justify-between hover:scale-[1.02] cursor-pointer group">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 group-hover:bg-cyan-500/20 transition-all">
                <Map className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                Automated Career Roadmaps
              </h3>
              <p className="text-slate-300 font-light text-sm leading-relaxed">
                Generate tailored, step-by-step career roadmaps for your dream jobs. We outline exact timeline phases, specific technologies, and portfolio project objectives you must complete.
              </p>
            </div>
            <Link to="/register" className="mt-6 flex items-center text-xs font-bold uppercase tracking-wider text-cyan-400 hover:text-cyan-300 transition-colors">
              <span>View roadmaps</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Link>
          </div>

          {/* Card 4 */}
          <div className="glass-card p-8 flex flex-col justify-between hover:scale-[1.02] cursor-pointer group">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 group-hover:bg-purple-500/20 transition-all">
                <Activity className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
                Deep Speech Analytics
              </h3>
              <p className="text-slate-300 font-light text-sm leading-relaxed">
                Review your mock interview transcripts side-by-side with professional feedback summaries. Track your improvement over time with detailed, graphical metrics dashboards.
              </p>
            </div>
            <Link to="/register" className="mt-6 flex items-center text-xs font-bold uppercase tracking-wider text-purple-400 hover:text-purple-300 transition-colors">
              <span>Open Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-24 border-t border-white/5 bg-slate-950/10 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-400">Simple Setup</span>
            <h2 className="text-white font-extrabold text-3xl sm:text-4xl md:text-5xl leading-tight">
              Get ready for your role in minutes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative p-6 rounded-2xl bg-white/5 border border-white/5 text-center space-y-4">
              <div className="h-10 w-10 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-400 font-black flex items-center justify-center mx-auto text-sm">
                1
              </div>
              <h3 className="text-lg font-bold text-white">Upload Your Profile</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Upload your resume (PDF/DOCX/TXT) or paste your professional bio to feed target contexts to the NextHire AI engine.
              </p>
            </div>

            <div className="relative p-6 rounded-2xl bg-white/5 border border-white/5 text-center space-y-4">
              <div className="h-10 w-10 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 font-black flex items-center justify-center mx-auto text-sm">
                2
              </div>
              <h3 className="text-lg font-bold text-white">Train with AI Coach</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Go through mock interview sessions, review missing key competencies, and checklist roadmap steps step-by-step.
              </p>
            </div>

            <div className="relative p-6 rounded-2xl bg-white/5 border border-white/5 text-center space-y-4">
              <div className="h-10 w-10 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 font-black flex items-center justify-center mx-auto text-sm">
                3
              </div>
              <h3 className="text-lg font-bold text-white">Land Your Dream Job</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Utilize your refined speaking flow, keyword optimizations, and technical training to master the real-world recruiters.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <span className="text-xs uppercase font-extrabold tracking-widest text-cyan-400">Success Stories</span>
          <h2 className="text-white font-extrabold text-3xl sm:text-4xl">
            Tested & approved by job seekers
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card p-6 flex flex-col justify-between">
            <p className="text-slate-300 font-light text-xs leading-relaxed italic">
              "The Voice Coach is unreal! It forced me to stop saying 'like' and 'you know' during every sentence. I got a Senior Dev role at Goldman Sachs three weeks later."
            </p>
            <div className="mt-6 flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full bg-purple-500/25 flex items-center justify-center font-bold text-xs">
                A
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Alex Chen</h4>
                <p className="text-[9px] text-slate-400">Senior Developer</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 flex flex-col justify-between">
            <p className="text-slate-300 font-light text-xs leading-relaxed italic">
              "I uploaded my resume and matched it to a Cloud Architect job description. It pointed out 4 missing AWS keywords. I updated it, applied, and got an interview immediately."
            </p>
            <div className="mt-6 flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full bg-indigo-500/25 flex items-center justify-center font-bold text-xs">
                M
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Maria Santos</h4>
                <p className="text-[9px] text-slate-400">Cloud Architect</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 flex flex-col justify-between">
            <p className="text-slate-300 font-light text-xs leading-relaxed italic">
              "The career timelines are super detailed. It outlined a complete roadmap for AI Product Manager and suggested projects to build. Highly recommend this tool."
            </p>
            <div className="mt-6 flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full bg-cyan-500/25 flex items-center justify-center font-bold text-xs">
                K
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Kevin Patel</h4>
                <p className="text-[9px] text-slate-400">AI Product Manager</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Call to Action Banner */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto relative z-10 text-center">
        <div className="rounded-3xl border border-purple-500/20 bg-gradient-to-b from-purple-950/15 via-[#0b0c16] to-[#05060b] p-12 sm:p-16 relative overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.15)] space-y-8">
          <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[80px] pointer-events-none"></div>
          
          <h2 className="text-white font-extrabold text-3xl sm:text-5xl leading-tight">
            Master your next career move today
          </h2>
          <p className="text-slate-300 font-light text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            Upload your profile, practice with our AI, and optimize your qualifications. Land your next role with confidence.
          </p>

          <Link
            to="/register"
            className="inline-flex px-8 py-4 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-xl shadow-purple-500/25 border border-purple-400/20 transition-all active:scale-[0.98] items-center space-x-2"
          >
            <span>Start Practice - It's Free</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 bg-slate-950/40 text-center relative z-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-400 font-medium">
          <div className="flex items-center space-x-2">
            <svg className="w-6 h-6" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M25 80V20H40L65 65V20H80V80H65L40 35V80H25Z" fill="url(#nGradLanding)" />
            </svg>
            <span className="font-extrabold text-white">NextHire AI</span>
          </div>
          <p>© {new Date().getFullYear()} NextHire AI. Redefining professional preparation.</p>
          <div className="flex items-center space-x-4">
            <span className="flex items-center text-[10px] bg-white/5 border border-white/5 rounded-full px-3 py-1 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400 mr-1" />
              Secure JWT Auth
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Simple loader helper inside landing
const Loader2 = ({ className }) => (
  <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export default Landing;
