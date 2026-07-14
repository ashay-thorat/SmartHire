import { db } from '../db/index.js';
import { jobs, applications, users, candidateProfiles, resumeScores, recruiterProfiles } from '../db/schema.js';
import { eq, and, sql, gte } from 'drizzle-orm';
import { extractTextFromPdf } from '../services/pdfService.js';
import { evaluateResumeAgainstRole } from '../services/groqService.js';
import { sendStatusUpdateEmail } from '../services/emailService.js';

// CRUD Jobs
export const getMyJobs = async (req, res, next) => {
  try {
    const list = await db.select().from(jobs).where(eq(jobs.recruiterId, req.user.id));
    res.json(list);
  } catch (error) {
    next(error);
  }
};

import { jobSchema } from '../utils/validators.js';
import { z } from 'zod';

export const createJob = async (req, res, next) => {
  try {
    const validatedData = jobSchema.parse(req.body);
    const { title, company, description, requiredSkills, location, jobType, salaryMin, salaryMax, expiresAt } = validatedData;

    const [newJob] = await db.insert(jobs).values({
      recruiterId: req.user.id,
      title,
      company,
      description,
      requiredSkills,
      location,
      jobType,
      salaryMin: Number(salaryMin) || 0,
      salaryMax: Number(salaryMax) || 0,
      isActive: true,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    }).returning();

    res.status(201).json({ message: 'Job posted successfully', job: newJob });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: error.errors });
    }
    next(error);
  }
};

export const updateJob = async (req, res, next) => {
  try {
    const validatedData = jobSchema.partial().parse(req.body);
    const { title, company, description, requiredSkills, location, jobType, salaryMin, salaryMax, isActive, expiresAt } = validatedData;
    
    // Check ownership
    const foundJobs = await db.select().from(jobs).where(eq(jobs.id, req.params.id)).limit(1);
    if (foundJobs.length === 0) {
      return res.status(404).json({ message: 'Job not found' });
    }
    if (foundJobs[0].recruiterId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to modify this job' });
    }

    const [updated] = await db.update(jobs)
      .set({
        title: title !== undefined ? title : undefined,
        company: company !== undefined ? company : undefined,
        description: description !== undefined ? description : undefined,
        requiredSkills: requiredSkills !== undefined ? requiredSkills : undefined,
        location: location !== undefined ? location : undefined,
        jobType: jobType !== undefined ? jobType : undefined,
        salaryMin: salaryMin !== undefined ? Number(salaryMin) : undefined,
        salaryMax: salaryMax !== undefined ? Number(salaryMax) : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
        expiresAt: expiresAt !== undefined ? (expiresAt ? new Date(expiresAt) : null) : undefined,
      })
      .where(eq(jobs.id, req.params.id))
      .returning();

    res.json({ message: 'Job updated successfully', job: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: error.errors });
    }
    next(error);
  }
};

export const deleteJob = async (req, res, next) => {
  try {
    const jobId = req.params.id;

    // Verify ownership
    const jobQuery = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1);
    if (jobQuery.length === 0) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (jobQuery[0].recruiterId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this job' });
    }

    await db.delete(jobs).where(eq(jobs.id, jobId));
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Recruiter Profile
export const getRecruiterProfile = async (req, res, next) => {
  try {
    let [profile] = await db.select().from(recruiterProfiles).where(eq(recruiterProfiles.userId, req.user.id));
    if (!profile) {
      const [newProfile] = await db.insert(recruiterProfiles).values({ userId: req.user.id }).returning();
      profile = newProfile;
    }
    res.json(profile);
  } catch (error) {
    next(error);
  }
};

export const getCompanyProfile = async (req, res, next) => {
  try {
    const recruiterId = req.params.id;
    const [profile] = await db.select().from(recruiterProfiles).where(eq(recruiterProfiles.userId, recruiterId));
    if (!profile) {
      return res.status(404).json({ message: 'Company profile not found' });
    }
    res.json(profile);
  } catch (error) {
    next(error);
  }
};

export const getCompanyJobs = async (req, res, next) => {
  try {
    const recruiterId = req.params.id;
    const list = await db.select().from(jobs).where(and(eq(jobs.recruiterId, recruiterId), eq(jobs.isActive, true)));
    res.json(list);
  } catch (error) {
    next(error);
  }
};

export const updateRecruiterProfile = async (req, res, next) => {
  try {
    const { companyName, companyDescription, website } = req.body;
    let logoUrl = undefined;

    if (req.file) {
      logoUrl = `/uploads/${req.file.filename}`;
    }

    const updateData = {};
    if (companyName !== undefined) updateData.companyName = companyName;
    if (companyDescription !== undefined) updateData.companyDescription = companyDescription;
    if (website !== undefined) updateData.website = website;
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl;

    const [profile] = await db.select().from(recruiterProfiles).where(eq(recruiterProfiles.userId, req.user.id));

    if (!profile) {
      updateData.userId = req.user.id;
      const [newProfile] = await db.insert(recruiterProfiles).values(updateData).returning();
      return res.json({ message: 'Profile created', profile: newProfile });
    } else {
      const [updatedProfile] = await db.update(recruiterProfiles)
        .set(updateData)
        .where(eq(recruiterProfiles.userId, req.user.id))
        .returning();
      return res.json({ message: 'Profile updated', profile: updatedProfile });
    }
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
      candidateEmail: users.email,
      candidateName: users.name,
      jobTitle: jobs.title,
      companyName: jobs.company,
    })
    .from(applications)
    .innerJoin(jobs, eq(applications.jobId, jobs.id))
    .innerJoin(users, eq(applications.candidateId, users.id))
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

    // Send email notification
    const { candidateEmail, candidateName, jobTitle, companyName } = appQuery[0];
    try {
      await sendStatusUpdateEmail(candidateEmail, candidateName, jobTitle, companyName, status);
    } catch (emailErr) {
      console.error('Failed to send status update email:', emailErr);
    }

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
