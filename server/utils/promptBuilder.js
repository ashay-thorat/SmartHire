const buildPrompt = (resumeText, jobDescription) => {
  return `You are an expert resume analyzer. Analyze the resume against the job description below.

Return ONLY a valid JSON object with this exact structure:
{
  "matchScore": <number 0-100>,
  "jobTitle": "<extract job title from job description>",
  "missingSkills": ["skill1", "skill2", ...],
  "suggestions": ["suggestion1", "suggestion2", ...]
}

Rules:
- matchScore: how well the resume matches the job (0-100)
- missingSkills: skills mentioned in job description but missing from resume (max 6)
- suggestions: specific actionable improvements for this resume (max 4)
- Return ONLY the JSON, no extra text

Resume:
${resumeText}

Job Description:
${jobDescription}`
}

export default buildPrompt