import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { sendPasswordResetEmail } from '../services/emailService.js';

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

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(6),
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

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        name: newUser.name,
      },
      accessToken,
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

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      accessToken,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: error.errors });
    }
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token is required' });
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

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  res.json({ message: 'Logged out successfully' });
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

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);
    const foundUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (foundUsers.length > 0) {
      const user = foundUsers[0];
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

      await db.update(users)
        .set({ resetToken, resetTokenExpiry })
        .where(eq(users.id, user.id));

      const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
      await sendPasswordResetEmail(user.email, user.name, resetUrl);
    }
    
    // Always return success to prevent email enumeration
    res.json({ message: 'If that email is registered, a password reset link has been sent.' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: error.errors });
    }
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = resetPasswordSchema.parse(req.body);
    
    const foundUsers = await db.select().from(users).where(eq(users.resetToken, token)).limit(1);
    if (foundUsers.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const user = foundUsers[0];
    if (new Date() > user.resetTokenExpiry) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.update(users)
      .set({ 
        passwordHash: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      })
      .where(eq(users.id, user.id));

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: error.errors });
    }
    next(error);
  }
};
