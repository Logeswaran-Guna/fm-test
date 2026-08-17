import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import {
  createServerSupabaseClient,
  createServiceRoleClient,
  requireAdmin,
} from "@/lib/supabase/server";

// Lets an admin register a tutor application on behalf of a caller (e.g.
// taking the details over the phone). Creates the auth.users row via the
// service-role Admin API, then submits the tutor profile through the
// normal admin-gated RPC using the admin's own session. Photo/KYC document
// upload isn't supported here — the tutor completes those themselves after
// setting a real password (via "Forgot password") and logging in.
export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const adminCheck = await requireAdmin(supabase);
  if ("error" in adminCheck) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  const body = await request.json();
  const {
    fullName,
    email,
    phoneNumber,
    qualifications,
    yearsExperience,
    expectedRate,
    serviceArea,
    bankUpiRef,
    modes,
    subjects,
    availability,
    tutoringFor,
    boards,
  } = body ?? {};

  if (!fullName || !email || !phoneNumber) {
    return NextResponse.json(
      { error: "Name, email, and phone are required." },
      { status: 400 }
    );
  }

  const serviceRole = createServiceRoleClient();
  const tempPassword = randomBytes(16).toString("hex");

  const { data: created, error: createError } = await serviceRole.auth.admin.createUser({
    email: String(email).trim(),
    password: tempPassword,
    email_confirm: true,
    user_metadata: {
      name: String(fullName).trim(),
      phone: String(phoneNumber).trim(),
      role: "TEACHER",
      consent: true,
    },
  });

  if (createError || !created.user) {
    return NextResponse.json(
      { error: createError?.message || "Could not create the tutor account." },
      { status: 400 }
    );
  }

  const { data: profile, error: rpcError } = await supabase.rpc(
    "admin_register_teacher_profile",
    {
      p_teacher_user_id: created.user.id,
      p_qualification: qualifications || null,
      p_experience: yearsExperience || null,
      p_subjects: subjects ?? [],
      p_preferred_locations: serviceArea ? [serviceArea] : null,
      p_teaching_mode: modes ?? [],
      p_availability: availability ?? [],
      p_rate_expectation: expectedRate ?? null,
      p_bank_upi_ref: bankUpiRef || null,
      p_area_city: serviceArea || null,
      p_tutoring_for: tutoringFor ?? [],
      p_boards: boards ?? [],
    }
  );

  if (rpcError) {
    // The auth account already exists at this point, but with no profile
    // behind it — left alone, that's a live login with an unknown random
    // password and no data, and the email can't be reused without manual
    // cleanup in Supabase. Roll it back so the admin can just retry.
    await serviceRole.auth.admin.deleteUser(created.user.id);
    return NextResponse.json({ error: rpcError.message }, { status: 400 });
  }

  return NextResponse.json({ profile });
}
