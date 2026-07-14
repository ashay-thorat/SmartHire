import { db } from '../db/index.js';
import { users, jobs, applications, resumeScores } from '../db/schema.js';
import { eq, sql } from 'drizzle-orm';

export const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const allUsers = await db.select().from(users).limit(limit).offset(offset);
    const [totalCount] = await db.select({ count: sql`count(*)` }).from(users);

    res.json({
      users: allUsers,
      total: Number(totalCount?.count) || 0,
      page,
      limit,
      totalPages: Math.ceil((Number(totalCount?.count) || 0) / limit)
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['candidate', 'recruiter', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be candidate, recruiter, or admin' });
    }

    const [updated] = await db.update(users)
      .set({ role })
      .where(eq(users.id, req.params.id))
      .returning();

    if (!updated) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User role updated successfully', role: updated.role });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const [deleted] = await db.delete(users)
      .where(eq(users.id, req.params.id))
      .returning();

    if (!deleted) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getAdminStats = async (req, res, next) => {
  try {
    const [totalUsersRes] = await db.select({ count: sql`count(*)` }).from(users);
    const [candidatesRes] = await db.select({ count: sql`count(*)` }).from(users).where(eq(users.role, 'candidate'));
    const [recruitersRes] = await db.select({ count: sql`count(*)` }).from(users).where(eq(users.role, 'recruiter'));
    const [adminsRes] = await db.select({ count: sql`count(*)` }).from(users).where(eq(users.role, 'admin'));

    const [jobsCountResult] = await db.select({ count: sql`count(*)` }).from(jobs);
    const [appsCountResult] = await db.select({ count: sql`count(*)` }).from(applications);
    const [evalsCountResult] = await db.select({ count: sql`count(*)` }).from(resumeScores);

    res.json({
      totalUsers: Number(totalUsersRes?.count) || 0,
      candidates: Number(candidatesRes?.count) || 0,
      recruiters: Number(recruitersRes?.count) || 0,
      admins: Number(adminsRes?.count) || 0,
      totalJobs: Number(jobsCountResult?.count) || 0,
      totalApplications: Number(appsCountResult?.count) || 0,
      totalEvaluations: Number(evalsCountResult?.count) || 0,
    });
  } catch (error) {
    next(error);
  }
};
