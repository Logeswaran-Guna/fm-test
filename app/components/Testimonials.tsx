"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getCurrentProfile, type Profile } from "@/lib/supabase/profile";
import fmLockup from "../../public/images/fm-header-logo.png";
import fmLockupWhite from "../../public/images/fm-lockup-white.png";
import fmMark from "../../public/images/fm-icon-mark.png";
import fmMarkWhite from "../../public/images/fm-icon-mark-white.png";

type Testimonial = {
  id: string;
  author_name: string;
  author_role: string | null;
  quote: string;
  rating: number;
};

// Three deep jewel tones instead of one repeating navy, so every third card
// doesn't read as the same near-black block — each pairs with a warm or
// cool accent from the existing brand palette for contrast.
const DARK_VARIANTS = [
  { bg: "#0a192f", accent: "#4FE5D7" }, // navy + teal
  { bg: "#0B4F45", accent: "#f59e0b" }, // deep teal + amber
  { bg: "#3B2145", accent: "#f59e0b" }, // deep plum + amber
];

function Stars({ rating, dark, accent }: { rating: number; dark?: boolean; accent?: string }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          width="15"
          height="15"
          fill={i < rating ? (dark ? accent : "#0f7c6c") : "none"}
          stroke={i < rating ? "none" : dark ? "rgba(255,255,255,0.35)" : "#cbd5e1"}
          strokeWidth="1.2"
        >
          <path d="M10 1.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8L10 14.8l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z" />
        </svg>
      ))}
    </div>
  );
}

function TestimonialCard({
  testimonial,
  dark,
  variant,
  revealed,
  delayMs,
}: {
  testimonial: Testimonial;
  dark: boolean;
  variant: { bg: string; accent: string };
  revealed: boolean;
  delayMs: number;
}) {
  return (
    <div
      className={`relative flex h-full flex-col overflow-hidden rounded-2xl border p-6 shadow-sm sm:p-7 ${
        dark ? "border-white/10" : "border-slate-200 bg-white"
      } ${revealed ? "" : "opacity-0"}`}
      style={{
        ...(dark ? { backgroundColor: variant.bg } : {}),
        ...(revealed ? { animation: `fade-in-up 550ms ease ${delayMs}ms both` } : {}),
      }}
    >
      {/* Large low-opacity FM watermark, bleeding off the bottom-left corner.
          Dark tiles use the white silhouette mark, since the colored mark's
          navy/teal tones are nearly invisible against a dark card. */}
      <Image
        src={dark ? fmMarkWhite : fmMark}
        alt=""
        aria-hidden
        className={`pointer-events-none absolute -bottom-8 -left-10 h-40 w-40 select-none ${
          dark ? "opacity-[0.18]" : "opacity-[0.12]"
        }`}
      />
      {/* Small dot-grid accent, top-right */}
      <div className="pointer-events-none absolute right-5 top-5 grid grid-cols-3 gap-1" aria-hidden>
        {Array.from({ length: 9 }, (_, i) => (
          <span
            key={i}
            className={`h-1 w-1 rounded-full ${dark ? "" : "bg-amber/40"}`}
            style={dark ? { backgroundColor: `${variant.accent}66` } : undefined}
          />
        ))}
      </div>

      <div className="relative z-10 flex items-center gap-2">
        <Image src={dark ? fmLockupWhite : fmLockup} alt="Future Minds" className="h-6 w-auto" />
      </div>

      <svg
        className={`relative z-10 mt-4 h-7 w-7 ${dark ? "" : "text-amber-500/70"}`}
        viewBox="0 0 24 24"
        fill="currentColor"
        style={dark ? { color: `${variant.accent}b3` } : undefined}
      >
        <path d="M9.5 6C6.5 7.8 5 10 5 12.8c0 2.4 1.5 4 3.6 4 1.7 0 3-1.2 3-3 0-1.6-1.1-2.7-2.6-2.9.4-1.5 1.6-2.9 3.5-4L9.5 6zm9 0C15.5 7.8 14 10 14 12.8c0 2.4 1.5 4 3.6 4 1.7 0 3-1.2 3-3 0-1.6-1.1-2.7-2.6-2.9.4-1.5 1.6-2.9 3.5-4L18.5 6z" />
      </svg>

      <p
        className={`relative z-10 mt-3 flex-1 text-sm leading-relaxed sm:text-[15px] ${
          dark ? "text-slate-200" : "text-slate-600"
        }`}
      >
        {testimonial.quote}
      </p>

      <div className="relative z-10 mt-5">
        <Stars rating={testimonial.rating} dark={dark} accent={variant.accent} />
        <p className={`mt-3 font-heading text-sm font-semibold ${dark ? "text-white" : "text-navy"}`}>
          {testimonial.author_name}
        </p>
        {testimonial.author_role && (
          <p className={`text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>{testimonial.author_role}</p>
        )}
      </div>
    </div>
  );
}

function RatingPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }, (_, i) => {
        const star = i + 1;
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            aria-label={`${star} star${star === 1 ? "" : "s"}`}
            className="p-0.5"
          >
            <svg
              viewBox="0 0 20 20"
              width="22"
              height="22"
              fill={star <= value ? "#0f7c6c" : "none"}
              stroke={star <= value ? "none" : "#cbd5e1"}
              strokeWidth="1.2"
            >
              <path d="M10 1.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8L10 14.8l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}

function SubmitTestimonialModal({ onClose }: { onClose: () => void }) {
  const [authorName, setAuthorName] = useState("");
  const [authorRole, setAuthorRole] = useState("");
  const [quote, setQuote] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!authorName.trim() || !quote.trim()) {
      setError("Display name and your story are both required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: rpcError } = await supabase.rpc("submit_testimonial", {
        p_quote: quote.trim(),
        p_author_name: authorName.trim(),
        p_author_role: authorRole.trim() || null,
        p_rating: rating,
      });
      if (rpcError) throw new Error(rpcError.message);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit your story.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-navy/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {submitted ? (
          <div className="py-6 text-center">
            <h3 className="font-heading text-lg font-semibold text-navy">Thank you!</h3>
            <p className="mt-2 text-sm text-slate-500">
              Your story is under review — our team will publish it once it&apos;s approved.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 rounded-xl bg-amber px-6 py-2.5 text-sm font-semibold text-navy"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-amber-700">Share your story</p>
                <h3 className="font-heading text-lg font-semibold text-navy">What was your experience?</h3>
              </div>
              <button type="button" onClick={onClose} className="text-slate-400 hover:text-navy">
                ✕
              </button>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-navy">
                How you&apos;d like to be shown
              </label>
              <input
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="e.g. Parent of Aadhya, or Anitha K."
                required
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber/50"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-navy">Role (optional)</label>
              <input
                value={authorRole}
                onChange={(e) => setAuthorRole(e.target.value)}
                placeholder="e.g. Parent, Chennai or Mathematics Tutor"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber/50"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-navy">Your story</label>
              <textarea
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                rows={4}
                required
                placeholder="What actually made a difference for you?"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber/50"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-navy">Rating</label>
              <RatingPicker value={rating} onChange={setRating} />
            </div>

            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-amber px-6 py-3 text-sm font-semibold text-navy shadow-lg shadow-amber/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Submitting…" : "Submit Story"}
            </button>
            <p className="text-center text-[11px] text-slate-400">
              Reviewed by our team before it appears on the homepage.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

function ShareStoryTile({ profile }: { profile: Profile | null }) {
  const [modalOpen, setModalOpen] = useState(false);
  const canSubmit = profile?.role === "PARENT" || profile?.role === "TEACHER";

  return (
    <>
      <div className="flex shrink-0 items-center gap-4 rounded-2xl border-2 border-dashed border-amber/40 bg-amber/5 px-5 py-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber/15 text-amber-700">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8" />
            <path d="M12 6H4a2 2 0 00-2 2v9a2 2 0 002 2h3l2 2.5L11 19h5a2 2 0 002-2v-2" />
          </svg>
        </div>
        <div className="min-w-0">
          <h3 className="font-heading text-sm font-semibold text-navy">Share your story</h3>
          <p className="mt-0.5 max-w-[220px] text-xs text-slate-500">
            {canSubmit
              ? "Tell other families what your experience was like."
              : "Have you worked with Future Minds? Log in to share your story."}
          </p>
        </div>
        {canSubmit ? (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="shrink-0 whitespace-nowrap rounded-full bg-navy px-4 py-2 text-xs font-semibold text-white transition-transform hover:-translate-y-0.5"
          >
            Write one
          </button>
        ) : (
          <Link
            href="/login"
            className="shrink-0 whitespace-nowrap rounded-full bg-navy px-4 py-2 text-xs font-semibold text-white transition-transform hover:-translate-y-0.5"
          >
            Log in
          </Link>
        )}
      </div>
      {modalOpen && <SubmitTestimonialModal onClose={() => setModalOpen(false)} />}
    </>
  );
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .rpc("testimonials_public")
      .then(({ data }) => setTestimonials((data ?? []) as Testimonial[]));
    getCurrentProfile(supabase).then(setProfile);
  }, []);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      const id = setTimeout(() => setRevealed(true), 0);
      return () => clearTimeout(id);
    }

    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [testimonials.length]);

  if (testimonials.length === 0) return null;

  let darkIndex = 0;

  return (
    <section ref={sectionRef} className="bg-[#FEEFE6] pt-8 pb-12 sm:pt-10 sm:pb-16">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div
          className={`mb-10 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center ${
            revealed ? "" : "opacity-0"
          }`}
          style={revealed ? { animation: "fade-in-up 550ms ease both" } : undefined}
        >
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">
              <span className="h-px w-6 bg-amber-700" aria-hidden />
              What families &amp; tutors say
            </span>
            <h2 className="mt-3 font-heading text-2xl font-semibold text-navy sm:text-3xl">
              Real stories from the Future Minds community
            </h2>
            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              Parents and tutors on what actually made a difference — coordination, verification, and follow-through.
            </p>
          </div>

          {profile?.role !== "ADMIN" && <ShareStoryTile profile={profile} />}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => {
            const isDark = i % 3 === 1;
            const variant = isDark ? DARK_VARIANTS[darkIndex++ % DARK_VARIANTS.length] : DARK_VARIANTS[0];
            return (
              <TestimonialCard
                key={t.id}
                testimonial={t}
                dark={isDark}
                variant={variant}
                revealed={revealed}
                delayMs={100 + i * 80}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
