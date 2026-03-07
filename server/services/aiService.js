import Groq from 'groq-sdk'
import buildPrompt from '../utils/promptBuilder.js'
import dotenv from 'dotenv'
dotenv.config()

const client = new Groq({ apiKey: process.env.GROQ_API_KEY })

const analyzeResume = async (resumeText, jobDescription) => {
  const prompt = buildPrompt(resumeText, jobDescription)

  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = response.choices[0].message.content
  const cleaned = raw.replace(/```json|```/g, '').trim()
  return JSON.parse(cleaned)
}

export default analyzeResume