import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';
import { getNumericOrderId } from '@/lib/utils';

// ✅ Define a type for order items
type OrderItem = {
  name: string;
  quantity: number;
  price: number;
  size?: string;
  sizeId?: string | null;
  productId: string;
};

// ✅ Setup mail transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER!,
    pass: process.env.EMAIL_PASS!,
  },
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      razorpay_payment_id,
      razorpay_order_id,
      email,
      amount,
      address,
      items,
    }: {
      razorpay_payment_id: string;
      razorpay_order_id: string;
      email: string;
      amount: number;
      address: string;
      items: OrderItem[];
    } = body;

    if (!email || !razorpay_payment_id || !razorpay_order_id || !items || !address) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // ✅ Create order
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        status: 'confirmed',
        shippingAddress: address,
        totalAmount: amount,
        paymentStatus: 'paid',
        shippingStatus: 'processing',
        razorpay_order_id,
        razorpay_payment_id,
        orderItems: {
          create: items.map((item: OrderItem) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            size: item.size || '',
            sizeId: item.sizeId || null,
            productId: item.productId,
          })),
        },
      },
    });

    // ✅ Clear cart
    await prisma.cartItem.deleteMany({ where: { userId: user.id } });

    // ✅ Format email content
    const itemList = items.map((item: OrderItem) =>
      `<li>${item.name} (x${item.quantity}) - Size: ${item.size || 'N/A'} - ₹${item.price}</li>`
    ).join('');

    const mailOptionsUser = {
      from: process.env.EMAIL_USER!,
      to: email,
      subject: 'Order Confirmation - Thank you for your purchase!',
      html: `
        <p>Hi ${user.name || 'Customer'},</p>
        <p>Thank you for your order! Here are your order details:</p>
        <ul>${itemList}</ul>
        <p><strong>Total:</strong> ₹${amount}</p>
        <p><strong>Shipping Address:</strong> ${address}</p>
        <p>Your order ID is: <strong>#${getNumericOrderId(order.id)}</strong></p>
      `,
    };

    const mailOptionsBusiness = {
      from: process.env.EMAIL_USER!,
      to: process.env.BUSINESS_EMAIL!,
      subject: 'New Order Received',
      html: `
        <p>A new order has been placed by ${email}.</p>
        <ul>${itemList}</ul>
        <p><strong>Total:</strong> ₹${amount}</p>
        <p><strong>Shipping Address:</strong> ${address}</p>
        <p>Order ID: <strong>${order.id}</strong></p>
      `,
    };

    // ✅ Send emails
    await transporter.sendMail(mailOptionsUser);
    await transporter.sendMail(mailOptionsBusiness);

    return NextResponse.json({ message: 'Order placed successfully', order });
  } catch (error: unknown) {
    console.error('ORDER ERROR:', error);
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { message: 'Internal Server Error', error: errMsg },
      { status: 500 }
    );
  }
}
