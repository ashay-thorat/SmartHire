import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useJobStore } from '../store/jobStore.js';
import { useAuthStore } from '../store/authStore.js';
import { 
  Briefcase, 
  FileText, 
  Sparkles, 
  TrendingUp, 
  CheckCircle, 
  ArrowRight, 
  Clock, 
  AlertCircle,
  FileCheck,
  User
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { 
    applications, 
    matchedJobs, 
    profile, 
    fetchApplications, 
    fetchMatchedJobs, 
    fetchProfile,
    fetchExternalJobs,
    externalJobs,
    loading,
    loadingExternal,
  } = useJobStore();

  useEffect(() => {
    fetchApplications();
    fetchMatchedJobs();
    fetchProfile();
    if (profile?.resumeUrl) {
      fetchExternalJobs();
    }
  }, [fetchApplications, fetchMatchedJobs, fetchProfile, fetchExternalJobs, profile?.resumeUrl]);

  // Calculate stats
  const totalApplied = applications.length;
  const matchCount = matchedJobs.length;
  const hasResume = !!profile?.resumeUrl;
  const skillsCount = profile?.extractedSkills?.length || 0;

  // Formats application status style
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Hired':
        return (
          <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-medium inline-flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Hired
          </span>
        );
      case 'Shortlisted':
        return (
          <span className="bg-sky-50 border border-sky-200 text-primary text-xs px-2.5 py-1 rounded-full font-medium inline-flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> Shortlisted
          </span>
        );
      case 'Rejected':
        return (
          <span className="bg-rose-50 border border-rose-200 text-rose-700 text-xs px-2.5 py-1 rounded-full font-medium inline-flex items-center gap-1">
            <AlertCircle className="h-3 w-3" /> Rejected
          </span>
        );
      case 'Reviewed':
        return (
          <span className="bg-amber-50 border border-amber-200 text-amber-700 text-xs px-2.5 py-1 rounded-full font-medium inline-flex items-center gap-1">
            <Clock className="h-3 w-3" /> Reviewed
          </span>
        );
      default:
        return (
          <span className="bg-slate-50 border border-slate-200 text-slate-600 text-xs px-2.5 py-1 rounded-full font-medium inline-flex items-center gap-1">
            <Clock className="h-3 w-3" /> Applied
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading font-extrabold text-3xl text-accent">
            Welcome back, <span className="text-primary">{user?.name}</span>
          </h1>
          <p className="text-text-muted text-sm mt-1">Track your active job matches, resume parses, and application flows.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/jobs" className="btn-outline py-2 px-4 text-xs font-semibold">
            Search Jobs
          </Link>
          <Link to="/profile" className="btn-primary py-2 px-4 text-xs font-semibold shadow-sm">
            Edit Profile
          </Link>
        </div>
      </div>

      {/* KPI Counters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Applications */}
        <div className="premium-card p-6 border-slate-100 flex items-center gap-4">
          <div className="bg-sky-50 text-primary p-3 rounded-2xl">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <span className="text-text-muted text-xs font-medium uppercase tracking-wider block">Applications</span>
            <span className="text-3xl font-heading font-extrabold text-accent mt-0.5 block">{totalApplied}</span>
          </div>
        </div>

        {/* AI matches */}
        <div className="premium-card p-6 border-slate-100 flex items-center gap-4">
          <div className="bg-sky-50 text-primary p-3 rounded-2xl">
            <Sparkles className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <span className="text-text-muted text-xs font-medium uppercase tracking-wider block">AI Job Matches</span>
            <span className="text-3xl font-heading font-extrabold text-accent mt-0.5 block">{matchCount}</span>
          </div>
        </div>

        {/* Resume status */}
        <div className="premium-card p-6 border-slate-100 flex items-center gap-4">
          <div className="bg-sky-50 text-primary p-3 rounded-2xl">
            <FileCheck className="h-6 w-6" />
          </div>
          <div>
            <span className="text-text-muted text-xs font-medium uppercase tracking-wider block">Resume Extracted</span>
            <span className="text-3xl font-heading font-extrabold text-accent mt-0.5 block">
              {hasResume ? `${skillsCount} Skills` : 'No Resume'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left/Middle Columns: Applications & Match details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Applications list */}
          <div className="bg-white border border-border-subtle rounded-2xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-heading font-bold text-xl text-accent flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Recent Applications
              </h2>
              {totalApplied > 0 && (
                <Link to="/applications" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </div>

            {totalApplied === 0 ? (
              <div className="text-center py-12 bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl">
                <FileText className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-accent">No applications found</p>
                <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">Start browsing job boards to apply and launch your recruitment tracker.</p>
                <Link to="/jobs" className="btn-primary py-2 px-5 text-xs font-semibold mt-4">
                  Browse Active Jobs
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {applications.slice(0, 5).map((app) => (
                  <div key={app.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-accent">{app.job?.title}</h4>
                      <p className="text-xs text-text-muted mt-0.5">{app.job?.company} • {app.job?.location}</p>
                      <p className="text-[10px] text-text-muted mt-1">Applied on {new Date(app.appliedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      {getStatusBadge(app.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Job Matches — powered by JSearch external API */}
          <div className="bg-white border border-border-subtle rounded-2xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-heading font-bold text-xl text-accent flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Top Job Matches
              </h2>
              {externalJobs.length > 0 && (
                <Link to="/jobs" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
                  View all jobs <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </div>

            {!hasResume ? (
              <div className="text-center py-12 bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl">
                <Sparkles className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-accent">AI Job Matches Locked</p>
                <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">Please upload your PDF resume to extract skills and enable AI-powered job matching.</p>
                <Link to="/profile" className="btn-primary py-2 px-5 text-xs font-semibold mt-4">
                  Upload PDF Resume
                </Link>
              </div>
            ) : loadingExternal ? (
              <div className="text-center py-12 bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
                <p className="text-sm font-semibold text-accent">Finding jobs for you...</p>
                <p className="text-xs text-text-muted mt-1">Searching across job platforms based on your resume skills.</p>
              </div>
            ) : externalJobs.length > 0 ? (
              <div className="space-y-4">
                {externalJobs.slice(0, 5).map((job) => (
                  <div key={job.id} className="p-4 border border-sky-100 rounded-xl bg-sky-50/10 hover:bg-sky-50/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-accent">{job.title}</h4>
                        {job.employmentType && (
                          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-emerald-200">
                            {job.employmentType}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-text-muted mt-0.5">{job.company} • {job.location}</p>
                      {job.description && (
                        <p className="text-[11px] text-text-muted mt-1.5 line-clamp-2">{job.description}...</p>
                      )}
                    </div>
                    <a
                      href={job.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary py-2 px-4 text-xs font-semibold self-start sm:self-center shrink-0"
                    >
                      Apply ↗
                    </a>
                  </div>
                ))}
              </div>
            ) : matchedJobs.length > 0 ? (
              <div className="space-y-4">
                {matchedJobs.slice(0, 3).map((match) => (
                  <div key={match.id} className="p-4 border border-sky-100 rounded-xl bg-sky-50/10 hover:bg-sky-50/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-accent">{match.title}</h4>
                        <span className="bg-sky-100 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          {match.matchPercentage}% AI Fit
                        </span>
                      </div>
                      <p className="text-xs text-text-muted mt-0.5">{match.company} • {match.location}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {(match.matchedSkills || []).slice(0, 3).map(skill => (
                          <span key={skill} className="bg-sky-100/50 text-primary text-[10px] px-2 py-0.5 rounded-md font-semibold">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <Link to="/jobs" className="btn-primary py-2 px-4 text-xs font-semibold self-start sm:self-center shrink-0">
                      Apply
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl">
                <Briefcase className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-accent">No matches found yet</p>
                <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">We couldn't find jobs matching your skills. Check back soon or refine your profile.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Profile Status / Upload Quick widget */}
        <div className="space-y-6">
          <div className="bg-white border border-border-subtle rounded-2xl shadow-sm p-6">
            <h3 className="font-heading font-bold text-lg text-accent mb-4 flex items-center gap-2">
              <User className="h-4.5 w-4.5 text-primary" />
              Resume Profile
            </h3>

            {hasResume ? (
              <div className="space-y-4">
                <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3">
                  <div className="bg-emerald-500 text-white rounded-full p-1 flex items-center justify-center shrink-0">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-800 leading-none">Resume Extracted</p>
                    <p className="text-[10px] text-emerald-600 mt-1">Successfully synced with Neon DB</p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <span className="text-[10px] text-text-muted font-semibold uppercase tracking-wider block mb-1">Current Title</span>
                    <span className="text-xs font-medium text-accent block">{profile.currentTitle || 'Not Extracted'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-text-muted font-semibold uppercase tracking-wider block mb-1">Experience Years</span>
                    <span className="text-xs font-medium text-accent block">{profile.experienceYears} Years</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-text-muted font-semibold uppercase tracking-wider block mb-1">Extracted Skills ({skillsCount})</span>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {profile.extractedSkills.slice(0, 10).map((skill, index) => (
                        <span key={index} className="bg-slate-100 text-text-muted text-[10px] px-2 py-0.5 rounded">
                          {skill}
                        </span>
                      ))}
                      {skillsCount > 10 && (
                        <span className="text-[9px] text-text-muted self-center font-bold px-1">
                          +{skillsCount - 10} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <Link to="/profile" className="btn-outline w-full py-2.5 text-xs font-semibold mt-2">
                  Update Resume / Profile
                </Link>
              </div>
            ) : (
              <div className="space-y-4 text-center py-4">
                <p className="text-xs text-text-muted">You haven't uploaded a resume yet. Let LLaMA-3.3 parse your credentials to find jobs matching your unique strengths.</p>
                <Link to="/profile" className="btn-primary w-full py-2.5 text-xs font-semibold">
                  Upload PDF Resume
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}