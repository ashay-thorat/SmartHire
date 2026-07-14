import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useJobStore } from '../store/jobStore.js';
import { useAuthStore } from '../store/authStore.js';
import {
  Search,
  MapPin,
  Briefcase,
  DollarSign,
  Bookmark,
  BookmarkCheck,
  Send,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  ExternalLink,
  Globe
} from 'lucide-react';

export default function Jobs() {
  const { user } = useAuthStore();
  const {
    jobs,
    pagination,
    savedJobs,
    applications,
    profile,
    loading,
    error,
    fetchAllJobs,
    fetchSavedJobs,
    fetchApplications,
    fetchProfile,
    saveJob,
    unsaveJob,
    applyToJob,
  } = useJobStore();

  // Search & Filter state
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    type: '',
    salary_min: '',
    salary_max: '',
    page: 1,
    limit: 6
  });

  // Modal application state
  const [selectedJob, setSelectedJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');
  const [modalError, setModalError] = useState('');
  const [submittingApp, setSubmittingApp] = useState(false);

  const [generatingCoverLetter, setGeneratingCoverLetter] = useState(false);

  useEffect(() => {
    fetchAllJobs(filters);
    fetchSavedJobs();
    fetchApplications();
    fetchProfile();
  }, [filters, fetchAllJobs, fetchSavedJobs, fetchApplications, fetchProfile]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: 1 // Reset to first page on change
    }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= (pagination?.totalPages || 1)) {
      setFilters(prev => ({ ...prev, page: newPage }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSaveToggle = async (e, jobId) => {
    e.preventDefault();
    e.stopPropagation();
    const isSaved = savedJobs.some(item => item.job?.id === jobId);
    if (isSaved) {
      await unsaveJob(jobId);
    } else {
      await saveJob(jobId);
    }
  };

  const isJobSaved = (jobId) => savedJobs.some(item => item.job?.id === jobId);
  const isJobApplied = (jobId) => applications.some(app => app.jobId === jobId);

  const openApplyModal = (job) => {
    setSelectedJob(job);
    setCoverLetter(`Dear Hiring Team at ${job.company},\n\nI am extremely excited to apply for the ${job.title} position. Given my professional experience and technical skills, I believe I am a strong candidate for this role. Thank you for your time and consideration.`);
    setModalSuccess('');
    setModalError('');
  };

  const closeApplyModal = () => {
    setSelectedJob(null);
    setCoverLetter('');
  };

  const handleGenerateCoverLetter = async () => {
    if (!selectedJob) return;
    setGeneratingCoverLetter(true);
    setModalError('');
    try {
      // Use the api instance from authStore to ensure interceptors and token refresh work
      const { api } = await import('../store/authStore.js');
      const response = await api.post('/resume/cover-letter', { jobId: selectedJob.id });
      setCoverLetter(response.data.coverLetter);
    } catch (err) {
      setModalError(err.response?.data?.message || err.message || 'Failed to generate cover letter');
    } finally {
      setGeneratingCoverLetter(false);
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setSubmittingApp(true);
    setModalSuccess('');
    setModalError('');
    try {
      await applyToJob(selectedJob.id, coverLetter);
      setModalSuccess('Application submitted successfully!');
      setTimeout(() => {
        closeApplyModal();
      }, 1500);
    } catch (err) {
      setModalError(err.message || 'Submission failed');
    } finally {
      setSubmittingApp(false);
    }
  };

  // Evaluate skills alignment
  const getSkillMatch = (requiredSkills) => {
    if (!profile?.extractedSkills || !requiredSkills) return { percentage: 0, matching: [], missing: requiredSkills || [] };
    const mySkills = profile.extractedSkills.map(s => s.toLowerCase());
    const matching = requiredSkills.filter(s => mySkills.includes(s.toLowerCase()));
    const missing = requiredSkills.filter(s => !mySkills.includes(s.toLowerCase()));
    const percentage = requiredSkills.length > 0 ? Math.round((matching.length / requiredSkills.length) * 100) : 100;
    return { percentage, matching, missing };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
      <div className="mb-8">
        <h1 className="font-heading font-extrabold text-3xl text-accent">Discover Tech Careers</h1>
        <p className="text-text-muted text-sm mt-1">Browse active postings, inspect real-time AI skill overlaps, and apply directly.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Side: Filter Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-border-subtle rounded-2xl p-5 shadow-sm sticky top-20">
            <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-slate-100">
              <h3 className="font-heading font-bold text-base text-accent flex items-center gap-2">
                <Search className="h-4 w-4 text-primary" />
                Filters
              </h3>
              {(filters.search || filters.location || filters.type || filters.salary_min) && (
                <button
                  onClick={() => setFilters({ search: '', location: '', type: '', salary_min: '', salary_max: '', page: 1, limit: 6 })}
                  className="text-[10px] text-rose-500 hover:text-rose-700 font-semibold uppercase tracking-wider"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="space-y-5">
              {/* Title Search */}
              <div>
                <label className="text-accent text-[10px] font-bold block mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                  <Search className="h-3 w-3 text-primary" />
                  Search Keywords
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    placeholder="e.g. React Developer"
                    className="premium-input py-2.5 text-xs pl-3"
                  />
                  {filters.search && (
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, search: '', page: 1 }))}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-300 hover:text-slate-500"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Location Search */}
              <div>
                <label className="text-accent text-[10px] font-bold block mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="h-3 w-3 text-primary" />
                  Location
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted">

                  </span>
                  <input
                    type="text"
                    name="location"
                    value={filters.location}
                    onChange={handleFilterChange}
                    placeholder="e.g. Remote or San Jose"
                    className="premium-input pl-8 py-2.5 text-xs"
                  />
                  {filters.location && (
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, location: '', page: 1 }))}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-300 hover:text-slate-500"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Job Type select */}
              <div>
                <label className="text-accent text-[10px] font-bold block mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="h-3 w-3 text-primary" />
                  Job Type
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted pointer-events-none">

                  </span>
                  <select
                    name="type"
                    value={filters.type}
                    onChange={handleFilterChange}
                    className="premium-input pl-8 py-2.5 text-xs appearance-none"
                  >
                    <option value="">All Types</option>
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="remote">Remote</option>
                    <option value="contract">Contract</option>
                  </select>
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted pointer-events-none">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </div>
              </div>

              {/* Salary Range */}
              <div>
                <label className="text-accent text-[10px] font-bold block mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="h-3 w-3 text-primary" />
                  Salary Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-text-muted">
                      <DollarSign className="h-3 w-3" />
                    </span>
                    <input
                      type="number"
                      name="salary_min"
                      value={filters.salary_min}
                      onChange={handleFilterChange}
                      placeholder="Min"
                      className="premium-input pl-7 py-2.5 text-xs"
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-text-muted">
                      <DollarSign className="h-3 w-3" />
                    </span>
                    <input
                      type="number"
                      name="salary_max"
                      value={filters.salary_max}
                      onChange={handleFilterChange}
                      placeholder="Max"
                      className="premium-input pl-7 py-2.5 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Active filter count */}
            {(() => {
              const count = [filters.search, filters.location, filters.type, filters.salary_min, filters.salary_max].filter(Boolean).length;
              if (count === 0) return null;
              return (
                <div className="mt-4 pt-3.5 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[10px] text-text-muted">
                    <span>{count} filter{count > 1 ? 's' : ''} active</span>
                    <span className="text-primary font-semibold">{jobs.length} result{jobs.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Right Side: Jobs List */}
        <div className="lg:col-span-3 space-y-6">
          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 text-xs rounded-xl px-4 py-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white border border-border-subtle rounded-2xl shadow-sm">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-xs text-text-muted font-medium">Fetching active careers...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-20 bg-white border border-border-subtle rounded-2xl shadow-sm">
              <Briefcase className="h-12 w-12 text-slate-200 mx-auto mb-4" />
              <p className="text-sm font-semibold text-accent">No career openings matching filters</p>
              <p className="text-xs text-text-muted mt-1">Try tweaking your search keywords or clearing out location parameters.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center text-xs text-text-muted px-1">
                <span>Displaying {jobs.length} postings</span>
                <span>Page {pagination?.currentPage || 1} of {pagination?.totalPages || 1}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {jobs.map((job) => {
                  const hasResume = !!profile?.resumeUrl;
                  const match = getSkillMatch(job.requiredSkills || []);
                  const isSaved = !job.isExternal && isJobSaved(job.id);
                  const isApplied = !job.isExternal && isJobApplied(job.id);

                  const displaySalary = job.salaryMin != null
                    ? `$${(job.salaryMin / 1000).toFixed(0)}k - $${(job.salaryMax / 1000).toFixed(0)}k`
                    : job.salary || null;

                  const displayType = job.jobType || job.employmentType || '';

                  return (
                    <div key={job.id} className="premium-card p-6 border-slate-100 bg-white flex flex-col justify-between relative group hover:-translate-y-1">
                      {/* Top Header Card */}
                      <div>
                        <div className="flex justify-between items-start gap-3 mb-3.5">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-heading font-extrabold text-base text-accent leading-tight group-hover:text-primary transition-colors">
                                {job.title}
                              </h3>
                              {job.isExternal && (
                                <span className="bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shrink-0">
                                  <Globe className="h-3 w-3" />
                                  External
                                </span>
                              )}
                            </div>
                            {job.logo && (
                              <img src={job.logo} alt="" className="h-5 w-5 object-contain mt-1 rounded" onError={(e) => e.target.style.display = 'none'} />
                            )}
                            {job.recruiterId && !job.isExternal ? (
                              <Link 
                                to={`/company/${job.recruiterId}`} 
                                className="text-xs text-primary font-medium mt-1 hover:underline inline-block"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {job.company}
                              </Link>
                            ) : (
                              <p className="text-xs text-text-muted font-medium mt-1">{job.company}</p>
                            )}
                          </div>

                          {/* Bookmark Save icon (internal only) */}
                          {!job.isExternal && (
                            <button
                              onClick={(e) => handleSaveToggle(e, job.id)}
                              className={`p-2 rounded-xl border transition-colors cursor-pointer shrink-0 ${isSaved
                                ? 'border-primary/20 bg-sky-50 text-primary'
                                : 'border-slate-100 bg-slate-50 text-slate-400 hover:text-primary hover:bg-sky-50/30'
                                }`}
                            >
                              {isSaved ? <BookmarkCheck className="h-4.5 w-4.5" /> : <Bookmark className="h-4.5 w-4.5" />}
                            </button>
                          )}
                        </div>

                        {/* Location / Placement badges */}
                        <div className="flex flex-wrap gap-2.5 mb-4 text-xs font-semibold text-text-muted">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                            {job.location}
                          </span>
                          {displayType && (
                            <span className="flex items-center gap-1 capitalize">
                              <Briefcase className="h-3.5 w-3.5 text-primary shrink-0" />
                              {displayType}
                            </span>
                          )}
                          {displaySalary && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3.5 w-3.5 text-primary shrink-0" />
                              {displaySalary}
                            </span>
                          )}
                        </div>

                        {/* Job Description Snippet */}
                        <p className="text-text-muted text-xs leading-relaxed line-clamp-3 mb-5">
                          {job.description}
                        </p>

                        {/* Required Skills list */}
                        {!job.isExternal && job.requiredSkills?.length > 0 && (
                          <div className="mb-6">
                            <span className="text-[10px] text-accent font-bold uppercase tracking-wider block mb-2">Required Skills</span>
                            <div className="flex flex-wrap gap-1.5">
                              {job.requiredSkills?.map((skill) => {
                                const isMatch = hasResume && profile?.extractedSkills?.some(s => s.toLowerCase() === skill.toLowerCase());
                                return (
                                  <span
                                    key={skill}
                                    className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border ${isMatch
                                      ? 'bg-sky-50 border-sky-100 text-primary'
                                      : 'bg-slate-50 border-slate-100 text-slate-500'
                                      }`}
                                  >
                                    {skill}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Bottom score and action */}
                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4 mt-auto">
                        {!job.isExternal && hasResume ? (
                          <div className="flex items-center gap-1.5">
                            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                            <span className="text-xs font-bold text-accent">{match.percentage}% Skill overlap</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-text-muted italic">
                            {job.isExternal ? 'Apply on external site' : 'Upload resume for fit analysis'}
                          </span>
                        )}

                        {job.isExternal ? (
                          <a
                            href={job.applyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary py-2 px-4 text-xs font-semibold shadow-sm inline-flex items-center gap-1.5"
                          >
                            Apply ↗
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : isApplied ? (
                          <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11px] font-semibold py-2 px-4 rounded-xl flex items-center gap-1">
                            <CheckCircle className="h-3.5 w-3.5" /> Applied
                          </span>
                        ) : (
                          <button
                            onClick={() => openApplyModal(job)}
                            className="btn-primary py-2 px-4 text-xs font-semibold shadow-sm"
                          >
                            Apply Now
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination triggers */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-6">
                  <button
                    onClick={() => handlePageChange(filters.page - 1)}
                    disabled={filters.page === 1}
                    className="p-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-xs text-text-muted font-semibold">
                    Page {filters.page} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(filters.page + 1)}
                    disabled={filters.page === pagination.totalPages}
                    className="p-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Application Custom Popup Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-border-subtle rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-float-fast relative">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-sky-50/50">
              <div>
                <h3 className="font-heading font-extrabold text-base text-accent leading-none">Apply for {selectedJob.title}</h3>
                <p className="text-[11px] text-text-muted mt-1">{selectedJob.company} • {selectedJob.location}</p>
              </div>
              <button onClick={closeApplyModal} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-accent cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="p-5 space-y-4">
              {modalSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl px-4 py-3 flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{modalSuccess}</span>
                </div>
              )}

              {modalError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl px-4 py-3 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>{modalError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-accent text-[10px] font-bold uppercase tracking-wider">Cover Letter Introduction</label>
                  <button
                    type="button"
                    onClick={handleGenerateCoverLetter}
                    disabled={generatingCoverLetter}
                    className="text-[10px] font-bold text-primary flex items-center gap-1 hover:text-sky-700 disabled:opacity-50"
                  >
                    <Sparkles className="h-3 w-3" />
                    {generatingCoverLetter ? 'Generating...' : 'AI Generate'}
                  </button>
                </div>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Tell the hiring team why you are a great fit..."
                  className="premium-input min-h-[160px] text-xs leading-relaxed resize-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeApplyModal}
                  className="btn-outline py-2 px-4 text-xs font-semibold border-slate-200 text-slate-500 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingApp || modalSuccess}
                  className="btn-primary py-2 px-5 text-xs font-semibold shadow-sm flex items-center gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  {submittingApp ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}