"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
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
}: {
  testimonial: Testimonial;
  dark: boolean;
  variant: { bg: string; accent: string };
}) {
  return (
    <div
      className={`relative flex h-full flex-col overflow-hidden rounded-2xl border p-6 shadow-sm sm:p-7 ${
        dark ? "border-white/10" : "border-slate-200 bg-white"
      }`}
      style={dark ? { backgroundColor: variant.bg } : undefined}
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

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .rpc("testimonials_public")
      .then(({ data }) => setTestimonials((data ?? []) as Testimonial[]));
  }, []);

  if (testimonials.length === 0) return null;

  let darkIndex = 0;

  return (
    <section className="bg-[#FEEFE6] pt-8 pb-12 sm:pt-10 sm:pb-16">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="mb-10 max-w-2xl">
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

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => {
            const isDark = i % 3 === 1;
            const variant = isDark ? DARK_VARIANTS[darkIndex++ % DARK_VARIANTS.length] : DARK_VARIANTS[0];
            return <TestimonialCard key={t.id} testimonial={t} dark={isDark} variant={variant} />;
          })}
        </div>
      </div>
    </section>
  );
}
