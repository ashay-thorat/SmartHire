import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { 
  Briefcase, 
  User, 
  LogOut, 
  Menu, 
  X, 
  FileText, 
  LayoutDashboard, 
  Sparkles, 
  Search, 
  FolderGit,
  Clock,
  Shield,
  Moon,
  Sun
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark') || localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (localStorage.getItem('theme') === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    } else if (localStorage.getItem('theme') === 'light') {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    } else {
      // Default to light if nothing set
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const linkClass = (path) => `
    flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200
    ${isActive(path) 
      ? 'bg-sky-50 text-primary font-semibold shadow-sm border border-sky-100' 
      : 'text-text-muted hover:text-primary hover:bg-slate-50'}
  `;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border-subtle shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
            <div className="bg-primary text-white p-2 rounded-xl flex items-center justify-center shadow-md shadow-sky-200 animate-float-slow">
              <Briefcase className="h-5 w-5" />
            </div>
            <span className="font-heading font-bold text-xl tracking-tight text-accent">
              Smart<span className="text-primary">Hire</span>
            </span>
            <span className="bg-sky-100 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ml-1">
              AI Powered
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                {user.role === 'candidate' ? (
                  <>
                    <Link to="/dashboard" className={linkClass('/dashboard')}>
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                    <Link to="/jobs" className={linkClass('/jobs')}>
                      <Search className="h-4 w-4" />
                      Search Jobs
                    </Link>
                    <Link to="/matches" className={linkClass('/matches')}>
                      <Sparkles className="h-4 w-4" />
                      AI Matches
                    </Link>
                    <Link to="/applications" className={linkClass('/applications')}>
                      <FileText className="h-4 w-4" />
                      Applications
                    </Link>
                    <Link to="/profile" className={linkClass('/profile')}>
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                    <Link to="/history" className={linkClass('/history')}>
                      <Clock className="h-4 w-4" />
                      History
                    </Link>
                  </>
                ) : user.role === 'admin' ? (
                  <>
                    <Link to="/admin" className={linkClass('/admin')}>
                      <Shield className="h-4 w-4" />
                      Admin
                    </Link>
                    <Link to="/history" className={linkClass('/history')}>
                      <Clock className="h-4 w-4" />
                      History
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/recruiter/dashboard" className={linkClass('/recruiter/dashboard')}>
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                    <Link to="/recruiter/jobs" className={linkClass('/recruiter/jobs')}>
                      <Briefcase className="h-4 w-4" />
                      Manage Jobs
                    </Link>
                    <Link to="/recruiter/evaluate" className={linkClass('/recruiter/evaluate')}>
                      <Sparkles className="h-4 w-4" />
                      AI Evaluate
                    </Link>
                    <Link to="/recruiter/pipeline" className={linkClass('/recruiter/pipeline')}>
                      <FolderGit className="h-4 w-4" />
                      Kanban Board
                    </Link>
                    <Link to="/recruiter/settings" className={linkClass('/recruiter/settings')}>
                      <User className="h-4 w-4" />
                      Settings
                    </Link>
                  </>
                )}

                {/* Divider */}
                <div className="h-6 w-px bg-slate-200 mx-2"></div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={toggleTheme} 
                    className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-accent transition-colors"
                    title="Toggle Dark Mode"
                  >
                    {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  </button>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-accent leading-none">{user.name}</p>
                    <p className="text-[10px] text-text-muted mt-0.5 capitalize">{user.role}</p>
                  </div>
                  <button onClick={handleLogout} className="btn-outline p-2.5 rounded-xl border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-accent">
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <button 
                  onClick={toggleTheme} 
                  className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-accent transition-colors"
                  title="Toggle Dark Mode"
                >
                  {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
                <Link to="/login" className="btn-outline text-sm py-2 px-4">
                  Log In
                </Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4 shadow-md shadow-sky-100">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-text-muted hover:text-accent hover:bg-slate-50 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border-subtle bg-white px-2 pt-2 pb-4 space-y-1 shadow-inner">
          {user ? (
            <>
              {user.role === 'candidate' ? (
                <>
                  <Link to="/dashboard" className={linkClass('/dashboard')} onClick={() => setMobileMenuOpen(false)}>
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <Link to="/jobs" className={linkClass('/jobs')} onClick={() => setMobileMenuOpen(false)}>
                    <Search className="h-4 w-4" />
                    Search Jobs
                  </Link>
                  <Link to="/matches" className={linkClass('/matches')} onClick={() => setMobileMenuOpen(false)}>
                    <Sparkles className="h-4 w-4" />
                    AI Matches
                  </Link>
                  <Link to="/applications" className={linkClass('/applications')} onClick={() => setMobileMenuOpen(false)}>
                    <FileText className="h-4 w-4" />
                    Applications
                  </Link>
                  <Link to="/profile" className={linkClass('/profile')} onClick={() => setMobileMenuOpen(false)}>
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                  <Link to="/history" className={linkClass('/history')} onClick={() => setMobileMenuOpen(false)}>
                    <Clock className="h-4 w-4" />
                    History
                  </Link>
                </>
              ) : user.role === 'admin' ? (
                <>
                  <Link to="/admin" className={linkClass('/admin')} onClick={() => setMobileMenuOpen(false)}>
                    <Shield className="h-4 w-4" />
                    Admin
                  </Link>
                  <Link to="/history" className={linkClass('/history')} onClick={() => setMobileMenuOpen(false)}>
                    <Clock className="h-4 w-4" />
                    History
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/recruiter/dashboard" className={linkClass('/recruiter/dashboard')} onClick={() => setMobileMenuOpen(false)}>
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <Link to="/recruiter/jobs" className={linkClass('/recruiter/jobs')} onClick={() => setMobileMenuOpen(false)}>
                    <Briefcase className="h-4 w-4" />
                    Manage Jobs
                  </Link>
                  <Link to="/recruiter/evaluate" className={linkClass('/recruiter/evaluate')} onClick={() => setMobileMenuOpen(false)}>
                    <Sparkles className="h-4 w-4" />
                    AI Evaluate
                  </Link>
                  <Link to="/recruiter/pipeline" className={linkClass('/recruiter/pipeline')} onClick={() => setMobileMenuOpen(false)}>
                    <FolderGit className="h-4 w-4" />
                    Kanban Board
                  </Link>
                  <Link to="/recruiter/settings" className={linkClass('/recruiter/settings')} onClick={() => setMobileMenuOpen(false)}>
                    <User className="h-4 w-4" />
                    Settings
                  </Link>
                  <Link to="/history" className={linkClass('/history')} onClick={() => setMobileMenuOpen(false)}>
                    <Clock className="h-4 w-4" />
                    History
                  </Link>
                </>
              )}

              {/* Profile Details & Logout */}
              <div className="pt-4 pb-2 border-t border-slate-100 mt-2 px-3">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-sky-100 text-primary h-10 w-10 rounded-xl flex items-center justify-center font-bold font-heading text-lg">
                      {user.name[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-accent leading-none">{user.name}</p>
                      <p className="text-xs text-text-muted mt-1 capitalize">{user.role}</p>
                    </div>
                  </div>
                  <button 
                    onClick={toggleTheme} 
                    className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-accent transition-colors"
                  >
                    {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  </button>
                </div>
                <button
                  onClick={handleLogout}
                  className="mt-4 w-full btn-outline flex items-center justify-center gap-2 border-red-200 text-red-500 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Log Out
                </button>
              </div>
            </>
          ) : (
            <div className="pt-2 pb-2 space-y-2 px-3">
              <div className="flex justify-between items-center mb-4 px-1">
                <span className="text-sm font-medium text-accent">Theme</span>
                <button 
                  onClick={toggleTheme} 
                  className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-accent transition-colors"
                >
                  {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
              </div>
              <Link to="/login" className="btn-outline w-full text-center" onClick={() => setMobileMenuOpen(false)}>
                Log In
              </Link>
              <Link to="/register" className="btn-primary w-full text-center" onClick={() => setMobileMenuOpen(false)}>
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
