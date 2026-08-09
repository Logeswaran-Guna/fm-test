import Header from "../components/Header";
import Footer from "../components/Footer";
import BackButton from "../components/BackButton";
import {
  PillarHero,
  PillarSectionHeading,
  ChipRow,
  ChipPanel,
  CardGrid,
  JourneyBand,
  PillarCTAs,
} from "../components/PillarPage";
import { BOARDS, GRADE_BANDS } from "@/lib/categories";

const gradeLevels = GRADE_BANDS.map((band) => band.label);
const allSubjects = Array.from(
  new Set(GRADE_BANDS.flatMap((band) => band.subjects).filter((s) => s !== "All Subjects"))
);

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

const formats = [
  {
    title: "Online Classes",
    description: "One-to-one, small group or batch, from anywhere.",
    icon: (
      <svg {...formatIcon}>
        <rect x="3" y="5" width="18" height="12" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  {
    title: "Home Tuition",
    description: "Teacher travels to the student's residence or preferred location.",
    icon: (
      <svg {...formatIcon}>
        <path d="M4 11l8-7 8 7" />
        <path d="M6 10v9a1 1 0 001 1h10a1 1 0 001-1v-9" />
        <path d="M10 20v-5h4v5" />
      </svg>
    ),
  },
  {
    title: "Teacher's Location",
    description: "Student travels to the teacher's residence or a coaching centre.",
    icon: (
      <svg {...formatIcon}>
        <path d="M12 21s7-6.5 7-11.5A7 7 0 105 9.5C5 14.5 12 21 12 21z" />
        <circle cx="12" cy="9.5" r="2.5" />
      </svg>
    ),
  },
  {
    title: "Community Pooling",
    description: "Apartments & residential groups share a class, and the cost.",
    unique: true,
    icon: (
      <svg {...formatIcon}>
        <circle cx="8" cy="9" r="3" />
        <circle cx="17" cy="9" r="2.5" />
        <path d="M2.5 20c0-3.3 2.5-6 5.5-6s5.5 2.7 5.5 6" />
        <path d="M14.5 14.5c2.5.3 4.5 2.6 4.5 5.5" />
      </svg>
    ),
  },
];

const steps = [
  { title: "Requirement", description: "Subject, level, mode, location, schedule and budget — submitted once." },
  { title: "Matching", description: "Our team shortlists educators by availability, location fit and willingness." },
  { title: "Demo", description: "Scheduling, communication and feedback, coordinated end to end." },
  {
    title: "Enrollment",
    description:
      "Approve the tutor to confirm — a one-time 20% platform fee applies, then attendance tracking activates.",
  },
];

export default function TutorPlatformPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <BackButton />
      <main className="flex-1 bg-slate-50">
        <PillarHero
          eyebrow="Managed Learning Ecosystem"
          headline="Academic tutoring, matched and managed — from Class KG to 12."
          description="State Board, CBSE, ICSE and IGCSE, from LKG to Class 12 — Mathematics, Science, Languages (including Tamil) and more. Every requirement is reviewed by a person before it's matched to an educator."
          stats={[
            { value: "LKG–12", label: "Full academic coverage" },
            { value: "4", label: "Delivery formats" },
            { value: "4 hrs", label: "Avg. time to first match" },
          ]}
        />

        <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8">
          <PillarSectionHeading title="Subjects & boards" />
          <ChipPanel>
            <div className="space-y-6">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Boards</p>
                <ChipRow items={[...BOARDS]} />
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Grade levels</p>
                <ChipRow items={gradeLevels} />
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Subjects</p>
                <ChipRow items={allSubjects} />
              </div>
            </div>
          </ChipPanel>

          <div className="mt-14">
            <PillarSectionHeading title="Delivery formats" />
            <CardGrid items={formats} />
          </div>
        </div>

        <div className="mt-16">
          <JourneyBand
            eyebrow="The journey"
            title="How it works — for parents"
            description="From your first requirement to a confirmed batch, every step is coordinated by our team."
            steps={steps}
          />
        </div>

        <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8">
          <div className="rounded-3xl border border-amber/30 bg-amber/5 p-6 sm:p-8">
            <PillarSectionHeading title="How it works — for tutors" />
            <div className="relative">
              <div
                aria-hidden
                className="absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-transparent via-navy/20 to-transparent sm:block"
              />
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                <div className="relative flex flex-col items-start text-left">
                  <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-navy/15 bg-white font-heading text-base font-bold text-navy shadow-sm">
                    01
                  </div>
                  <h4 className="mt-4 font-heading text-base font-semibold text-navy">Apply &amp; verify</h4>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    Register your subjects, availability, service area and expected rate, then upload an ID for KYC verification — required before you can be matched with families.
                  </p>
                </div>
                <div className="relative flex flex-col items-start text-left">
                  <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-navy/15 bg-white font-heading text-base font-bold text-navy shadow-sm">
                    02
                  </div>
                  <h4 className="mt-4 font-heading text-base font-semibold text-navy">Get matched</h4>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    Our team shortlists you against real, reviewed requirements — no bidding, no cold outreach to families.
                  </p>
                </div>
                <div className="relative flex flex-col items-start text-left">
                  <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-navy/15 bg-white font-heading text-base font-bold text-navy shadow-sm">
                    03
                  </div>
                  <h4 className="mt-4 font-heading text-base font-semibold text-navy">Run the demo</h4>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    We coordinate scheduling and communication for the trial class with the family.
                  </p>
                </div>
                <div className="relative flex flex-col items-start text-left">
                  <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-navy/15 bg-white font-heading text-base font-bold text-navy shadow-sm">
                    04
                  </div>
                  <h4 className="mt-4 font-heading text-base font-semibold text-navy">Teach &amp; get paid</h4>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    Log each class you teach; once the parent confirms attendance, your payout is tracked and
                    released, minus our 10% commission — charged every month for as long as the batch stays active.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-14 rounded-2xl border border-amber/30 bg-amber/5 p-6 sm:p-8">
            <PillarSectionHeading title="How Community Pooling works" />
            <p className="max-w-3xl text-sm leading-relaxed text-slate-600">
              Community Pooling lets families within the same apartment complex, gated community, or residential
              association share a class — and the cost — instead of paying for a one-to-one session each. One
              teacher, one session, several paying households: it lowers the per-family price without discounting
              what the teacher earns per class.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <h4 className="font-heading text-sm font-semibold text-navy">1. We identify a host</h4>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                  A common hall, clubhouse, or a willing resident&apos;s home within the community.
                </p>
              </div>
              <div>
                <h4 className="font-heading text-sm font-semibold text-navy">2. We pool nearby households</h4>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                  Interested families in the same complex are grouped into one batch with a matched teacher.
                </p>
              </div>
              <div>
                <h4 className="font-heading text-sm font-semibold text-navy">3. Fees, transparently</h4>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                  Unlike a standard match&apos;s one-time parent fee, Community Pooling is a recurring 10% from the
                  teacher&apos;s payout{" "}
                  <em>and</em>{" "}
                  a separate recurring 10% from each participating household&apos;s share — charged every month for
                  as long as the pooled batch stays active, since coordinating several families onto one shared
                  batch is ongoing work, not a one-time introduction.
                </p>
              </div>
            </div>
            <p className="mt-5 text-xs text-slate-500">
              Interested in hosting or joining a pooled class in your community? Mention it in your requirement, or{" "}
              <a href="mailto:hello@futureminds.in" className="font-semibold text-amber-700 underline">
                write to us directly
              </a>
              .
            </p>
          </div>

          <PillarCTAs
            primary={{ text: "Find a Tutor →", href: "/find-tutor" }}
            secondary={{ text: "Become a Tutor", href: "/become-a-tutor" }}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
