// Shared visual scaffolding for the four "pillar" info pages (Tutor
// Platform, Creative Learning, Soft Skills, AI & Robotics) — the navy
// hero band with stats, and the "cards in a grid" pattern used for both
// delivery formats and step-by-step flows. Content is prototype-derived
// (Future_Minds_Prototype_5_.html's view-tutor / view-ai / view-creative /
// view-soft sections), not invented.
import Link from "next/link";
import { getCategoryIcon } from "./categoryIcons";

export function PillarHero({
  eyebrow,
  headline,
  description,
  stats,
}: {
  eyebrow: string;
  headline: string;
  description: string;
  stats: { value: string; label: string }[];
}) {
  return (
    <section className="bg-navy">
      <div className="mx-auto max-w-4xl px-6 py-16 text-center sm:px-8">
        <div className="mx-auto flex w-fit items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber">
          <span className="h-px w-4 bg-amber" />
          {eyebrow}
          <span className="h-px w-4 bg-amber" />
        </div>
        <h1 className="mt-4 font-heading text-3xl font-bold leading-tight text-white sm:text-4xl">
          {headline}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
          {description}
        </p>
        <div className="mx-auto mt-8 flex max-w-lg flex-wrap justify-center gap-8">
          {stats.map((s) => (
            <div key={s.label}>
              <b className="block font-heading text-2xl text-white">{s.value}</b>
              <span className="text-xs text-white/50">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PillarSectionHeading({ title }: { title: string }) {
  return (
    <h2 className="mb-5 font-heading text-xl font-semibold text-navy sm:text-2xl">
      {title}
    </h2>
  );
}

export function ChipRow({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {items.map((item) => (
        <span
          key={item}
          className="inline-flex items-center gap-1.5 rounded-full border border-amber/30 bg-white px-4 py-2 text-sm font-medium text-navy shadow-sm transition-colors hover:border-amber hover:bg-amber hover:text-navy"
        >
          <span aria-hidden className="opacity-70">
            {getCategoryIcon(item)}
          </span>
          {item}
        </span>
      ))}
    </div>
  );
}

// Amber-tinted panel used to ground a cluster of ChipRows — mirrors the
// "Learning categories" panel on the homepage (PlatformHighlights.tsx).
export function ChipPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-amber/20 bg-amber/5 p-6 sm:p-8">{children}</div>
  );
}

const DEFAULT_TINTS = ["bg-amber/10 text-amber-700", "bg-navy/10 text-navy"];

export function CardGrid({
  items,
}: {
  items: {
    icon: React.ReactNode;
    title: string;
    description: string;
    tint?: string;
    unique?: boolean;
    uniqueNote?: string;
  }[];
}) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item, i) => {
        const tint = item.tint ?? DEFAULT_TINTS[i % DEFAULT_TINTS.length];
        if (item.unique) {
          return (
            <div
              key={item.title}
              className="group relative overflow-hidden rounded-2xl border-2 border-amber bg-navy p-6 shadow-md transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <span className="absolute -right-9 top-4 w-32 rotate-45 bg-amber py-1 text-center text-[10px] font-bold uppercase tracking-wide text-navy shadow-sm">
                Unique to us
              </span>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tint}`}>
                {item.icon}
              </div>
              <h4 className="mt-3 font-heading text-base font-semibold text-white">{item.title}</h4>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{item.description}</p>
              <p className="mt-3 text-xs font-medium text-amber">
                {item.uniqueNote ?? "Not offered by other tutoring platforms"}
              </p>
            </div>
          );
        }
        return (
          <div
            key={item.title}
            className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <span
              aria-hidden
              className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-amber transition-transform duration-300 group-hover:scale-x-100"
            />
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tint}`}>
              {item.icon}
            </div>
            <h4 className="mt-3 font-heading text-base font-semibold text-navy">{item.title}</h4>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">{item.description}</p>
          </div>
        );
      })}
    </div>
  );
}

// Full-bleed navy "how it works" band with numbered, amber-connected steps
// — the same treatment as the homepage's "One learner journey" section
// (PlatformHighlights.tsx), reused here so duplicated content reads as one
// consistent system instead of a plainer copy.
export function JourneyBand({
  eyebrow,
  title,
  description,
  steps,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  steps: { title: string; description: string }[];
}) {
  return (
    <div className="bg-navy">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8">
        <div className="mb-10 max-w-2xl">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-amber">
            <span className="h-px w-6 bg-amber" aria-hidden />
            {eyebrow}
          </span>
          <h2 className="mt-3 font-heading text-2xl font-semibold text-white sm:text-3xl">
            {title}
          </h2>
          {description && <p className="mt-2 text-sm text-slate-300 sm:text-base">{description}</p>}
        </div>
        <div className="relative">
          <div
            aria-hidden
            className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-amber/50 to-transparent sm:block"
          />
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-4 sm:gap-6">
            {steps.map((step, i) => (
              <div key={step.title} className="relative flex flex-col items-center text-center">
                <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border border-amber/40 bg-[#132a4d] font-heading text-lg font-bold text-amber shadow-[0_0_0_6px_rgba(10,25,47,1),0_8px_20px_rgba(0,0,0,0.35)]">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h4 className="mt-5 font-heading text-base font-semibold text-white">{step.title}</h4>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PillarCTAs({
  primary,
  secondary,
}: {
  primary: { text: string; href: string };
  secondary?: { text: string; href: string };
}) {
  return (
    <div className="mt-10 flex flex-wrap gap-4">
      <Link
        href={primary.href}
        className="rounded-xl bg-amber px-6 py-3 text-sm font-semibold text-navy shadow-lg shadow-amber/30 transition-transform hover:-translate-y-0.5"
      >
        {primary.text}
      </Link>
      {secondary && (
        <Link
          href={secondary.href}
          className="rounded-xl border border-navy/20 px-6 py-3 text-sm font-semibold text-navy transition-colors hover:bg-navy hover:text-white"
        >
          {secondary.text}
        </Link>
      )}
    </div>
  );
}
