import type { SupabaseClient } from "@supabase/supabase-js";
import { getCurrentProfile, type Role } from "./profile";

const ROLE_LABEL: Record<Role, string> = {
  PARENT: "Parent",
  TEACHER: "Teacher",
  ADMIN: "Admin",
};

// Public forms (find-tutor, become-a-tutor) create an account inline
// instead of sending people through a separate signup flow first. Each
// role requires its own account — a Parent registering as a Teacher (or
// vice versa) must use a different email and mobile number, not reuse
// their existing login. If the email is already registered under a
// DIFFERENT role, this rejects with a specific message instead of
// silently signing them into the wrong account.
export async function signUpOrSignIn(
  supabase: SupabaseClient,
  params: {
    email: string;
    password: string;
    name: string;
    phone: string;
    role: Role;
    referralCode?: string;
  }
): Promise<{ hasSession: boolean }> {
  const { email, password, name, phone, role, referralCode } = params;

  // Already logged in (e.g. a parent revisiting the form for a second
  // subject)? Skip signUp entirely — Supabase silently no-ops signUp for
  // an already-registered, already-confirmed email (anti-enumeration
  // behavior) and returns no session, which would otherwise look
  // identical to "needs email confirmation."
  const {
    data: { user: existingUser },
  } = await supabase.auth.getUser();
  if (existingUser) {
    return { hasSession: true };
  }

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
    {
      email,
      password,
      options: {
        data: {
          name,
          phone,
          role,
          consent: true,
          ...(referralCode?.trim() ? { referral_code: referralCode.trim() } : {}),
        },
      },
    }
  );

  if (!signUpError) {
    return { hasSession: !!signUpData.session };
  }

  const alreadyRegistered = /already registered|already exists/i.test(
    signUpError.message
  );
  if (!alreadyRegistered) {
    if (/profiles_phone_key/.test(signUpError.message)) {
      throw new Error(
        "That phone number is already registered to another account. Please use a different number, or log in if it's yours."
      );
    }
    const message = signUpError.message?.trim();
    throw new Error(
      message && message !== "{}" ? message : "Could not create your account. Please try again."
    );
  }

  // The email already has an account. Sign in to find out whose it is —
  // not to silently proceed, but so the rejection message can be
  // accurate, and so we never end up creating a Teacher profile on a
  // Parent's account (or vice versa) just because the password matched.
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (signInError) {
    throw new Error(
      "This email is already registered with Future Minds. Please use a different email and mobile number to sign up, or log in if this account is yours."
    );
  }

  const existingProfile = await getCurrentProfile(supabase);
  if (existingProfile && existingProfile.role !== role) {
    await supabase.auth.signOut();
    throw new Error(
      `You've already registered as a ${ROLE_LABEL[existingProfile.role]} using this email and mobile number. Please use a different email and mobile number to register as a ${ROLE_LABEL[role]}.`
    );
  }

  return { hasSession: true };
}
