"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
          <h1 className="font-heading text-xl font-semibold text-navy">Something went wrong.</h1>
          <p className="text-sm text-slate-500">
            Our team has been notified. Please try again, or refresh the page.
          </p>
        </div>
      </body>
    </html>
  );
}
