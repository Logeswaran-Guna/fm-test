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
  "State Board",
  "CBSE",
  "ICSE",
  "IGCSE",
  "Engineering",
  "Commerce",
  "Languages",
  "Public Speaking",
  "Personality Development",
  "AI & Robotics",
  "Music & Instruments",
  "Dance",
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
