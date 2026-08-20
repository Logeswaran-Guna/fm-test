import { NextResponse } from "next/server";
import {
  createServerSupabaseClient,
  createServiceRoleClient,
  requireAdmin,
} from "@/lib/supabase/server";

// For when someone can't complete the normal "forgot password" email flow
// and reaches Future Minds on WhatsApp/phone instead. The admin is
// expected to verify the caller's identity on the call against what's
// shown in Manage Users (name, email, phone) before clicking this — that
// verification is a human step, not something this route can enforce.
// Issues a short temp password the admin reads out loud, and flags the
// account so the caller is forced to set a real one on first login.

const TEMP_PASSWORD_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no 0/O/1/I/L — easier to read aloud

function generateTempPassword(length = 8): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += TEMP_PASSWORD_ALPHABET[Math.floor(Math.random() * TEMP_PASSWORD_ALPHABET.length)];
  }
  return out;
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const adminCheck = await requireAdmin(supabase);
  if ("error" in adminCheck) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  const body = await request.json().catch(() => null);
  const profileId = body?.profileId;
  if (!profileId || typeof profileId !== "string") {
    return NextResponse.json({ error: "profileId is required." }, { status: 400 });
  }

  const tempPassword = generateTempPassword();
  const serviceRole = createServiceRoleClient();

  const { error: authError } = await serviceRole.auth.admin.updateUserById(profileId, {
    password: tempPassword,
  });
  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 });
  }

  const { error: flagError } = await supabase.rpc("admin_flag_password_reset", {
    p_profile_id: profileId,
  });
  if (flagError) {
    return NextResponse.json({ error: flagError.message }, { status: 400 });
  }

  return NextResponse.json({ tempPassword });
}
