"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import BackButton from "../components/BackButton";
import { createClient } from "@/lib/supabase/client";
import { getCurrentProfile, homePathForRole } from "@/lib/supabase/profile";

// Landing page for the confirmation email link (see emailRedirectTo in
// lib/supabase/auth-helpers.ts). Deliberately doesn't try to parse
// Supabase's exact error codes to tell apart "link already used" from
// "expired" from "opened on a different device than the one that signed
// up" (a PKCE code-verifier mismatch, which produces no error param at
// all, just a silent failed exchange) — those all mean the same thing to
// the person reading this page, so this just checks the one thing that
// actually matters: is there a session now? If yes, confirmation just
// completed successfully. If no, treat it as an already-confirmed account
// and point them at a normal login instead.
export default function EmailConfirmedPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "verified" | "already">("checking");
  // A closed-over `status` check inside the effect below would always see
  // this render's initial value ("checking"), never the updated one — a
  // ref is what actually stops check() from running its body more than
  // once when both the timeout and an auth event fire close together.
  const checkedRef = useRef(false);

  useEffect(() => {
    let active = true;
    const supabase = createClient();

    async function check() {
      if (!active || checkedRef.current) return;
      checkedRef.current = true;
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!active) return;

      if (user) {
        setStatus("verified");
        const profile = await getCurrentProfile(supabase);
        if (!active) return;
        setTimeout(() => {
          router.push(profile ? homePathForRole(profile.role) : "/login");
        }, 2500);
      } else {
        setStatus("already");
      }
    }

    // The client library exchanges the confirmation code for a session
    // automatically on load — these events fire once that's actually
    // settled, rather than us checking before it's had a chance to run.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "INITIAL_SESSION") check();
    });
    // Fallback in case neither event fires (e.g. the exchange failed
    // silently) — concludes "already confirmed, please log in" after a
    // short wait rather than hanging on "Checking..." forever.
    const timeout = setTimeout(check, 1500);

    return () => {
      active = false;
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <BackButton />
      <main className="flex-1 bg-slate-50">
        <div className="mx-auto max-w-md px-6 py-16 sm:px-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            {status === "checking" ? (
              <p className="py-8 text-sm text-slate-400">Checking your confirmation…</p>
            ) : status === "verified" ? (
              <>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber/10 text-2xl font-bold text-amber">
                  ✓
                </div>
                <h1 className="mt-5 font-heading text-xl font-semibold text-navy">
                  Email verified!
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-slate-500">
                  You&apos;ve successfully verified your email with Future Minds. Taking you in…
                </p>
              </>
            ) : (
              <>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber/10 text-2xl font-bold text-amber">
                  ✓
                </div>
                <h1 className="mt-5 font-heading text-xl font-semibold text-navy">
                  Already verified
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-slate-500">
                  You&apos;ve already verified your email with Future Minds. Please log in with
                  your email and password.
                </p>
                <Link
                  href="/login"
                  className="mt-6 inline-flex items-center justify-center rounded-xl bg-amber px-6 py-3 text-sm font-semibold text-navy shadow-lg shadow-amber/30 transition-transform hover:-translate-y-0.5"
                >
                  Log in
                </Link>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
