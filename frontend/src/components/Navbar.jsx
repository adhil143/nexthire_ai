import { Link, useNavigate } from 'react-router-dom';
import { logout, getCurrentUserToken } from '../services/auth';
import useDarkMode from '../hooks/useDarkMode';
import { Moon, Sun } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const token = getCurrentUserToken();
  const { theme, toggleTheme } = useDarkMode();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white dark:bg-slate-900 shadow-sm border-b dark:border-slate-800 transition-colors duration-300 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                NextHire AI
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            {token ? (
              <>
                <Link to="/dashboard" className="text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium">
                  Dashboard
                </Link>
                <Link to="/interview-coach" className="text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                  <span className="mr-1">💬</span> Chat Coach
                </Link>
                <Link to="/voice-coach" className="text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                  <span className="mr-1">🎙️</span> Voice Coach
                </Link>
                <Link to="/roadmap" className="text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                  <span className="mr-1">🛣️</span> Roadmap
                </Link>
                <Link to="/job-matcher" className="text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                  <span className="mr-1">🎯</span> Matcher
                </Link>
                <button
                  onClick={handleLogout}
                  className="ml-2 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="ml-4 bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Register
                </Link>
              </>
            )}
            
            <button
              onClick={toggleTheme}
              className="ml-4 p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
