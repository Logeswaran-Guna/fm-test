"use client";

import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import BackButton from "../components/BackButton";

type FaqItem = { q: string; a: React.ReactNode };
type FaqSection = { heading: string; items: FaqItem[] };

const PARENT_SECTIONS: FaqSection[] = [
  {
    heading: "Getting started",
    items: [
      {
        q: "How do I find a tutor through Future Minds?",
        a: (
          <>
            Submit a requirement on{" "}
            <a href="/find-tutor" className="font-semibold text-amber-700 underline">
              Find a Tutor
            </a>{" "}
            — subject, level, mode, location, schedule, and budget. Our team personally reviews it and
            shortlists suitable educators; we don&apos;t just hand you a list to pick from.
          </>
        ),
      },
      {
        q: "Is this a directory where I browse and pick a tutor myself?",
        a: "No. Future Minds is a managed platform — every requirement is reviewed by a person on our team, who shortlists educators by availability, location fit, and willingness before anything is proposed to you.",
      },
      {
        q: "How long does it usually take to get matched?",
        a: "It depends on your subject, location, and current tutor availability in that area — there's no fixed guarantee. Our team starts reviewing as soon as you submit.",
      },
      {
        q: "What subjects, boards, and grades do you cover?",
        a: "State Board, CBSE, ICSE, and IGCSE from LKG through Class 12, across Mathematics, Science, Languages (including Tamil), and more — plus Creative Learning, Soft Skills, and AI & Robotics (Future Minds Academy) outside pure academics.",
      },
      {
        q: "What delivery modes are available?",
        a: "Online classes, home tuition (tutor travels to you), the tutor's own location or a coaching centre, and Community Pooling for apartment/residential communities sharing a batch.",
      },
    ],
  },
  {
    heading: "Fees & payments",
    items: [
      {
        q: "How much does it cost?",
        a: "For a standard match, once you approve a tutor after the demo, Future Minds charges a one-time platform fee of 20% of your submitted monthly budget — paid directly to us. What you pay the tutor for the classes themselves is agreed and paid directly between you and the tutor.",
      },
      {
        q: "Does Future Minds process the tutor's class fees?",
        a: "Not currently — parents pay tutors directly, as agreed between them. Future Minds' fee is separate: the one-time 20% platform fee charged when you confirm a tutor.",
      },
      {
        q: "How is Community Pooling priced differently?",
        a: "Instead of a one-time fee, both you and the tutor pay a recurring 10% every month for as long as the pooled batch stays active — spreading the coordination cost across every participating household instead of a single upfront fee. See the full breakdown on the Tutor Platform page.",
      },
      {
        q: "Is the platform fee refundable if things don't work out?",
        a: "This depends on the specific situation — please reach out to our team directly if you have concerns after paying the fee, and we'll work through it with you.",
      },
    ],
  },
  {
    heading: "Trust & safety",
    items: [
      {
        q: "How are tutors verified?",
        a: "Every tutor goes through KYC (government ID) verification before they can be matched with any family. This is a reasonable diligence check on identity, not a formal background check or professional certification.",
      },
      {
        q: "Can I see ratings or reviews before committing?",
        a: "Yes — tutor profiles carry ratings and reviews left by other parents after confirmed classes, so you're not going in blind.",
      },
      {
        q: "Is my child's information safe?",
        a: "Student details can only be submitted through your own parent/guardian account, with explicit consent recorded against it. Data is stored securely and never shown publicly — see our Privacy Policy for the full detail.",
      },
    ],
  },
  {
    heading: "Demo, classes & disputes",
    items: [
      {
        q: "Is there a demo before I commit?",
        a: "Yes. We coordinate a trial demo class end to end. Only after you approve the tutor post-demo does the platform fee apply and attendance tracking begin — the demo itself is not a commitment.",
      },
      {
        q: "What if I want a different tutor after the demo?",
        a: "That's exactly what the demo is for. Let our team know and we'll continue shortlisting — nothing is confirmed until you approve.",
      },
      {
        q: "How do I know a class actually happened before I'm charged toward a tutor's payout?",
        a: "The tutor logs each class, and it only counts once you (the parent) confirm it. If something looks wrong, you can dispute it and our team reviews the record.",
      },
      {
        q: "Will I be notified about updates automatically?",
        a: "Yes — the notification bell in the site header shows status updates in real time: match proposed, demo scheduled, tutor confirmed, and more.",
      },
      {
        q: "What if no tutor matches my requirement yet?",
        a: "We keep reviewing as new tutors join. If any tutor becomes a strong (60%+) fit for your requirement, you'll see their profile card — photo, subjects, fee, rating, area — right on your dashboard, even before a formal match is proposed.",
      },
    ],
  },
  {
    heading: "Referrals",
    items: [
      {
        q: "How does the referral program work?",
        a: "Share your referral code or link from your dashboard. When someone you referred gets their own first confirmed match, you earn 100 points — redeemable at the current rate for a discount code toward your own future one-time platform fee, capped at 50% of that fee.",
      },
      {
        q: "Where do I find my referral code or link?",
        a: "In the \"Refer & Earn\" section of your My Dashboard — it has your code, plus a share-link button that automatically fills the code in for whoever opens it.",
      },
    ],
  },
];

const TEACHER_SECTIONS: FaqSection[] = [
  {
    heading: "Getting started",
    items: [
      {
        q: "How do I apply to become a tutor?",
        a: (
          <>
            Register on{" "}
            <a href="/become-a-tutor" className="font-semibold text-amber-700 underline">
              Become a Tutor
            </a>{" "}
            with your subjects, availability, service area, and expected rate, then upload a government
            ID for KYC verification.
          </>
        ),
      },
      {
        q: "What is KYC and why is it required?",
        a: "It's identity verification using your government ID — required before you can be matched with any family. It protects both families and you, and it's a one-time step unless your details change.",
      },
      {
        q: "Do I need to bid for jobs or message parents myself?",
        a: "No. There's no bidding and no cold outreach. Our team shortlists you against real, reviewed parent requirements that fit your subjects and location.",
      },
      {
        q: "How long does approval take?",
        a: "Our team reviews every application personally — there's no fixed turnaround time, but you'll only be shortlisted for families once your KYC is approved.",
      },
    ],
  },
  {
    heading: "Matching & demo",
    items: [
      {
        q: "How does matching work?",
        a: "You're shortlisted against a specific family's reviewed requirement based on subject fit, availability, location, and willingness — not a public job board you apply to.",
      },
      {
        q: "What happens during the demo class?",
        a: "Future Minds coordinates the scheduling and communication with the family for the trial class. If the parent approves you afterward, the match is confirmed and attendance tracking begins.",
      },
      {
        q: "What if the parent doesn't confirm after the demo?",
        a: "No fee or commitment is triggered until the parent approves. You remain available to be matched against other requirements in the meantime.",
      },
    ],
  },
  {
    heading: "Payouts & commission",
    items: [
      {
        q: "How much commission does Future Minds take?",
        a: "A flat 10%, deducted from your payout, charged every month for as long as that batch stays active — for the matching, verification, and coordination work involved.",
      },
      {
        q: "How do I actually get paid?",
        a: "Log each class you teach on your Teacher Dashboard. Once the parent confirms it, it's tracked as validated; our team then releases your payout to the bank/UPI details on file, net of the 10% commission.",
      },
      {
        q: "Does Community Pooling change my own commission?",
        a: "No — you still pay your usual flat 10%. Future Minds separately collects its own 10% from each participating household's monthly share, which doesn't come out of your payout.",
      },
      {
        q: "Do I need to provide bank details?",
        a: "Yes, a UPI ID or bank account (with IFSC, holder name, and branch) is needed so we can release payouts. These are visible only to our admin team and used solely for that purpose.",
      },
    ],
  },
  {
    heading: "Profile, reviews & disputes",
    items: [
      {
        q: "Can parents review me?",
        a: "Yes, after a confirmed class a parent can leave a rating and comment, visible on your profile — it factors into whether you get shortlisted for future requirements, so it's worth keeping classes running well.",
      },
      {
        q: "How do I update my subjects, rate, or availability?",
        a: "Use the \"Edit Profile\" option on your Teacher Dashboard any time — changes apply to future matching immediately.",
      },
      {
        q: "What happens if a parent disputes a class I logged?",
        a: "Our team reviews the available record and makes a good-faith determination. Repeated disputes or logging irregularities may lead to a review of your account status, so log classes accurately.",
      },
      {
        q: "What do the account statuses (Active / Idle / Removed) mean?",
        a: "Active is normal standing. Idle or Removed can be set by our admin team for inactivity or a policy concern — if you think your status is wrong, contact us and we'll look into it.",
      },
    ],
  },
  {
    heading: "Referrals",
    items: [
      {
        q: "How does the referral program work for tutors?",
        a: "Same mechanic as parents: share your code or link from your Teacher Dashboard. Once a tutor you referred gets their own first confirmed match, you earn 100 points — redeemable for a discount on your own future payout commission, capped at 2 months of your stated monthly rate.",
      },
      {
        q: "Where do I find my referral code or link?",
        a: "In the \"Refer & Earn\" section of your Teacher Dashboard — it has your code, plus a share-link button that automatically fills the code in for whoever opens it.",
      },
    ],
  },
];

function AccordionItem({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 py-4 text-left"
      >
        <span className="text-sm font-medium text-navy">{item.q}</span>
        <svg
          viewBox="0 0 24 24"
          width={16}
          height={16}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <p className="pb-4 pr-8 text-sm leading-relaxed text-slate-600">{item.a}</p>
      )}
    </div>
  );
}

function FaqSectionBlock({ section }: { section: FaqSection }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-2 shadow-sm sm:px-8">
      <h3 className="pt-5 text-xs font-semibold uppercase tracking-widest text-amber-700">
        {section.heading}
      </h3>
      <div>
        {section.items.map((item) => (
          <AccordionItem key={item.q} item={item} />
        ))}
      </div>
    </div>
  );
}

export default function FaqPage() {
  const [audience, setAudience] = useState<"parents" | "teachers">("parents");
  const sections = audience === "parents" ? PARENT_SECTIONS : TEACHER_SECTIONS;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <BackButton />
      <main className="flex-1 bg-slate-50">
        <section className="bg-navy">
          <div className="mx-auto max-w-3xl px-6 py-14 text-center sm:px-8">
            <div className="mx-auto flex w-fit items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber">
              <span className="h-px w-4 bg-amber" />
              Help Centre
              <span className="h-px w-4 bg-amber" />
            </div>
            <h1 className="mt-4 font-heading text-3xl font-bold text-white sm:text-4xl">
              Frequently Asked Questions
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm text-white/60">
              Answers for parents & students, and for teachers & tutors — pick your side below.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-3xl px-6 py-10 sm:px-8">
          <div className="mx-auto flex w-fit rounded-full border border-slate-200 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setAudience("parents")}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
                audience === "parents" ? "bg-navy text-white" : "text-slate-500 hover:text-navy"
              }`}
            >
              Parents &amp; Students
            </button>
            <button
              type="button"
              onClick={() => setAudience("teachers")}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
                audience === "teachers" ? "bg-navy text-white" : "text-slate-500 hover:text-navy"
              }`}
            >
              Teachers &amp; Tutors
            </button>
          </div>

          <div className="mt-8 space-y-6">
            {sections.map((section) => (
              <FaqSectionBlock key={section.heading} section={section} />
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-amber/30 bg-amber/5 p-6 text-center sm:p-8">
            <h3 className="font-heading text-base font-semibold text-navy">
              Still haven&apos;t found your answer?
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
              Our team is happy to help directly — reach out over email or WhatsApp and we&apos;ll get
              back to you.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <a
                href="mailto:hello@futureminds.in"
                className="rounded-full border border-navy px-5 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-navy hover:text-white"
              >
                Email us
              </a>
              <a
                href="https://wa.me/917200227081"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-amber px-5 py-2.5 text-sm font-semibold text-navy transition-transform hover:-translate-y-0.5"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
