import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";
import { getNumericOrderId } from "@/lib/utils";

type OrderItem = {
  name: string;
  quantity: number;
  price: number;
  size?: string;
  sizeId?: string | null;
  productId: string;
};

// Nodemailer config
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER!,
    pass: process.env.EMAIL_PASS!,
  },
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, amount, address, items, upiTransactionId }: {
      email: string;
      amount: number;
      address: string;
      items: OrderItem[];
      upiTransactionId?: string;
    } = body;

    // Validate required fields
    if (!email || !items || !address || items.length === 0) {
      return NextResponse.json({ 
        message: "Missing required fields. Email, items, and address are required." 
      }, { status: 400 });
    }

    // Validate UPI transaction ID
    if (!upiTransactionId || upiTransactionId.trim() === '') {
      return NextResponse.json({ 
        message: "UPI Transaction ID is required for payment confirmation" 
      }, { status: 400 });
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Check if UPI transaction ID already exists (prevent duplicate orders)
    const existingOrder = await prisma.order.findFirst({
      where: { upiTransactionId: upiTransactionId.trim() }
    });

    if (existingOrder) {
      return NextResponse.json({ 
        message: "An order with this UPI transaction ID already exists" 
      }, { status: 409 });
    }

    // Validate items and calculate total
    let calculatedTotal = 0;
    for (const item of items) {
      if (!item.productId || !item.name || item.quantity <= 0 || item.price <= 0) {
        return NextResponse.json({ 
          message: "Invalid item data detected" 
        }, { status: 400 });
      }
      calculatedTotal += item.price * item.quantity;
    }

    // Validate total amount matches
    if (Math.abs(calculatedTotal - amount) > 0.01) {
      return NextResponse.json({ 
        message: "Order total mismatch detected" 
      }, { status: 400 });
    }

    // Create order with transaction
    const order = await prisma.$transaction(async (prisma) => {
      // Create the order
      const newOrder = await prisma.order.create({
        data: {
          userId: user.id,
          status: "confirmed",
          shippingAddress: address,
          totalAmount: amount,
          paymentStatus: "paid", // Since we have UPI transaction ID
          shippingStatus: "processing",
          upiTransactionId: upiTransactionId.trim(),
          orderItems: {
            create: items.map((item) => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              size: item.size || "",
              sizeId: item.sizeId || null,
              productId: item.productId,
            })),
          },
        },
        include: {
          orderItems: true,
        },
      });

      // Clear user's cart
      await prisma.cartItem.deleteMany({ 
        where: { userId: user.id } 
      });

      return newOrder;
    });

    // Prepare email content
    const orderItemsList = items
      .map((i) => `<li>${i.name} ${i.size ? `(${i.size})` : ''} x${i.quantity} - ₹${i.price.toFixed(2)}</li>`)
      .join("");

    // Send confirmation email to customer
    const mailOptionsUser = {
      from: `"Zestwear India" <${process.env.EMAIL_USER!}>`,
      to: email,
      subject: `Order Confirmation #${getNumericOrderId(order.id)} - Thank you for your purchase!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Order Confirmation</h2>
          <p>Hi ${user.name || "Customer"},</p>
          <p>Thank you for your order! Your payment has been confirmed and your order is being processed.</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Order Details</h3>
            <p><strong>Order ID:</strong> #${getNumericOrderId(order.id)}</p>
            <p><strong>Total Amount:</strong> ₹${amount.toLocaleString("en-IN")}</p>
            <p><strong>Payment Status:</strong> Paid (UPI Ref: ${upiTransactionId})</p>
            <p><strong>Shipping Status:</strong> Processing</p>
          </div>

          <div style="margin: 20px 0;">
            <h3>Items Ordered:</h3>
            <ul style="list-style-type: none; padding: 0;">
              ${orderItemsList}
            </ul>
          </div>

          <div style="margin: 20px 0;">
            <h3>Shipping Address:</h3>
            <p style="background-color: #f9f9f9; padding: 10px; border-radius: 4px;">
              ${address}
            </p>
          </div>

          <p>We'll send you another email with tracking information once your order has been shipped.</p>
          <p>Thank you for shopping with us!</p>
          
          <p style="color: #666; font-size: 14px;">
            Best regards,<br>
            Zestwear India Team
          </p>
        </div>
      `,
    };

    // Send notification email to business
    const mailOptionsBusiness = {
      from: `"Zestwear India" <${process.env.EMAIL_USER!}>`,
      to: process.env.BUSINESS_EMAIL!,
      subject: `New Order Received - #${getNumericOrderId(order.id)} (₹${amount.toLocaleString("en-IN")})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Order Received</h2>
          
          <div style="background-color: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #2d5a2d;">Order Summary</h3>
            <p><strong>Order ID:</strong> #${getNumericOrderId(order.id)}</p>
            <p><strong>Customer:</strong> ${user.name || 'N/A'} (${email})</p>
            <p><strong>Total:</strong> ₹${amount.toLocaleString("en-IN")}</p>
            <p><strong>UPI Transaction ID:</strong> ${upiTransactionId}</p>
            <p><strong>Payment Status:</strong> PAID ✅</p>
            <p><strong>Order Time:</strong> ${new Date().toLocaleString("en-IN")}</p>
          </div>

          <div style="margin: 20px 0;">
            <h3>Items:</h3>
            <ul>
              ${orderItemsList}
            </ul>
          </div>

          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px;">
            <h3 style="margin-top: 0;">Shipping Address:</h3>
            <p>${address}</p>
          </div>

          <p style="color: #666; margin-top: 30px;">
            Please process this order and update the shipping status accordingly.
          </p>
        </div>
      `,
    };

    try {
      // Send emails
      await Promise.all([
        transporter.sendMail(mailOptionsUser),
        transporter.sendMail(mailOptionsBusiness)
      ]);
      console.log('Order confirmation emails sent successfully');
    } catch (emailError) {
      console.error('Error sending emails:', emailError);
      // Don't fail the order creation if email fails
    }

    return NextResponse.json({ 
      message: "Order placed successfully",
      orderId: getNumericOrderId(order.id),
      order: {
        id: order.id,
        status: order.status,
        totalAmount: order.totalAmount,
        paymentStatus: order.paymentStatus,
        shippingStatus: order.shippingStatus,
        upiTransactionId: order.upiTransactionId,
        createdAt: order.createdAt
      }
    }, { status: 201 });

  } catch (error: unknown) {
    console.error("ORDER CREATION ERROR:", error);
    
    // Handle Prisma unique constraint violations
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json({ 
        message: "Order with this transaction ID already exists" 
      }, { status: 409 });
    }
    
    const errMsg = error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ 
      message: "Failed to create order. Please try again.",
      error: process.env.NODE_ENV === 'development' ? errMsg : undefined
    }, { status: 500 });
  }
}