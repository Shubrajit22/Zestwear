import { NextRequest, NextResponse } from 'next/server';
import { createTransport } from 'nodemailer';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email || !session.user?.name) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const address = formData.get('address') as string;
  const quantity = formData.get('quantity') as string;
  const frontImage = formData.get('frontImage') as File;
  const backImage = formData.get('backImage') as File;

  const userEmail = session.user.email;
  const userName = session.user.name;
  const userMobile = session.user.mobile || 'N/A';

  const frontImageBuffer = Buffer.from(await frontImage.arrayBuffer());
  const backImageBuffer = Buffer.from(await backImage.arrayBuffer());

  const transporter = createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER!,
      pass: process.env.EMAIL_PASS!,
    },
  });

  const businessMail = {
    from: process.env.EMAIL_USER!,
    to: process.env.BUSINESS_EMAIL!,
    subject: `New Custom T-Shirt Order from ${userName}`,
    html: `
      <h2>New T-Shirt Order Received</h2>
      <p><strong>Name:</strong> ${userName}</p>
      <p><strong>Email:</strong> ${userEmail}</p>
      <p><strong>Mobile:</strong> ${userMobile}</p>
      <p><strong>Address:</strong> ${address}</p>
      <p><strong>Quantity:</strong> ${quantity}</p>
    `,
    attachments: [
      { filename: 'front.jpg', content: frontImageBuffer },
      { filename: 'back.jpg', content: backImageBuffer },
    ],
  };

  const userMail = {
    from: process.env.EMAIL_USER!,
    to: userEmail,
    subject: 'Your Order Has Been Received',
    html: `
      <h3>Hi ${userName},</h3>
      <p>We’ve received your custom T-shirt order for <strong>${quantity}</strong> unit(s).</p>
      <p>We’ll contact you soon for further processing.</p>
      <p>Thank you for shopping with us!</p>
    `,
  };

  try {
    await transporter.sendMail(businessMail);
    await transporter.sendMail(userMail);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email sending failed:', error);
    return NextResponse.json({ error: 'Failed to send emails' }, { status: 500 });
  }
}
