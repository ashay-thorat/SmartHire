import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Briefcase, Key, Mail, User, AlertTriangle, ArrowRight, BrainCircuit, Users } from 'lucide-react';

export default function Register() {
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('role') === 'recruiter' ? 'recruiter' : 'candidate';

  const [form, setForm] = useState({ name: '', email: '', password: '', role: defaultRole });
  const { register, googleLogin, loading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleRoleSelect = (role) => setForm({ ...form, role });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      useAuthStore.setState({ error: 'Please fill in all fields' });
      return;
    }
    
    try {
      const user = await register(form.name, form.email, form.password, form.role);
      if (user.role === 'recruiter') {
        navigate('/recruiter/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      // Handled by store
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center px-4 relative overflow-hidden font-sans">
      {/* Decorative glows */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-sky-200/30 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-100/30 rounded-full blur-3xl -z-10"></div>

      <div className="w-full max-w-md my-8">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <div className="bg-primary text-white p-2 rounded-xl">
              <Briefcase className="h-5 w-5" />
            </div>
            <span className="font-heading font-bold text-xl text-accent">
              Smart<span className="text-primary">Hire</span>
            </span>
          </Link>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-accent">Create Account</h2>
          <p className="text-text-muted text-sm mt-1.5">Join SmartHire to streamline matches or screening pipelines</p>
        </div>

        <div className="bg-white border border-border-subtle rounded-2xl p-8 shadow-xl shadow-sky-200/10">
          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 text-xs rounded-xl px-4 py-3 mb-6 flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Role selector tab buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => handleRoleSelect('candidate')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-semibold cursor-pointer ${
                form.role === 'candidate'
                  ? 'border-primary bg-sky-50/50 text-primary shadow-sm'
                  : 'border-slate-200 bg-white text-text-muted hover:border-slate-300'
              }`}
            >
              <BrainCircuit className="h-5 w-5" />
              Candidate Profile
            </button>
            <button
              type="button"
              onClick={() => handleRoleSelect('recruiter')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-semibold cursor-pointer ${
                form.role === 'recruiter'
                  ? 'border-primary bg-sky-50/50 text-primary shadow-sm'
                  : 'border-slate-200 bg-white text-text-muted hover:border-slate-300'
              }`}
            >
              <Users className="h-5 w-5" />
              Recruiter Dashboard
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-accent text-xs font-semibold block mb-1.5 uppercase tracking-wider">
                {form.role === 'recruiter' ? 'Company or Recruiter Name' : 'Full Name'}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted">
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder={form.role === 'recruiter' ? 'e.g. Acme Talent Acquisition' : 'e.g. John Doe'}
                  className="premium-input pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-accent text-xs font-semibold block mb-1.5 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                  className="premium-input pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-accent text-xs font-semibold block mb-1.5 uppercase tracking-wider">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted">
                  <Key className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="premium-input pl-10"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 mt-2 font-medium tracking-wide shadow-md shadow-sky-100"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Create Account
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-text-muted font-semibold">or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={async () => {
              try {
                const user = await googleLogin(form.role);
                if (user.role === 'recruiter') {
                  navigate('/recruiter/dashboard');
                } else {
                  navigate('/dashboard');
                }
              } catch {}
            }}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border-2 border-slate-300 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 transition-colors text-sm font-semibold text-slate-700 shadow-sm"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {loading ? 'Redirecting...' : `Sign up with Google as ${form.role === 'recruiter' ? 'Recruiter' : 'Candidate'}`}
          </button>
        </div>

        <p className="text-text-muted text-sm text-center mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:text-primary-dark font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
