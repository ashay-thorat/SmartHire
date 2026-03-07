import express from 'express'
import { analyze } from '../controllers/analysisController.js'
import protect from '../middleware/authMiddleware.js'
import upload from '../middleware/uploadMiddleware.js'

const router = express.Router()

router.post('/', protect, upload.single('resume'), analyze)

export default router