import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Refreshes the Supabase auth session cookie on every request so client
// components always see a valid, up-to-date session. Called from proxy.ts
// (Next.js 16 renamed the `middleware.ts` file convention to `proxy.ts`,
// but this cookie-refresh logic is unrelated to that rename and lives here
// so it stays easy to find alongside the other Supabase helpers).
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
  // Bounded by a timeout: this runs on nearly every request (see the
  // matcher below), and auth-js retries a slow/flaky network call with
  // its own backoff — without a cap here, one bad connection to Supabase
  // stalls every single page load (observed: 27s on one request). If it
  // times out or errors, the request just proceeds with whatever session
  // cookie it already had rather than hanging the whole site.
  try {
    await Promise.race([
      supabase.auth.getUser(),
      new Promise((_, reject) => setTimeout(() => reject(new Error("auth refresh timed out")), 4000)),
    ]);
  } catch {
    // Non-fatal — worst case this request's session cookie doesn't get
    // refreshed; the next successful request will catch it up.
  }

  return response;
}
