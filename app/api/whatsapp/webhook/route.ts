import { NextResponse } from "next/server";

// Meta calls GET once, at setup time, to prove you control this URL —
// echo back hub.challenge only if hub.verify_token matches the value you
// typed into the Meta app dashboard's webhook config (WHATSAPP_WEBHOOK_VERIFY_TOKEN
// below is just a shared secret you invent yourself, not something Meta gives you).
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN && challenge) {
    return new Response(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

// Meta POSTs here for delivery receipts and any inbound message a customer
// sends to your WhatsApp number. Must respond 200 quickly — Meta retries
// (and eventually disables the webhook) if this hangs or errors.
// Currently a no-op receiver; extend the switch below once you want to
// react to specific statuses (e.g. log "failed" deliveries) or incoming
// replies (e.g. forward them into the admin dashboard).
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const entry = body?.entry?.[0]?.changes?.[0]?.value;
  const statuses = entry?.statuses as { status: string; id: string }[] | undefined;
  const messages = entry?.messages as { from: string; text?: { body: string } }[] | undefined;

  if (statuses?.length) {
    // e.g. statuses[0].status is "sent" | "delivered" | "read" | "failed"
  }
  if (messages?.length) {
    // An inbound reply from a customer — not wired to anything yet.
  }

  return NextResponse.json({ received: true });
}
