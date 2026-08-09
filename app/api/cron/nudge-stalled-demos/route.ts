import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

// Hit once daily by Vercel Cron (see vercel.json). There's no logged-in
// user for a scheduled job, so this is protected by a shared secret
// instead of requireAdmin() — Vercel automatically sends
// `Authorization: Bearer $CRON_SECRET` on cron-triggered requests once
// that env var is set. _cron_nudge_stalled_matches() is itself only
// reachable via the service-role connection (revoked from `authenticated`
// in migration 0032), so this route is the only path that can ever
// trigger it.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const serviceRole = createServiceRoleClient();
  const { data, error } = await serviceRole.rpc("_cron_nudge_stalled_matches");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ nudged: data });
}
