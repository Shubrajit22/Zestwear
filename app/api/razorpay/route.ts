import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_SECRET!,
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const payment_capture = 1;
  const amount = Math.round(body.amount * 100); // convert to paise

  const options = {
    amount: amount,
    currency: "INR",
    receipt: `receipt_order_${Date.now()}`,
    payment_capture,
  };

  try {
    const response = await razorpay.orders.create(options);
    return NextResponse.json(response);
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: 'Razorpay order creation failed' }, { status: 500 });
  }
}
