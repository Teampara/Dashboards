import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers.get("x-razorpay-signature") || "";
  const payload = await req.text();

  if (!secret) {
    return NextResponse.json({ error: "Missing webhook secret" }, { status: 500 });
  }

  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  if (expected !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(payload);
  const payment = event.payload?.payment?.entity;

  if (payment?.status === "captured" && supabase) {
    await supabase.from("stories").update({ is_paid: true }).eq("payment_id", payment.id);
  }

  return NextResponse.json({ ok: true });
}
