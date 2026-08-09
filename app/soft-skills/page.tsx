import Header from "../components/Header";
import Footer from "../components/Footer";
import BackButton from "../components/BackButton";
import { PillarHero, PillarSectionHeading, CardGrid, PillarCTAs } from "../components/PillarPage";

const formatIcon = {
  viewBox: "0 0 24 24",
  width: 22,
  height: 22,
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const programs = [
  {
    title: "Communication Skills",
    description: "Spoken & written clarity, everyday professional English.",
    icon: (
      <svg {...formatIcon}>
        <path d="M4 6.5a3 3 0 013-3h10a3 3 0 013 3v6a3 3 0 01-3 3H10l-4.5 3.5v-3.5A3 3 0 014 12.5z" />
      </svg>
    ),
  },
  {
    title: "Presentation Skills",
    description: "Structuring a pitch or deck, and delivering it with confidence.",
    icon: (
      <svg {...formatIcon}>
        <rect x="3" y="4" width="18" height="12" rx="2" />
        <path d="M8 20h8M12 16v4" />
      </svg>
    ),
  },
  {
    title: "Public Speaking",
    description: "Overcoming stage fear, voice modulation & body language.",
    icon: (
      <svg {...formatIcon}>
        <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
        <path d="M8.5 12.2l2.3 2.3 4.7-4.8" />
      </svg>
    ),
  },
  {
    title: "Motivational Speaking & Consulting",
    description: "Building a signature talk, plus 1:1 speaker coaching.",
    icon: (
      <svg {...formatIcon}>
        <path d="M12 2l2.6 6.6L22 9l-5.4 4.6L18 22l-6-4-6 4 1.4-8.4L2 9l7.4-.4z" />
      </svg>
    ),
  },
  {
    title: "Foreign Languages",
    description: "German, French, Japanese & Chinese — conversational and exam-track options.",
    icon: (
      <svg {...formatIcon}>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.5 2.5 4 5.8 4 9s-1.5 6.5-4 9c-2.5-2.5-4-5.8-4-9s1.5-6.5 4-9z" />
      </svg>
    ),
  },
  {
    title: "Handwriting",
    description: "Legibility, speed and correct grip — for young learners building writing habits.",
    icon: (
      <svg {...formatIcon}>
        <path d="M4 20l3.5-1 11-11a2.1 2.1 0 00-3-3l-11 11z" />
        <path d="M14.5 6L18 9.5" />
      </svg>
    ),
  },
  {
    title: "Phonics",
    description: "Sound-letter foundations that build strong, confident early readers.",
    icon: (
      <svg {...formatIcon}>
        <path d="M4 6.5a3 3 0 013-3h10a3 3 0 013 3v6a3 3 0 01-3 3H10l-4.5 3.5v-3.5A3 3 0 014 12.5z" />
        <path d="M8 9.5h8M8 12h5" />
      </svg>
    ),
  },
];

const formats = [
  {
    title: "Online Coaching",
    description: "One-to-one sessions, from anywhere.",
    icon: (
      <svg {...formatIcon}>
        <rect x="3" y="5" width="18" height="12" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  {
    title: "In-Person Coaching",
    description: "At home, office, or a coaching studio.",
    icon: (
      <svg {...formatIcon}>
        <path d="M4 11l8-7 8 7" />
        <path d="M6 10v9a1 1 0 001 1h10a1 1 0 001-1v-9" />
      </svg>
    ),
  },
  {
    title: "Group Workshops",
    description: "Small-batch workshops for schools & teams.",
    icon: (
      <svg {...formatIcon}>
        <circle cx="8" cy="9" r="3" />
        <circle cx="17" cy="9" r="2.5" />
        <path d="M2.5 20c0-3.3 2.5-6 5.5-6s5.5 2.7 5.5 6" />
        <path d="M14.5 14.5c2.5.3 4.5 2.6 4.5 5.5" />
      </svg>
    ),
  },
  {
    title: "Event & Consulting",
    description: "Booked engagements for talks & sessions.",
    icon: (
      <svg {...formatIcon}>
        <rect x="4" y="8" width="16" height="12" rx="2" />
        <path d="M9 8V6a3 3 0 016 0v2" />
      </svg>
    ),
  },
];

export default function SoftSkillsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <BackButton />
      <main className="flex-1 bg-slate-50">
        <PillarHero
          eyebrow="Soft Skills"
          headline="The skills that decide interviews, stages and first impressions."
          description="Communication, presentation and public speaking — coached by educators who train adults and students alike."
          stats={[
            { value: "4", label: "Tracks live" },
            { value: "All ages", label: "Students to professionals" },
            { value: "1:1", label: "Or small-group coaching" },
          ]}
        />

        <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8">
          <PillarSectionHeading title="Programs" />
          <CardGrid items={programs} />

          <div className="mt-14">
            <PillarSectionHeading title="Formats" />
            <CardGrid items={formats} />
          </div>

          <PillarCTAs
            primary={{ text: "Find a Soft Skills Coach →", href: "/find-tutor" }}
            secondary={{ text: "Become a Tutor", href: "/become-a-tutor" }}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
