import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export const getAllUsers = async (req, res, next) => {
  try {
    const allUsers = await db.select().from(users);
    res.json(allUsers);
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
    const allUsers = await db.select().from(users);
    const candidates = allUsers.filter(u => u.role === 'candidate').length;
    const recruiters = allUsers.filter(u => u.role === 'recruiter').length;
    const admins = allUsers.filter(u => u.role === 'admin').length;

    res.json({
      totalUsers: allUsers.length,
      candidates,
      recruiters,
      admins,
    });
  } catch (error) {
    next(error);
  }
};
