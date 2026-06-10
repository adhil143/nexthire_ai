import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logout, getCurrentUserToken, getCurrentUser } from '../services/auth';
import useDarkMode from '../hooks/useDarkMode';
import { Moon, Sun, Bell, ChevronDown, LogOut } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = getCurrentUserToken();
  const { theme, toggleTheme } = useDarkMode();
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (token) {
      getCurrentUser()
        .then((data) => setUser(data))
        .catch((err) => console.error(err));
    }
  }, [token]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setThemeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Chat Coach', path: '/interview-coach' },
    { name: 'Voice Coach', path: '/voice-coach' },
    { name: 'Roadmap', path: '/roadmap' },
    { name: 'Matcher', path: '/job-matcher' },
  ];

  const handleThemeChange = (selectedTheme) => {
    if (selectedTheme !== theme) {
      toggleTheme();
    }
    setThemeDropdownOpen(false);
  };

  return (
    <nav className="glass-navbar sticky top-0 z-50 py-3 px-4 bg-[#05060b]/40 border-b border-white/5 backdrop-blur-md">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        
        {/* Logo Section */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center space-x-2">
            <svg className="w-8 h-8 filter drop-shadow-[0_0_6px_rgba(168,85,247,0.5)]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="nGradNav" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="50%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
              <path d="M25 80V20H40L65 65V20H80V80H65L40 35V80H25Z" fill="url(#nGradNav)" />
            </svg>
            <span className="text-lg font-black tracking-wider text-white">
              NextHire<span className="text-purple-400">AI</span>
            </span>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-1.5 p-1 bg-white/5 dark:bg-black/20 rounded-xl border border-white/5">
          {token && navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-400 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.1)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Actions & Profiles */}
        <div className="flex items-center space-x-3">
          {token ? (
            <>
              {/* Notification Bell */}
              <button className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5 transition-colors relative">
                <Bell className="w-4.5 h-4.5" />
                <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
              </button>

              {/* User Info */}
              <div className="flex items-center space-x-2 border-l border-white/10 pl-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 text-white flex items-center justify-center font-bold text-xs uppercase shadow-md shadow-purple-500/10">
                  {user ? user.email.charAt(0) : 'U'}
                </div>
                <span className="hidden sm:inline text-xs font-bold text-slate-300 capitalize">
                  {user ? user.email.split('@')[0] : 'User'}
                </span>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Link to="/login" className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-all">
                Login
              </Link>
              <Link to="/register" className="px-4 py-2 rounded-full text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md transition-all">
                Register
              </Link>
            </div>
          )}

          {/* Custom Theme Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-[10px] font-bold text-slate-300 hover:bg-white/10 transition-all"
            >
              {theme === 'dark' ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-purple-400 mr-1" />
                  <span>Deep Space</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-500 mr-1" />
                  <span>Soft Pastel</span>
                </>
              )}
              <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
            </button>

            {themeDropdownOpen && (
              <div className="absolute right-0 mt-2 w-36 rounded-xl border border-white/10 bg-[#0d1020] shadow-xl p-1 z-50">
                <button
                  onClick={() => handleThemeChange('dark')}
                  className={`w-full flex items-center space-x-2 px-3 py-2 text-xs font-semibold rounded-lg text-left transition-colors ${
                    theme === 'dark'
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5 text-purple-400" />
                  <span>Deep Space</span>
                </button>
                <button
                  onClick={() => handleThemeChange('light')}
                  className={`w-full flex items-center space-x-2 px-3 py-2 text-xs font-semibold rounded-lg text-left transition-colors ${
                    theme === 'light'
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Soft Pastel</span>
                </button>
              </div>
            )}
          </div>

          {token && (
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors border border-transparent hover:border-rose-500/20"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          )}
        </div>
        
      </div>
    </nav>
  );
};

export default Navbar;
