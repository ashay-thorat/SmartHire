import React, { useState, useEffect } from 'react';
import { api } from '../store/authStore';
import { Building2, Save, CheckCircle, AlertTriangle, Image as ImageIcon } from 'lucide-react';

export default function RecruiterSettings() {
  const [profile, setProfile] = useState({
    companyName: '',
    companyDescription: '',
    website: '',
    logoUrl: ''
  });
  const [logoFile, setLogoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/recruiter/profile');
      if (response.data) {
        setProfile({
          companyName: response.data.companyName || '',
          companyDescription: response.data.companyDescription || '',
          website: response.data.website || '',
          logoUrl: response.data.logoUrl || ''
        });
      }
    } catch (err) {
      console.error('Error fetching recruiter profile', err);
    }
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setLogoFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const formData = new FormData();
    formData.append('companyName', profile.companyName);
    formData.append('companyDescription', profile.companyDescription);
    formData.append('website', profile.website);
    if (logoFile) {
      formData.append('logo', logoFile);
    }

    try {
      const response = await api.put('/recruiter/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccessMsg('Profile updated successfully');
      if (response.data.profile) {
        setProfile({
          companyName: response.data.profile.companyName || '',
          companyDescription: response.data.profile.companyDescription || '',
          website: response.data.profile.website || '',
          logoUrl: response.data.profile.logoUrl || ''
        });
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 font-sans">
      <div className="mb-8">
        <h1 className="font-heading font-extrabold text-3xl text-accent flex items-center gap-2.5">
          <Building2 className="h-8 w-8 text-primary" />
          Company Profile
        </h1>
        <p className="text-text-muted text-sm mt-1">Manage your company details and branding.</p>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl px-4 py-3.5 mb-6 flex items-start gap-2.5 shadow-sm">
          <CheckCircle className="h-5 w-5 shrink-0 mt-0.5 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-sm rounded-xl px-4 py-3.5 mb-6 flex items-start gap-2.5 shadow-sm">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-border-subtle rounded-2xl shadow-sm p-6 md:p-8 space-y-6">
        <h3 className="font-heading font-bold text-lg text-accent pb-3 border-b border-slate-100">Company Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2 flex items-center gap-6">
            <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50 overflow-hidden shrink-0">
              {profile.logoUrl ? (
                <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${profile.logoUrl}`} alt="Company Logo" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="h-8 w-8 text-slate-300" />
              )}
            </div>
            <div>
              <label className="text-accent text-xs font-semibold block mb-1.5 uppercase tracking-wider">Company Logo</label>
              <input type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-primary hover:file:bg-sky-100 transition-colors" />
            </div>
          </div>

          <div className="md:col-span-1">
            <label className="text-accent text-xs font-semibold block mb-1.5 uppercase tracking-wider">Company Name</label>
            <input
              type="text"
              name="companyName"
              value={profile.companyName}
              onChange={handleChange}
              placeholder="e.g. Acme Corp"
              className="premium-input"
            />
          </div>

          <div className="md:col-span-1">
            <label className="text-accent text-xs font-semibold block mb-1.5 uppercase tracking-wider">Website URL</label>
            <input
              type="url"
              name="website"
              value={profile.website}
              onChange={handleChange}
              placeholder="https://example.com"
              className="premium-input"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-accent text-xs font-semibold block mb-1.5 uppercase tracking-wider">Company Description</label>
            <textarea
              name="companyDescription"
              value={profile.companyDescription}
              onChange={handleChange}
              rows={4}
              placeholder="Tell candidates about your company..."
              className="premium-input resize-none"
            ></textarea>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary py-3.5 px-6 text-sm font-semibold shadow-md shadow-sky-100 flex items-center gap-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
