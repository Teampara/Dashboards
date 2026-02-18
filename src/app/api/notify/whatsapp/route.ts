import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { to, link } = await req.json();

  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    return NextResponse.json({ error: "Missing WhatsApp Cloud API env vars" }, { status: 500 });
  }

  const response = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: "story_ready",
        language: { code: "en_US" },
        components: [
          {
            type: "body",
            parameters: [{ type: "text", text: `Your story is ready! Download here: ${link}` }]
          }
        ]
      }
    })
  });

  if (!response.ok) {
    const details = await response.text();
    return NextResponse.json({ error: "Failed to send WhatsApp message", details }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
