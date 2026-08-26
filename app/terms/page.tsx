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

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <BackButton />
      <main className="flex-1 bg-slate-50">
        <section className="bg-navy">
          <div className="mx-auto max-w-3xl px-6 py-14 sm:px-8">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber">
              <span className="h-px w-4 bg-amber" />
              Legal
            </div>
            <h1 className="mt-4 font-heading text-3xl font-bold text-white sm:text-4xl">
              Terms of Service
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-white/60">
              Last updated: 5 August 2026 · Applies to the Future Minds tutor
              discovery &amp; learning management platform
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-3xl px-6 py-10 sm:px-8">
          <div className="mb-8 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-800">
            <strong>Draft for founder review.</strong> This page describes how
            the platform actually works today, so it can go live as a real
            Terms of Service. It should still be reviewed by a qualified
            lawyer before launch — particularly the sections marked{" "}
            <code className="rounded bg-amber-100 px-1">
              [confirm before publishing]
            </code>
            , which need business decisions (e.g. refund policy specifics,
            registered business details) that aren&apos;t mine to make.
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-2 shadow-sm sm:px-8">
            <Section title="1. Acceptance of these terms">
              <p>
                By creating an account, submitting a requirement, or applying
                to become a tutor on Future Minds, you agree to these Terms
                of Service and to our{" "}
                <a href="/privacy-policy" className="font-semibold text-amber-700 underline">
                  Privacy Policy
                </a>
                . If you don&apos;t agree, please don&apos;t use the platform.
              </p>
              <p>
                Because Future Minds involves information about students who
                may be minors, a parent or legal guardian must create and
                control the account on a student&apos;s behalf — a student does
                not register directly.
              </p>
            </Section>

            <Section title="2. What Future Minds is — and isn't">
              <p>
                Future Minds is a managed tutor discovery and coordination
                platform. We review each family&apos;s requirement personally,
                shortlist suitable educators, and coordinate the relationship
                through the demo class, enrollment, attendance, and payout
                tracking.
              </p>
              <p>
                Tutors listed on the platform are independent educators, not
                employees, agents, or representatives of Future Minds. Future
                Minds is not a school, an employer of tutors, or a party to
                any tuition arrangement — we facilitate the introduction and
                coordinate the process, but the actual teaching relationship
                is between the parent/student and the tutor.
              </p>
              <p>
                We make a genuine, good-faith effort to match families with
                suitable educators and to verify tutor identity (see Section
                5), but we do not guarantee the outcome, quality, or
                continuation of any tuition arrangement.
              </p>
            </Section>

            <Section title="3. Accounts and eligibility">
              <ul className="list-disc space-y-1.5 pl-5">
                <li>
                  You must provide accurate, current information when you
                  register, and keep it up to date.
                </li>
                <li>
                  You&apos;re responsible for keeping your login credentials
                  confidential and for all activity under your account.
                </li>
                <li>
                  Tutor accounts must be created by the individual who will
                  actually be teaching — not registered on someone else&apos;s
                  behalf, except by our own team during an assisted phone
                  registration.
                </li>
                <li>
                  One account per person. Creating multiple accounts to
                  bypass a status change (e.g. after being removed) is a
                  violation of these terms.
                </li>
              </ul>
            </Section>

            <Section title="4. Submitting a requirement (parents)">
              <p>
                When you submit a learning requirement, you&apos;re asking us to
                find and coordinate a suitable tutor. Submitting a
                requirement does not guarantee a match, a specific tutor, or
                a specific timeline — matching depends on tutor availability
                in your area and subject.
              </p>
              <p>
                You confirm that any information you provide about a student
                is provided with the knowledge and consent of that student&apos;s
                parent or legal guardian (i.e., you).
              </p>
            </Section>

            <Section title="5. Applying as a tutor">
              <p>
                Tutor applications go through a verification (KYC) step
                before a tutor can be matched with a family, using the
                government ID and details submitted at application. This
                verification is a reasonable diligence check, not a
                background check or professional certification, and Future
                Minds does not warrant a tutor&apos;s teaching ability,
                qualifications claimed, or conduct.
              </p>
              <p>
                Submitting false information in a tutor application —
                including qualifications, identity documents, or experience —
                is grounds for immediate removal from the platform.
              </p>
            </Section>

            <Section title="6. Fees, payments &amp; commission">
              <p>
                Future Minds does not currently process class fees through
                the platform. Parents pay tutors directly, as agreed between
                them. For a standard (non-pooled) match, once you approve a
                tutor, Future Minds charges you a one-time platform fee of
                20% of your submitted budget, paid directly to Future Minds.
                Separately, Future Minds charges the tutor a flat 10% service
                commission, deducted from their payout, recurring every month
                for as long as the batch stays active, for the matching,
                verification, attendance-tracking, and coordination provided.
              </p>
              <p>
                Community Pooling batches work differently: instead of a
                one-time parent fee, both sides pay a recurring 10% every
                month for as long as the pooled batch stays active — Future
                Minds deducts a flat 10% from the teacher&apos;s payout{" "}
                <em>and</em>{" "}
                separately collects a flat 10% from each participating
                household&apos;s monthly share of the pooled amount. Both the
                parent-side one-time fee and the pooling parent-side monthly
                fee are tracked and collected manually by our team, the same
                way payouts are, until an in-platform payment option exists.
              </p>
              <p>
                We may introduce in-platform payment options (for example,
                QR-code based payments) in the future. This section will be
                updated, and you&apos;ll be notified, before any such change
                takes effect.
              </p>
              <p>
                Payout figures shown in a tutor&apos;s dashboard are based on
                classes logged and confirmed through the platform, and are
                calculated using the commission structure in effect at the
                time.
              </p>
            </Section>

            <Section title="7. Cancellations, no-shows &amp; refunds">
              <p>
                Because class fees are paid directly between parent and
                tutor, cancellation and refund terms for individual classes
                are a matter between them. Future Minds&apos; role is limited to
                coordinating scheduling and tracking attendance/logged
                classes accurately.{" "}
                <em>[confirm before publishing — any FM-specific policy on
                repeated no-shows or demo cancellations]</em>.
              </p>
            </Section>

            <Section title="8. Attendance, disputes &amp; logged classes">
              <p>
                Class sessions are logged by the tutor and confirmed by the
                parent. If a parent disputes a logged session, our team
                reviews the available record and makes a determination in
                good faith. Repeated disputes or logging irregularities may
                result in a status change on either account while we
                investigate.
              </p>
            </Section>

            <Section title="9. Conduct">
              <p>You agree not to:</p>
              <ul className="list-disc space-y-1.5 pl-5">
                <li>
                  Use the platform to harass, discriminate against, or
                  endanger another user, including any student.
                </li>
                <li>
                  Circumvent the platform to avoid a commission owed, once a
                  match has been coordinated through Future Minds.
                </li>
                <li>
                  Submit spam, automated, or fraudulent requirement/tutor
                  applications, or otherwise attempt to abuse or overload our
                  public forms.
                </li>
                <li>
                  Misrepresent your identity, qualifications, or the identity
                  of a student.
                </li>
                <li>
                  Scrape, copy, or resell content, tutor listings, or the
                  category taxonomy from the platform.
                </li>
              </ul>
            </Section>

            <Section title="10. Reviews">
              <p>
                Parents may leave a rating and review about a tutor after a
                confirmed class. Reviews must reflect a genuine experience.
                We may remove a review that is abusive, unrelated to the
                platform, or that we reasonably believe to be fraudulent.
              </p>
            </Section>

            <Section title="11. Suspension and termination">
              <p>
                We may suspend or remove an account for misuse, fraud,
                repeated policy violations, or at a user&apos;s own request. See
                our Privacy Policy for how account status (Active / Idle /
                Removed / Deleted) works and what happens to associated data.
              </p>
              <p>
                You may stop using the platform at any time; contact us to
                request account removal.
              </p>
            </Section>

            <Section title="12. Intellectual property">
              <p>
                The Future Minds name, logo, brand, and the platform&apos;s
                content, design, and learning-category taxonomy belong to
                Future Minds and may not be copied or reused without
                permission. Content you submit (e.g. a review, a profile
                description) remains yours, but you grant us the right to
                display it on the platform for its intended purpose.
              </p>
            </Section>

            <Section title="13. Limitation of liability">
              <p>
                Future Minds coordinates introductions and tracks the
                administrative side of a tuition arrangement, but is not
                responsible for the conduct, safety, or performance of any
                parent, student, or tutor during a class, or for any dispute
                arising directly between them. To the fullest extent
                permitted by law, Future Minds&apos; liability in connection with
                the platform is limited to the commission fees actually paid
                to us in the relevant period.
              </p>
            </Section>

            <Section title="14. Changes to these terms">
              <p>
                We may update these terms as the platform evolves. Material
                changes will be reflected with a new &quot;last updated&quot; date at
                the top of this page. Continuing to use the platform after a
                change means you accept the updated terms.
              </p>
            </Section>

            <Section title="15. Governing law &amp; contact">
              <p>
                These terms are governed by the laws of India. Registered
                business name and address:{" "}
                <em>[confirm before publishing]</em>. For questions about
                these terms, contact us at{" "}
                <a href="mailto:contact@futuremindsindia.com" className="font-semibold text-amber-700 underline">
                  contact@futuremindsindia.com
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
