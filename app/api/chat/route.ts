import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

// Cheap and fast is the right default for a FAQ/support assistant — swap to
// "claude-opus-5" if conversations start needing real reasoning (multi-step
// comparisons, nuanced edge cases), but that's ~5x the cost per token for a
// job this one doesn't need.
const MODEL = "claude-haiku-4-5";

const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_MESSAGES = 20;
const MAX_OUTPUT_TOKENS = 1024;

const SYSTEM_PROMPT = `You are the Future Minds website assistant — a managed tutor marketplace based in Old Pallavaram, Chennai, Tamil Nadu, built for Tamil Nadu and South Indian families first.

Answer only from the facts below. If something isn't covered here, say you're not sure and point the person to hello@futureminds.in or WhatsApp +91 72002 27081 — never guess at pricing, policy, or account-specific details.

## What Future Minds does
Not a listing directory — every match is personally reviewed. A parent submits a requirement (subject, level, mode, location, schedule, budget); the Future Minds team shortlists tutors by availability, location fit, and willingness; coordinates a demo class; the parent approves the tutor; then every class is logged and must be confirmed by the parent before it counts toward the tutor's payout.

Two verticals:
- **Tutor Platform** — academics, creative learning, soft skills, matched to independent tutors.
- **Future Minds Academy** — AI & Robotics training, run directly by Future Minds (not a matched tutor). Courses: Robotics Starter (ages 6-9, ₹1,999, 1 month), Junior AI Coders (10-13, ₹2,999, 3 months), AI Builders — Teen (14-17, ₹3,999, 3 months), Adult & Family AI (all ages, ₹5,999, 3 months). Delivered as Course Packages, Live Classes, Certifications, and Weekend Workshops.

## Categories (54+ live)
State Board, CBSE, ICSE, IGCSE, full K-12 academics, Music & Instruments, Dance, Art, Abacus, Communication Skills, Spoken English, Spoken Hindi, Presentation Skills, Public Speaking, Personality Development, Interview Skills, Group Discussion, French, German, Japanese, Chinese, Handwriting, Phonics.

## Modes
Online, Home Tuition (teacher travels to student), Teacher's Location (student travels to teacher), and Community Pooling — apartments/residential groups sharing one class and splitting the cost, unique to Future Minds.

## Fees — be precise here, families ask about this a lot
Class fees themselves are paid directly to the tutor, as agreed between parent and tutor — Future Minds never touches that payment.
- **Standard match:** once the parent approves a tutor, Future Minds charges a **one-time platform fee of 20% of the monthly budget**, paid directly to Future Minds. Separately, the tutor pays Future Minds a **10% commission from their own earnings, every month**, for as long as the class stays active.
- **Community Pooling:** different — no one-time fee. Instead **both sides pay a recurring 10% every month**: 10% of the tutor's payout, and a separate 10% of each participating household's monthly share.
- No subscription for parents — you only pay once matched.

## Perks
Free access to training materials, always. Verified tutors (KYC-checked before a child's first class). Attendance assurance — a class only counts toward payout once the parent confirms it happened. A 10% discount on Future Minds Academy courses, for both parents and tutors. For tutors specifically: Future Minds coordinates Community Pooling batches, handles parent follow-ups, and there's a referral program with points for successful referrals.

## Signing up
Parents and tutors sign up via the "Find a Tutor" / "Become a Tutor" forms. Both require account confirmation via email before the requirement/application goes through. Tutors additionally need KYC verification before they can be matched with families.

## Contact
Email: hello@futureminds.in · WhatsApp / phone: +91 72002 27081 · Careers: careers@futureminds.in · Registered Office: Old Pallavaram, Chennai, Tamil Nadu.

## How to behave
- Warm, direct, and specific — the way you'd actually explain this to a parent on the phone, not corporate boilerplate.
- You cannot see anyone's account, requirement status, KYC status, or payout details — for anything account-specific, tell them to log in to their dashboard, or contact hello@futureminds.in / WhatsApp if they're stuck.
- Never ask for or accept passwords, OTPs, card numbers, or bank details in this chat — if someone shares any of that, tell them not to and don't repeat it back.
- If asked whether you're a bot: yes, you're the Future Minds website assistant, not a person.
- Keep answers short — a couple of sentences for a simple question. Only go longer when the question genuinely needs it.`;

type ChatMessage = { role: "user" | "assistant"; content: string };

// Very small in-memory limiter — good enough to blunt casual abuse on a
// single-instance deployment. Not durable across serverless cold starts or
// multiple instances; if traffic grows enough for that gap to matter, swap
// this for a real store (Redis, Vercel KV) rather than trusting this map.
const requestLog = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 10;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (requestLog.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  requestLog.set(ip, recent);
  return recent.length > RATE_LIMIT_MAX_REQUESTS;
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Chat is temporarily unavailable. Reach us on WhatsApp or hello@futureminds.in instead." },
      { status: 503 }
    );
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many messages — please wait a moment and try again." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const messages: unknown = body?.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "No message provided." }, { status: 400 });
  }

  const history: ChatMessage[] = messages
    .slice(-MAX_HISTORY_MESSAGES)
    .filter(
      (m): m is ChatMessage =>
        !!m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0 &&
        m.content.length <= MAX_MESSAGE_LENGTH
    );

  if (history.length === 0 || history[history.length - 1].role !== "user") {
    return NextResponse.json({ error: "Invalid message." }, { status: 400 });
  }

  const client = new Anthropic({ apiKey });

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        const anthropicStream = client.messages.stream({
          model: MODEL,
          max_tokens: MAX_OUTPUT_TOKENS,
          system: SYSTEM_PROMPT,
          messages: history,
        });

        anthropicStream.on("text", (delta) => {
          controller.enqueue(encoder.encode(delta));
        });

        await anthropicStream.finalMessage();
        controller.close();
      } catch {
        controller.enqueue(
          encoder.encode("\n\nSomething went wrong on our end — please try again or reach us on WhatsApp.")
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
