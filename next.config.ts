import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const SUPABASE_ORIGIN = "https://gjpwrmatwcrjwhglczvc.supabase.co";

// The app collects KYC documents and bank/UPI details, so this is worth
// getting right. script-src needs 'unsafe-inline': most of this site is
// statically prerendered at build time (checked via `next build`), so a
// per-request nonce (the stricter option) can't reach the hydration
// scripts baked into that static HTML — tried it, it 404s the site's own
// scripts. The app has zero `dangerouslySetInnerHTML` anywhere (checked),
// so the residual XSS surface this leaves open is narrow. Every other
// directive stays strict, including frame-ancestors, which is what
// actually closes the clickjacking gap this was added for.
// Dev-only: Next.js/React use eval() in development for Fast Refresh and
// reconstructing stack traces (React's own error message confirms it
// "will never use eval() in production mode"), so this is scoped out of
// the production policy rather than loosened everywhere for dev's sake.
const SCRIPT_SRC =
  process.env.NODE_ENV === "development"
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : "script-src 'self' 'unsafe-inline'";

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  SCRIPT_SRC,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: " + SUPABASE_ORIGIN,
  "font-src 'self' data:",
  "connect-src 'self' " + SUPABASE_ORIGIN + " wss://" + SUPABASE_ORIGIN.replace("https://", "") + " https://*.sentry.io",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: CONTENT_SECURITY_POLICY },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  // No org/project/token yet — skip source-map upload silently rather than
  // failing the build. Set these once a real Sentry project exists.
  silent: true,
});
