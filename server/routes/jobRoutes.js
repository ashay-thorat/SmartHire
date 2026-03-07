import express from 'express'
import { getJobRecommendations, searchJobs, searchByResume } from '../controllers/jobController.js'
import protect from '../middleware/authMiddleware.js'
import upload from '../middleware/uploadMiddleware.js'

const router = express.Router()

router.get('/recommendations/:analysisId', protect, getJobRecommendations)
router.post('/search', protect, searchJobs)
router.post('/search-by-resume', protect, upload.single('resume'), searchByResume)

export default router