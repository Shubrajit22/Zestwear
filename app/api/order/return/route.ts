import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getNumericOrderId } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const { orderId, reason, userEmail, products = [] } = await req.json();

    if (!orderId || !reason || !userEmail) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    // --- MAIL CONFIG ---
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // --- PRODUCT LIST FOR EMAIL ---
    const productRows = products
      .map(
        (p: any) => `
        <tr>
          <td style="padding:8px; border-bottom:1px solid #f1f5f9;">${p.name} ${p.size ? `(${p.size})` : ""}</td>
          <td align="center" style="padding:8px; border-bottom:1px solid #f1f5f9;">${p.quantity}</td>
          <td align="right" style="padding:8px; border-bottom:1px solid #f1f5f9;">₹${p.price.toLocaleString("en-IN")}</td>
        </tr>`
      )
      .join("");

    // ---------------- BUSINESS EMAIL ----------------
    const businessSubject = `Return Request — Order #${getNumericOrderId(orderId)}`;
    const businessHtml = `
      <div style="font-family: system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif; max-width:700px; margin:auto; padding:20px; color:#1f2d3a;">
        <h2 style="margin:0 0 10px;">Return Request Submitted</h2>
        <p>Customer <strong>${userEmail}</strong> has submitted a return request for <strong>Order #${getNumericOrderId(
      orderId
    )}</strong>.</p>
        
        ${
          products.length > 0
            ? `
        <h3 style="margin:16px 0 8px;">Order Items</h3>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse; margin-bottom:16px; font-size:14px;">
          <thead>
            <tr>
              <th align="left" style="padding:8px; border-bottom:1px solid #e2e8f0;">Item</th>
              <th align="center" style="padding:8px; border-bottom:1px solid #e2e8f0;">Qty</th>
              <th align="right" style="padding:8px; border-bottom:1px solid #e2e8f0;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${productRows}
          </tbody>
        </table>` : ""
        }

        <h3 style="margin:16px 0 8px;">Reason for Return</h3>
        <p style="background:#f9fafb; padding:12px; border-radius:6px; font-size:14px; line-height:1.5;">${reason}</p>

        <p style="margin-top:20px; font-size:14px;">Please review and initiate refund or exchange as applicable. Ensure customer is contacted within <strong>24 hours</strong>.</p>

        <div style="padding:12px; background:#f3f4f6; border-radius:6px; font-size:12px; color:#6b7280; margin-top:20px;">
          <p style="margin:0;">This is an automated email. Reply if you need to contact the customer.</p>
        </div>
      </div>
    `;

    // ---------------- USER EMAIL ----------------
    const userSubject = `Return Request Submitted — Order #${getNumericOrderId(orderId)}`;
    const userHtml = `
      <div style="font-family: system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif; max-width:700px; margin:auto; padding:20px; color:#1f2d3a;">
        <div style="text-align:center; border-bottom:1px solid #e2e8f0; padding-bottom:12px; margin-bottom:16px;">
          <h1 style="margin:0; font-size:22px;">Return Request Received</h1>
          <p style="margin:4px 0 0; font-size:14px;">Order ID: <strong>#${getNumericOrderId(
            orderId
          )}</strong></p>
        </div>

        <p style="font-size:15px; margin:0 0 12px;">Hi,</p>
        <p style="font-size:14px; line-height:1.6;">
          We have received your return request for <strong>Order #${getNumericOrderId(
            orderId
          )}</strong>. Our team will review your request and update you within <strong>1–2 business days</strong>.
        </p>

        ${
          products.length > 0
            ? `
        <h3 style="margin:16px 0 8px;">Order Items</h3>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse; margin-bottom:16px; font-size:14px;">
          <thead>
            <tr>
              <th align="left" style="padding:8px; border-bottom:1px solid #e2e8f0;">Item</th>
              <th align="center" style="padding:8px; border-bottom:1px solid #e2e8f0;">Qty</th>
              <th align="right" style="padding:8px; border-bottom:1px solid #e2e8f0;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${productRows}
          </tbody>
        </table>` : ""
        }

        <h3 style="margin:16px 0 8px;">Reason Provided</h3>
        <p style="background:#f9fafb; padding:12px; border-radius:6px; font-size:14px; line-height:1.5;">${reason}</p>

        <p style="margin:16px 0 0; font-size:14px;">
          Once approved, you will receive instructions for pickup or return shipment, along with refund processing details.
        </p>

        <p style="margin:16px 0 0; font-size:14px;">
          For any queries, reply to this email or contact us at <a href="mailto:zestwearindia.info@gmail.com" style="color:#2563eb; text-decoration:none;">zestwearindia.info@gmail.com</a>.
        </p>

        <footer style="margin-top:24px; font-size:12px; color:#9ca3af; text-align:center;">
          <p>© ${new Date().getFullYear()} Zestwear India. All rights reserved.</p>
        </footer>
      </div>
    `;

    // --- SEND TO BUSINESS ---
    await transporter.sendMail({
      from: `"Zestwear India" <${process.env.EMAIL_USER}>`,
      to: process.env.BUSINESS_EMAIL,
      subject: businessSubject,
      html: businessHtml,
    });

    // --- SEND TO USER ---
    await transporter.sendMail({
      from: `"Zestwear India" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: userSubject,
      html: userHtml,
    });

    return NextResponse.json({ message: "Return request sent successfully" });
  } catch (error) {
    console.error("Return request error:", error);
    return NextResponse.json({ message: "Failed to send return request" }, { status: 500 });
  }
}
