import { BOARDS, SOFT_SKILLS_ITEMS } from "@/lib/categories";

const journeySteps = [
  {
    icon: "①",
    title: "Requirement",
    description:
      "Subject, level, mode, location, schedule and budget — submitted once.",
  },
  {
    icon: "②",
    title: "Matching",
    description:
      "Our team shortlists educators by availability, location fit and willingness.",
  },
  {
    icon: "③",
    title: "Demo",
    description:
      "Scheduling, communication and feedback, coordinated end to end.",
  },
  {
    icon: "④",
    title: "Enrollment",
    description:
      "Schedule and pricing documented, attendance tracking activated.",
  },
];

const deliveryFormats = [
  {
    icon: "▣",
    title: "Online Classes",
    description: "One-to-one, small group or batch, from anywhere.",
  },
  {
    icon: "⌂",
    title: "Home Tuition",
    description:
      "Teacher travels to the student's residence or preferred location.",
  },
  {
    icon: "◈",
    title: "Teacher's Location",
    description:
      "Student travels to the teacher's residence or a coaching centre.",
  },
  {
    icon: "⬡",
    title: "Community Pooling",
    description: "Apartments & residential groups share a class, and the cost.",
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

const learningSpaces = [
  {
    title: "Students",
    description: "Every grade, every board — matched to a tutor who fits how they learn.",
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="3.2" />
        <path d="M4.5 20c0-3.6 3.36-6.5 7.5-6.5s7.5 2.9 7.5 6.5" />
      </svg>
    ),
  },
  {
    title: "Teachers",
    description: "Verified educators, hand-picked by our team for qualification and fit.",
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="7" r="3" />
        <path d="M5 20.5c0-3.87 3.13-7 7-7s7 3.13 7 7" />
        <path d="M8.5 20.5V17a3.5 3.5 0 017 0v3.5" />
      </svg>
    ),
  },
  {
    title: "Classroom",
    description: "Online, home tuition, teacher's location, or a pooled community class.",
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4.5" width="18" height="12" rx="1.5" />
        <path d="M8 20.5h8M12 16.5v4" />
      </svg>
    ),
  },
  {
    title: "Books",
    description: "Structured subjects, board-aligned curriculum, real progress tracking.",
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 5.2c2.2-.9 4.6-.9 6.8 0v13.6c-2.2-.9-4.6-.9-6.8 0z" />
        <path d="M20 5.2c-2.2-.9-4.6-.9-6.8 0v13.6c2.2-.9 4.6-.9 6.8 0z" />
      </svg>
    ),
  },
  {
    title: "Labs",
    description: "Hands-on future-skills learning — AI &amp; Robotics, coding, and more.",
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.5 3.5h5M10 4v5.5L5.5 18a2 2 0 001.8 3h9.4a2 2 0 001.8-3L14 9.5V4" />
        <path d="M7.5 15h9" />
      </svg>
    ),
  },
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
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {journeySteps.map((step) => (
            <div
              key={step.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-amber/50 hover:shadow-md"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-navy text-amber">
                {step.icon}
              </div>
              <h4 className="font-heading text-base font-semibold text-navy">
                {step.title}
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 pb-16 sm:px-8 md:pb-20">
        <SectionHeading
          title="Delivery formats"
          description="Built for how Indian families actually learn — solo, in small groups, or pooled across a community."
        />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {deliveryFormats.map((format) => (
            <div
              key={format.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-amber/50 hover:shadow-md"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-navy text-amber">
                {format.icon}
              </div>
              <h4 className="font-heading text-base font-semibold text-navy">
                {format.title}
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                {format.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 pb-16 sm:px-8">
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

      <div className="mx-auto max-w-7xl px-6 pb-20 sm:px-8">
        <SectionHeading
          title="Built for every kind of learning space"
          description="From a home desk to a coaching centre, Future Minds fits how your child actually learns."
        />
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
          {learningSpaces.map((space) => (
            <div
              key={space.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm transition-all hover:-translate-y-1 hover:border-amber/50 hover:shadow-md"
            >
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-navy/5 text-navy">
                {space.icon}
              </div>
              <h4 className="font-heading text-sm font-semibold text-navy">
                {space.title}
              </h4>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                {space.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
