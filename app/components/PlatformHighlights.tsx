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
    tint: "bg-amber/10 text-amber-700",
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
    tint: "bg-navy/10 text-navy",
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
    tint: "bg-amber/10 text-amber-700",
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
    tint: "bg-navy/10 text-navy",
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
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-8 max-w-2xl">
      <h2 className="font-heading text-2xl font-semibold text-navy sm:text-3xl">
        {title}
      </h2>
      <p className="mt-2 text-sm text-slate-500 sm:text-base">{description}</p>
    </div>
  );
}

export default function PlatformHighlights() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 md:py-20">
        <SectionHeading
          title="One learner journey, fully coordinated"
          description="From the first requirement to the first payout, Future Minds stays in the loop at every step."
        />
        <div className="relative">
          <div
            aria-hidden
            className="absolute left-0 right-0 top-6 hidden h-0.5 bg-slate-200 sm:block"
          />
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-4">
            {journeySteps.map((step, i) => (
              <div key={step.title} className="relative flex flex-col items-center text-center">
                <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-navy font-heading text-base font-bold text-amber shadow-md">
                  {i + 1}
                </div>
                <h4 className="mt-4 font-heading text-base font-semibold text-navy">
                  {step.title}
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 pb-16 sm:px-8 md:pb-20">
        <SectionHeading
          title="Delivery formats"
          description="Built for how Indian families actually learn — solo, in small groups, or pooled across a community."
        />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {deliveryFormats.map((format) => (
            <div
              key={format.title}
              className={`flex items-start gap-4 rounded-2xl p-6 transition-all hover:-translate-y-1 ${format.tint.split(" ")[0]}`}
            >
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white ${format.tint.split(" ")[1]}`}>
                {format.icon}
              </div>
              <div>
                <h4 className="font-heading text-base font-semibold text-navy">
                  {format.title}
                </h4>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                  {format.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 pb-20 sm:px-8">
        <SectionHeading
          title="Learning categories"
          description="Academic, creative and future-skills categories live today."
        />
        <div className="flex flex-wrap gap-2.5">
          {categories.map((category) => (
            <span
              key={category}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-navy transition-colors hover:border-amber hover:bg-amber/10"
            >
              {category}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
