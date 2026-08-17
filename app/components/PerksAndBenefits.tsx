"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import fmMark from "../../public/images/fm-icon-mark.png";

type Benefit = {
  title: string;
  description: string;
  icon: ReactNode;
  tint: string;
};

const walletIcon = (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2.5" y="6" width="19" height="13" rx="2.2" />
    <path d="M2.5 10h19" />
    <circle cx="16.5" cy="14.5" r="1.4" />
  </svg>
);

const shieldIcon = (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l7 3v5c0 4.6-2.9 8.4-7 10-4.1-1.6-7-5.4-7-10V6l7-3z" />
    <path d="M9 12l2 2 4-4.5" />
  </svg>
);

const calendarCheckIcon = (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4.5" width="18" height="16.5" rx="2.2" />
    <path d="M3 9.5h18" />
    <path d="M8 2.5v4M16 2.5v4" />
    <path d="M8.5 14.5l2 2 4-4.5" />
  </svg>
);

const gradCapIcon = (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 8L12 3.5 21.5 8 12 12.5 2.5 8z" />
    <path d="M6 10.2v4.3c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.3" />
    <path d="M21.5 8v6" />
  </svg>
);

const poolingIcon = (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="9" r="3" />
    <circle cx="17" cy="9" r="2.5" />
    <path d="M2.5 20c0-3.3 2.5-6 5.5-6s5.5 2.7 5.5 6" />
    <path d="M14.5 14.5c2.5.3 4.5 2.6 4.5 5.5" />
  </svg>
);

const heartHandIcon = (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20.5s-7.5-4.6-9.7-9.1C1 8.3 2.7 4.6 6.4 4.6c2.1 0 3.7 1.3 5.6 3.4 1.9-2.1 3.5-3.4 5.6-3.4 3.7 0 5.4 3.7 4.1 6.8-2.2 4.5-9.7 9.1-9.7 9.1z" />
  </svg>
);

const trendingUpIcon = (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 17l6-6 4 4 8-9" />
    <path d="M15 6h6v6" />
  </svg>
);

const noSubscriptionIcon = (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2.5" y="5.5" width="19" height="13" rx="2.2" />
    <path d="M2.5 9.5h19" />
    <path d="M4.5 4l15 16" />
  </svg>
);

const giftIcon = (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="8.5" width="18" height="12.5" rx="1.4" />
    <path d="M3 12.5h18" />
    <path d="M12 8.5v12.5" />
    <path d="M7.8 8.5a2.6 2.6 0 010-5.2C10.5 3.3 12 8.5 12 8.5s1.5-5.2 4.2-5.2a2.6 2.6 0 010 5.2" />
  </svg>
);

const parentBenefits: Benefit[] = [
  {
    title: "One-time Fee",
    description: "Pay only when we match — no subscription, no hidden fees.",
    icon: walletIcon,
    tint: "bg-amber-100 text-amber-600",
  },
  {
    title: "Verified Tutors",
    description: "Every tutor is KYC-checked before your child's first class.",
    icon: shieldIcon,
    tint: "bg-sky-100 text-sky-600",
  },
  {
    title: "Attendance Assurance",
    description: "Confirm every class before any payment goes out.",
    icon: calendarCheckIcon,
    tint: "bg-violet-100 text-violet-600",
  },
  {
    title: "10% Academy Benefit",
    description: "Discount on Academy enrichment courses for your child.",
    icon: gradCapIcon,
    tint: "bg-[#0f7c6c]/10 text-[#0f7c6c]",
  },
];

const tutorBenefits: Benefit[] = [
  {
    title: "10% Academy Benefit",
    description: "Pick up a new subject or skill through Future Minds Academy.",
    icon: gradCapIcon,
    tint: "bg-[#0f7c6c]/10 text-[#0f7c6c]",
  },
  {
    title: "Community Pooling",
    description: "We coordinate the batch and collect from every family.",
    icon: poolingIcon,
    tint: "bg-amber-100 text-amber-600",
  },
  {
    title: "We Do the Chasing",
    description: "Zero follow-ups. You focus on teaching, we manage parents.",
    icon: heartHandIcon,
    tint: "bg-rose-100 text-rose-600",
  },
  {
    title: "Long-term Opportunities",
    description: "Be part of a growing platform — referrals and repeat matches as we expand.",
    icon: trendingUpIcon,
    tint: "bg-violet-100 text-violet-600",
  },
];

const trustStrip = [
  { title: "Verified Tutors", caption: "Learn with confidence", icon: shieldIcon },
  { title: "Attendance Tracked", caption: "Every class accounted for", icon: calendarCheckIcon },
  { title: "No Subscription", caption: "Pay only when matched", icon: noSubscriptionIcon },
  { title: "Free Registration", caption: "Join the Future Minds community", icon: giftIcon },
];

function BenefitCard({ benefit, revealed, delayMs }: { benefit: Benefit; revealed: boolean; delayMs: number }) {
  return (
    <div
      className={`group flex items-start gap-2.5 rounded-[18px] border border-slate-200/70 bg-white/90 p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_1px_10px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-200 hover:shadow-[0_4px_14px_rgba(15,23,42,0.08)] ${revealed ? "" : "opacity-0"}`}
      style={revealed ? { animation: `fade-in-up 550ms ease ${delayMs}ms both` } : undefined}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${benefit.tint}`}
        aria-hidden
      >
        {benefit.icon}
      </span>
      <div className="min-w-0">
        <p className="font-heading text-[15px] font-semibold leading-tight text-navy">{benefit.title}</p>
        <p className="mt-0.5 text-[12.5px] leading-snug text-slate-500">{benefit.description}</p>
      </div>
    </div>
  );
}

// Simple line-art open book with floating accent icons — evokes "training
// materials" without leaning on a stock/photorealistic illustration that
// wouldn't match the rest of the site's flat icon language.
function TrainingIllustration() {
  return (
    <svg viewBox="0 0 140 120" width="120" height="103" className="shrink-0" aria-hidden>
      <defs>
        <radialGradient id="perksGlow" cx="50%" cy="55%" r="55%">
          <stop offset="0%" stopColor="#4FE5D7" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#4FE5D7" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="perksBook" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4FE5D7" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <circle cx="70" cy="66" r="46" fill="url(#perksGlow)" />
      <path
        d="M70 46c-9-6-22-8-32-5v42c10-3 23-1 32 5 9-6 22-8 32-5V41c-10-3-23-1-32 5z"
        fill="none"
        stroke="url(#perksBook)"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path d="M70 46v42" stroke="url(#perksBook)" strokeWidth="2.2" />
      <path d="M44 52c6-1.5 13-1 18 1.5M44 61c6-1.5 13-1 18 1.5M44 70c6-1.5 13-1 18 1.5" stroke="#4FE5D7" strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
      <path d="M78 53.5c5-2.5 12-3 18-1.5M78 62.5c5-2.5 12-3 18-1.5M78 71.5c5-2.5 12-3 18-1.5" stroke="#f59e0b" strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />

      <g transform="translate(16,14)">
        <circle cx="12" cy="12" r="12" fill="#0f2a4d" stroke="#4FE5D7" strokeWidth="1.4" />
        <path d="M9 7.5l7 4.5-7 4.5v-9z" fill="#4FE5D7" />
      </g>
      <g transform="translate(100,10)">
        <circle cx="12" cy="12" r="12" fill="#0f2a4d" stroke="#f59e0b" strokeWidth="1.4" />
        <path d="M7 15V9M12 15V6M17 15v-5" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" />
      </g>
      <g transform="translate(104,80)">
        <circle cx="12" cy="12" r="12" fill="#0f2a4d" stroke="#4FE5D7" strokeWidth="1.4" />
        <circle cx="12" cy="12" r="3.2" stroke="#4FE5D7" strokeWidth="1.4" fill="none" />
        <ellipse cx="12" cy="12" rx="8.5" ry="3.4" stroke="#4FE5D7" strokeWidth="1.2" fill="none" />
        <ellipse cx="12" cy="12" rx="8.5" ry="3.4" stroke="#4FE5D7" strokeWidth="1.2" fill="none" transform="rotate(60 12 12)" />
      </g>
      <circle cx="30" cy="20" r="1.6" fill="#4FE5D7" />
      <circle cx="112" cy="52" r="1.6" fill="#f59e0b" />
      <circle cx="24" cy="94" r="1.6" fill="#4FE5D7" />
    </svg>
  );
}

// The center "bridge" — replaces the old sun-ray badge. A thin orbit ring
// carries a few tiny colored nodes around the FM mark, a small particle
// drifts through to suggest Parents -> FM -> Tutors, and the mark itself
// breathes almost imperceptibly. All motion is transform/opacity only and
// fully disabled under prefers-reduced-motion, leaving the static circle
// + caption intact.
function FMBridge() {
  return (
    <div className="flex flex-row items-center gap-4 py-2 lg:flex-col lg:gap-2.5 lg:py-0">
      <div className="relative flex h-36 w-36 shrink-0 items-center justify-center">
        <svg viewBox="0 0 128 128" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
          <circle cx="64" cy="64" r="54" fill="none" stroke="#0a192f" strokeOpacity="0.08" strokeWidth="1" />
          <g className="fm-bridge-orbit" style={{ transformOrigin: "64px 64px" }}>
            <circle cx="64" cy="10" r="3" fill="#18D4C5" />
            <circle cx="113" cy="87" r="2.6" fill="#4FE5D7" />
            <circle cx="19" cy="91" r="2.3" fill="#FF9933" />
            <circle cx="33" cy="19" r="1.9" fill="#8E8CF0" />
          </g>
        </svg>

        <div className="pointer-events-none absolute left-[-39px] right-[-39px] top-1/2 h-1.5 -translate-y-1/2 overflow-visible" aria-hidden>
          <span className="fm-bridge-particle absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[#18D4C5] shadow-[0_0_6px_rgba(24,212,197,0.8)]" />
        </div>

        <div className="fm-bridge-glow fm-emphasis-b relative flex h-20 w-20 items-center justify-center rounded-full border border-slate-200 bg-white shadow-md">
          <Image src={fmMark} alt="" aria-hidden className="h-9 w-auto" />
        </div>
      </div>

      <div className="text-center lg:max-w-[10.5rem]">
        <p className="text-[11px] italic leading-snug text-slate-500">
          The trusted bridge between learners and educators.
        </p>
        <span className="mx-auto mt-1.5 block h-px w-8 bg-gradient-to-r from-[#18D4C5] via-[#4FE5D7] to-[#FF9933]" aria-hidden />
      </div>

      <style>{`
        @keyframes fmBridgeOrbit {
          to { transform: rotate(360deg); }
        }
        @keyframes fmBridgeBreathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.015); }
        }
        @keyframes fmBridgeTravel {
          0% { transform: translateX(-39px); opacity: 0; }
          14% { opacity: 1; }
          50% { transform: translateX(0px); opacity: 1; }
          86% { opacity: 1; }
          100% { transform: translateX(39px); opacity: 0; }
        }
        /* Sequenced Parents -> FM -> Tutors emphasis: one shared keyframe,
           staggered via animation-delay so each zone lights up in turn
           every 9s. Each flash carries both brand accents at once — a
           tight teal ring with a softer saffron-gold ring just outside
           it — kept to a brief window near the start of each cycle so it
           reads as a passing highlight, not a persistent glow. */
        @keyframes fmEmphasisPulse {
          0%, 8%, 100% {
            box-shadow: 0 0 0 0 rgba(24, 212, 197, 0), 0 0 0 0 rgba(255, 153, 51, 0);
          }
          4% {
            box-shadow: 0 0 0 4px rgba(24, 212, 197, 0.2), 0 0 0 9px rgba(255, 153, 51, 0.14);
          }
        }
        .fm-bridge-orbit { animation: fmBridgeOrbit 10s linear infinite; }
        .fm-bridge-glow { animation: fmBridgeBreathe 3.6s ease-in-out infinite, fmEmphasisPulse 9s ease-in-out 3s infinite; }
        .fm-bridge-particle { animation: fmBridgeTravel 5s ease-in-out infinite; }
        .fm-emphasis-a { animation: fmEmphasisPulse 9s ease-in-out 0s infinite; border-radius: 18px; }
        .fm-emphasis-c { animation: fmEmphasisPulse 9s ease-in-out 6s infinite; border-radius: 18px; }
        @media (prefers-reduced-motion: reduce) {
          .fm-bridge-orbit, .fm-bridge-glow, .fm-bridge-particle, .fm-emphasis-a, .fm-emphasis-c { animation: none; }
          .fm-bridge-particle { display: none; }
        }
      `}</style>
    </div>
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
      className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-white to-[#EAF7F4] pt-6 pb-14 sm:pt-8 sm:pb-16"
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
          className={`mx-auto mb-10 max-w-2xl text-center ${revealed ? "" : "opacity-0"}`}
          style={revealed ? { animation: "fade-in-up 550ms ease both" } : undefined}
        >
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">
            <span className="h-px w-6 bg-amber-700" aria-hidden />
            Perks &amp; Benefits
            <span className="h-px w-6 bg-amber-700" aria-hidden />
          </span>
          <h2 className="mt-3 font-heading text-2xl font-semibold text-navy sm:text-3xl">
            What you get beyond the match
          </h2>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">One match. More value on both sides.</p>
        </div>

        <div
          className={`mb-10 flex flex-col items-center gap-6 overflow-hidden rounded-2xl border-2 border-amber bg-navy px-6 py-6 shadow-md sm:flex-row sm:px-8 sm:py-7 ${revealed ? "" : "opacity-0"}`}
          style={revealed ? { animation: "fade-in-up 550ms ease 60ms both" } : undefined}
        >
          <TrainingIllustration />
          <div className="min-w-0 text-center sm:text-left">
            <span className="text-[10px] font-bold uppercase tracking-wide text-amber">Our Commitment</span>
            <p className="mt-1 font-heading text-xl font-semibold text-white sm:text-2xl">
              <span className="text-amber">Free</span> Access to Training Materials
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-300">
              Class and subject-specific materials that help every learner go further —{" "}
              <span className="font-semibold text-white">completely free, always.</span>
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
              {["Curriculum Support", "Practice Resources", "Skill Development", "For Everyone"].map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white"
                >
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#4FE5D7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_auto_1fr] lg:gap-6">
          <div>
            <span className="inline-flex items-center rounded-full bg-navy px-3.5 py-1 font-heading text-xs font-semibold uppercase tracking-wide text-amber">
              For Parents
            </span>
            <h3 className="mt-2 font-heading text-lg font-semibold text-navy">Smarter, Safer &amp; Simpler</h3>
            <p className="mt-1 text-xs text-slate-500">Give your child the right guidance with complete peace of mind.</p>
            <div className="fm-emphasis-a mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {parentBenefits.map((benefit, i) => (
                <BenefitCard key={benefit.title} benefit={benefit} revealed={revealed} delayMs={120 + i * 70} />
              ))}
            </div>
          </div>

          <div className="lg:mt-14">
            <FMBridge />
          </div>

          <div>
            <span className="inline-flex items-center rounded-full bg-[#0f7c6c] px-3.5 py-1 font-heading text-xs font-semibold uppercase tracking-wide text-white">
              For Tutors
            </span>
            <h3 className="mt-2 font-heading text-lg font-semibold text-navy">Teach. Grow. We&apos;ll take care of the rest.</h3>
            <p className="mt-1 text-xs text-slate-500">Focus on what you love — we handle the support.</p>
            <div className="fm-emphasis-c mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {tutorBenefits.map((benefit, i) => (
                <BenefitCard key={benefit.title} benefit={benefit} revealed={revealed} delayMs={120 + i * 70} />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5 rounded-2xl bg-[#F97123] px-6 py-5 sm:grid-cols-4 sm:px-8">
          {trustStrip.map((item) => (
            <div key={item.title} className="flex items-center gap-3">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#F97123]"
                aria-hidden
              >
                {item.icon}
              </span>
              <div className="min-w-0">
                <p className="font-heading text-xs font-semibold text-navy sm:text-sm">{item.title}</p>
                <p className="text-[11px] text-navy/85">{item.caption}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
