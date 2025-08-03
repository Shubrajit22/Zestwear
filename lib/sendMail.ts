import nodemailer from 'nodemailer';

export async function sendCustomiseImages(to: string, frontUrl: string, backUrl: string) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Zestware Orders" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Your Customised T-Shirt Order',
    html: `
      <p>Thank you for your order. Here are your uploaded images:</p>
      <img src="${frontUrl}" width="200" />
      <img src="${backUrl}" width="200" />
    `,
  });
}
