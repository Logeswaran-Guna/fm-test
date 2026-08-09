import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Refreshes the Supabase auth session cookie on every request so client
// components always see a valid, up-to-date session. Called from proxy.ts
// (Next.js 16 renamed the `middleware.ts` file convention to `proxy.ts`,
// but this cookie-refresh logic is unrelated to that rename and lives here
// so it stays easy to find alongside the other Supabase helpers).
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // When valid Supabase credentials aren't available (e.g. a preview sandbox
  // where the Sensitive production env vars can't be pulled), skip the session
  // refresh instead of throwing so public pages still render. Production, where
  // the real credentials exist, runs the full session logic below.
  const hasValidCredentials =
    !!supabaseAnonKey && /^https?:\/\//.test(supabaseUrl ?? "");
  if (!hasValidCredentials) {
    return response;
  }

  const supabase = createServerClient(
    supabaseUrl!,
    supabaseAnonKey!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Touches the session so expired tokens get refreshed and the new
  // cookies are written to the response before it reaches the browser.
  await supabase.auth.getUser();

  return response;
}
