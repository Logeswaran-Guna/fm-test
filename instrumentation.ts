import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 0.2,
      // Silent no-op when no DSN is configured — safe to ship before a
      // Sentry project exists, and safe to leave as-is in local dev.
      enabled: Boolean(process.env.SENTRY_DSN),
    });
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 0.2,
      enabled: Boolean(process.env.SENTRY_DSN),
    });
  }
}

export const onRequestError = Sentry.captureRequestError;
