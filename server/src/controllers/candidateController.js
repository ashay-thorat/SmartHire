import { db } from '../db/index.js';
import { candidateProfiles, jobs } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { extractTextFromPdf } from '../services/pdfService.js';
import { parseResumeText } from '../services/groqService.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const downloadResume = async (req, res, next) => {
  try {
    const { filename } = req.params;
    
    if (req.user.role === 'candidate') {
      const existing = await db.select().from(candidateProfiles).where(eq(candidateProfiles.userId, req.user.id)).limit(1);
      if (existing.length === 0 || existing[0].resumeUrl !== `/uploads/${filename}`) {
        return res.status(403).json({ message: 'Forbidden: You can only view your own resume.' });
      }
    }
    
    const filePath = path.join(__dirname, '../../uploads', filename);
    
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ message: 'File not found' });
    }
  } catch (error) {
    next(error);
  }
};

export const uploadResume = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No resume file uploaded' });
  }

  try {
    const filePath = req.file.path;
    const resumeText = await extractTextFromPdf(filePath);
    
    const parsedData = await parseResumeText(resumeText);
    
    const existing = await db.select().from(candidateProfiles).where(eq(candidateProfiles.userId, req.user.id)).limit(1);
    
    const values = {
      userId: req.user.id,
      resumeUrl: `/uploads/${req.file.filename}`,
      resumeText: resumeText,
      extractedSkills: parsedData.skills || [],
      experienceYears: Number(parsedData.experience_years) || 0,
      currentTitle: parsedData.current_title || '',
      location: parsedData.location || '',
    };

    let profile;
    if (existing.length > 0) {
      const [updated] = await db.update(candidateProfiles)
        .set(values)
        .where(eq(candidateProfiles.userId, req.user.id))
        .returning();
      profile = updated;
    } else {
      const [inserted] = await db.insert(candidateProfiles)
        .values(values)
        .returning();
      profile = inserted;
    }

    res.json({
      message: 'Resume uploaded and parsed successfully',
      profile,
      parsedData,
    });
  } catch (error) {
    next(error);
  }
};

export const getMatches = async (req, res, next) => {
  try {
    const profileResult = await db.select().from(candidateProfiles).where(eq(candidateProfiles.userId, req.user.id)).limit(1);
    if (profileResult.length === 0 || !profileResult[0].extractedSkills) {
      return res.status(400).json({ message: 'Please upload your resume to see AI matched jobs.' });
    }

    const candidateSkills = (profileResult[0].extractedSkills || []).map(s => s.toLowerCase());
    const activeJobs = await db.select().from(jobs).where(eq(jobs.isActive, true));

    const matches = activeJobs.map(job => {
      const required = (job.requiredSkills || []).map(s => s.toLowerCase());
      const overlap = required.filter(skill => candidateSkills.includes(skill));
      const percentage = required.length > 0 
        ? Math.round((overlap.length / required.length) * 100) 
        : 0;

      return {
        ...job,
        matchPercentage: percentage,
        matchedSkills: overlap,
      };
    })
    .filter(j => j.matchPercentage > 0)
    .sort((a, b) => b.matchPercentage - a.matchPercentage)
    // Increase the number of matches returned to provide a richer set of recommendations.
    // Previously limited to 10; now returning up to 20 matches.
    .slice(0, 20);

    res.json(matches);
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const profile = await db.select().from(candidateProfiles).where(eq(candidateProfiles.userId, req.user.id)).limit(1);
    res.json(profile[0] || null);
  } catch (error) {
    next(error);
  }
};

import { profileUpdateSchema } from '../utils/validators.js';
import { z } from 'zod';

export const updateProfile = async (req, res, next) => {
  try {
    const validatedData = profileUpdateSchema.parse(req.body);
    const { currentTitle, experienceYears, location, extractedSkills } = validatedData;
    
    const existing = await db.select().from(candidateProfiles).where(eq(candidateProfiles.userId, req.user.id)).limit(1);

    const values = {
      currentTitle: currentTitle || '',
      experienceYears: experienceYears || 0,
      location: location || '',
      extractedSkills: extractedSkills || [],
    };

    let profile;
    if (existing.length > 0) {
      const [updated] = await db.update(candidateProfiles)
        .set(values)
        .where(eq(candidateProfiles.userId, req.user.id))
        .returning();
      profile = updated;
    } else {
      const [inserted] = await db.insert(candidateProfiles)
        .values({
          userId: req.user.id,
          ...values
        })
        .returning();
      profile = inserted;
    }

    res.json({ message: 'Profile updated successfully', profile });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: error.errors });
    }
    next(error);
  }
};

import { generateCoverLetter as groqGenerateCoverLetter } from '../services/groqService.js';

export const generateCoverLetter = async (req, res, next) => {
  try {
    const { jobId } = req.body;
    if (!jobId) {
      return res.status(400).json({ message: 'Job ID is required' });
    }

    // Get candidate profile
    const profile = await db.select().from(candidateProfiles).where(eq(candidateProfiles.userId, req.user.id)).limit(1);
    if (profile.length === 0 || !profile[0].resumeText) {
      return res.status(400).json({ message: 'Please upload a resume first' });
    }

    // Get job description
    const jobResult = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1);
    if (jobResult.length === 0) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const jobDesc = `${jobResult[0].title} at ${jobResult[0].company}\n${jobResult[0].description}\nSkills required: ${jobResult[0].requiredSkills?.join(', ')}`;
    
    const coverLetter = await groqGenerateCoverLetter(profile[0].resumeText, jobDesc);

    res.json({ coverLetter });
  } catch (error) {
    next(error);
  }
};
