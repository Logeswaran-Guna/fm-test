"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Perk = {
  title: string;
  description: string;
  icon: ReactNode;
};

const parentPerks: Perk[] = [
  {
    title: "One fee, not a subscription",
    description:
      "Pay once when we match you with the right tutor — no recurring platform fee stacked on top every month.",
    icon: (
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2.5" y="6" width="19" height="13" rx="2.2" />
        <path d="M2.5 10h19" />
        <circle cx="16.5" cy="14.5" r="1.4" />
      </svg>
    ),
  },
  {
    title: "Verified, then trusted",
    description:
      "Every tutor is KYC-checked, and every class is confirmed by you before any payment goes out — nothing on faith.",
    icon: (
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l7 3v5c0 4.6-2.9 8.4-7 10-4.1-1.6-7-5.4-7-10V6l7-3z" />
        <path d="M9 12l2 2 4-4.5" />
      </svg>
    ),
  },
  {
    title: "10% off Future Minds Academy",
    description:
      "A discount on Academy enrichment courses for your child — just for being a matched Future Minds family.",
    icon: (
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="7" cy="7" r="3.2" />
        <circle cx="17" cy="17" r="3.2" />
        <path d="M18.5 5.5l-13 13" />
      </svg>
    ),
  },
];

const tutorPerks: Perk[] = [
  {
    title: "10% off your own learning",
    description:
      "Pick up a new subject or a soft skill yourself through Future Minds Academy — 10% off, for as long as you teach with us.",
    icon: (
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="7" cy="7" r="3.2" />
        <circle cx="17" cy="17" r="3.2" />
        <path d="M18.5 5.5l-13 13" />
      </svg>
    ),
  },
  {
    title: "We do the chasing, you do the teaching",
    description:
      "In Community Pooling, we coordinate the batch and collect from every family — our share pays for real work done for you.",
    icon: (
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="9" r="3" />
        <circle cx="17" cy="9" r="2.5" />
        <path d="M2.5 20c0-3.3 2.5-6 5.5-6s5.5 2.7 5.5 6" />
        <path d="M14.5 14.5c2.5.3 4.5 2.6 4.5 5.5" />
      </svg>
    ),
  },
];

function PerkItem({
  perk,
  badgeClass,
  titleHoverClass,
  revealed,
  delayMs,
}: {
  perk: Perk;
  badgeClass: string;
  titleHoverClass: string;
  revealed: boolean;
  delayMs: number;
}) {
  return (
    <li
      className={`group flex gap-3 ${revealed ? "" : "opacity-0"}`}
      style={revealed ? { animation: `fade-in-up 550ms ease ${delayMs}ms both` } : undefined}
    >
      <span
        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl shadow-sm transition-transform duration-300 ease-out group-hover:scale-110 group-hover:-rotate-3 ${badgeClass}`}
        aria-hidden
      >
        {perk.icon}
      </span>
      <p className="text-sm leading-relaxed text-slate-600 transition-transform duration-300 ease-out group-hover:translate-x-1">
        <span className={`font-heading font-semibold text-navy transition-colors duration-300 ${titleHoverClass}`}>
          {perk.title}
        </span>
        {" — "}
        {perk.description}
      </p>
    </li>
  );
}

function Typewriter({ text, start, reduceMotion }: { text: string; start: boolean; reduceMotion: boolean }) {
  const [count, setCount] = useState(reduceMotion ? text.length : 0);
  const [phase, setPhase] = useState<"typing" | "deleting">("typing");

  useEffect(() => {
    if (reduceMotion) {
      const id = setTimeout(() => setCount(text.length), 0);
      return () => clearTimeout(id);
    }
    if (!start) return;

    if (phase === "typing") {
      if (count < text.length) {
        const id = setTimeout(() => setCount((c) => c + 1), 32);
        return () => clearTimeout(id);
      }
      const id = setTimeout(() => setPhase("deleting"), 1800);
      return () => clearTimeout(id);
    }

    if (count > 0) {
      const id = setTimeout(() => setCount((c) => c - 1), 18);
      return () => clearTimeout(id);
    }
    const id = setTimeout(() => setPhase("typing"), 500);
    return () => clearTimeout(id);
  }, [start, count, phase, text, reduceMotion]);

  return (
    <span aria-label={text}>
      <span aria-hidden>
        {text.slice(0, count)}
        {!reduceMotion && (
          <span
            className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] bg-amber align-middle"
            style={{ animation: "pulse-soft 1s ease-in-out infinite" }}
          />
        )}
      </span>
    </span>
  );
}

export default function PerksAndBenefits() {
  const sectionRef = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    Promise.resolve().then(() => {
      setReduceMotion(prefersReduced);
      if (prefersReduced) setRevealed(true);
    });
    if (prefersReduced) return;

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
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-white to-[#EAF7F4] py-8 sm:py-10"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-300/25 blur-3xl"
        style={reduceMotion ? undefined : { animation: "float-slow 7s ease-in-out infinite" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-[#4FE5D7]/25 blur-3xl"
        style={reduceMotion ? undefined : { animation: "float-slower 9s ease-in-out infinite" }}
      />

      <div className="relative mx-auto max-w-7xl px-6 sm:px-8">
        <div
          className={`mb-6 max-w-2xl ${revealed ? "" : "opacity-0"}`}
          style={revealed ? { animation: "fade-in-up 550ms ease both" } : undefined}
        >
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">
            <span className="h-px w-6 bg-amber-700" aria-hidden />
            Perks &amp; Benefits
          </span>
          <h2 className="mt-3 font-heading text-2xl font-semibold text-navy sm:text-3xl">
            What you get beyond the match
          </h2>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">
            A one-time fee from parents, a small share from Community Pooling — and in return, real perks flow back
            to both sides of the table.
          </p>
        </div>

        <div
          className={`mb-8 flex items-start gap-4 overflow-hidden rounded-2xl border-2 border-amber bg-navy px-5 py-4 shadow-md sm:px-7 sm:py-5 ${revealed ? "" : "opacity-0"}`}
          style={revealed ? { animation: "fade-in-up 550ms ease 60ms both" } : undefined}
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 to-amber-500 text-navy shadow-sm">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2.5 8L12 3.5 21.5 8 12 12.5 2.5 8z" />
              <path d="M6 10.2v4.3c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.3" />
              <path d="M21.5 8v6" />
            </svg>
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wide text-amber">Our Commitment</span>
            <p className="mt-1 min-h-[1.5em] font-heading text-lg font-semibold text-white sm:text-xl">
              <Typewriter
                text="Free Access to Training Materials"
                start={revealed}
                reduceMotion={reduceMotion}
              />
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-300">
              For kids and tutors alike — class and subject-specific material where it matters, plus general
              resources for everyone. Free, always — our investment in you, not a cost to you.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <span className="inline-flex items-center rounded-full bg-navy px-3.5 py-1 font-heading text-xs font-semibold uppercase tracking-wide text-amber">
              For Parents
            </span>
            <ul className="mt-4 space-y-3.5">
              {parentPerks.map((perk, i) => (
                <PerkItem
                  key={perk.title}
                  perk={perk}
                  badgeClass="bg-gradient-to-br from-amber-400 to-amber-600"
                  titleHoverClass="group-hover:text-amber-700"
                  revealed={revealed}
                  delayMs={100 + i * 90}
                />
              ))}
            </ul>
          </div>

          <div>
            <span className="inline-flex items-center rounded-full bg-[#0f7c6c] px-3.5 py-1 font-heading text-xs font-semibold uppercase tracking-wide text-white">
              For Tutors
            </span>
            <ul className="mt-4 space-y-3.5">
              {tutorPerks.map((perk, i) => (
                <PerkItem
                  key={perk.title}
                  perk={perk}
                  badgeClass="bg-gradient-to-br from-[#14A398] to-[#0f7c6c]"
                  titleHoverClass="group-hover:text-[#0f7c6c]"
                  revealed={revealed}
                  delayMs={100 + i * 90}
                />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
