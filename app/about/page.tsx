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
              A managed learning ecosystem, not a listing directory
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-white/60">
              Based in Chennai, Tamil Nadu, and built for how Indian families actually find and trust an educator.
            </p>
            <p className="mt-2 max-w-2xl text-xs text-white/40">
              Every number on this site — tutors onboarded, classes completed, categories live — reflects real,
              live data from the platform, not placeholder marketing figures.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-3xl px-6 py-10 sm:px-8">
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-2 shadow-sm sm:px-8">
            <Section title="Why we exist">
              <p>
                Finding a good tutor in India today usually means asking
                around, comparing strangers on a directory, and hoping it
                works out — with no real way to verify quality beforehand,
                no one coordinating the demo class, and no system to confirm
                a class actually happened before money changes hands.
              </p>
              <p>
                Future Minds exists to close that gap. Instead of just
                listing tutors and stepping back, our team reviews every
                request, hand-picks and validates suitable educators, and
                stays involved through the demo, enrollment, and every class
                logged afterward.
              </p>
            </Section>

            <Section title="How we work">
              <p>
                A parent submits what they need — subject, level, mode,
                location, schedule, and budget. Our team shortlists
                educators by availability, location fit, and willingness,
                coordinates a demo class, and only marks an assignment
                confirmed once the parent has approved the tutor. From
                there, every class is logged and confirmed by the parent
                before it factors into a tutor&apos;s payout — so trust isn&apos;t
                assumed, it&apos;s tracked.
              </p>
            </Section>

            <Section title="Our fees, transparently">
              <p>
                For a standard match, once you approve a tutor, Future Minds charges a one-time platform fee of
                20% of your monthly budget — paid directly to us, separate from what you pay the tutor. The tutor
                separately pays Future Minds a 10% commission from their own earnings, recurring every month for as
                long as the class stays active, until the batch closes. Every rupee of that fee maps to real,
                ongoing work, not just a cut for existing:
              </p>
              <ul className="list-disc space-y-1.5 pl-5">
                <li>
                  <strong className="text-navy">Profile maintenance</strong>
                  {" — "}verifying a tutor&apos;s identity (KYC) once, then keeping their profile, subjects, and
                  availability accurate as they take on more classes.
                </li>
                <li>
                  <strong className="text-navy">Platform fee</strong>
                  {" — "}the hosting, database, admin dashboard, and matching tools that keep every family&apos;s and
                  tutor&apos;s records running and secure.
                </li>
                <li>
                  <strong className="text-navy">Commission for the handshake</strong>
                  {" — "}our team reviewing each requirement, shortlisting suitable educators, and coordinating the
                  introduction and demo class — the actual matching work, not just a listing.
                </li>
                <li>
                  <strong className="text-navy">Attendance, with parent validation</strong>
                  {" — "}every class a tutor logs has to be confirmed by the parent before it counts toward a
                  payout; we build and maintain that verification step so payment is never released on an
                  unconfirmed claim.
                </li>
                <li>
                  <strong className="text-navy">Administrative cost</strong>
                  {" — "}a person on our team reviews KYC documents, resolves disputes, and processes every payout
                  by hand at this stage — real, ongoing labor, not an automated cut.
                </li>
              </ul>
              <p>
                Community Pooling works differently: instead of a one-time parent fee, both sides pay a recurring
                10% every month for as long as the pooled batch stays active — 10% of the tutor&apos;s payout{" "}
                <em>and</em>{" "}
                a separate 10% of each participating household&apos;s monthly share, since coordinating several
                families onto one shared batch is ongoing work each month, not a one-time introduction. See{" "}
                <a href="/tutor-platform" className="font-semibold text-amber-700 underline">
                  how Community Pooling works
                </a>{" "}
                for the full breakdown.
              </p>
            </Section>

            <Section title="Two verticals, one mission">
              <p>
                Future Minds runs two connected efforts: a tutor discovery
                and learning management platform covering academics,
                creative learning, and soft skills — and Future Minds
                Academy, our training division for AI and future-skills
                programs. Both share the same principle: active,
                human-guided management beats a passive listing every time.
              </p>
            </Section>

            <Section title="Where we're based">
              <p>
                Future Minds is headquartered in Old Pallavaram, Chennai,
                with a branch in Gudiyattam, Vellore — built with Tamil Nadu
                and South Indian families in mind first, and growing from
                there.
              </p>
            </Section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
