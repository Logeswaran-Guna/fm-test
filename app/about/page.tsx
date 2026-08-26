import Header from "../components/Header";
import Footer from "../components/Footer";
import BackButton from "../components/BackButton";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-slate-200 py-8 first:pt-0 last:border-0">
      <h2 className="font-heading text-lg font-semibold text-navy">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-600">
        {children}
      </div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <BackButton />
      <main className="flex-1 bg-slate-50">
        <section className="bg-navy">
          <div className="mx-auto max-w-3xl px-6 py-14 sm:px-8">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber">
              <span className="h-px w-4 bg-amber" />
              About Us
            </div>
            <h1 className="mt-4 font-heading text-3xl font-bold text-white sm:text-4xl">
              Every family&apos;s tutor search, personally guided
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-white/60">
              Not just listed. We get to know what your child needs, hand-pick
              the right educator, and stay involved through the demo,
              enrollment, and every class after.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-3xl px-6 py-10 sm:px-8">
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-2 shadow-sm sm:px-8">
            <Section title="What we do">
              <p>
                Future Minds is a managed tutor discovery and coordination
                platform, built for how Indian families actually learn —
                solo, in small groups, or pooled across a community. We
                review every requirement personally, shortlist educators by
                availability, location fit, and willingness, and stay
                involved through the demo class, enrollment, attendance
                tracking, and payouts.
              </p>
              <p>
                We&apos;re not a listings site. A parent doesn&apos;t scroll through
                profiles and cold-message strangers — our team does the
                matching, sits in on the coordination, and only releases
                payment once a class is confirmed to have actually happened.
              </p>
            </Section>

            <Section title="Our story">
              <p>
                Future Minds is built by two partners based in Chennai,
                Tamil Nadu, who saw the same gap from both sides: parents
                struggling to find a tutor they could actually trust, and
                good tutors struggling to find the right families without
                cold outreach or bidding wars. We built Future Minds to fix
                both sides of that problem at once — verification, personal
                coordination, and accountability, instead of guesswork.
              </p>
              <p>
                We&apos;re early and growing one verified match at a time —
                the numbers on our homepage are live and unedited, on
                purpose. We&apos;d rather show honest early traction than
                inflate it.
              </p>
            </Section>

            <Section title="Where we're headed">
              <p>
                Tutoring is where we started, not where we stop. Our plan is
                to grow Future Minds into a platform that stands beside
                working parents for everything they worry about in raising
                a child — not just academics, but extracurricular
                development, dependable care, good nutrition, and good
                manners and behavior. One trusted match at a time, we&apos;re
                building toward being the partner working families can rely
                on for their child&apos;s whole development, not just their
                next subject.
              </p>
            </Section>

            <Section title="What makes us different">
              <ul className="list-disc space-y-1.5 pl-5">
                <li>
                  <strong className="text-navy">Personally matched,</strong>{" "}
                  not just listed — our team shortlists educators by
                  subject, mode, location, and availability fit.
                </li>
                <li>
                  <strong className="text-navy">Verified tutors</strong> —
                  every tutor is KYC-checked before a family&apos;s first class.
                </li>
                <li>
                  <strong className="text-navy">Attendance assurance</strong>{" "}
                  — a class is confirmed by the parent before any payment
                  obligation is finalized.
                </li>
                <li>
                  <strong className="text-navy">Community Pooling</strong> —
                  apartments and residential groups can share a class, and
                  the cost, a model not offered by other tutoring platforms.
                </li>
                <li>
                  <strong className="text-navy">
                    Free access to training materials
                  </strong>{" "}
                  — class and subject-specific resources for every learner,
                  completely free, always.
                </li>
              </ul>
            </Section>

            <Section title="For tutors">
              <p>
                We handle the parts tutors don&apos;t want to: chasing leads,
                negotiating fees, and following up with families. Tutors on
                Future Minds get matched requirements, coordinated batches
                through Community Pooling, and long-term opportunities as we
                grow — with a flat 10% service commission rather than
                unpredictable lead-generation costs.
              </p>
            </Section>

            <Section title="Registered office &amp; contact">
              <p>
                Future Minds, Old Pallavaram, Chennai, Tamil Nadu, India.
              </p>
              <p>
                Email:{" "}
                <a href="mailto:contact@futuremindsindia.com" className="font-semibold text-amber-700 underline">
                  contact@futuremindsindia.com
                </a>
                <br />
                Phone:{" "}
                <a href="tel:+917200227081" className="font-semibold text-amber-700 underline">
                  +91 72002 27081
                </a>
              </p>
              <p>
                Read more in our{" "}
                <a href="/terms" className="font-semibold text-amber-700 underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy-policy" className="font-semibold text-amber-700 underline">
                  Privacy Policy
                </a>
                .
              </p>
            </Section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
