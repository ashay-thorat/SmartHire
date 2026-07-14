import React, { useState, useEffect } from 'react';
import { useRecruiterStore } from '../store/recruiterStore.js';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Power, 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Users, 
  X, 
  Check, 
  AlertCircle 
} from 'lucide-react';

export default function RecruiterJobs() {
  const { myJobs, fetchMyJobs, createJob, updateJob, deleteJob, loading, error } = useRecruiterStore();
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [modalError, setModalError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form State
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [description, setDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('full-time');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  useEffect(() => {
    fetchMyJobs();
  }, [fetchMyJobs]);

  const openCreateModal = () => {
    setEditingJob(null);
    setTitle('');
    setCompany('');
    setDescription('');
    setRequiredSkills('');
    setLocation('');
    setJobType('full-time');
    setSalaryMin('');
    setSalaryMax('');
    setExpiresAt('');
    setModalError('');
    setShowModal(true);
  };

  const openEditModal = (job) => {
    setEditingJob(job);
    setTitle(job.title);
    setCompany(job.company);
    setDescription(job.description);
    setRequiredSkills(job.requiredSkills.join(', '));
    setLocation(job.location);
    setJobType(job.jobType);
    setSalaryMin(job.salaryMin.toString());
    setSalaryMax(job.salaryMax.toString());
    setExpiresAt(job.expiresAt ? new Date(job.expiresAt).toISOString().split('T')[0] : '');
    setModalError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError('');

    const parsedSkills = requiredSkills
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const jobData = {
      title,
      company,
      description,
      requiredSkills: parsedSkills,
      location,
      jobType,
      salaryMin: parseInt(salaryMin, 10),
      salaryMax: parseInt(salaryMax, 10),
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
    };

    try {
      if (editingJob) {
        await updateJob(editingJob.id, jobData);
      } else {
        await createJob(jobData);
      }
      setShowModal(false);
    } catch (err) {
      setModalError(err.message || 'Action failed. Please verify inputs.');
    }
  };

  const toggleActiveStatus = async (job) => {
    try {
      await updateJob(job.id, { isActive: !job.isActive });
    } catch (err) {
      console.error(err);
    }
  };

  const handleCloseJob = async (job) => {
    if (!window.confirm('Are you sure you want to close this job? It will be removed from the job board.')) return;
    try {
      await updateJob(job.id, { isActive: false, expiresAt: new Date().toISOString() });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-heading font-extrabold text-3xl text-accent flex items-center gap-2.5">
            <Briefcase className="h-7 w-7 text-primary" />
            Manage Job Postings
          </h1>
          <p className="text-text-muted text-sm mt-1">Create, pause, edit, and monitor your listed placements.</p>
        </div>
        <button onClick={openCreateModal} className="btn-primary py-2.5 px-5 text-xs font-semibold shadow-sm flex items-center gap-1.5 self-start shrink-0">
          <Plus className="h-4 w-4" />
          Post New Job
        </button>
      </div>

      <div className="mb-6">
        <input 
          type="text" 
          placeholder="Search by title, company, or skills..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="premium-input text-xs w-full max-w-md"
        />
      </div>

      {loading && myJobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-border-subtle rounded-2xl shadow-sm">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-xs text-text-muted font-medium">Loading your job posts...</p>
        </div>
      ) : myJobs.length === 0 ? (
        <div className="text-center py-20 bg-white border border-border-subtle rounded-2xl shadow-sm">
          <Briefcase className="h-14 w-14 text-slate-200 mx-auto mb-4" />
          <h3 className="font-heading font-bold text-lg text-accent">No Active Postings</h3>
          <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
            Get started by posting your first job description. Candidates will see it instantly on their job boards.
          </p>
          <button onClick={openCreateModal} className="btn-primary py-2 px-5 text-xs font-semibold mt-5">
            Post a Job
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {myJobs.filter(job => {
            const query = searchQuery.toLowerCase();
            return job.title.toLowerCase().includes(query) || 
                   job.company.toLowerCase().includes(query) ||
                   job.requiredSkills.some(s => s.toLowerCase().includes(query));
          }).map((job) => {
            const isClosed = job.expiresAt && new Date(job.expiresAt) < new Date();
            return (
            <div key={job.id} className={`premium-card p-6 bg-white border-slate-100 flex flex-col justify-between transition-all ${!job.isActive || isClosed ? 'opacity-75 bg-slate-50/50' : ''}`}>
              <div>
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div>
                    <h3 className="font-heading font-extrabold text-base text-accent leading-tight">{job.title}</h3>
                    <p className="text-xs text-text-muted font-semibold mt-0.5">{job.company}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                    isClosed
                      ? 'text-rose-700 bg-rose-50 border-rose-200'
                      : job.isActive 
                        ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
                        : 'text-slate-500 bg-slate-50 border-slate-200'
                  }`}>
                    {isClosed ? 'Closed' : job.isActive ? 'Active' : 'Paused'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2.5 mb-4 text-xs font-semibold text-text-muted">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1 capitalize">
                    <Briefcase className="h-3.5 w-3.5 text-primary shrink-0" />
                    {job.jobType}
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-3.5 w-3.5 text-primary shrink-0" />
                    ${(job.salaryMin / 1000).toFixed(0)}k - ${(job.salaryMax / 1000).toFixed(0)}k
                  </span>
                </div>

                <p className="text-text-muted text-xs leading-relaxed line-clamp-3 mb-4">
                  {job.description}
                </p>

                <div className="mb-6">
                  <span className="text-[10px] text-accent font-bold uppercase tracking-wider block mb-2">Required Skills</span>
                  <div className="flex flex-wrap gap-1.5">
                    {job.requiredSkills?.map((skill) => (
                      <span key={skill} className="text-[10px] px-2 py-0.5 rounded-md font-semibold border bg-slate-50 border-slate-100 text-slate-500">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto flex-wrap">
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleActiveStatus(job)}
                    disabled={isClosed}
                    className={`btn-outline py-1.5 px-3 text-[10px] font-bold border-slate-200 flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                      job.isActive ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'
                    }`}
                  >
                    <Power className="h-3.5 w-3.5" />
                    {job.isActive ? 'Pause Posting' : 'Activate'}
                  </button>

                  {!isClosed && (
                    <button
                      onClick={() => handleCloseJob(job)}
                      className="btn-outline py-1.5 px-3 text-[10px] font-bold border-slate-200 flex items-center gap-1 cursor-pointer text-rose-600 hover:bg-rose-50"
                    >
                      <X className="h-3.5 w-3.5" />
                      Close Job
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(job)}
                    className="p-2 border border-slate-200 hover:border-primary hover:bg-sky-50/30 text-slate-500 hover:text-primary rounded-xl transition-all cursor-pointer"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => deleteJob(job.id)}
                    className="p-2 border border-slate-200 hover:border-rose-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-all cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}

      {/* Post/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-border-subtle rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl animate-float-fast relative">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-sky-50/50">
              <h3 className="font-heading font-extrabold text-base text-accent">
                {editingJob ? 'Edit Job Posting' : 'Post New Career'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-accent cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {modalError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl px-4 py-3 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>{modalError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Title */}
                <div>
                  <label className="text-accent text-[10px] font-bold block mb-1 uppercase tracking-wider">Job Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Senior Frontend Engineer"
                    className="premium-input text-xs"
                    required
                  />
                </div>

                {/* Company Name */}
                <div>
                  <label className="text-accent text-[10px] font-bold block mb-1 uppercase tracking-wider">Company Name</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. SmartHire Inc."
                    className="premium-input text-xs"
                    required
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="text-accent text-[10px] font-bold block mb-1 uppercase tracking-wider">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Remote or Denver, CO"
                    className="premium-input text-xs"
                    required
                  />
                </div>

                {/* Placement Type */}
                <div>
                  <label className="text-accent text-[10px] font-bold block mb-1 uppercase tracking-wider">Placement Type</label>
                  <select
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value)}
                    className="premium-input text-xs"
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="remote">Remote</option>
                    <option value="contract">Contract</option>
                  </select>
                </div>

                {/* Salary Min */}
                <div>
                  <label className="text-accent text-[10px] font-bold block mb-1 uppercase tracking-wider">Min Salary (USD/yr)</label>
                  <input
                    type="number"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value)}
                    placeholder="e.g. 90000"
                    className="premium-input text-xs"
                    required
                  />
                </div>

                {/* Salary Max */}
                <div>
                  <label className="text-accent text-[10px] font-bold block mb-1 uppercase tracking-wider">Max Salary (USD/yr)</label>
                  <input
                    type="number"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(e.target.value)}
                    placeholder="e.g. 130000"
                    className="premium-input text-xs"
                    required
                  />
                </div>
                
                {/* Expiry Date */}
                <div>
                  <label className="text-accent text-[10px] font-bold block mb-1 uppercase tracking-wider">Expiry Date (Optional)</label>
                  <input
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="premium-input text-xs"
                  />
                </div>
              </div>

              {/* Skills */}
              <div>
                <label className="text-accent text-[10px] font-bold block mb-1 uppercase tracking-wider">Required Skills (Comma separated)</label>
                <input
                  type="text"
                  value={requiredSkills}
                  onChange={(e) => setRequiredSkills(e.target.value)}
                  placeholder="React, TypeScript, Tailwind, Node.js"
                  className="premium-input text-xs"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-accent text-[10px] font-bold block mb-1 uppercase tracking-wider">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the role details, responsibilities, and benefits..."
                  className="premium-input min-h-[120px] text-xs leading-relaxed"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-outline py-2 px-4 text-xs font-semibold border-slate-200 text-slate-500 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary py-2 px-5 text-xs font-semibold shadow-sm cursor-pointer"
                >
                  {editingJob ? 'Update Posting' : 'Publish Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
