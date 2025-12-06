import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { ApiError } from '../middleware/error.js';
import { sendVerificationEmail } from '../services/email.js';

const router = Router();
const prisma = new PrismaClient();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const verifySchema = z.object({
  token: z.string(),
});

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { email, password } = registerSchema.parse(req.body);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ApiError('Email already registered', 400);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);
    const verificationToken = uuidv4();

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        verificationToken,
        isVerified: false
      },
      select: { id: true, email: true, createdAt: true },
    });

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // NOTE: In production, consider rolling back user creation or having a retry mechanism
    }

    res.status(201).json({
      message: 'User created successfully. Please check your email to verify your account.',
      user,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new ApiError('Invalid credentials', 401);
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new ApiError('Invalid credentials', 401);
    }

    // Check verification
    if (!user.isVerified) {
      throw new ApiError('Please verify your email address before logging in.', 403);
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/verify
router.post('/verify', async (req, res, next) => {
  try {
    const { token } = verifySchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { verificationToken: token },
    });

    if (!user) {
      throw new ApiError('Invalid or expired verification token', 400);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null
      },
    });

    res.json({ message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    next(error);
  }
});

export default router;
