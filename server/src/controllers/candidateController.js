import { db } from '../db/index.js';
import { candidateProfiles, jobs } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { extractTextFromPdf } from '../services/pdfService.js';
import { parseResumeText } from '../services/groqService.js';

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

export const updateProfile = async (req, res, next) => {
  try {
    const { currentTitle, experienceYears, location, extractedSkills } = req.body;
    
    const existing = await db.select().from(candidateProfiles).where(eq(candidateProfiles.userId, req.user.id)).limit(1);
    
    const skillsArray = Array.isArray(extractedSkills) 
      ? extractedSkills 
      : (extractedSkills || '').split(',').map(s => s.trim()).filter(Boolean);

    const values = {
      currentTitle: currentTitle || '',
      experienceYears: Number(experienceYears) || 0,
      location: location || '',
      extractedSkills: skillsArray,
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
    next(error);
  }
};
