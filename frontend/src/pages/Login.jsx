import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/auth';
import { LogIn, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';

const quotes = [
  { text: "Success is where preparation and opportunity meet.", author: "Bobby Unser" },
  { text: "The best way to predict your future is to create it.", author: "Abraham Lincoln" },
  { text: "Prepare today for the career path of tomorrow.", author: "NextHire AI Coach" }
];

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [quoteIndex, setQuoteIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const quoteTimer = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 6000);
    return () => clearInterval(quoteTimer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex text-slate-100 bg-[#05060b] transition-colors duration-300 relative overflow-hidden font-sans">
      {/* Background blobs for auth */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.1)_0%,transparent_70%)] rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.08)_0%,transparent_70%)] rounded-full blur-[100px] pointer-events-none" />

      {/* Left Column: Premium Graphic and Quotes */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-950 overflow-hidden items-center justify-center border-r border-white/5">
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-950/20 via-slate-950 to-cyan-950/20 z-10" />
        
        {/* Subtle geometric grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] z-10" />

        <div className="relative z-20 w-full p-16 flex flex-col justify-between h-full bg-gradient-to-t from-slate-950 via-slate-900/10 to-transparent">
          <div className="flex items-center space-x-2">
            <svg className="w-10 h-10 filter drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="nGradLargeLogin" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="50%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
              <path d="M25 80V20H40L65 65V20H80V80H65L40 35V80H25Z" fill="url(#nGradLargeLogin)" />
            </svg>
            <span className="text-2xl font-black tracking-widest text-white">
              NextHire<span className="text-purple-400">AI</span>
            </span>
          </div>

          <div className="max-w-xl pr-6 transition-all duration-700 ease-in-out">
            <div className="h-32 flex flex-col justify-end mb-8">
              <p className="text-2xl sm:text-3xl font-light italic text-slate-100 leading-relaxed transition-all duration-500">
                "{quotes[quoteIndex].text}"
              </p>
              <p className="text-sm font-bold uppercase tracking-widest text-purple-400 mt-3 ml-1">
                — {quotes[quoteIndex].author}
              </p>
            </div>
            <h1 className="text-4xl font-extrabold text-white leading-tight mb-4">
              Master Your Next Career Move.
            </h1>
            <p className="text-base text-slate-400 font-light leading-relaxed">
              Join professional job seekers using AI resume matching, interactive roadmap timelines, and real-time voice interview engines.
            </p>
          </div>
        </div>
      </div>

      {/* Right Column: Glassmorphic Auth Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-28 relative z-10">
        <div className="w-full max-w-md mx-auto">
          
          {/* Mobile Branding */}
          <div className="lg:hidden text-center mb-8 flex items-center justify-center space-x-2">
            <svg className="w-9 h-9 filter drop-shadow-[0_0_6px_rgba(168,85,247,0.5)]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M25 80V20H40L65 65V20H80V80H65L40 35V80H25Z" fill="url(#nGradLargeLogin)" />
            </svg>
            <span className="text-2xl font-black tracking-wider text-white">
              NextHire<span className="text-purple-400">AI</span>
            </span>
          </div>

          {/* Glass Card Container */}
          <div className="glass-panel p-8 sm:p-10 shadow-2xl relative overflow-hidden bg-gradient-to-br from-purple-950/5 via-[#0d1020]/90 to-cyan-950/5 backdrop-blur-xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500"></div>

            {/* Glowing Icon Holder */}
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 rounded-3xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shadow-md">
                <svg className="w-9 h-9 text-purple-400 filter drop-shadow-[0_0_4px_rgba(168,85,247,0.4)]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M25 80V20H40L65 65V20H80V80H65L40 35V80H25Z" fill="url(#nGradLargeLogin)" />
                </svg>
              </div>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Welcome back
              </h2>
              <p className="mt-2 text-xs text-slate-400">
                Please enter your credentials to log in.
              </p>
            </div>
            
            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-rose-500/10 text-rose-400 p-3 rounded-xl text-xs border border-rose-500/20 font-medium">
                  {error}
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">Email Address</label>
                  <input
                    type="email"
                    required
                    className="glass-input w-full"
                    placeholder="john.doe@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1.5 ml-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Password</label>
                    <a href="#" className="text-xs font-semibold text-purple-400 hover:underline">Forgot password?</a>
                  </div>
                  <input
                    type="password"
                    required
                    className="glass-input w-full"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-2">
                <button type="submit" className="glass-button w-full flex items-center justify-center py-3.5 shadow-lg shadow-purple-500/25">
                  <span>Login</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </form>

            {/* Social Divider */}
            <div className="my-6 flex items-center justify-between text-[10px] text-slate-500 uppercase tracking-widest font-bold">
              <span className="w-1/4 border-b border-white/5"></span>
              <span>Or connect with</span>
              <span className="w-1/4 border-b border-white/5"></span>
            </div>

            {/* Social Logins */}
            <div className="grid grid-cols-1 gap-3">
              <button className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs font-semibold hover:bg-white/10 transition-colors">
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                <span>Sign in with Google</span>
              </button>
            </div>

            <div className="mt-8 text-center text-xs text-slate-400">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-purple-400 hover:text-purple-300 transition-colors hover:underline">
                Register
              </Link>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Login;
