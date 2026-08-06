import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import BackButton from "../components/BackButton";
import { PillarHero, PillarSectionHeading } from "../components/PillarPage";

const liveVerticals = [
  {
    title: "Tutor Platform",
    description: "Academic tutoring, matched and managed — Class KG to 12.",
    href: "/tutor-platform",
    chips: ["State Board", "CBSE", "ICSE", "IGCSE", "Tamil", "Languages"],
  },
  {
    title: "AI & Robotics",
    description: "Paid training, live classes and certifications, owned and run by Future Minds.",
    href: "/ai-robotics",
    chips: ["Robotics Starter · 6–9", "Junior AI Coders · 10–13", "AI Builders Teen · 14–17"],
  },
  {
    title: "Creative Learning",
    description: "Music, dance, art and abacus, matched to the right educator.",
    href: "/creative-learning",
    chips: ["Vocal & Instrumental Music", "Dance", "Art & Painting", "Abacus"],
  },
  {
    title: "Soft Skills",
    description: "Communication, presentation and public speaking, for students and professionals.",
    href: "/soft-skills",
    chips: ["Communication", "Presentation", "Public Speaking", "Motivational Speaking & Consulting"],
  },
  {
    title: "Adult & Family AI",
    description: "Practical AI skills for adults and families, delivered as course packages under AI & Robotics.",
    href: "/ai-robotics",
    chips: [
      "Workplace AI",
      "AI Productivity",
      "Automation Tools",
      "Family AI Literacy",
      "Safe AI Usage",
      "AI-Powered Parenting",
    ],
  },
];

const comingSoon = [
  {
    title: "Technical & Professional Programs",
    chips: [
      "Programming",
      "Data Analytics",
      "Data Science",
      "Cybersecurity",
      "Cloud Computing",
      "DevOps",
      "Project Management",
      "Business Analysis",
      "Digital Marketing",
    ],
  },
  {
    title: "Competitive Exam Ecosystem",
    chips: [
      "JEE",
      "NEET",
      "CAT",
      "GATE",
      "CUET",
      "UPSC",
      "SSC",
      "Banking",
      "Railways",
      "Defence",
      "TNPSC",
      "TRB",
      "TET",
    ],
  },
];

export default function AcademyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <BackButton />
      <main className="flex-1 bg-slate-50">
        <PillarHero
          eyebrow="Future Minds Academy"
          headline="Every service we offer — live today, and what's coming next."
          description="One ecosystem covering academic tutoring, creative learning, soft skills, and Future Minds-owned AI & Robotics training for kids, adults and families today, with technical/professional and exam-prep verticals on the way."
          stats={[
            { value: "5", label: "Verticals live today" },
            { value: "2", label: "Coming soon" },
            { value: "30+", label: "Categories & tracks" },
          ]}
        />

        <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8">
          <PillarSectionHeading title="Live today" />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {liveVerticals.map((v) => (
              <div key={v.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="font-heading text-lg font-semibold text-navy">{v.title}</h4>
                  <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                    Live
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{v.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {v.chips.map((c) => (
                    <span
                      key={c}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-navy"
                    >
                      {c}
                    </span>
                  ))}
                </div>
                <Link
                  href={v.href}
                  className="mt-5 inline-block text-sm font-semibold text-amber-700 hover:underline"
                >
                  Open →
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-14">
            <PillarSectionHeading title="Coming soon" />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              {comingSoon.map((v) => (
                <div key={v.title} className="rounded-2xl border border-dashed border-amber/40 bg-amber/5 p-6">
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="font-heading text-base font-semibold text-navy">{v.title}</h4>
                    <span className="shrink-0 rounded-full bg-amber/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
                      ◔ Coming Soon
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {v.chips.map((c) => (
                      <span
                        key={c}
                        className="rounded-full border border-amber/30 bg-white/60 px-3 py-1 text-xs font-medium text-navy/60"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
