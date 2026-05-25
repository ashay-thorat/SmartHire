import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Briefcase, Key, Mail, User, AlertTriangle, ArrowRight, BrainCircuit, Users } from 'lucide-react';

export default function Register() {
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('role') === 'recruiter' ? 'recruiter' : 'candidate';

  const [form, setForm] = useState({ name: '', email: '', password: '', role: defaultRole });
  const { register, loading, error } = useAuthStore();
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
