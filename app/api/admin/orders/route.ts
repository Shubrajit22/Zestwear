import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

// Nodemailer config for notifications
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER!,
    pass: process.env.EMAIL_PASS!,
  },
});

// GET: Fetch all orders for admin
export async function GET(req: NextRequest) {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            mobile: true,
          },
        },
        orderItems: {
          include: {
            product: {
              select: {
                name: true,
                color: true,
                type: true,
                texture: true,
                neckline: true,
                stockImages: {
                  select: {
                    imageUrl: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { message: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// PATCH: Update order status (shipping or payment)
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, shippingStatus, paymentStatus } = body;

    if (!orderId) {
      return NextResponse.json(
        { message: "Order ID is required" },
        { status: 400 }
      );
    }

    // Build update object based on provided fields
    const updateData: any = {};
    if (shippingStatus) updateData.shippingStatus = shippingStatus;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { message: "No valid fields to update" },
        { status: 400 }
      );
    }

    // Update the order
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Send email notifications based on status changes
    try {
      if (shippingStatus) {
        await sendShippingUpdateEmail(updatedOrder, shippingStatus);
      }
      
      if (paymentStatus) {
        await sendPaymentStatusEmail(updatedOrder, paymentStatus);
      }
    } catch (emailError) {
      console.error("Email notification error:", emailError);
      // Don't fail the update if email fails
    }

    return NextResponse.json({
      message: "Order updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { message: "Failed to update order" },
      { status: 500 }
    );
  }
}

// Helper function to send shipping update emails
async function sendShippingUpdateEmail(order: any, newStatus: string) {
  const statusMessages = {
    processing: "Your order is being processed",
    shipped: "Your order has been shipped!",
    "out-for-delivery": "Your order is out for delivery",
    delivered: "Your order has been delivered!",
    cancelled: "Your order has been cancelled",
  };

  const statusColors = {
    processing: "#f59e0b",
    shipped: "#3b82f6",
    "out-for-delivery": "#8b5cf6",
    delivered: "#10b981",
    cancelled: "#ef4444",
  };

  const message = statusMessages[newStatus as keyof typeof statusMessages] || "Order status updated";
  const color = statusColors[newStatus as keyof typeof statusColors] || "#6b7280";

  const mailOptions = {
    from: `"Zestwear India" <${process.env.EMAIL_USER!}>`,
    to: order.user.email,
    subject: `Order Update - ${message}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: ${color}; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">${message}</h1>
        </div>
        
        <div style="padding: 20px;">
          <p>Hi ${order.user.name || "Customer"},</p>
          <p>Your order status has been updated:</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Order Details</h3>
            <p><strong>Order ID:</strong> #${order.id}</p>
            <p><strong>Status:</strong> <span style="color: ${color}; font-weight: bold;">${newStatus.toUpperCase()}</span></p>
            <p><strong>Total:</strong> ₹${order.totalAmount.toLocaleString("en-IN")}</p>
          </div>

          ${newStatus === 'delivered' ? `
            <div style="background-color: #d1fae5; border: 1px solid #10b981; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #065f46;"><strong>🎉 Your order has been delivered!</strong></p>
              <p style="margin: 5px 0 0 0; color: #065f46;">Thank you for shopping with us. We hope you love your purchase!</p>
            </div>
          ` : ''}

          ${newStatus === 'cancelled' ? `
            <div style="background-color: #fee2e2; border: 1px solid #ef4444; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #991b1b;"><strong>Order Cancelled</strong></p>
              <p style="margin: 5px 0 0 0; color: #991b1b;">If you have any questions about this cancellation, please contact our support team.</p>
            </div>
          ` : ''}

          <p>Best regards,<br>Zestwear India Team</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

// Helper function to send payment status emails
async function sendPaymentStatusEmail(order: any, newStatus: string) {
  let subject = "Payment Status Update";
  let message = "";
  let color = "#6b7280";

  switch (newStatus) {
    case "verified":
      subject = "Payment Verified ✅";
      message = "Your payment has been verified and confirmed.";
      color = "#10b981";
      break;
    case "suspicious":
      subject = "Payment Under Review ⚠️";
      message = "Your payment is currently under review. We may contact you for additional verification.";
      color = "#f59e0b";
      break;
    case "pending":
      subject = "Payment Pending";
      message = "Your payment is still pending verification.";
      color = "#6b7280";
      break;
  }

  const mailOptions = {
    from: `"Zestwear India" <${process.env.EMAIL_USER!}>`,
    to: order.user.email,
    subject: subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: ${color}; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">${subject}</h1>
        </div>
        
        <div style="padding: 20px;">
          <p>Hi ${order.user.name || "Customer"},</p>
          <p>${message}</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Order Information</h3>
            <p><strong>Order ID:</strong> #${order.id}</p>
            <p><strong>Payment Status:</strong> <span style="color: ${color}; font-weight: bold;">${newStatus.toUpperCase()}</span></p>
            <p><strong>Total Amount:</strong> ₹${order.totalAmount.toLocaleString("en-IN")}</p>
            ${order.upiTransactionId ? `<p><strong>UPI Transaction ID:</strong> ${order.upiTransactionId}</p>` : ''}
          </div>

          ${newStatus === 'suspicious' ? `
            <div style="background-color: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #92400e;"><strong>Action Required</strong></p>
              <p style="margin: 5px 0 0 0; color: #92400e;">Please ensure your UPI transaction was completed successfully. If you have any concerns, please contact our support team with your transaction details.</p>
            </div>
          ` : ''}

          <p>If you have any questions, please don't hesitate to contact us.</p>
          
          <p>Best regards,<br>Zestwear India Team</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}