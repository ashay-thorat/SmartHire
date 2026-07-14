import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useRecruiterStore } from '../store/recruiterStore.js';
import { useAuthStore } from '../store/authStore.js';
import {
  Briefcase,
  Users,
  Sparkles,
  TrendingUp,
  Plus,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle,
  LayoutGrid
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const STATUS_COLORS = {
  Applied: 'text-slate-600 bg-slate-50 border-slate-200',
  Reviewed: 'text-amber-700 bg-amber-50 border-amber-200',
  Shortlisted: 'text-primary bg-sky-50 border-sky-200',
  Hired: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  Rejected: 'text-rose-600 bg-rose-50 border-rose-200',
};

export default function RecruiterDashboard() {
  const { user } = useAuthStore();
  const { myJobs, stats, evalHistory, pipeline, fetchMyJobs, fetchStats, fetchEvalHistory, fetchPipeline, loading } = useRecruiterStore();

  useEffect(() => {
    fetchMyJobs();
    fetchStats();
    fetchEvalHistory();
    fetchPipeline();
  }, [fetchMyJobs, fetchStats, fetchEvalHistory, fetchPipeline]);

  const totalApplicants = stats?.totalApplicants ?? 0;
  const totalJobs = myJobs.length;
  const hireRate = stats?.hireRate ?? 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading font-extrabold text-3xl text-accent">
            Recruiter Hub, <span className="text-primary">{user?.name}</span>
          </h1>
          <p className="text-text-muted text-sm mt-1">Manage your job postings, evaluate candidates, and track pipeline progression.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/recruiter/pipeline" className="btn-outline py-2 px-4 text-xs font-semibold">
            <LayoutGrid className="h-4 w-4" />
            Kanban Board
          </Link>
          <Link to="/recruiter/jobs" className="btn-primary py-2 px-4 text-xs font-semibold shadow-sm">
            <Plus className="h-4 w-4" />
            Post a Job
          </Link>
        </div>
      </div>

      {/* KPI Counter Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="premium-card p-6 border-slate-100 flex items-center gap-4">
          <div className="bg-sky-50 text-primary p-3 rounded-2xl">
            <Briefcase className="h-6 w-6" />
          </div>
          <div>
            <span className="text-text-muted text-xs font-medium uppercase tracking-wider block">Active Postings</span>
            <span className="text-3xl font-heading font-extrabold text-accent mt-0.5 block">{totalJobs}</span>
          </div>
        </div>

        <div className="premium-card p-6 border-slate-100 flex items-center gap-4">
          <div className="bg-sky-50 text-primary p-3 rounded-2xl">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="text-text-muted text-xs font-medium uppercase tracking-wider block">Total Applicants</span>
            <span className="text-3xl font-heading font-extrabold text-accent mt-0.5 block">{totalApplicants}</span>
          </div>
        </div>

        <div className="premium-card p-6 border-slate-100 flex items-center gap-4">
          <div className="bg-sky-50 text-primary p-3 rounded-2xl">
            <Sparkles className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <span className="text-text-muted text-xs font-medium uppercase tracking-wider block">AI Evaluations</span>
            <span className="text-3xl font-heading font-extrabold text-accent mt-0.5 block">{evalHistory.length}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: My Jobs list */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-border-subtle rounded-2xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-heading font-bold text-xl text-accent flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                My Job Postings
              </h2>
              <Link to="/recruiter/jobs" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
                Manage all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {myJobs.length === 0 ? (
              <div className="text-center py-12 bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl">
                <Briefcase className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-accent">No job postings yet</p>
                <p className="text-xs text-text-muted mt-1">Create your first listing to start receiving applications.</p>
                <Link to="/recruiter/jobs" className="btn-primary py-2 px-5 text-xs font-semibold mt-4">
                  Post a Job
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {myJobs.slice(0, 5).map((job) => (
                  <div key={job.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-accent">{job.title}</h4>
                      <p className="text-xs text-text-muted mt-0.5">{job.location} • <span className="capitalize">{job.jobType}</span></p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(job.requiredSkills || []).slice(0, 3).map(s => (
                          <span key={s} className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded">{s}</span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${job.isActive ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-slate-500 bg-slate-50 border-slate-200'}`}>
                        {job.isActive ? 'Active' : 'Paused'}
                      </span>
                      <p className="text-[10px] text-text-muted mt-1.5">
                        ${(job.salaryMin / 1000).toFixed(0)}k–${(job.salaryMax / 1000).toFixed(0)}k
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pipeline snapshot */}
          <div className="bg-white border border-border-subtle rounded-2xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-heading font-bold text-xl text-accent flex items-center gap-2">
                <LayoutGrid className="h-5 w-5 text-primary" />
                Pipeline Snapshot
              </h2>
              <Link to="/recruiter/pipeline" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
                Open Kanban <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {pipeline.length === 0 ? (
              <div className="text-center py-10 bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl">
                <Users className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-accent">No applicants in pipeline</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {['Applied', 'Reviewed', 'Shortlisted', 'Hired'].map(status => {
                    const count = pipeline.filter(a => a.status === status).length;
                    return (
                      <div key={status} className={`p-4 rounded-xl border text-center ${STATUS_COLORS[status]}`}>
                        <p className="text-2xl font-heading font-extrabold">{count}</p>
                        <p className="text-[11px] font-semibold mt-1 opacity-80">{status}</p>
                      </div>
                    );
                  })}
                </div>
                
                <div className="h-48 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={['Applied', 'Reviewed', 'Shortlisted', 'Hired', 'Rejected'].map(status => ({
                      name: status,
                      count: pipeline.filter(a => a.status === status).length
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} />
                      <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '12px' }}
                        cursor={{ fill: 'transparent' }}
                      />
                      <Bar dataKey="count" fill="#f97316" radius={[4, 4, 0, 0]} barSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Recent AI Evaluations */}
        <div className="space-y-6">
          <div className="bg-white border border-border-subtle rounded-2xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-heading font-bold text-base text-accent flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Recent Evaluations
              </h3>
              <Link to="/recruiter/evaluate" className="text-xs text-primary font-semibold hover:underline">
                + New
              </Link>
            </div>

            {evalHistory.length === 0 ? (
              <div className="text-center py-8">
                <Sparkles className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                <p className="text-xs font-semibold text-accent">No evaluations run</p>
                <p className="text-[10px] text-text-muted mt-1">Upload candidate resumes to get AI scoring.</p>
                <Link to="/recruiter/evaluate" className="btn-primary py-2 px-4 text-[11px] mt-3">
                  Run AI Eval
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {evalHistory.slice(0, 5).map((score) => (
                  <div key={score.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-bold text-accent leading-none">{score.candidateName}</p>
                        <p className="text-[10px] text-text-muted mt-0.5">{score.jobRole}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-heading font-extrabold text-accent">{score.overallScore}<span className="text-[10px] text-text-muted">/100</span></span>
                        <p className={`text-[10px] font-bold mt-0.5 ${score.verdict === 'hire' ? 'text-emerald-700' : 'text-rose-600'}`}>
                          {score.verdict === 'hire' ? '✓ Hire' : '✗ No-Hire'}
                        </p>
                      </div>
                    </div>

                    {/* Mini progress bar */}
                    <div className="mt-2 w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${score.overallScore >= 70 ? 'bg-emerald-400' : score.overallScore >= 50 ? 'bg-amber-400' : 'bg-rose-400'}`}
                        style={{ width: `${score.overallScore}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
