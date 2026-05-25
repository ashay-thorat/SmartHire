import { create } from 'zustand';
import { api } from './authStore.js';

export const useJobStore = create((set, get) => ({
  jobs: [],
  pagination: null,
  savedJobs: [],
  applications: [],
  matchedJobs: [],
  externalJobs: [], // jobs fetched from external API
  profile: null,
  loading: false,
  loadingExternal: false,
  error: null,

  // ── Jobs fetching ────────────────────────────────────────────────────────
  fetchJobs: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const {
        search = '',
        location = '',
        type = '',
        salary_min = '',
        salary_max = '',
        page = 1,
        limit = 10,
      } = filters;
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (location) params.append('location', location);
      if (type) params.append('type', type);
      if (salary_min) params.append('salary_min', salary_min);
      if (salary_max) params.append('salary_max', salary_max);
      params.append('page', page);
      params.append('limit', limit);

      const response = await api.get(`/jobs?${params.toString()}`);
      set({
        jobs:
          page === 1
            ? response.data.jobs
            : [...get().jobs, ...response.data.jobs],
        pagination: response.data.pagination,
        loading: false,
      });
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to fetch jobs',
        loading: false,
      });
    }
  },

  // ── Saved jobs ──────────────────────────────────────────────────────────────
  fetchSavedJobs: async () => {
    set({ loading: true });
    try {
      const response = await api.get('/jobs/saved');
      set({ savedJobs: response.data, loading: false });
    } catch (err) {
      set({
        error:
          err.response?.data?.message || 'Failed to fetch saved jobs',
        loading: false,
      });
    }
  },

  saveJob: async (jobId) => {
    try {
      await api.post(`/jobs/${jobId}/save`);
      get().fetchSavedJobs();
    } catch (err) {
      console.error(err);
    }
  },

  unsaveJob: async (jobId) => {
    try {
      await api.delete(`/jobs/${jobId}/save`);
      set({
        savedJobs: get().savedJobs.filter(item => item.id !== jobId),
      });
    } catch (err) {
      console.error(err);
    }
  },

  // ── Apply to a job ────────────────────────────────────────────────────────
  applyToJob: async (jobId, coverLetter) => {
    set({ loading: true, error: null });
    try {
      await api.post(`/jobs/${jobId}/apply`, { coverLetter });
      get().fetchApplications();
      set({ loading: false });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to apply';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  // ── Applications ────────────────────────────────────────────────────────
  fetchApplications: async () => {
    set({ loading: true });
    try {
      const response = await api.get('/applications');
      set({ applications: response.data, loading: false });
    } catch (err) {
      set({
        error:
          err.response?.data?.message ||
          'Failed to fetch applications',
        loading: false,
      });
    }
  },

  // ── AI‑matched jobs ────────────────────────────────────────────────────────
  fetchMatchedJobs: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/resume/matches');
      set({ matchedJobs: response.data, loading: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to fetch matches',
        loading: false,
      });
    }
  },

  // ── Profile handling ────────────────────────────────────────────────────
  fetchProfile: async () => {
    try {
      const response = await api.get('/resume/profile');
      set({ profile: response.data });
    } catch (err) {
      console.error(err);
    }
  },

  updateProfile: async (profileData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.patch('/resume/profile', profileData);
      set({ profile: response.data.profile, loading: false });
    } catch (err) {
      set({
        error:
          err.response?.data?.message || 'Failed to update profile',
        loading: false,
      });
    }
  },

  // ── Resume upload ────────────────────────────────────────────────────────
  uploadResume: async (formData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      set({ profile: response.data.profile, loading: false });
      get().fetchMatchedJobs();
      return response.data;
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Resume upload failed';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  // ── External jobs (Dual-API Fetching & Fallback) ─────────────────────────
  fetchExternalJobs: async ({ search: searchArg, location: locationArg, page = 1 } = {}) => {
    set({ loadingExternal: true, error: null });

    const apiKey = import.meta.env.VITE_RAPIDAPI_KEY;
    if (!apiKey) {
      console.warn('[SmartHire] VITE_RAPIDAPI_KEY is not set. Skipping external job fetch.');
      set({ externalJobs: [], loadingExternal: false });
      return;
    }

    const profile = get().profile;
    let query = "software developer";
    if (searchArg && searchArg.trim().length > 0) {
      query = searchArg.trim();
    } else if (profile) {
      const title = (profile.currentTitle || "").trim();
      const topSkills = (profile.extractedSkills || []).slice(0, 2).join(' ');
      const combined = `${title} ${topSkills}`.trim();
      if (combined.length > 3) query = combined;
    }
    console.log('[SmartHire] External job search query:', query, '| location:', locationArg);

    let jobs = [];
    let apiUsed = '';

    // 1. Try Active-Jobs-DB API
    try {
      console.log('[SmartHire] Attempting to fetch from Active-Jobs-DB...');
      const activeAtsUrl = `https://active-jobs-db.p.rapidapi.com/active-ats-1h?offset=0&title_filter=${encodeURIComponent('"' + query + '"')}&description_type=text`;
      const activeRes = await fetch(activeAtsUrl, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': apiKey,
          'x-rapidapi-host': 'active-jobs-db.p.rapidapi.com',
        },
      });

      const activeData = await activeRes.json();
      console.log('[SmartHire] Active-Jobs-DB raw response keys:', Object.keys(activeData));

      if (Array.isArray(activeData)) {
        jobs = activeData.map((job) => ({
          id: `ext-${job.id}`,
          title: job.title,
          company: job.organization,
          location: Array.isArray(job.locations_alt_raw) && job.locations_alt_raw.length > 0 
            ? job.locations_alt_raw[0] 
            : 'Remote',
          applyUrl: job.url,
          description: (job.description_text || '').substring(0, 200),
          employmentType: Array.isArray(job.employment_type) ? job.employment_type.join(', ') : (job.employment_type || ''),
          salary: job.salary_raw || null,
          salaryMin: null,
          salaryMax: null,
          logo: job.organization_logo || null,
          requiredSkills: [],
          matchPercentage: null,
          matchedSkills: [],
          isExternal: true,
        }));
        apiUsed = 'Active-Jobs-DB';
      } else {
        console.warn('[SmartHire] Active-Jobs-DB returned non-array response (possibly quota exceeded):', activeData);
      }
    } catch (err) {
      console.error('[SmartHire] Active-Jobs-DB fetch failed:', err);
    }

    // 2. Fallback: If jobs is empty, try JSearch
    if (jobs.length === 0) {
      try {
        console.log('[SmartHire] Falling back to JSearch...');
        const jsearchUrl = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&page=${page}&num_pages=1`;
        const jsearchRes = await fetch(jsearchUrl, {
          method: 'GET',
          headers: {
            'x-rapidapi-key': apiKey,
            'x-rapidapi-host': 'jsearch.p.rapidapi.com',
          },
        });
        const jsearchData = await jsearchRes.json();
        console.log('[SmartHire] JSearch response status:', jsearchData.status);

        const jsearchJobs = Array.isArray(jsearchData.data) ? jsearchData.data : [];
        if (jsearchJobs.length > 0) {
          jobs = jsearchJobs.map((job) => ({
            id: `ext-${job.job_id}`,
            title: job.job_title,
            company: job.employer_name,
            location: [job.job_city, job.job_state, job.job_country]
              .filter(Boolean)
              .join(', ') || 'Remote',
            applyUrl: job.job_apply_link || job.job_google_link,
            description: (job.job_description || '').substring(0, 200),
            employmentType: job.job_employment_type || '',
            salary: job.job_min_salary
              ? `$${Math.round(job.job_min_salary / 1000)}k – $${Math.round(job.job_max_salary / 1000)}k`
              : null,
            salaryMin: job.job_min_salary,
            salaryMax: job.job_max_salary,
            logo: job.employer_logo || null,
            requiredSkills: [],
            matchPercentage: null,
            matchedSkills: [],
            isExternal: true,
          }));
          apiUsed = 'JSearch';
        }
      } catch (err) {
        console.error('[SmartHire] JSearch fallback fetch failed:', err);
      }
    }

    console.log(`[SmartHire] fetchExternalJobs complete. Used API: ${apiUsed} | Total jobs loaded: ${jobs.length}`);
    set({ externalJobs: jobs.slice(0, 15), loadingExternal: false });
  },

  // ── Merged internal + external job search ─────────────────────────────
  fetchAllJobs: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const { search = '', location = '', type = '', salary_min = '', salary_max = '', page = 1, limit = 10 } = filters;

      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (location) params.append('location', location);
      if (type) params.append('type', type);
      if (salary_min) params.append('salary_min', salary_min);
      if (salary_max) params.append('salary_max', salary_max);
      params.append('page', page);
      params.append('limit', limit);

      const [internalRes, externalJobs] = await Promise.all([
        api.get(`/jobs?${params.toString()}`),
        get().fetchExternalJobs({ search, location, page }).then(() => get().externalJobs).catch(() => []),
      ]);

      const internalJobs = internalRes.data.jobs.map(j => ({ ...j, isExternal: false }));
      const merged = [...internalJobs, ...externalJobs];

      const totalPages = Math.max(
        internalRes.data.pagination?.totalPages || 1,
        Math.ceil(externalJobs.length / limit)
      );

      set({
        jobs: merged,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: (internalRes.data.pagination?.total || 0) + externalJobs.length,
          totalPages,
        },
        loading: false,
      });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch jobs', loading: false });
    }
  },
}));

