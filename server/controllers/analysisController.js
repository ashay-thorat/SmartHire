import parseResume from '../services/pdfParser.js'
import analyzeResume from '../services/aiService.js'
import Analysis from '../models/Analysis.js'

export const analyze = async (req, res) => {
  try {
    const { jobDescription } = req.body
    if (!req.file) return res.status(400).json({ message: 'No PDF uploaded' })
    if (!jobDescription) return res.status(400).json({ message: 'Job description required' })

    // Parse PDF
    const resumeText = await parseResume(req.file.buffer)

    // Call AI
    const result = await analyzeResume(resumeText, jobDescription)

    // Save to DB
    const analysis = await Analysis.create({
      user: req.user.id,
      resumeName: req.file.originalname,
      jobTitle: result.jobTitle,
      matchScore: result.matchScore,
      missingSkills: result.missingSkills,
      suggestions: result.suggestions,
    })

    res.status(201).json(analysis)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}