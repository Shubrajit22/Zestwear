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
  from: `"Zestwear India" <${process.env.EMAIL_USER!}>`,
  to: email,
  subject: "Order Confirmation — Thank you for your purchase!",
  html: `
  <div style="font-family: system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif; max-width:600px; margin:0 auto; padding:16px; color:#1f2d3a;">
    <div style="text-align:center; padding-bottom:16px; border-bottom:1px solid #e2e8f0;">
      <h1 style="margin:0; font-size:24px; color:#111;">Thank you for your order!</h1>
      <p style="margin:4px 0 0; font-size:14px; color:#6b7280;">Order confirmation for <strong>#${getNumericOrderId(order.id)}</strong></p>
    </div>

    <section style="margin-top:24px;">
      <p style="margin:0 0 8px; font-size:16px;">Hi ${user.name || "Customer"},</p>
      <p style="margin:0 0 16px; font-size:14px; line-height:1.4;">
        Thanks for shopping with us. We’re excited to let you know that we’ve received your order and it's now being processed. Below are the details:
      </p>
    </section>

    <section style="margin-top:8px;">
      <h2 style="font-size:18px; margin-bottom:8px; color:#111;">Order Summary</h2>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse; margin-bottom:16px;">
        <thead>
          <tr>
            <th align="left" style="padding:8px; border-bottom:1px solid #e2e8f0; font-weight:600;">Item</th>
            <th align="center" style="padding:8px; border-bottom:1px solid #e2e8f0; font-weight:600;">Qty</th>
            <th align="right" style="padding:8px; border-bottom:1px solid #e2e8f0; font-weight:600;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${items
            .map(
              (item: OrderItem) => `
            <tr>
              <td style="padding:8px; border-bottom:1px solid #f1f5f9;">
                ${item.name} ${item.size ? `(${item.size})` : ""}
              </td>
              <td align="center" style="padding:8px; border-bottom:1px solid #f1f5f9;">
                ${item.quantity}
              </td>
              <td align="right" style="padding:8px; border-bottom:1px solid #f1f5f9;">
                ₹${item.price.toLocaleString("en-IN")}
              </td>
            </tr>`
            )
            .join("")}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" align="right" style="padding:8px; font-weight:600; border-top:1px solid #e2e8f0;">Total</td>
            <td align="right" style="padding:8px; font-weight:600; border-top:1px solid #e2e8f0;">
              ₹${amount.toLocaleString("en-IN")}
            </td>
          </tr>
        </tfoot>
      </table>

      <div style="display:flex; flex-wrap:wrap; gap:16px; margin-bottom:24px;">
        <div style="flex:1; min-width:200px;">
          <p style="margin:0 0 4px; font-size:14px; font-weight:600;">Shipping Address</p>
          <p style="margin:0; font-size:14px; line-height:1.4;">
            ${address}
          </p>
        </div>
        <div style="flex:1; min-width:200px;">
          <p style="margin:0 0 4px; font-size:14px; font-weight:600;">Order ID</p>
          <p style="margin:0; font-size:14px;">
            <strong>#${getNumericOrderId(order.id)}</strong>
          </p>
        </div>
      </div>

      <p style="margin:0 0 16px; font-size:14px;">
        If you have any questions or need assistance, reply to this email or contact our support team at <a href="mailto:zestwearindia.info@gmail.com" style="color:#2563eb; text-decoration:none;">support@yourdomain.com</a>.
      </p>
    </section>

    <div style="padding:16px; background:#f9f9fb; border-radius:8px; margin-top:16px; font-size:12px; color:#6b7280;">
      <p style="margin:0;">
        <strong>Note:</strong> This is an automated confirmation. Please retain this email for your records.
      </p>
    </div>

    <footer style="margin-top:32px; text-align:center; font-size:12px; color:#9ca3af;">
      <p style="margin:4px 0;">© ${new Date().getFullYear()} Your Brand Name. All rights reserved.</p>
      <p style="margin:4px 0;">123 Business St, City, State ZIP</p>
    </footer>
  </div>
  `,
};

const mailOptionsBusiness = {
  from: `"Zestwear India" <${process.env.EMAIL_USER!}>`,
  to: process.env.BUSINESS_EMAIL!,
  subject: `New Order Received — #${getNumericOrderId(order.id)}`,
  html: `
  <div style="font-family: system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif; max-width:700px; margin:0 auto; padding:20px; color:#1f2d3a;">
    <div style="border-bottom:1px solid #e2e8f0; padding-bottom:12px; margin-bottom:16px;">
      <h2 style="margin:0; font-size:22px;">New Order Received</h2>
      <p style="margin:4px 0 0; font-size:14px;">
        Order ID: <strong>#${getNumericOrderId(order.id)}</strong> — placed by <strong>${email}</strong>
      </p>
    </div>

    <section style="margin-bottom:16px;">
      <p style="margin:0 0 8px; font-size:14px;">
        A new order has been placed. Below are the details:
      </p>
      <div style="display:flex; flex-wrap:wrap; gap:16px; font-size:14px;">
        <div style="flex:1; min-width:220px;">
          <p style="margin:4px 0; font-weight:600;">Customer Email</p>
          <p style="margin:0;">${email}</p>
        </div>
        <div style="flex:1; min-width:220px;">
          <p style="margin:4px 0; font-weight:600;">Order ID</p>
          <p style="margin:0;">#${getNumericOrderId(order.id)}</p>
        </div>
        <div style="flex:1; min-width:220px;">
          <p style="margin:4px 0; font-weight:600;">Total Amount</p>
          <p style="margin:0;">₹${amount.toLocaleString("en-IN")}</p>
        </div>
      </div>
    </section>

    <section style="margin-bottom:20px;">
      <h3 style="margin:0 0 8px; font-size:18px;">Order Summary</h3>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse; margin-bottom:16px;">
        <thead>
          <tr>
            <th align="left" style="padding:10px; border-bottom:1px solid #e2e8f0; font-weight:600;">Item</th>
            <th align="center" style="padding:10px; border-bottom:1px solid #e2e8f0; font-weight:600;">Qty</th>
            <th align="right" style="padding:10px; border-bottom:1px solid #e2e8f0; font-weight:600;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${items
            .map(
              (item: any) => `
            <tr>
              <td style="padding:10px; border-bottom:1px solid #f1f5f9;">
                ${item.name} ${item.size ? `(${item.size})` : ""}
              </td>
              <td align="center" style="padding:10px; border-bottom:1px solid #f1f5f9;">
                ${item.quantity}
              </td>
              <td align="right" style="padding:10px; border-bottom:1px solid #f1f5f9;">
                ₹${item.price.toLocaleString("en-IN")}
              </td>
            </tr>`
            )
            .join("")}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" align="right" style="padding:10px; font-weight:600; border-top:1px solid #e2e8f0;">Grand Total</td>
            <td align="right" style="padding:10px; font-weight:600; border-top:1px solid #e2e8f0;">
              ₹${amount.toLocaleString("en-IN")}
            </td>
          </tr>
        </tfoot>
      </table>
    </section>

    <section style="margin-bottom:16px;">
      <h3 style="margin:0 0 8px; font-size:16px;">Shipping Address</h3>
      <p style="margin:0; font-size:14px; line-height:1.4;">${address}</p>
    </section>

    <div style="padding:14px; background:#f3f4f6; border-radius:8px; font-size:12px; color:#6b7280;">
      <p style="margin:0;">
        Quick action: <strong><a href="admin/orders/${order.id}" style="color:#2563eb; text-decoration:none;">View in admin dashboard</a></strong>
      </p>
    </div>

    <footer style="margin-top:32px; font-size:12px; color:#9ca3af; text-align:center;">
      <p style="margin:4px 0;">This notification was generated automatically.</p>
    </footer>
  </div>
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
