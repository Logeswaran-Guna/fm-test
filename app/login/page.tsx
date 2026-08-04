"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import BackButton from "../components/BackButton";
import LoginBackground from "../components/LoginBackground";
import { createClient } from "@/lib/supabase/client";
import { getCurrentProfile, homePathForRole, type Role } from "@/lib/supabase/profile";

const ROLE_TABS: { label: string; role: Role }[] = [
  { label: "Admin", role: "ADMIN" },
  { label: "Parent / Student", role: "PARENT" },
  { label: "Teacher / Tutor", role: "TEACHER" },
];

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<Role>("PARENT");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSubmitting, setForgotSubmitting] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError(signInError.message || "Could not sign in.");
        return;
      }

      const profile = await getCurrentProfile(supabase);
      if (!profile) {
        setError("Signed in, but we couldn't load your account. Please try again.");
        return;
      }

      if (profile.role !== selectedRole) {
        await supabase.auth.signOut();
        const roleLabel = ROLE_TABS.find((r) => r.role === profile.role)?.label ?? profile.role;
        setError(
          `This account is registered as ${roleLabel}, not ${ROLE_TABS.find((r) => r.role === selectedRole)?.label}. Please choose the correct option above.`
        );
        return;
      }

      router.push(homePathForRole(profile.role));
      router.refresh();
    } catch {
      setError("We couldn't reach the server. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleForgotSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setForgotSubmitting(true);
    setForgotError(null);

    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        forgotEmail.trim(),
        { redirectTo: `${window.location.origin}/reset-password` }
      );
      if (resetError) {
        setForgotError(resetError.message);
        return;
      }
      setForgotSent(true);
    } catch {
      setForgotError("We couldn't reach the server. Please check your connection.");
    } finally {
      setForgotSubmitting(false);
    }
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
              Welcome Back
              <span className="h-px w-4 bg-amber" />
            </div>
            <h1 className="mt-4 font-heading text-3xl font-bold text-white sm:text-4xl">
              Log in to Future Minds
            </h1>
          </div>
        </section>

        <div className="relative">
        <LoginBackground />
        <div className="relative z-10 mx-auto max-w-md px-6 py-16 sm:px-8 md:absolute md:left-1/2 md:top-[15%] md:w-full md:-translate-x-1/2 md:py-0">
          <div className="mb-5 flex rounded-full border border-slate-200 bg-white p-1">
            {ROLE_TABS.map((tab) => (
              <button
                key={tab.role}
                type="button"
                onClick={() => {
                  setSelectedRole(tab.role);
                  setError(null);
                }}
                className={`flex-1 rounded-full px-3 py-2 text-xs font-semibold transition-colors ${
                  selectedRole === tab.role ? "bg-navy text-white" : "text-slate-500 hover:text-navy"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {forgotMode ? (
            <form
              onSubmit={handleForgotSubmit}
              noValidate
              className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
            >
              {forgotSent ? (
                <div className="text-center">
                  <p className="text-sm text-slate-600">
                    If an account exists for <strong>{forgotEmail}</strong>, a
                    password reset link has been sent to it.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotMode(false);
                      setForgotSent(false);
                    }}
                    className="mt-4 text-sm font-semibold text-amber-700 underline"
                  >
                    Back to login
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-navy">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber/50"
                    />
                  </div>
                  {forgotError && (
                    <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                      {forgotError}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={forgotSubmitting}
                    className="w-full rounded-xl bg-amber px-6 py-3 text-sm font-semibold text-navy shadow-lg shadow-amber/30 transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {forgotSubmitting ? "Sending…" : "Send reset link"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setForgotMode(false)}
                    className="w-full text-center text-sm font-semibold text-slate-500 underline"
                  >
                    Back to login
                  </button>
                </>
              )}
            </form>
          ) : (
            <form
              onSubmit={handleSubmit}
              noValidate
              className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
            >
              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber/50"
                />
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="block text-sm font-medium text-navy">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotMode(true);
                      setForgotEmail(email);
                    }}
                    className="text-xs font-semibold text-amber-700 underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 pr-11 text-sm text-navy placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-navy"
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M3 3l18 18" strokeLinecap="round" />
                        <path d="M10.58 10.58a2 2 0 002.83 2.83" strokeLinecap="round" />
                        <path d="M9.36 5.32A9.77 9.77 0 0112 5c5 0 9 4.5 10 7-.34.94-1.02 2.1-2.02 3.2M6.53 6.53C4.6 7.86 3.14 9.72 2 12c1 2.5 5 7 10 7 1.36 0 2.62-.28 3.74-.76" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" strokeLinejoin="round" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-amber px-6 py-3 text-sm font-semibold text-navy shadow-lg shadow-amber/30 transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {submitting ? "Signing in…" : "Log in"}
              </button>

              {selectedRole === "PARENT" && (
                <p className="text-center text-xs text-slate-400">
                  New parent?{" "}
                  <a href="/find-tutor" className="font-semibold text-amber-700 underline">
                    Submit a requirement
                  </a>{" "}
                  to create your account.
                </p>
              )}

              {selectedRole === "TEACHER" && (
                <p className="text-center text-xs text-slate-400">
                  New Tutor?{" "}
                  <a href="/become-a-tutor" className="font-semibold text-amber-700 underline">
                    Apply to become a Tutor
                  </a>{" "}
                  to create your account.
                </p>
              )}
            </form>
          )}
        </div>
        </div>
      </main>
    </div>
  );
}
