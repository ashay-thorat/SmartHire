import { Router } from 'express';
import { register, login, refresh, getMe } from '../controllers/authController.js';
import { uploadResume, getMatches, getProfile, updateProfile } from '../controllers/candidateController.js';
import { getJobs, getJobById, applyToJob, getMyApplications, saveJob, unsaveJob, getSavedJobs } from '../controllers/jobController.js';
import {
  getMyJobs,
  createJob,
  updateJob,
  deleteJob,
  getJobApplicants,
  evaluateResume,
  getEvaluationHistory,
  updateApplicationStatus,
  getPipeline,
  getRecruiterStats,
} from '../controllers/recruiterController.js';
import { getAllUsers, updateUserRole, deleteUser, getAdminStats } from '../controllers/adminController.js';
import { getHistory } from '../controllers/historyController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/upload.js';

const router = Router();

// ==========================================
// AUTH ROUTES
// ==========================================
router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/refresh', refresh);
router.get('/auth/me', protect, getMe);

// ==========================================
// CANDIDATE ROUTES (Protected, role = candidate)
// ==========================================
router.post('/resume/upload', protect, authorize('candidate'), upload.single('resume'), uploadResume);
router.get('/resume/matches', protect, authorize('candidate'), getMatches);
router.get('/resume/profile', protect, authorize('candidate'), getProfile);
router.patch('/resume/profile', protect, authorize('candidate'), updateProfile);

router.get('/jobs', protect, authorize('candidate'), getJobs);
router.get('/jobs/saved', protect, authorize('candidate'), getSavedJobs);
router.get('/jobs/:id', protect, authorize('candidate'), getJobById);
router.post('/jobs/:id/apply', protect, authorize('candidate'), applyToJob);
router.get('/applications', protect, authorize('candidate'), getMyApplications);
router.post('/jobs/:id/save', protect, authorize('candidate'), saveJob);
router.delete('/jobs/:id/save', protect, authorize('candidate'), unsaveJob);

// ==========================================
// RECRUITER ROUTES (Protected, role = recruiter)
// ==========================================
router.get('/recruiter/jobs', protect, authorize('recruiter'), getMyJobs);
router.post('/recruiter/jobs', protect, authorize('recruiter'), createJob);
router.patch('/recruiter/jobs/:id', protect, authorize('recruiter'), updateJob);
router.delete('/recruiter/jobs/:id', protect, authorize('recruiter'), deleteJob);

router.get('/recruiter/jobs/:id/applicants', protect, authorize('recruiter'), getJobApplicants);
router.post('/recruiter/evaluate', protect, authorize('recruiter'), upload.single('resume'), evaluateResume);
router.get('/recruiter/scores', protect, authorize('recruiter'), getEvaluationHistory);
router.get('/recruiter/pipeline', protect, authorize('recruiter'), getPipeline);
router.get('/recruiter/stats', protect, authorize('recruiter'), getRecruiterStats);

// Shared route for application status modification
router.patch('/applications/:id/status', protect, authorize('recruiter'), updateApplicationStatus);

// ==========================================
// ADMIN ROUTES (Protected, role = admin)
// ==========================================
router.get('/admin/users', protect, authorize('admin'), getAllUsers);
router.put('/admin/users/:id/role', protect, authorize('admin'), updateUserRole);
router.delete('/admin/users/:id', protect, authorize('admin'), deleteUser);
router.get('/admin/stats', protect, authorize('admin'), getAdminStats);

// ==========================================
// HISTORY ROUTES (Protected)
// ==========================================
router.get('/history', protect, getHistory);

export default router;
