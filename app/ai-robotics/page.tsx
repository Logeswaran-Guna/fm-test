import Header from "../components/Header";
import Footer from "../components/Footer";
import BackButton from "../components/BackButton";
import { PillarHero, PillarSectionHeading, CardGrid, PillarCTAs } from "../components/PillarPage";
import AcademyCatalog from "./AcademyCatalog";

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

const tracks = [
  {
    title: "Robotics Starter",
    description: "Ages 6–9 · Snap-together kits, block-based coding, sensors & motors, demo day each term.",
    icon: (
      <svg {...formatIcon}>
        <rect x="4" y="8" width="16" height="11" rx="3" />
        <circle cx="9" cy="13.2" r="1.3" fill="currentColor" stroke="none" />
        <circle cx="15" cy="13.2" r="1.3" fill="currentColor" stroke="none" />
        <path d="M12 8V4" />
        <circle cx="12" cy="3" r="1.1" />
      </svg>
    ),
  },
  {
    title: "Junior AI Coders",
    description: "Ages 10–13 · Intro to Python & logic, how AI models \"learn\", responsible AI usage, build a chatbot.",
    icon: (
      <svg {...formatIcon}>
        <path d="M8.5 6.5l-5.5 5.5 5.5 5.5M15.5 6.5l5.5 5.5-5.5 5.5" />
      </svg>
    ),
  },
  {
    title: "AI Builders — Teen",
    description: "Ages 14–17 · Machine learning concepts, an applied AI/Robotics capstone project, ethics & careers.",
    icon: (
      <svg {...formatIcon}>
        <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
        <path d="M8.5 12.2l2.3 2.3 4.7-4.8" />
      </svg>
    ),
  },
  {
    title: "Adult & Family AI",
    description: "All ages · Workplace AI, AI productivity & automation tools, family AI literacy, safe AI usage, and AI-powered parenting.",
    icon: (
      <svg {...formatIcon}>
        <circle cx="8" cy="8" r="2.8" />
        <circle cx="16.5" cy="9" r="2.2" />
        <path d="M3 20c0-2.9 2.2-5.2 5-5.2s5 2.3 5 5.2" />
        <path d="M13.2 15.3c2.3.2 4.1 2.3 4.1 4.7" />
      </svg>
    ),
  },
];

const offerings = [
  {
    title: "Course Packages",
    description: "Structured, age-tiered curricula — enroll for a full term, priced per package.",
    icon: (
      <svg {...formatIcon}>
        <path d="M6 4h9a3 3 0 013 3v13H9a3 3 0 01-3-3z" />
        <path d="M6 4a3 3 0 000 6h12" />
      </svg>
    ),
  },
  {
    title: "Live Classes",
    description: "Instructor-led sessions in small batches — online or in person, not self-paced video.",
    icon: (
      <svg {...formatIcon}>
        <rect x="3" y="5" width="18" height="12" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  {
    title: "Certifications",
    description: "A Future Minds certificate on completing each track, verifying the projects actually built.",
    icon: (
      <svg {...formatIcon}>
        <circle cx="12" cy="9" r="6" />
        <path d="M9 14l-1.5 6L12 18l4.5 2L15 14" />
      </svg>
    ),
  },
  {
    title: "Weekend Workshops",
    description: "2-hour hands-on sessions for a first taste, no term commitment.",
    icon: (
      <svg {...formatIcon}>
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M3 9h18M8 2v4M16 2v4" />
      </svg>
    ),
  },
];

export default function AiRoboticsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <BackButton />
      <main className="flex-1 bg-slate-50">
        <PillarHero
          eyebrow="Future Minds Academy · Owned & Delivered by Future Minds"
          headline="AI & Robotics, taught the way kids actually learn — by building things."
          description="Unlike the Tutor Platform, AI & Robotics is a Future Minds–owned program, not a matched independent tutor — every course, live class and instructor is run directly by Future Minds Academy. From dragging your first block of code to training a working robot, it's project-based, age-tiered, and run in small batches so every child gets hands-on time."
          stats={[
            { value: "4", label: "Tracks — kids to adults" },
            { value: "12", label: "Hands-on projects / level" },
            { value: "6–Adult", label: "Age range covered" },
          ]}
        />

        <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8">
          <PillarSectionHeading title="Courses open for enrollment" />
          <AcademyCatalog />
          <p className="mx-auto mt-6 max-w-2xl text-center text-xs text-slate-400">
            Submitting an enrollment request doesn&apos;t charge you anything — our team will contact you directly
            to confirm your spot and arrange payment. No card details are collected on this site.
          </p>

          <div className="mt-14">
            <PillarSectionHeading title="What it covers — tracks by age & audience" />
            <CardGrid items={tracks} />
          </div>

          <div className="mt-14">
            <PillarSectionHeading title="How it works" />
            <p className="max-w-3xl text-sm leading-relaxed text-slate-600">
              This isn&apos;t a matching service — Future Minds runs it directly. You enroll in a course package or a
              weekend workshop, attend live instructor-led classes (online or in person), work through hands-on
              projects each term, and receive a Future Minds certificate on completion.
            </p>
            <div className="mt-6">
              <CardGrid items={offerings} />
            </div>
          </div>

          <PillarCTAs primary={{ text: "Enquire About AI & Robotics →", href: "mailto:contact@futuremindsindia.com" }} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
