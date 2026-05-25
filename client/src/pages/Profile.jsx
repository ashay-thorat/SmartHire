import React, { useState, useEffect } from 'react';
import { useJobStore } from '../store/jobStore.js';
import { useAuthStore } from '../store/authStore.js';
import { 
  FileText, 
  UploadCloud, 
  CheckCircle, 
  BrainCircuit, 
  Save, 
  Plus, 
  X, 
  Trash2,
  AlertCircle
} from 'lucide-react';

export default function Profile() {
  const { profile, fetchProfile, uploadResume, updateProfile, loading, error } = useJobStore();
  const [dragOver, setDragOver] = useState(false);
  const [formData, setFormData] = useState({
    currentTitle: '',
    experienceYears: 0,
    location: '',
    extractedSkills: []
  });
  const [newSkill, setNewSkill] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profile) {
      setFormData({
        currentTitle: profile.currentTitle || '',
        experienceYears: profile.experienceYears || 0,
        location: profile.location || '',
        extractedSkills: profile.extractedSkills || []
      });
    }
  }, [profile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'experienceYears' ? parseInt(value) || 0 : value
    });
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !formData.extractedSkills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        extractedSkills: [...formData.extractedSkills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      extractedSkills: formData.extractedSkills.filter(s => s !== skillToRemove)
    });
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragOver(false);
    setSuccessMsg('');
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      await handleUpload(file);
    }
  };

  const handleFileChange = async (e) => {
    setSuccessMsg('');
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      await handleUpload(file);
    }
  };

  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  const validateFile = (file) => {
    if (!file) return 'No file selected';
    if (file.type !== 'application/pdf') return 'Only PDF files are supported';
    if (file.size > MAX_FILE_SIZE) return 'File size must be under 10MB';
    return null;
  };

  const handleUpload = async (file) => {
    const validationError = validateFile(file);
    if (validationError) {
      useAuthStore.setState({ error: validationError });
      return;
    }
    const uploadData = new FormData();
    uploadData.append('resume', file);
    try {
      await uploadResume(uploadData);
      setSuccessMsg('Resume uploaded and parsed successfully by LLaMA-3.3 AI!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    try {
      await updateProfile(formData);
      setSuccessMsg('Profile updated successfully!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 font-sans">
      <div className="mb-8">
        <h1 className="font-heading font-extrabold text-3xl text-accent flex items-center gap-2.5">
          <BrainCircuit className="h-8 w-8 text-primary" />
          My Professional Profile
        </h1>
        <p className="text-text-muted text-sm mt-1">Upload your resume to let AI parse your skills, or manually update your credentials.</p>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl px-4 py-3.5 mb-6 flex items-start gap-2.5 shadow-sm">
          <CheckCircle className="h-5 w-5 shrink-0 mt-0.5 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-sm rounded-xl px-4 py-3.5 mb-6 flex items-start gap-2.5 shadow-sm">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Upload Panel */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white border border-border-subtle rounded-2xl shadow-sm p-5">
            <h3 className="font-heading font-bold text-base text-accent mb-3.5">PDF Resume</h3>
            
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition ${
                dragOver 
                  ? 'border-primary bg-sky-50' 
                  : 'border-slate-200 hover:border-primary hover:bg-slate-50'
              }`}
            >
              {loading ? (
                <div className="flex flex-col items-center py-4">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="text-[11px] font-semibold text-accent leading-none">LLaMA Parsing...</p>
                  <p className="text-[9px] text-text-muted mt-1 leading-normal px-2">Extracting experience & key skills</p>
                </div>
              ) : profile?.resumeUrl ? (
                <div className="flex flex-col items-center">
                  <FileText className="h-10 w-10 text-primary mb-3" />
                  <p className="text-xs font-semibold text-accent truncate max-w-full px-2">Resume Uploaded</p>
                  <a 
                    href={`http://localhost:5000${profile.resumeUrl}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-[10px] text-primary hover:underline font-bold mt-1.5"
                  >
                    View Current PDF
                  </a>
                  <div className="h-px w-full bg-slate-100 my-4"></div>
                  <label className="text-[10px] bg-slate-100 text-text-muted hover:bg-slate-200 py-1.5 px-3 rounded-lg font-semibold cursor-pointer">
                    Replace Resume
                    <input type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
                  </label>
                </div>
              ) : (
                <div className="flex flex-col items-center py-2">
                  <UploadCloud className="h-10 w-10 text-slate-300 mb-3" />
                  <p className="text-xs font-bold text-accent mb-1">Drag resume here</p>
                  <p className="text-[9px] text-text-muted mb-4">PDF format only</p>
                  <label className="btn-primary py-1.5 px-4 text-[10px] font-semibold cursor-pointer shadow-sm">
                    Browse File
                    <input type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Columns: Profile Fields Editor */}
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white border border-border-subtle rounded-2xl shadow-sm p-6 md:p-8 space-y-6">
            <h3 className="font-heading font-bold text-lg text-accent pb-3 border-b border-slate-100">Profile Details</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-accent text-xs font-semibold block mb-1.5 uppercase tracking-wider">Current Job Title</label>
                <input
                  type="text"
                  name="currentTitle"
                  value={formData.currentTitle}
                  onChange={handleInputChange}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="premium-input"
                />
              </div>

              <div>
                <label className="text-accent text-xs font-semibold block mb-1.5 uppercase tracking-wider">Years of Experience</label>
                <input
                  type="number"
                  name="experienceYears"
                  value={formData.experienceYears}
                  onChange={handleInputChange}
                  min="0"
                  className="premium-input"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-accent text-xs font-semibold block mb-1.5 uppercase tracking-wider">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g. San Francisco, CA (or Remote)"
                  className="premium-input"
                />
              </div>
            </div>

            {/* Extracted Skills Tags Editor */}
            <div className="pt-2">
              <label className="text-accent text-xs font-semibold block mb-2 uppercase tracking-wider">Extracted Professional Skills</label>
              
              <div className="flex flex-wrap gap-2 p-4 bg-slate-50 border border-slate-100 rounded-xl mb-4 min-h-[80px]">
                {formData.extractedSkills.length === 0 ? (
                  <span className="text-xs text-text-muted self-center italic">No skills listed yet. Upload a resume or add skills manually below.</span>
                ) : (
                  formData.extractedSkills.map(skill => (
                    <span 
                      key={skill} 
                      className="bg-sky-50 border border-sky-100 text-primary text-xs px-3 py-1 rounded-full font-semibold flex items-center gap-1.5 shadow-sm"
                    >
                      {skill}
                      <button 
                        type="button" 
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-primary hover:text-rose-500 rounded-full hover:bg-sky-100 p-0.5 cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill tag manually... e.g. React Native"
                  className="premium-input"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="btn-outline py-3 px-4 font-semibold text-sm shrink-0 border-slate-200 text-slate-600 hover:bg-slate-100"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary py-3.5 px-6 text-sm font-semibold shadow-md shadow-sky-100 flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save Profile
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
