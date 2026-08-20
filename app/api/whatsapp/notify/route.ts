import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { normalizeIndianPhone, sendWhatsAppTemplate } from "@/lib/whatsapp";

// Called by a Supabase Database Webhook (Database > Webhooks in the
// dashboard — not something set up in code) configured to fire on every
// INSERT into `notifications`, POSTing the new row here. Protected the
// same way app/api/cron/nudge-stalled-demos is: a shared secret, since
// there's no logged-in user for a database-triggered call. Set the same
// value as WHATSAPP_NOTIFY_SECRET below into the webhook's HTTP Headers
// config as `Authorization: Bearer <value>`.
//
// The `notifications` table only stores rendered title/body text, not a
// reference to which requirement/match triggered it — so each handler
// below re-queries the most recent matching row for that parent/teacher
// instead of parsing it back out of the text. That's reliable in practice
// (the webhook fires immediately after the insert) but not literally
// guaranteed under a race; if that ever matters, the real fix is adding a
// `related_id` column to `notifications` and passing it through every
// _notify() call site, which is a bigger migration than this scaffold.
//
// Only 3 of the ~10 templates from the earlier copy doc are wired below —
// enough to prove the pattern. Add the rest by following the same shape:
// look up event_type, fetch whatever the template's {{n}} vars need, call
// sendWhatsAppTemplate().
//
// DEMO_SCHEDULED and TEACHER_APPROVED each fire twice per event, once with
// audience PARENT and once with audience TEACHER (see 0028's
// propose_demo/accept_demo/approve_teacher) — both share the same
// event_type. Only the PARENT side is wired below; the switch checks
// `audience` explicitly so a TEACHER-audience row falls through to the
// default case instead of silently querying by the wrong id and finding
// nothing. Add a teacher_confirmed / demo_scheduled_tutor case (keyed off
// teacher_profiles.user_id instead of requirements.parent_id) the same way.

type NotificationRow = {
  audience: "GENERAL" | "PARENT" | "TEACHER";
  target_profile_id: string | null;
  event_type: string | null;
};

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!process.env.WHATSAPP_NOTIFY_SECRET || authHeader !== `Bearer ${process.env.WHATSAPP_NOTIFY_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  const row: NotificationRow | undefined = payload?.record;
  if (!row?.target_profile_id || !row.event_type) {
    return NextResponse.json({ skipped: true });
  }

  const supabase = createServiceRoleClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, phone")
    .eq("id", row.target_profile_id)
    .single();
  const to = normalizeIndianPhone(profile?.phone);
  if (!profile || !to) {
    return NextResponse.json({ skipped: true, reason: "no usable phone number" });
  }

  switch (row.event_type) {
    case "REQUIREMENT_SUBMITTED": {
      const { data: req } = await supabase
        .from("requirements")
        .select("subject, display_id")
        .eq("parent_id", row.target_profile_id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      if (!req) break;
      await sendWhatsAppTemplate({
        to,
        templateName: "requirement_received",
        bodyParams: [profile.name, req.subject, req.display_id],
      });
      break;
    }

    case "DEMO_SCHEDULED": {
      if (row.audience !== "PARENT") break;
      const { data: match } = await supabase
        .from("matches")
        .select("demo_date, demo_time_slot, requirements!inner(subject, parent_id)")
        .eq("requirements.parent_id", row.target_profile_id)
        .eq("status", "DEMO_SCHEDULED")
        .order("scheduled_at", { ascending: false })
        .limit(1)
        .single();
      if (!match) break;
      const req = Array.isArray(match.requirements) ? match.requirements[0] : match.requirements;
      const when = `${match.demo_date}${match.demo_time_slot ? ` (${match.demo_time_slot})` : ""}`;
      await sendWhatsAppTemplate({
        to,
        templateName: "demo_scheduled_parent",
        bodyParams: [profile.name, req.subject, when],
      });
      break;
    }

    case "TEACHER_APPROVED": {
      if (row.audience !== "PARENT") break;
      const { data: match } = await supabase
        .from("matches")
        .select("requirements!inner(subject, parent_id)")
        .eq("requirements.parent_id", row.target_profile_id)
        .eq("status", "CONFIRMED")
        .order("parent_approved_at", { ascending: false })
        .limit(1)
        .single();
      if (!match) break;
      const req = Array.isArray(match.requirements) ? match.requirements[0] : match.requirements;
      await sendWhatsAppTemplate({
        to,
        templateName: "tutor_confirmed_parent",
        bodyParams: [profile.name, req.subject],
      });
      break;
    }

    default:
      // Not one of the wired-up events yet — no-op.
      break;
  }

  return NextResponse.json({ ok: true });
}
