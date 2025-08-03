import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

const otpStore: { [email: string]: string } = {}; // In-memory; swap to a persistent store in prod
const otpExpiry: { [email: string]: number } = {};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// STEP 1: Send OTP
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    // Check user exists before sending OTP
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Optionally: respond with same message to avoid enumeration
      return NextResponse.json({ message: 'If that account exists, an OTP was sent' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = otp;
    otpExpiry[email] = Date.now() + 5 * 60 * 1000; // 5 minutes

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP for password reset',
      text: `Your OTP is: ${otp}`,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: 'If that account exists, an OTP was sent' });
  } catch (error) {
    console.error('OTP sending error:', error);
    return NextResponse.json({ message: 'Error sending OTP' }, { status: 500 });
  }
}

// STEP 2: Verify OTP and reset password
export async function PUT(req: NextRequest) {
  try {
    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    const storedOtp = otpStore[email];
    const expiry = otpExpiry[email];

    if (!storedOtp || !expiry || Date.now() > expiry) {
      return NextResponse.json({ message: 'OTP expired or invalid' }, { status: 400 });
    }

    if (storedOtp !== otp) {
      return NextResponse.json({ message: 'Invalid OTP' }, { status: 400 });
    }

    // Ensure user exists
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    // Cleanup
    delete otpStore[email];
    delete otpExpiry[email];

    return NextResponse.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
