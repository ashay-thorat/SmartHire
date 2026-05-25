import { create } from 'zustand';
import { api } from './authStore.js';

export const useRecruiterStore = create((set, get) => ({
  myJobs: [],
  applicants: [],
  pipeline: [],
  evalHistory: [],
  stats: null,
  latestScore: null,
  loading: false,
  error: null,

  fetchMyJobs: async () => {
    set({ loading: true });
    try {
      const response = await api.get('/recruiter/jobs');
      set({ myJobs: response.data, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch jobs', loading: false });
    }
  },

  createJob: async (jobData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/recruiter/jobs', jobData);
      set({ myJobs: [...get().myJobs, response.data.job], loading: false });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create job';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  updateJob: async (jobId, jobData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.patch(`/recruiter/jobs/${jobId}`, jobData);
      set({
        myJobs: get().myJobs.map(j => j.id === jobId ? response.data.job : j),
        loading: false
      });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update job';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  deleteJob: async (jobId) => {
    try {
      await api.delete(`/recruiter/jobs/${jobId}`);
      set({ myJobs: get().myJobs.filter(j => j.id !== jobId) });
    } catch (err) {
      console.error(err);
    }
  },

  fetchJobApplicants: async (jobId) => {
    set({ loading: true });
    try {
      const response = await api.get(`/recruiter/jobs/${jobId}/applicants`);
      set({ applicants: response.data, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch applicants', loading: false });
    }
  },

  evaluateResume: async (formData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/recruiter/evaluate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      set({ latestScore: response.data.score, loading: false });
      get().fetchEvalHistory();
      return response.data.score;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to evaluate resume';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  fetchEvalHistory: async () => {
    try {
      const response = await api.get('/recruiter/scores');
      set({ evalHistory: response.data });
    } catch (err) {
      console.error(err);
    }
  },

  updateApplicationStatus: async (appId, status) => {
    try {
      set({
        pipeline: get().pipeline.map(app => app.id === appId ? { ...app, status } : app)
      });
      await api.patch(`/applications/${appId}/status`, { status });
      get().fetchStats();
    } catch (err) {
      console.error(err);
    }
  },

  fetchPipeline: async () => {
    set({ loading: true });
    try {
      const response = await api.get('/recruiter/pipeline');
      set({ pipeline: response.data, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch pipeline', loading: false });
    }
  },

  fetchStats: async () => {
    try {
      const response = await api.get('/recruiter/stats');
      set({ stats: response.data });
    } catch (err) {
      console.error(err);
    }
  }
}));
