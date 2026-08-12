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
    tint: "bg-amber/20 text-amber",
    unique: true,
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

function Eyebrow({ children, light }: { children: string; light?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] ${
        light ? "text-amber" : "text-amber-700"
      }`}
    >
      <span className={`h-px w-6 ${light ? "bg-amber" : "bg-amber-700"}`} aria-hidden />
      {children}
    </span>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  light,
}: {
  eyebrow: string;
  title: string;
  description: string;
  light?: boolean;
}) {
  return (
    <div className="mb-10 max-w-2xl">
      <Eyebrow light={light}>{eyebrow}</Eyebrow>
      <h2
        className={`mt-3 font-heading text-2xl font-semibold sm:text-3xl ${
          light ? "text-white" : "text-navy"
        }`}
      >
        {title}
      </h2>
      <p className={`mt-2 text-sm sm:text-base ${light ? "text-slate-300" : "text-slate-500"}`}>
        {description}
      </p>
    </div>
  );
}

export default function PlatformHighlights() {
  return (
    <section className="bg-white">
      <div className="bg-navy">
        <div className="mx-auto max-w-7xl px-6 pt-16 pb-10 sm:px-8 sm:pt-20 sm:pb-12">
          <SectionHeading
            light
            eyebrow="The journey"
            title="One learner journey, fully coordinated"
            description="From the first requirement to the first payout, Future Minds stays in the loop at every step."
          />
          <div className="relative">
            <div
              aria-hidden
              className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-amber/50 to-transparent sm:block"
            />
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-4 sm:gap-6">
              {journeySteps.map((step, i) => (
                <div key={step.title} className="relative flex flex-col items-center text-center">
                  <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border border-amber/40 bg-[#132a4d] font-heading text-lg font-bold text-amber shadow-[0_0_0_6px_rgba(10,25,47,1),0_8px_20px_rgba(0,0,0,0.35)]">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <h4 className="mt-5 font-heading text-base font-semibold text-white">
                    {step.title}
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 pt-10 pb-6 sm:px-8 sm:pt-12 md:pt-14">
        <SectionHeading
          eyebrow="How you learn"
          title="Flexible delivery"
          description="Built for how Indian families actually learn — solo, in small groups, or pooled across a community."
        />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {deliveryFormats.map((format) =>
            format.unique ? (
              <div
                key={format.title}
                className="group relative overflow-hidden rounded-2xl border-2 border-amber bg-navy p-6 shadow-md transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <span className="absolute -right-9 top-4 w-32 rotate-45 bg-amber py-1 text-center text-[10px] font-bold uppercase tracking-wide text-navy shadow-sm">
                  Unique to us
                </span>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${format.tint}`}>
                  {format.icon}
                </div>
                <h4 className="mt-5 font-heading text-base font-semibold text-white">
                  {format.title}
                </h4>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-300">
                  {format.description}
                </p>
                <p className="mt-3 text-xs font-medium text-amber">
                  Not offered by other tutoring platforms
                </p>
              </div>
            ) : (
              <div
                key={format.title}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-amber transition-transform duration-300 group-hover:scale-x-100"
                />
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${format.tint}`}>
                  {format.icon}
                </div>
                <h4 className="mt-5 font-heading text-base font-semibold text-navy">
                  {format.title}
                </h4>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                  {format.description}
                </p>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}
