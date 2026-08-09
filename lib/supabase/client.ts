import { createBrowserClient } from "@supabase/ssr";

// In real environments these come from the project's Supabase env vars. In a
// preview sandbox where the Sensitive production values can't be injected,
// they may be missing or a non-URL placeholder — fall back to a syntactically
// valid dummy origin so `createBrowserClient` doesn't throw at construction.
// Auth/data calls then simply resolve to "no session" instead of crashing the
// page, which lets the public marketing UI render for previews.
const FALLBACK_URL = "https://placeholder.supabase.co";
const FALLBACK_KEY = "public-anon-key-placeholder";

function resolveCredentials() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isValidUrl = /^https?:\/\//.test(url ?? "");
  return {
    url: isValidUrl ? (url as string) : FALLBACK_URL,
    key: key && isValidUrl ? key : FALLBACK_KEY,
  };
}

export function createClient() {
  const { url, key } = resolveCredentials();
  return createBrowserClient(url, key);
}
