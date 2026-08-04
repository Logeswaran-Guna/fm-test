import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

// For Route Handlers: authenticated as whoever's session cookie came in
// with the request (the signed-in admin), so RLS/role checks in the RPCs
// still apply — this client can only do what that admin is allowed to do.
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}

// Elevated, not tied to any user session — bypasses RLS entirely. Never
// import this into client code or a Client Component; it must only be
// constructed inside a Route Handler using the server-only
// SUPABASE_SERVICE_ROLE_KEY env var. Used exclusively for
// supabase.auth.admin.createUser() when an admin registers someone on a
// caller's behalf — every other mutation still goes through the normal
// RPCs, authenticated as the admin's own session.
export function createServiceRoleClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// Guards every admin-only Route Handler: confirms there's a real, signed-in
// session and that its profile role is ADMIN, before any service-role
// action is allowed to run. Returns the caller's own id on success.
export async function requireAdmin(
  supabase: SupabaseClient
): Promise<{ id: string } | { error: string; status: number }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in.", status: 401 };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "ADMIN") {
    return { error: "Admin only.", status: 403 };
  }
  return { id: profile.id };
}
