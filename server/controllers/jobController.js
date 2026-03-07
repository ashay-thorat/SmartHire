import findJobs from '../services/jobService.js'
import Analysis from '../models/Analysis.js'
import parseResume from '../services/pdfParser.js'
import Groq from 'groq-sdk'
import dotenv from 'dotenv'
dotenv.config()

const client = new Groq({ apiKey: process.env.GROQ_API_KEY })

export const getJobRecommendations = async (req, res) => {
  try {
    const { analysisId } = req.params
    const analysis = await Analysis.findOne({ _id: analysisId, user: req.user.id })
    if (!analysis) return res.status(404).json({ message: 'Analysis not found' })
    const jobs = await findJobs(analysis.missingSkills, analysis.jobTitle || 'Software Developer')
    res.json(jobs)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const searchJobs = async (req, res) => {
  try {
    const { query, skills } = req.body
    const skillsArray = skills ? skills.split(',') : []
    const jobs = await findJobs(skillsArray, query)
    res.json(jobs)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const searchByResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' })

    // Parse PDF
    const resumeText = await parseResume(req.file.buffer)

    // Ask Groq to extract profile + job title from resume
    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `Analyze this resume and return ONLY a JSON object with this structure:
{
  "name": "candidate name",
  "currentRole": "their current or most recent job title",
  "summary": "2 sentence professional summary",
  "topSkills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
  "jobTitle": "best job title to search for based on their experience"
}
Return ONLY JSON, no extra text.

Resume:
${resumeText}`
      }]
    })

    const raw = response.choices[0].message.content
    const cleaned = raw.replace(/```json|```/g, '').trim()
    const profile = JSON.parse(cleaned)

    // Find jobs based on extracted info
    const jobs = await findJobs(profile.topSkills, profile.jobTitle)

    res.json({ profile, jobs })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}