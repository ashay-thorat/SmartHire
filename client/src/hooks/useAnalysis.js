import { useState, useCallback } from 'react';
import { api } from '../store/authStore';

export function useAnalysis() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const evaluateResume = useCallback(async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/recruiter/evaluate', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.score;
    } catch (err) {
      const msg = err.response?.data?.message || 'Analysis failed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const parseResume = useCallback(async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Resume parsing failed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const getMatches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/resume/matches');
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to get matches';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { evaluateResume, parseResume, getMatches, loading, error, clearError };
}