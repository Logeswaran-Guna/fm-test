import type { SupabaseClient } from "@supabase/supabase-js";
import type { EntityStatus } from "@/lib/status";

export type Role = "PARENT" | "TEACHER" | "ADMIN";

export type Profile = {
  id: string;
  display_id: string;
  role: Role;
  name: string;
  phone: string;
  email: string | null;
  status: EntityStatus;
  must_change_password: boolean;
};

// Looks up the signed-in user's own profile row (RLS allows a user to read
// only their own row, or everything if they're ADMIN). Returns null if
// nobody is signed in or the profile lookup fails. `status` here is a
// direct read, not freshly recomputed — the automatic Active/Idle self-heal
// runs inside my_requirements()/my_teacher_profile(), so it may lag by one
// page load; it always corrects itself on the next RPC call.
export async function getCurrentProfile(
  supabase: SupabaseClient
): Promise<Profile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_id, role, name, phone, email, status, must_change_password")
    .eq("id", user.id)
    .single();

  if (error || !data) return null;
  return data as Profile;
}

export function homePathForRole(role: Role): string {
  if (role === "ADMIN") return "/admin";
  if (role === "TEACHER") return "/Teacher";
  return "/my-dashboard";
}
