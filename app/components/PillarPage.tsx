// Shared visual scaffolding for the four "pillar" info pages (Tutor
// Platform, Creative Learning, Soft Skills, AI & Robotics) — the navy
// hero band with stats, and the "cards in a grid" pattern used for both
// delivery formats and step-by-step flows. Content is prototype-derived
// (Future_Minds_Prototype_5_.html's view-tutor / view-ai / view-creative /
// view-soft sections), not invented.
import Link from "next/link";

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
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-navy"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

export function CardGrid({
  items,
}: {
  items: { icon: React.ReactNode; title: string; description: string }[];
}) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.title}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-amber/50 hover:shadow-md"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-navy text-amber">
            {item.icon}
          </div>
          <h4 className="font-heading text-base font-semibold text-navy">{item.title}</h4>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">{item.description}</p>
        </div>
      ))}
    </div>
  );
}

export function NumberedSteps({
  steps,
}: {
  steps: { title: string; description: string }[];
}) {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute left-0 right-0 top-6 hidden h-0.5 bg-slate-200 sm:block"
      />
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-4">
        {steps.map((step, i) => (
          <div key={step.title} className="relative flex flex-col items-center text-center">
            <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-navy font-heading text-base font-bold text-amber shadow-md">
              {i + 1}
            </div>
            <h4 className="mt-4 font-heading text-base font-semibold text-navy">{step.title}</h4>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">{step.description}</p>
          </div>
        ))}
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
