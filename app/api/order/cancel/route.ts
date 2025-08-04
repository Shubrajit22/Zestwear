import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import nodemailer from "nodemailer";
import { getNumericOrderId } from "@/lib/utils";

export async function PATCH(req: NextRequest) {
  try {
    const { orderId } = await req.json();
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: { product: true },
        },
        user: true,
      },
    });

    if (!order || order.userId !== session.user.id) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    if (order.shippingStatus !== "processing") {
      return NextResponse.json(
        { message: "Order cannot be cancelled after it is shipped" },
        { status: 400 }
      );
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "cancelled",
        shippingStatus: "cancelled",
      },
    });

    const address = (order as any).shippingAddress || "N/A"; // adjust if your type includes it explicitly

    // --- EMAIL CONFIG ---
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const productList = order.orderItems
      .map(
        (item) =>
          `• ${item.product.name} (Qty: ${item.quantity}, Price: ₹${item.price})`
      )
      .join("\n");

    // --- EMAIL TO USER ---
    const userEmailSubject = `Order #${getNumericOrderId(order.id)} Cancelled — Refund Pending`;
    const userEmailHtml = `
  <div style="font-family: system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif; max-width:600px; margin:0 auto; padding:20px; color:#1f2d3a;">
    <div style="text-align:center; border-bottom:1px solid #e2e8f0; padding-bottom:12px; margin-bottom:16px;">
      <h1 style="margin:0; font-size:22px;">Order Cancelled</h1>
      <p style="margin:4px 0 0; font-size:14px;">Order ID: <strong>#${getNumericOrderId(
        order.id
      )}</strong></p>
    </div>

    <p style="font-size:15px; margin:0 0 12px;">
      Hi ${order.user.name || "Customer"},
    </p>
    <p style="font-size:14px; line-height:1.5; margin:0 0 16px;">
      Your order <strong>#${getNumericOrderId(
        order.id
      )}</strong> has been successfully cancelled. Below are the details of the order:
    </p>

    <h2 style="font-size:16px; margin-bottom:8px;">Order Summary</h2>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse; margin-bottom:16px; font-size:14px;">
      <thead>
        <tr>
          <th align="left" style="padding:8px; border-bottom:1px solid #e2e8f0; font-weight:600;">Item</th>
          <th align="center" style="padding:8px; border-bottom:1px solid #e2e8f0; font-weight:600;">Qty</th>
          <th align="right" style="padding:8px; border-bottom:1px solid #e2e8f0; font-weight:600;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${order.orderItems
          .map(
            (item: any) => `
          <tr>
            <td style="padding:8px; border-bottom:1px solid #f1f5f9;">
              ${item.product.name} ${item.size ? `(${item.size})` : ""}
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
          <td colspan="2" align="right" style="padding:8px; font-weight:600; border-top:1px solid #e2e8f0;">Total Refunded</td>
          <td align="right" style="padding:8px; font-weight:600; border-top:1px solid #e2e8f0;">
            ₹${order.totalAmount.toLocaleString("en-IN")}
          </td>
        </tr>
      </tfoot>
    </table>

    <div style="display:flex; gap:16px; flex-wrap:wrap; margin-bottom:16px;">
      <div style="flex:1; min-width:200px;">
        <p style="margin:0 0 4px; font-size:14px; font-weight:600;">Shipping Address</p>
        <p style="margin:0; font-size:14px; line-height:1.4;">${address}</p>
      </div>
    </div>

    <p style="margin:0 0 12px; font-size:14px;">
      Our team will get back to you soon to process your refund. Refunds typically take <strong>3–5 business days</strong> to reflect depending on your payment method.
    </p>

    <p style="margin:0 0 16px; font-size:14px;">
      If you have any questions, reply to this email or contact our support team at <a href="mailto:zestwearindia.info@gmail.com" style="color:#2563eb; text-decoration:none;">support@yourdomain.com</a>.
    </p>

    <div style="padding:14px; background:#f3f4f6; border-radius:6px; font-size:12px; color:#6b7280;">
      <p style="margin:0;">
        <strong>Note:</strong> This is an automated notification. Keep this email for your records.
      </p>
    </div>

    <footer style="margin-top:24px; font-size:12px; color:#9ca3af; text-align:center;">
      <p style="margin:4px 0;">© ${new Date().getFullYear()} Zestwear India. All rights reserved.</p>
    </footer>
  </div>
`;

    const userEmailText = `
Hi ${order.user.name || "Customer"},

Your order #${getNumericOrderId(order.id)} has been cancelled.

Order Details:
${productList}

Total Refunded: ₹${order.totalAmount}

Shipping Address:
${address}

Our team will get back to you soon to process your refund (typically 3–5 business days).

If you have any questions, contact support@yourdomain.com.

Thank you,
Your Brand Name
`;

    // --- EMAIL TO BUSINESS ---
    const businessEmailSubject = `Order Cancelled by Customer — #${getNumericOrderId(order.id)}`;
    const businessEmailHtml = `
  <div style="font-family: system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif; max-width:700px; margin:0 auto; padding:20px; color:#1f2d3a;">
    <div style="border-bottom:1px solid #e2e8f0; padding-bottom:12px; margin-bottom:16px;">
      <h2 style="margin:0; font-size:22px;">Order Cancelled</h2>
      <p style="margin:4px 0 0; font-size:14px;">
        Customer <strong>${order.user.name || "Unknown"}</strong> (${order.user.email}) cancelled order <strong>#${getNumericOrderId(
      order.id
    )}</strong>
      </p>
    </div>

    <section style="margin-bottom:16px; font-size:14px;">
      <h3 style="margin:0 0 8px; font-size:16px;">Order Summary</h3>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse; margin-bottom:16px;">
        <thead>
          <tr>
            <th align="left" style="padding:10px; border-bottom:1px solid #e2e8f0; font-weight:600;">Item</th>
            <th align="center" style="padding:10px; border-bottom:1px solid #e2e8f0; font-weight:600;">Qty</th>
            <th align="right" style="padding:10px; border-bottom:1px solid #e2e8f0; font-weight:600;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${order.orderItems
            .map(
              (item: any) => `
            <tr>
              <td style="padding:10px; border-bottom:1px solid #f1f5f9;">
                ${item.product.name} ${item.size ? `(${item.size})` : ""}
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
            <td colspan="2" align="right" style="padding:10px; font-weight:600; border-top:1px solid #e2e8f0;">Total</td>
            <td align="right" style="padding:10px; font-weight:600; border-top:1px solid #e2e8f0;">
              ₹${order.totalAmount.toLocaleString("en-IN")}
            </td>
          </tr>
        </tfoot>
      </table>
    </section>

    <section style="margin-bottom:16px; font-size:14px;">
      <p style="margin:0;">Shipping Address:</p>
      <p style="margin:4px 0 0;">${address}</p>
    </section>

    <div style="padding:14px; background:#f3f4f6; border-radius:6px; font-size:12px; color:#6b7280;">
      <p style="margin:0;">
        This notification is for internal tracking. Refund processing should be coordinated if applicable.
      </p>
    </div>
  </div>
`;

    const businessEmailText = `
Customer ${order.user.name || "Unknown"} (${order.user.email}) cancelled order #${getNumericOrderId(
      order.id
    )}.

Order Details:
${productList}

Total Amount: ₹${order.totalAmount}

Shipping Address:
${address}
`;

    // send mails
    await transporter.sendMail({
      from: `"Your Brand Name" <${process.env.EMAIL_USER}>`,
      to: order.user.email,
      subject: userEmailSubject,
      text: userEmailText,
      html: userEmailHtml,
    });

    await transporter.sendMail({
      from: `"Your Brand Name" <${process.env.EMAIL_USER}>`,
      to: process.env.BUSINESS_EMAIL,
      subject: businessEmailSubject,
      text: businessEmailText,
      html: businessEmailHtml,
    });

    return NextResponse.json({ message: "Order cancelled", order: updatedOrder });
  } catch (error) {
    console.error("Cancel order error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
