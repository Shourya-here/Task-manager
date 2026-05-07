import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';
import env from '../config/env.js';
import { AppError } from '../middleware/errorHandler.js';
import { sendOTPEmail } from './email.service.js';

const generateToken = (userId) => {
  return jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: '7d' });
};

export const signup = async ({ name, email, password, role }) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError('Email already registered', 409);
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  const user = await prisma.user.create({
    data: { 
      name, 
      email, 
      password: hashedPassword, 
      role: role || 'MEMBER',
      isVerified: false,
      otp,
      otpExpiresAt,
    },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  // Send OTP email
  await sendOTPEmail(user.email, user.name, otp);

  return { 
    user, 
    message: 'Verification code sent to your email. Please verify to continue.' 
  };
};

export const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.isVerified) {
    throw new AppError('Please verify your email to continue.', 403);
  }

  const token = generateToken(user.id);
  const { password: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
};

export const getMe = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return user;
};

export const verifyOTP = async ({ email, otp }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.isVerified) {
    throw new AppError('User is already verified', 400);
  }

  if (user.otp !== otp) {
    throw new AppError('Invalid OTP', 400);
  }

  if (!user.otpExpiresAt || new Date() > user.otpExpiresAt) {
    throw new AppError('OTP has expired. Please request a new one.', 400);
  }

    const updatedUser = await prisma.user.update({
    where: { email },
    data: {
      isVerified: true,
      otp: null,
      otpExpiresAt: null,
    },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  const token = generateToken(updatedUser.id);
  return { user: updatedUser, token };
};
