import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req: Request) {
  const body = await req.json();

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return NextResponse.json({ error: "Missing Razorpay env vars" }, { status: 500 });
  }

  const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
  const order = await razorpay.orders.create({
    amount: Number(body.amount ?? 19900),
    currency: "INR",
    receipt: `storybook_${Date.now()}`
  });

  return NextResponse.json({ orderId: order.id, amount: order.amount, currency: order.currency });
}
