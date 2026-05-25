import { db } from '../db/index.js';
import { resumeScores } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export const getHistory = async (req, res, next) => {
  try {
    const history = await db.select().from(resumeScores).where(eq(resumeScores.recruiterId, req.user.id));

    const mapped = history.map(item => ({
      _id: item.id,
      jobTitle: item.jobRole,
      resumeName: item.candidateName,
      matchScore: item.overallScore,
      missingSkills: [],
      createdAt: item.scoredAt,
    }));

    res.json(mapped);
  } catch (error) {
    next(error);
  }
};
