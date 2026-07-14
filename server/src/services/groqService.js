import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.GROQ_API_KEY) {
  console.warn('Warning: GROQ_API_KEY is not defined in environment variables.');
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const extractJson = (text) => {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    return text.substring(start, end + 1);
  }
  return text;
};

export const parseResumeText = async (resumeText) => {
  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are a professional recruiting assistant. Your task is to extract details from the provided resume text and return ONLY a valid JSON object. Do not include markdown code block syntax (like ```json ... ```) or any additional explanation. Just the raw JSON object.'
        },
        {
          role: 'user',
          content: `Extract from this resume: full_name, email, skills (array of lowercase text), experience_years (number), current_title, education_level.
          Return ONLY valid JSON in this format:
          {
            "full_name": "Name",
            "email": "email@example.com",
            "skills": ["react", "node", "javascript"],
            "experience_years": 5,
            "current_title": "Software Engineer",
            "education_level": "Bachelor's Degree"
          }

          Resume Text:
          ${resumeText}`
        }
      ]
    });

    const content = response.choices[0]?.message?.content || '{}';
    const jsonStr = extractJson(content);
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Groq Parse Resume Error:', error);
    throw new Error('AI resume parsing failed');
  }
};

export const evaluateResumeAgainstRole = async (resumeText, jobRole, jobDescription = '') => {
  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are an expert HR recruitment auditor. You evaluate resumes against specific job roles/descriptions. Your task is to analyze the details and return ONLY a valid JSON object. Do not include markdown code block syntax or additional explanation.'
        },
        {
          role: 'user',
          content: `Evaluate this resume for the role: ${jobRole}.
          Optional Job Description details: ${jobDescription}

          Score each section 0-100: skills_score, experience_score, education_score, ats_score.
          Calculate overall_score as the weighted average of these four.
          Give a clear verdict: "hire" or "no-hire".
          List 3-5 suggestions for improvements or interview questions.

          Return ONLY valid JSON in this format:
          {
            "overall_score": 85,
            "skills_score": 90,
            "experience_score": 80,
            "education_score": 85,
            "ats_score": 85,
            "verdict": "hire",
            "suggestions": ["Add React Router v6 experience", "Prepare to explain past PostgreSQL scaling efforts", "List DM Sans or Sora typographies knowledge"]
          }

          Resume Text:
          ${resumeText}`
        }
      ]
    });

    const content = response.choices[0]?.message?.content || '{}';
    const jsonStr = extractJson(content);
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Groq Evaluate Resume Error:', error);
    throw new Error('AI resume evaluation failed');
  }
};

export const generateCoverLetter = async (resumeText, jobDescription) => {
  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are an expert career coach and copywriter. Your task is to write a highly professional, engaging, and tailored cover letter for a candidate applying to a job. Use the candidate\'s resume and the job description to match their skills and experience with the role\'s requirements. Do not include markdown code block syntax. Return only the raw text of the cover letter.'
        },
        {
          role: 'user',
          content: `Write a cover letter based on the following.
          
          Job Description:
          ${jobDescription}

          Candidate's Resume:
          ${resumeText}
          `
        }
      ]
    });

    return response.choices[0]?.message?.content || 'Error generating cover letter.';
  } catch (error) {
    console.error('Groq Cover Letter Error:', error);
    throw new Error('AI cover letter generation failed');
  }
};
