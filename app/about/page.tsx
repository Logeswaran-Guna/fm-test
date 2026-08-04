import Header from "../components/Header";
import Footer from "../components/Footer";

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
              Based in Coimbatore, Tamil Nadu, and built for how Indian families actually find and trust an educator.
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
                with a branch in Gudiyattam, Vellore — built with Coimbatore
                and Tamil Nadu families in mind first, and growing from
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
