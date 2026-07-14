import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from "../store/authStore.js";
import { Building2, Globe, FileText, Briefcase, MapPin, DollarSign, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function CompanyProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setLoading(true);
        const [profileRes, jobsRes] = await Promise.all([
          api.get(`/company/${id}`),
          api.get(`/company/${id}/jobs`),
        ]);
        setProfile(profileRes.data);
        setJobs(jobsRes.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching company data:', err);
        setError(err.response?.data?.message || 'Failed to load company profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3">
          <FileText className="h-5 w-5" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
      {/* Header Section */}
      <div className="premium-card p-6 md:p-10 flex flex-col md:flex-row gap-8 items-start border-slate-200">
        <div className="bg-sky-50 border border-sky-100 w-24 h-24 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
          {profile.logoUrl ? (
            <img src={profile.logoUrl} alt={profile.companyName} className="w-full h-full object-cover rounded-2xl" />
          ) : (
            <Building2 className="h-10 w-10 text-primary" />
          )}
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-heading font-bold text-accent mb-2">
            {profile.companyName || 'Unnamed Company'}
          </h1>
          {profile.website && (
            <a 
              href={profile.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-sky-600 font-medium bg-sky-50 px-3 py-1.5 rounded-lg mb-4"
            >
              <Globe className="h-4 w-4" />
              Visit Website
            </a>
          )}
          <div className="text-text-muted mt-2 whitespace-pre-wrap text-sm leading-relaxed max-w-3xl">
            {profile.companyDescription || 'No description provided.'}
          </div>
        </div>
      </div>

      {/* Active Jobs Section */}
      <div>
        <h2 className="text-xl font-heading font-bold text-accent mb-6 flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
          Open Positions at {profile.companyName || 'this company'}
        </h2>

        {jobs.length === 0 ? (
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 text-center">
            <p className="text-text-muted">There are no open positions at this time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <div key={job.id} className="premium-card p-5 border-slate-200 hover:border-sky-300 transition-colors flex flex-col h-full">
                <div className="mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-heading font-semibold text-lg text-accent line-clamp-1" title={job.title}>
                      {job.title}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-text-muted mt-2">
                    <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md">
                      <MapPin className="h-3 w-3" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md">
                      <Briefcase className="h-3 w-3" />
                      {job.jobType}
                    </span>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-emerald-600 text-xs font-semibold bg-emerald-50 px-2 py-1 rounded-md">
                    <DollarSign className="h-3 w-3" />
                    {job.salaryMin.toLocaleString()} - {job.salaryMax.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1 text-slate-400 text-xs">
                    <Calendar className="h-3 w-3" />
                    {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
