import { db } from '../db/index.js';
import { jobs, applications, users, candidateProfiles, resumeScores } from '../db/schema.js';
import { eq, and, sql, gte } from 'drizzle-orm';
import { extractTextFromPdf } from '../services/pdfService.js';
import { evaluateResumeAgainstRole } from '../services/groqService.js';

// CRUD Jobs
export const getMyJobs = async (req, res, next) => {
  try {
    const list = await db.select().from(jobs).where(eq(jobs.recruiterId, req.user.id));
    res.json(list);
  } catch (error) {
    next(error);
  }
};

export const createJob = async (req, res, next) => {
  try {
    const { title, company, description, requiredSkills, location, jobType, salaryMin, salaryMax } = req.body;

    const skillsArray = Array.isArray(requiredSkills) 
      ? requiredSkills 
      : (requiredSkills || '').split(',').map(s => s.trim()).filter(Boolean);

    const [newJob] = await db.insert(jobs).values({
      recruiterId: req.user.id,
      title,
      company,
      description,
      requiredSkills: skillsArray,
      location,
      jobType,
      salaryMin: Number(salaryMin),
      salaryMax: Number(salaryMax),
      isActive: true,
    }).returning();

    res.status(201).json({ message: 'Job posted successfully', job: newJob });
  } catch (error) {
    next(error);
  }
};

export const updateJob = async (req, res, next) => {
  try {
    const { title, company, description, requiredSkills, location, jobType, salaryMin, salaryMax, isActive } = req.body;
    
    // Check ownership
    const foundJobs = await db.select().from(jobs).where(eq(jobs.id, req.params.id)).limit(1);
    if (foundJobs.length === 0) {
      return res.status(404).json({ message: 'Job not found' });
    }
    if (foundJobs[0].recruiterId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to modify this job' });
    }

    const skillsArray = requiredSkills 
      ? (Array.isArray(requiredSkills) ? requiredSkills : requiredSkills.split(',').map(s => s.trim()).filter(Boolean))
      : undefined;

    const [updated] = await db.update(jobs)
      .set({
        title: title !== undefined ? title : undefined,
        company: company !== undefined ? company : undefined,
        description: description !== undefined ? description : undefined,
        requiredSkills: skillsArray !== undefined ? skillsArray : undefined,
        location: location !== undefined ? location : undefined,
        jobType: jobType !== undefined ? jobType : undefined,
        salaryMin: salaryMin !== undefined ? Number(salaryMin) : undefined,
        salaryMax: salaryMax !== undefined ? Number(salaryMax) : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      })
      .where(eq(jobs.id, req.params.id))
      .returning();

    res.json({ message: 'Job updated successfully', job: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteJob = async (req, res, next) => {
  try {
    // Check ownership
    const foundJobs = await db.select().from(jobs).where(eq(jobs.id, req.params.id)).limit(1);
    if (foundJobs.length === 0) {
      return res.status(404).json({ message: 'Job not found' });
    }
    if (foundJobs[0].recruiterId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this job' });
    }

    await db.delete(jobs).where(eq(jobs.id, req.params.id));
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Job Applicants
export const getJobApplicants = async (req, res, next) => {
  try {
    const jobId = req.params.id;

    // Check ownership
    const foundJobs = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1);
    if (foundJobs.length === 0) {
      return res.status(404).json({ message: 'Job not found' });
    }
    if (foundJobs[0].recruiterId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view applicants for this job' });
    }

    const list = await db.select({
      id: applications.id,
      status: applications.status,
      coverLetter: applications.coverLetter,
      appliedAt: applications.appliedAt,
      candidate: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
      profile: candidateProfiles
    })
    .from(applications)
    .innerJoin(users, eq(applications.candidateId, users.id))
    .leftJoin(candidateProfiles, eq(users.id, candidateProfiles.userId))
    .where(eq(applications.jobId, jobId));

    res.json(list);
  } catch (error) {
    next(error);
  }
};

// AI Evaluator
export const evaluateResume = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Please upload a resume PDF file' });
  }

  try {
    const { jobRole, jobDescription, candidateName } = req.body;
    if (!jobRole || !candidateName) {
      return res.status(400).json({ message: 'Candidate name and job role are required' });
    }

    const filePath = req.file.path;
    const resumeText = await extractTextFromPdf(filePath);

    // Call Groq
    const evaluation = await evaluateResumeAgainstRole(resumeText, jobRole, jobDescription || '');

    const [scoreRecord] = await db.insert(resumeScores).values({
      recruiterId: req.user.id,
      candidateName,
      resumeUrl: `/uploads/${req.file.filename}`,
      jobRole,
      overallScore: Number(evaluation.overall_score) || 0,
      skillsScore: Number(evaluation.skills_score) || 0,
      experienceScore: Number(evaluation.experience_score) || 0,
      educationScore: Number(evaluation.education_score) || 0,
      atsScore: Number(evaluation.ats_score) || 0,
      verdict: evaluation.verdict === 'hire' ? 'hire' : 'no-hire',
      suggestions: evaluation.suggestions || [],
    }).returning();

    res.json({
      message: 'Resume evaluated successfully',
      score: scoreRecord,
    });
  } catch (error) {
    next(error);
  }
};

export const getEvaluationHistory = async (req, res, next) => {
  try {
    const list = await db.select().from(resumeScores).where(eq(resumeScores.recruiterId, req.user.id));
    res.json(list);
  } catch (error) {
    next(error);
  }
};

// Update Application Status (Kanban status change)
export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const appId = req.params.id;

    if (!['Applied', 'Reviewed', 'Shortlisted', 'Hired', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status type' });
    }

    // Verify ownership of the job
    const appQuery = await db.select({
      appId: applications.id,
      recruiterId: jobs.recruiterId,
    })
    .from(applications)
    .innerJoin(jobs, eq(applications.jobId, jobs.id))
    .where(eq(applications.id, appId))
    .limit(1);

    if (appQuery.length === 0) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (appQuery[0].recruiterId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to modify this application status' });
    }

    const [updated] = await db.update(applications)
      .set({ status })
      .where(eq(applications.id, appId))
      .returning();

    res.json({ message: 'Application status updated successfully', application: updated });
  } catch (error) {
    next(error);
  }
};

// Pipeline Kanban board data
export const getPipeline = async (req, res, next) => {
  try {
    const list = await db.select({
      id: applications.id,
      status: applications.status,
      appliedAt: applications.appliedAt,
      candidate: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
      job: {
        id: jobs.id,
        title: jobs.title,
        company: jobs.company,
      },
      profile: {
        resumeUrl: candidateProfiles.resumeUrl,
        extractedSkills: candidateProfiles.extractedSkills,
        experienceYears: candidateProfiles.experienceYears,
      }
    })
    .from(applications)
    .innerJoin(jobs, eq(applications.jobId, jobs.id))
    .innerJoin(users, eq(applications.candidateId, users.id))
    .leftJoin(candidateProfiles, eq(users.id, candidateProfiles.userId))
    .where(eq(jobs.recruiterId, req.user.id));

    res.json(list);
  } catch (error) {
    next(error);
  }
};

// Recruiter Dashboard Stats
export const getRecruiterStats = async (req, res, next) => {
  try {
    const myJobs = await db.select({ id: jobs.id }).from(jobs).where(eq(jobs.recruiterId, req.user.id));
    const jobIds = myJobs.map(j => j.id);

    let totalApplicants = 0;
    let topCandidates = 0;

    if (jobIds.length > 0) {
      const appCount = await db.select({ count: sql`count(*)` }).from(applications).where(sql`job_id IN ${jobIds}`);
      totalApplicants = Number(appCount[0]?.count) || 0;

      // Top candidates could be calculated by evaluating resume score records
      const highScores = await db.select({ count: sql`count(*)` }).from(resumeScores)
        .where(
          and(
            eq(resumeScores.recruiterId, req.user.id),
            gte(resumeScores.overallScore, 80)
          )
        );
      topCandidates = Number(highScores[0]?.count) || 0;
    }

    res.json({
      jobsPosted: myJobs.length,
      totalApplicants,
      topCandidates,
    });
  } catch (error) {
    next(error);
  }
};
