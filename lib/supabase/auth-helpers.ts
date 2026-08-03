import type { SupabaseClient } from "@supabase/supabase-js";
import type { Role } from "./profile";

// Public forms (find-tutor, become-a-tutor) create an account inline
// instead of sending people through a separate signup flow first. If the
// email is already registered, falls back to signing in with the same
// password rather than erroring out.
export async function signUpOrSignIn(
  supabase: SupabaseClient,
  params: { email: string; password: string; name: string; phone: string; role: Role }
): Promise<{ hasSession: boolean }> {
  const { email, password, name, phone, role } = params;

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
      options: { data: { name, phone, role, consent: true } },
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

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (signInError) {
    throw new Error(
      "An account with this email already exists, but that password doesn't match. Please use the correct password, or log in first."
    );
  }
  return { hasSession: true };
}
