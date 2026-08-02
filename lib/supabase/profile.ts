import type { SupabaseClient } from "@supabase/supabase-js";

export type Role = "PARENT" | "TEACHER" | "ADMIN";

export type Profile = {
  id: string;
  display_id: string;
  role: Role;
  name: string;
  phone: string;
  email: string | null;
};

// Looks up the signed-in user's own profile row (RLS allows a user to read
// only their own row, or everything if they're ADMIN). Returns null if
// nobody is signed in or the profile lookup fails.
export async function getCurrentProfile(
  supabase: SupabaseClient
): Promise<Profile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_id, role, name, phone, email")
    .eq("id", user.id)
    .single();

  if (error || !data) return null;
  return data as Profile;
}

export function homePathForRole(role: Role): string {
  if (role === "ADMIN") return "/admin";
  if (role === "TEACHER") return "/Teacher";
  return "/find-tutor";
}
