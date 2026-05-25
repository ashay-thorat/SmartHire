import React, { useEffect, useState } from 'react';
import { useJobStore } from '../store/jobStore.js';
import { Link } from 'react-router-dom';
import {
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Briefcase,
  MapPin,
  DollarSign
} from 'lucide-react';

const STATUS_CONFIG = {
  Applied: { label: 'Applied', color: 'text-slate-600 bg-slate-50 border-slate-200', icon: <Clock className="h-3.5 w-3.5" /> },
  Reviewed: { label: 'Reviewed', color: 'text-amber-700 bg-amber-50 border-amber-200', icon: <Clock className="h-3.5 w-3.5" /> },
  Shortlisted: { label: 'Shortlisted', color: 'text-primary bg-sky-50 border-sky-200', icon: <Sparkles className="h-3.5 w-3.5" /> },
  Hired: { label: 'Hired 🎉', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', icon: <CheckCircle className="h-3.5 w-3.5" /> },
  Rejected: { label: 'Rejected', color: 'text-rose-600 bg-rose-50 border-rose-200', icon: <AlertCircle className="h-3.5 w-3.5" /> },
};

function ApplicationCard({ app }) {
  const [expanded, setExpanded] = useState(false);
  const statusConfig = STATUS_CONFIG[app.status] || STATUS_CONFIG.Applied;

  return (
    <div className="premium-card p-6 bg-white border-slate-100 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-1.5">
            <h3 className="font-heading font-extrabold text-base text-accent">{app.job?.title}</h3>
            <span className={`inline-flex items-center gap-1 text-xs font-semibold border px-2.5 py-1 rounded-full ${statusConfig.color}`}>
              {statusConfig.icon}
              {statusConfig.label}
            </span>
          </div>

          <p className="text-xs font-semibold text-text-muted mb-2">{app.job?.company}</p>

          <div className="flex flex-wrap gap-3 text-xs text-text-muted">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              {app.job?.location}
            </span>
            <span className="flex items-center gap-1 capitalize">
              <Briefcase className="h-3.5 w-3.5 text-primary" />
              {app.job?.jobType}
            </span>
            {app.job?.salaryMin && (
              <span className="flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5 text-primary" />
                ${(app.job.salaryMin / 1000).toFixed(0)}k – ${(app.job.salaryMax / 1000).toFixed(0)}k
              </span>
            )}
          </div>

          <p className="text-[10px] text-text-muted mt-2">
            Submitted on {new Date(app.appliedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {app.coverLetter && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline shrink-0 self-start mt-1"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {expanded ? 'Hide' : 'View'} Cover Letter
          </button>
        )}
      </div>

      {expanded && app.coverLetter && (
        <div className="mt-5 pt-4 border-t border-slate-100">
          <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-2">Your Cover Letter</p>
          <p className="text-xs text-text-muted leading-relaxed whitespace-pre-wrap bg-slate-50 rounded-xl p-4 border border-slate-100">
            {app.coverLetter}
          </p>
        </div>
      )}
    </div>
  );
}

export default function Applications() {
  const { applications, fetchApplications, loading } = useJobStore();
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const statuses = ['All', 'Applied', 'Reviewed', 'Shortlisted', 'Hired', 'Rejected'];
  const filtered = activeFilter === 'All' ? applications : applications.filter(app => app.status === activeFilter);

  const counts = statuses.reduce((acc, s) => {
    acc[s] = s === 'All' ? applications.length : applications.filter(a => a.status === s).length;
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 font-sans">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading font-extrabold text-3xl text-accent flex items-center gap-2.5">
          <FileText className="h-7 w-7 text-primary" />
          My Applications
        </h1>
        <p className="text-text-muted text-sm mt-1">Track every position you have applied to in real-time.</p>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {statuses.map(status => {
          const config = STATUS_CONFIG[status];
          return (
            <button
              key={status}
              onClick={() => setActiveFilter(status)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                activeFilter === status
                  ? 'bg-accent text-white border-accent shadow-sm'
                  : 'bg-white text-text-muted border-slate-200 hover:border-slate-300'
              }`}
            >
              {status} {counts[status] > 0 && <span className="ml-1 opacity-70">({counts[status]})</span>}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-border-subtle rounded-2xl shadow-sm">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-xs text-text-muted font-medium">Loading applications...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white border border-border-subtle rounded-2xl shadow-sm">
          <FileText className="h-12 w-12 text-slate-200 mx-auto mb-4" />
          <p className="text-sm font-semibold text-accent">
            {activeFilter === 'All' ? 'No applications yet' : `No ${activeFilter} applications`}
          </p>
          <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
            {activeFilter === 'All'
              ? 'Start browsing the job board and apply to positions that match your skills.'
              : 'Try switching to a different status filter or check back later.'}
          </p>
          {activeFilter === 'All' && (
            <Link to="/jobs" className="btn-primary py-2 px-5 text-xs font-semibold mt-5">
              Browse Jobs
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {filtered.map(app => (
            <ApplicationCard key={app.id} app={app} />
          ))}
        </div>
      )}
    </div>
  );
}
