import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/auth';
import { UserPlus, ArrowRight } from 'lucide-react';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(email, password);
      navigate('/login');
    } catch (err) {
      setError('Registration failed. Email may already exist.');
    }
  };

  return (
    <div className="min-h-screen flex transition-colors duration-300">
      
      {/* Left Column: Image/Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-indigo-900/40 mix-blend-multiply z-10" />
        <img 
          src="/auth-bg.png" 
          alt="AI Technology" 
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-80"
        />
        <div className="relative z-20 w-full p-12 flex flex-col justify-between h-full bg-gradient-to-t from-slate-950 via-slate-900/20 to-transparent">
          <div>
            <Link to="/" className="text-3xl font-black tracking-tight text-white flex items-center">
              NextHire<span className="text-indigo-400">AI</span>
            </Link>
          </div>
          <div className="max-w-lg">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">
              Unlock Your Career Potential.
            </h1>
            <p className="text-lg text-slate-300">
              Create an account today to access AI-powered resume matching, roadmap generation, and realistic voice mock interviews.
            </p>
          </div>
        </div>
      </div>

      {/* Right Column: Auth Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-20 xl:px-32 relative">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-10">
             <Link to="/" className="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center justify-center">
              NextHire<span className="text-indigo-600 dark:text-indigo-400">AI</span>
            </Link>
          </div>

          <div className="bg-white/70 backdrop-blur-xl dark:bg-slate-900/60 p-8 sm:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-slate-200/60 dark:border-white/10">
            <div>
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mb-6 border border-indigo-100 dark:border-indigo-800/50">
                <UserPlus className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                Create an account
              </h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Start your journey with NextHire AI.
              </p>
            </div>
            
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 p-3 rounded-lg text-sm border border-rose-100 dark:border-rose-800/50">
                  {error}
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    className="appearance-none block w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    className="appearance-none block w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-md shadow-indigo-500/20"
                >
                  Register
                  <ArrowRight className="ml-2 h-5 w-5 opacity-70 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>
            </form>
            
            <div className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors">
                Sign in
              </Link>
            </div>
          </div>
          
          {/* Footer Links */}
          <div className="mt-12 flex items-center justify-center space-x-6 text-sm text-slate-500 dark:text-slate-400">
            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">About</a>
            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Help</a>
            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
