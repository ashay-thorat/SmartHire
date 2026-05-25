import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Search, 
  FileCheck, 
  BrainCircuit, 
  Briefcase, 
  Users, 
  FolderGit, 
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function Home() {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden font-sans">
      {/* Background Decorative Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-sky-200/40 rounded-full blur-3xl -z-10"></div>
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-blue-100/30 rounded-full blur-3xl -z-10"></div>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 md:pt-28 md:pb-32 flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 bg-sky-100 border border-sky-200 text-primary text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            Empowering Modern Teams with LLaMA-3.3 AI
          </div>
          
          <h1 className="font-heading font-extrabold text-4xl sm:text-5xl md:text-6xl text-accent leading-[1.1] tracking-tight mb-6">
            The Intelligent Path to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Smart Hiring.</span>
          </h1>
          
          <p className="text-text-muted text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed font-normal">
            A dual-sided AI recruitment platform matching top candidates to active roles instantly, while providing recruiters with state-of-the-art ATS resume grading and collaborative pipelines.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            {user ? (
              <Link to={user.role === 'recruiter' ? '/recruiter/dashboard' : '/dashboard'} className="btn-primary py-3.5 px-8 w-full sm:w-auto shadow-lg shadow-sky-200">
                Go to Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary py-3.5 px-8 w-full sm:w-auto shadow-lg shadow-sky-200">
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/login" className="btn-outline py-3.5 px-8 w-full sm:w-auto hover:bg-sky-50">
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-4 mt-12 pt-8 border-t border-slate-200 max-w-md mx-auto lg:mx-0">
            <div>
              <p className="text-2xl font-heading font-extrabold text-accent">98%</p>
              <p className="text-xs text-text-muted">AI Match accuracy</p>
            </div>
            <div>
              <p className="text-2xl font-heading font-extrabold text-accent">10x</p>
              <p className="text-xs text-text-muted">Faster screening</p>
            </div>
            <div>
              <p className="text-2xl font-heading font-extrabold text-accent">15k+</p>
              <p className="text-xs text-text-muted">Successful matches</p>
            </div>
          </div>
        </div>

        {/* Visual Mockups Column */}
        <div className="flex-1 relative w-full max-w-lg mx-auto lg:max-w-none flex items-center justify-center">
          <div className="relative w-full aspect-[4/3] rounded-3xl bg-gradient-to-tr from-sky-300/30 to-blue-200/20 p-4 border border-white/40 shadow-2xl backdrop-blur-sm">
            {/* Main Premium Card (Dashboard Preview) */}
            <div className="absolute top-4 left-4 right-4 bottom-4 bg-white rounded-2xl border border-sky-100/80 shadow-md p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-primary font-bold">SH</div>
                  <div>
                    <h4 className="text-xs font-semibold text-accent leading-none">AI Fit Analysis</h4>
                    <p className="text-[10px] text-text-muted">Parsed matches</p>
                  </div>
                </div>
                <div className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  92% Match
                </div>
              </div>

              {/* Fake List Items */}
              <div className="space-y-2.5 my-4">
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    <span className="text-[11px] font-medium text-accent">React, Node.js, Express</span>
                  </div>
                  <span className="text-[10px] text-primary font-semibold">Matched</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    <span className="text-[11px] font-medium text-accent">PostgreSQL (Neon), Drizzle ORM</span>
                  </div>
                  <span className="text-[10px] text-primary font-semibold">Matched</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 opacity-60">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                    <span className="text-[11px] font-medium text-slate-500">AWS DevOps Deployment</span>
                  </div>
                  <span className="text-[10px] text-text-muted">Missing Skill</span>
                </div>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] text-text-muted">ATS Compatibility</span>
                  <span className="text-[10px] font-semibold text-primary">85 / 100</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
            </div>

            {/* Floating Card 1: Score circle badge */}
            <div className="absolute -top-6 -right-6 bg-white border border-sky-100 rounded-2xl p-4 shadow-xl flex items-center gap-3 animate-float-slow">
              <div className="relative w-12 h-12 flex items-center justify-center rounded-full bg-sky-50 border-2 border-primary">
                <span className="font-heading font-extrabold text-xs text-accent">88%</span>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-accent leading-none">LLaMA 3.3 Score</p>
                <p className="text-[9px] text-text-muted mt-0.5">Highly Recommended</p>
              </div>
            </div>

            {/* Floating Card 2: Status checkbadge */}
            <div className="absolute -bottom-4 -left-6 bg-accent border border-slate-800 rounded-2xl p-3.5 shadow-xl text-white flex items-center gap-3 animate-float-fast">
              <div className="bg-primary p-2 rounded-xl flex items-center justify-center">
                <FileCheck className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-[10px] text-sky-200 leading-none">Resume Extracted</p>
                <p className="text-[11px] font-bold mt-1">8+ Core Skills Saved</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dual Persona Features Section */}
      <section className="bg-white py-20 border-y border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-accent mb-4">
              Dual-Sided AI Talent Hub
            </h2>
            <p className="text-text-muted">
              Whether you are a job seeker looking for your next career move, or a recruiter searching for perfect-fit talent, SmartHire streamlines the entire process.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Candidate Experience Card */}
            <div className="premium-card p-8 md:p-10 border-sky-100 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 bg-sky-50 text-primary text-xs font-bold px-3 py-1 rounded-full mb-6">
                  <BrainCircuit className="h-3.5 w-3.5" />
                  FOR CANDIDATES
                </div>
                <h3 className="font-heading font-extrabold text-2xl text-accent mb-4">
                  Match with the Best Roles, Instantly
                </h3>
                <p className="text-text-muted text-sm leading-relaxed mb-8">
                  Upload your PDF resume once. Our built-in LLaMA 3.3 AI parses your experiences, highlights your skills, and compares them with active job requirements. Get manual job searches and direct match reports instantly.
                </p>

                <ul className="space-y-3.5 mb-8">
                  {[
                    'Instant PDF resume extraction (name, skills, experiences)',
                    'Smart skill-based overlap job rankings',
                    'Interactive application submission with customized cover letters',
                    'A personalized profile hub with editable parsed records'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-text-muted">
                      <div className="bg-sky-100 text-primary rounded-full p-0.5 mt-0.5">
                        <Zap className="h-3 w-3" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <Link to="/register?role=candidate" className="btn-primary w-full py-3">
                Join as Candidate
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Recruiter Experience Card */}
            <div className="premium-card p-8 md:p-10 border-slate-200 bg-accent text-white flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 bg-slate-800 text-sky-400 text-xs font-bold px-3 py-1 rounded-full mb-6">
                  <Users className="h-3.5 w-3.5" />
                  FOR RECRUITERS
                </div>
                <h3 className="font-heading font-extrabold text-2xl text-white mb-4">
                  Screen Candidates & Track Pipelines
                </h3>
                <p className="text-sky-200/80 text-sm leading-relaxed mb-8">
                  Post open roles, upload applicant resumes, and let the AI grade each applicant out of 100 on skills, education, and ATS compatibility. Manage your applicant flow using a state-of-the-art Kanban board.
                </p>

                <ul className="space-y-3.5 mb-8">
                  {[
                    'Upload resumes against jobs to receive deep rating metrics',
                    'Detailed verdict cards (Hire / No-Hire badges) with suggestions',
                    'Manage applicants via fluid Drag and Drop Kanban Pipeline',
                    'Key KPI summary counts of all posted job metrics'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-sky-200/75">
                      <div className="bg-sky-500/20 text-sky-400 rounded-full p-0.5 mt-0.5">
                        <Zap className="h-3 w-3" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <Link to="/register?role=recruiter" className="btn-primary w-full py-3 bg-primary hover:bg-primary-dark">
                Join as Recruiter
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Features Highlights */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="premium-card p-6 border-slate-100 hover:scale-[1.01]">
            <div className="bg-sky-100 text-primary w-12 h-12 rounded-xl flex items-center justify-center mb-4">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h4 className="font-heading font-semibold text-lg text-accent mb-2">Secure & Reliable</h4>
            <p className="text-text-muted text-xs leading-relaxed">
              Fully compliant security layer utilizing JWT access/refresh token models, secure password hashes, and transactional database actions.
            </p>
          </div>
          
          <div className="premium-card p-6 border-slate-100 hover:scale-[1.01]">
            <div className="bg-sky-100 text-primary w-12 h-12 rounded-xl flex items-center justify-center mb-4">
              <Search className="h-6 w-6" />
            </div>
            <h4 className="font-heading font-semibold text-lg text-accent mb-2">Manual & AI Search</h4>
            <p className="text-text-muted text-xs leading-relaxed">
              Find exactly what you are looking for through flexible search parameters, salary ranges, full-text ILIKE, and deep AI match scores.
            </p>
          </div>

          <div className="premium-card p-6 border-slate-100 hover:scale-[1.01]">
            <div className="bg-sky-100 text-primary w-12 h-12 rounded-xl flex items-center justify-center mb-4">
              <FolderGit className="h-6 w-6" />
            </div>
            <h4 className="font-heading font-semibold text-lg text-accent mb-2">Interactive Pipeline</h4>
            <p className="text-text-muted text-xs leading-relaxed">
              Smooth Drag & Drop board lets recruiters visualize applicant statuses (Applied, Reviewed, Shortlisted, Hired, Rejected) instantly.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Bottom Section */}
      <section className="mx-4 md:mx-auto max-w-6xl mb-24 relative overflow-hidden bg-hero-gradient rounded-3xl p-12 text-center text-white shadow-2xl shadow-sky-100">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)]"></div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="font-heading font-bold text-3xl sm:text-4xl mb-4 text-white">Ready to automate your recruitment?</h2>
          <p className="text-sky-100/90 text-sm mb-8 leading-relaxed">
            Upload resumes, match top talents, screen candidates with LLaMA-3.3, and track candidate progress through active pipelines in one dashboard.
          </p>
          <Link
            to="/register"
            className="bg-white hover:bg-sky-50 text-primary px-8 py-3.5 rounded-xl font-medium transition text-sm inline-block shadow-md"
          >
            Create Your Free Account
          </Link>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-white p-1.5 rounded-lg">
              <Briefcase className="h-4 w-4" />
            </div>
            <span className="font-heading font-bold text-lg text-white">Smart<span className="text-primary">Hire</span></span>
          </div>
          <p className="text-xs">
            © {new Date().getFullYear()} SmartHire AI Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}