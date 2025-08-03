// app/api/contact/route.ts
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  const { firstName, lastName, email, mobile, message } = await req.json();

  if (!email || !message) {
    return NextResponse.json({ success: false, error: 'Email and message are required.' }, { status: 400 });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER, // Sends to your own email
    subject: `Contact Form Submission from ${firstName} ${lastName}`,
    text: `
      Name: ${firstName} ${lastName}
      Email: ${email}
      Mobile: ${mobile}
      Message: ${message}
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Nodemailer error:', error.message);
    } else {
      console.error('Nodemailer error:', error);
    }
    return NextResponse.json({ success: false, error: 'Email sending failed.' }, { status: 500 });
  }
}
