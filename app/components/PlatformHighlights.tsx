import { BOARDS, SOFT_SKILLS_ITEMS } from "@/lib/categories";

const journeySteps = [
  {
    title: "Requirement",
    description:
      "Subject, level, mode, location, schedule and budget — submitted once.",
  },
  {
    title: "Matching",
    description:
      "Our team shortlists educators by availability, location fit and willingness.",
  },
  {
    title: "Demo",
    description:
      "Scheduling, communication and feedback, coordinated end to end.",
  },
  {
    title: "Enrollment",
    description:
      "Schedule and pricing documented, attendance tracking activated.",
  },
];

const deliveryFormats = [
  {
    title: "Online Classes",
    description: "One-to-one, small group or batch, from anywhere.",
    accent: "amber",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="12" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  {
    title: "Home Tuition",
    description: "Teacher travels to the student's residence or preferred location.",
    accent: "navy",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 11l8-7 8 7" />
        <path d="M6 10v9a1 1 0 001 1h10a1 1 0 001-1v-9" />
        <path d="M10 20v-5h4v5" />
      </svg>
    ),
  },
  {
    title: "Teacher's Location",
    description: "Student travels to the teacher's residence or a coaching centre.",
    accent: "amber",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 21s7-6.5 7-11.5A7 7 0 105 9.5C5 14.5 12 21 12 21z" />
        <circle cx="12" cy="9.5" r="2.5" />
      </svg>
    ),
  },
  {
    title: "Community Pooling",
    description: "Apartments & residential groups share a class, and the cost.",
    accent: "navy",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="9" r="3" />
        <circle cx="17" cy="9" r="2.5" />
        <path d="M2.5 20c0-3.3 2.5-6 5.5-6s5.5 2.7 5.5 6" />
        <path d="M14.5 14.5c2.5.3 4.5 2.6 4.5 5.5" />
      </svg>
    ),
  },
];

const categories = [
  ...BOARDS,
  "Academics (Pre-Primary – Higher Secondary)",
  "Music & Instruments",
  "Dance",
  "Art",
  "Abacus",
  ...SOFT_SKILLS_ITEMS,
];

function SectionHeading({
  eyebrow,
  title,
  description,
  tone = "light",
}: {
  eyebrow: string;
  title: string;
  description: string;
  tone?: "light" | "dark";
}) {
  const isDark = tone === "dark";
  return (
    <div className="mb-10 max-w-2xl">
      <span
        className={`inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] ${
          isDark ? "text-amber" : "text-amber-600"
        }`}
      >
        <span className="h-px w-6 bg-amber" aria-hidden />
        {eyebrow}
      </span>
      <h2
        className={`mt-3 font-heading text-2xl font-semibold tracking-tight text-balance sm:text-3xl md:text-[2rem] ${
          isDark ? "text-white" : "text-navy"
        }`}
      >
        {title}
      </h2>
      <p
        className={`mt-3 text-sm leading-relaxed text-pretty sm:text-base ${
          isDark ? "text-slate-300" : "text-slate-500"
        }`}
      >
        {description}
      </p>
    </div>
  );
}

export default function PlatformHighlights() {
  return (
    <section className="bg-white">
      {/* Journey — dark band for contrast */}
      <div className="bg-navy">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 md:py-24">
          <SectionHeading
            eyebrow="How it works"
            title="One learner journey, fully coordinated"
            description="From the first requirement to the first payout, Future Minds stays in the loop at every step."
            tone="dark"
          />
          <ol className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {journeySteps.map((step, i) => (
              <li
                key={step.title}
                className="group relative flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-amber/40 hover:bg-white/[0.06]"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber font-heading text-base font-bold text-navy shadow-sm">
                    {i + 1}
                  </span>
                  {i < journeySteps.length - 1 && (
                    <span
                      aria-hidden
                      className="hidden h-px flex-1 bg-gradient-to-r from-amber/50 to-transparent lg:block"
                    />
                  )}
                </div>
                <h3 className="mt-5 font-heading text-lg font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Delivery formats */}
      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 md:py-24">
        <SectionHeading
          eyebrow="Flexible delivery"
          title="Learn the way that fits your family"
          description="Built for how Indian families actually learn — solo, in small groups, or pooled across a community."
        />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {deliveryFormats.map((format) => {
            const isAmber = format.accent === "amber";
            return (
              <div
                key={format.title}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:border-transparent hover:shadow-[0_16px_40px_-16px_rgba(10,25,47,0.35)]"
              >
                <span
                  aria-hidden
                  className={`absolute inset-x-0 top-0 h-1 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100 ${
                    isAmber ? "bg-amber" : "bg-navy"
                  }`}
                />
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                    isAmber
                      ? "bg-amber/10 text-amber-600"
                      : "bg-navy/10 text-navy"
                  }`}
                >
                  {format.icon}
                </div>
                <h3 className="mt-5 font-heading text-base font-semibold text-navy">
                  {format.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  {format.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Learning categories */}
      <div className="mx-auto max-w-7xl px-6 pb-20 sm:px-8">
        <div className="rounded-3xl border border-slate-200 bg-slate-50/60 p-8 sm:p-10">
          <SectionHeading
            eyebrow="What we cover"
            title="Learning categories"
            description="Academic, creative and future-skills categories live today."
          />
          <div className="flex flex-wrap gap-2.5">
            {categories.map((category) => (
              <span
                key={category}
                className="cursor-default rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-navy shadow-sm transition-all hover:-translate-y-0.5 hover:border-amber hover:bg-amber hover:text-navy"
              >
                {category}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
