import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Cpu, History, LogIn, LogOut, UserPlus, Zap } from 'lucide-react';

const Navbar: React.FC = () => {
  const { token, userEmail, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-slate-800 backdrop-blur-md px-4 sm:px-8 py-4 shadow-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 group">
          <div className="bg-brand-500 text-white p-2 rounded-xl shadow-lg shadow-brand-500/30 group-hover:scale-105 transition-transform">
            <Cpu className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-brand-400 bg-clip-text text-transparent">
            Resume<span className="text-brand-500">AI</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-1">
          <Link
            to="/"
            className={`flex items-center space-x-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isActive('/')
                ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Analyzer</span>
          </Link>

          {token && (
            <Link
              to="/history"
              className={`flex items-center space-x-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/history')
                  ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <History className="w-4 h-4" />
              <span>History</span>
            </Link>
          )}
        </div>

        {/* Right Auth Side */}
        <div className="flex items-center space-x-3">
          {token ? (
            <>
              {/* User Identity */}
              <div className="hidden sm:flex flex-col items-end mr-2 text-xs">
                <span className="text-slate-400">Logged in as</span>
                <span className="text-brand-400 font-medium">{userEmail}</span>
              </div>
              
              {/* Mobile History Link (if logged in) */}
              <Link
                to="/history"
                className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/40"
                title="History"
              >
                <History className="w-5 h-5" />
              </Link>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-4 py-2 rounded-xl text-sm font-medium bg-slate-900 border border-slate-800 text-slate-300 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/5 transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="flex items-center space-x-1 px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/40 transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </Link>
              <Link
                to="/register"
                className="flex items-center space-x-1 px-4 py-2 rounded-xl text-sm font-medium bg-brand-600 text-white shadow-lg shadow-brand-600/20 hover:bg-brand-500 hover:shadow-brand-500/30 transition-all"
              >
                <UserPlus className="w-4 h-4" />
                <span>Register</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
