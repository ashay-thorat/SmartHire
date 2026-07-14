import { db } from '../db/index.js';
import { jobs, applications, savedJobs, users } from '../db/schema.js';
import { eq, and, or, ilike, gte, lte, gt, sql, isNull } from 'drizzle-orm';

export const getJobs = async (req, res, next) => {
  try {
    const { search, location, type, salary_min, salary_max, page, limit, recruiterId } = req.query;

    const whereClause = [];
    whereClause.push(eq(jobs.isActive, true));
    
    // Filter out expired jobs
    whereClause.push(
      or(
        isNull(jobs.expiresAt),
        gt(jobs.expiresAt, new Date())
      )
    );

    if (search) {
      whereClause.push(
        or(
          ilike(jobs.title, `%${search}%`),
          ilike(jobs.description, `%${search}%`),
          ilike(jobs.company, `%${search}%`)
        )
      );
    }
    if (location) {
      whereClause.push(ilike(jobs.location, `%${location}%`));
    }
    if (type) {
      whereClause.push(eq(jobs.jobType, type));
    }
    if (recruiterId) {
      whereClause.push(eq(jobs.recruiterId, recruiterId));
    }
    if (salary_min) {
      whereClause.push(gte(jobs.salaryMin, Number(salary_min)));
    }
    if (salary_max) {
      whereClause.push(lte(jobs.salaryMax, Number(salary_max)));
    }

    const finalWhere = and(...whereClause);
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const offset = (pageNum - 1) * limitNum;

    const list = await db.select()
      .from(jobs)
      .where(finalWhere)
      .limit(limitNum)
      .offset(offset);

    const totalResult = await db.select({ count: sql`count(*)` }).from(jobs).where(finalWhere);
    const total = Number(totalResult[0]?.count) || 0;

    res.json({
      jobs: list,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getJobById = async (req, res, next) => {
  try {
    const foundJobs = await db.select().from(jobs).where(eq(jobs.id, req.params.id)).limit(1);
    if (foundJobs.length === 0) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(foundJobs[0]);
  } catch (error) {
    next(error);
  }
};

export const applyToJob = async (req, res, next) => {
  try {
    const { coverLetter } = req.body;
    const jobId = req.params.id;

    // Check if job exists
    const foundJobs = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1);
    if (foundJobs.length === 0) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if already applied
    const existing = await db.select().from(applications)
      .where(
        and(
          eq(applications.candidateId, req.user.id),
          eq(applications.jobId, jobId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return res.status(400).json({ message: 'You have already applied to this job' });
    }

    const [app] = await db.insert(applications).values({
      candidateId: req.user.id,
      jobId,
      coverLetter,
      status: 'Applied',
    }).returning();

    res.status(201).json({ message: 'Application submitted successfully', application: app });
  } catch (error) {
    next(error);
  }
};

export const getMyApplications = async (req, res, next) => {
  try {
    const myApps = await db.select({
      id: applications.id,
      status: applications.status,
      appliedAt: applications.appliedAt,
      coverLetter: applications.coverLetter,
      job: {
        id: jobs.id,
        title: jobs.title,
        company: jobs.company,
        location: jobs.location,
        jobType: jobs.jobType,
        salaryMin: jobs.salaryMin,
        salaryMax: jobs.salaryMax,
        recruiterId: jobs.recruiterId,
      }
    })
    .from(applications)
    .innerJoin(jobs, eq(applications.jobId, jobs.id))
    .where(eq(applications.candidateId, req.user.id));

    res.json(myApps);
  } catch (error) {
    next(error);
  }
};

export const withdrawApplication = async (req, res, next) => {
  try {
    const applicationId = req.params.id;
    // Ensure the application belongs to the current user
    const [existingApp] = await db.select().from(applications)
      .where(and(eq(applications.id, applicationId), eq(applications.candidateId, req.user.id)))
      .limit(1);

    if (!existingApp) {
      return res.status(404).json({ message: 'Application not found or unauthorized' });
    }

    await db.delete(applications).where(eq(applications.id, applicationId));

    res.json({ message: 'Application withdrawn successfully' });
  } catch (error) {
    next(error);
  }
};

export const saveJob = async (req, res, next) => {
  try {
    const jobId = req.params.id;
    // Check if saved
    const existing = await db.select().from(savedJobs)
      .where(
        and(
          eq(savedJobs.candidateId, req.user.id),
          eq(savedJobs.jobId, jobId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Job already saved' });
    }

    await db.insert(savedJobs).values({
      candidateId: req.user.id,
      jobId,
    });

    res.json({ message: 'Job saved successfully' });
  } catch (error) {
    next(error);
  }
};

export const unsaveJob = async (req, res, next) => {
  try {
    const jobId = req.params.id;
    await db.delete(savedJobs)
      .where(
        and(
          eq(savedJobs.candidateId, req.user.id),
          eq(savedJobs.jobId, jobId)
        )
      );

    res.json({ message: 'Job unsaved successfully' });
  } catch (error) {
    next(error);
  }
};

export const getSavedJobs = async (req, res, next) => {
  try {
    const list = await db.select({
      job: jobs,
      savedAt: savedJobs.savedAt
    })
    .from(savedJobs)
    .innerJoin(jobs, eq(savedJobs.jobId, jobs.id))
    .where(eq(savedJobs.candidateId, req.user.id));

    res.json(list);
  } catch (error) {
    next(error);
  }
};
