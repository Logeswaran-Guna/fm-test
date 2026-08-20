"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import BackButton from "../components/BackButton";
import PasswordField from "../components/PasswordField";
import { createClient } from "@/lib/supabase/client";
import { getCurrentProfile, homePathForRole } from "@/lib/supabase/profile";

export default function SetNewPasswordPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const supabase = createClient();
      const profile = await getCurrentProfile(supabase);
      if (!active) return;
      if (!profile) {
        router.replace("/login");
        return;
      }
      if (!profile.must_change_password) {
        router.replace(homePathForRole(profile.role));
        return;
      }
      setChecking(false);
    })();
    return () => {
      active = false;
    };
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message || "Could not update your password.");
        return;
      }
      const { error: clearError } = await supabase.rpc("clear_must_change_password");
      if (clearError) {
        setError(clearError.message);
        return;
      }
      setDone(true);
      await supabase.auth.signOut();
      setTimeout(() => router.push("/login"), 2000);
    } catch {
      setError("We couldn't reach the server. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  }

  if (checking) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 bg-slate-50" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <BackButton />
      <main className="flex-1 bg-slate-50">
        <section className="bg-navy">
          <div className="mx-auto max-w-3xl px-6 py-14 text-center sm:px-8">
            <div className="mx-auto flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber">
              <span className="h-px w-4 bg-amber" />
              Set a Permanent Password
              <span className="h-px w-4 bg-amber" />
            </div>
            <h1 className="mt-4 font-heading text-3xl font-bold text-white sm:text-4xl">
              Choose your new password
            </h1>
            <p className="mt-3 max-w-md mx-auto text-sm text-white/60">
              Our team gave you a temporary password to get back in — set a permanent one now to
              continue.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-md px-6 py-12 sm:px-8">
          {done ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber/10 text-2xl font-bold text-amber">
                ✓
              </div>
              <h2 className="mt-5 font-heading text-xl font-semibold text-navy">
                Password updated
              </h2>
              <p className="mt-3 text-sm text-slate-500">
                Log back in with your new password to continue.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              noValidate
              className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
            >
              <PasswordField
                label="New Password"
                value={password}
                onChange={setPassword}
                placeholder="At least 8 characters"
              />
              <PasswordField
                label="Confirm New Password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Re-enter your new password"
              />

              {error && (
                <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-amber px-6 py-3 text-sm font-semibold text-navy shadow-lg shadow-amber/30 transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Saving…" : "Set Password & Log In Again"}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
