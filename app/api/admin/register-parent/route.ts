import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import {
  createServerSupabaseClient,
  createServiceRoleClient,
  requireAdmin,
} from "@/lib/supabase/server";

// Lets an admin register a parent + their first requirement on behalf of a
// caller (e.g. taking the details over the phone). Creates the auth.users
// row via the service-role Admin API (skipping email confirmation, since
// the admin is vouching for the caller directly), then submits the
// requirement through the normal admin-gated RPC using the admin's own
// session — so the RPC's "Admin only" check is real, not just assumed.
export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const adminCheck = await requireAdmin(supabase);
  if ("error" in adminCheck) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  const body = await request.json();
  const {
    parentName,
    email,
    phoneNumber,
    subject,
    modes,
    location,
    schedulePref,
    pricingType,
    budget,
    preferredGender,
    studentName,
    gradeClass,
    age,
    gender,
    address,
    areaCity,
    pincode,
    notes,
    priorExperience,
  } = body ?? {};

  if (!parentName || !email || !phoneNumber || !subject || !Array.isArray(modes) || modes.length === 0) {
    return NextResponse.json(
      { error: "Parent name, email, phone, subject, and at least one mode are required." },
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
      name: String(parentName).trim(),
      phone: String(phoneNumber).trim(),
      role: "PARENT",
      consent: true,
    },
  });

  if (createError || !created.user) {
    return NextResponse.json(
      { error: createError?.message || "Could not create the parent account." },
      { status: 400 }
    );
  }

  const { data: requirement, error: rpcError } = await supabase.rpc(
    "admin_register_parent_requirement",
    {
      p_parent_id: created.user.id,
      p_subject: subject,
      p_mode: modes,
      p_location: location || null,
      p_schedule_pref: schedulePref || null,
      p_pricing_type: pricingType || null,
      p_budget: budget ?? null,
      p_preferred_teacher_gender: preferredGender || null,
      p_student_name: studentName || null,
      p_age_grade: gradeClass || null,
      p_age: age ?? null,
      p_gender: gender || null,
      p_address: address || null,
      p_area_city: areaCity || null,
      p_pincode: pincode || null,
      p_whatsapp: phoneNumber || null,
      p_notes: notes || null,
      p_prior_tutoring_experience: priorExperience || null,
    }
  );

  if (rpcError) {
    // The auth account already exists at this point, but with no requirement
    // behind it — left alone, that's a live login with an unknown random
    // password and no data, and the email can't be reused without manual
    // cleanup in Supabase. Roll it back so the admin can just retry.
    await serviceRole.auth.admin.deleteUser(created.user.id);
    return NextResponse.json({ error: rpcError.message }, { status: 400 });
  }

  return NextResponse.json({ requirement });
}
