import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['candidate', 'recruiter']),
  name: z.string().min(2),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

export const register = async (req, res, next) => {
  try {
    const validated = registerSchema.parse(req.body);
    
    const existing = await db.select().from(users).where(eq(users.email, validated.email)).limit(1);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(validated.password, 10);
    
    const [newUser] = await db.insert(users).values({
      email: validated.email,
      passwordHash: hashedPassword,
      role: validated.role,
      name: validated.name,
    }).returning();

    const accessToken = generateAccessToken(newUser.id);
    const refreshToken = generateRefreshToken(newUser.id);

    res.status(201).json({
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        name: newUser.name,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: error.errors });
    }
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const validated = loginSchema.parse(req.body);
    
    const foundUsers = await db.select().from(users).where(eq(users.email, validated.email)).limit(1);
    if (foundUsers.length === 0) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const user = foundUsers[0];
    const passwordMatch = await bcrypt.compare(validated.password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: error.errors });
    }
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token is required' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    const foundUsers = await db.select().from(users).where(eq(users.id, decoded.id)).limit(1);
    if (foundUsers.length === 0) {
      return res.status(401).json({ message: 'Invalid token, user not found' });
    }

    const newAccessToken = generateAccessToken(foundUsers[0].id);
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
};

export const googleLogin = async (req, res, next) => {
  try {
    const { idToken, role } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: 'ID token is required' });
    }

    let admin;
    try {
      admin = (await import('../config/firebaseAdmin.js')).default;
    } catch {
      return res.status(500).json({ message: 'Firebase Admin not configured' });
    }

    let decoded;
    try {
      decoded = await admin.auth().verifyIdToken(idToken);
    } catch {
      return res.status(401).json({ message: 'Invalid Firebase token' });
    }

    const { email, name, picture } = decoded;

    let foundUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);

    let user;
    if (foundUsers.length === 0) {
      if (!role || !['candidate', 'recruiter'].includes(role)) {
        return res.status(400).json({ message: 'Role is required for new accounts' });
      }
      [user] = await db.insert(users).values({
        email,
        passwordHash: 'google-oauth',
        role,
        name: name || email.split('@')[0],
        avatarUrl: picture || null,
      }).returning();
    } else {
      user = foundUsers[0];
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res) => {
  res.json({
    id: req.user.id,
    email: req.user.email,
    role: req.user.role,
    name: req.user.name,
    avatarUrl: req.user.avatarUrl,
  });
};
