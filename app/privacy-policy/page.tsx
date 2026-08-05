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

export default function PrivacyPolicyPage() {
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
              Privacy Policy
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-white/60">
              Last updated: 3 August 2026 · Applies to the Future Minds tutor
              discovery &amp; learning management platform
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-3xl px-6 py-10 sm:px-8">
          <div className="mb-8 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-800">
            <strong>Draft for founder review.</strong> This page describes how
            the platform actually works today, so it can go live as a real
            Privacy Policy and Terms page. It should still be reviewed by a
            qualified lawyer before launch — particularly the sections marked{" "}
            <code className="rounded bg-amber-100 px-1">
              [confirm before publishing]
            </code>
            , which need your business&apos;s specific details filled in.
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-2 shadow-sm sm:px-8">
            <Section title="1. Who we are">
              <p>
                Future Minds (&quot;Future Minds&quot;, &quot;we&quot;, &quot;us&quot;) operates a managed
                tutor discovery and learning management platform serving
                families and educators in Coimbatore, Tamil Nadu, India, and
                such other areas as we expand to.
              </p>
              <p>
                Registered business name and address:{" "}
                <em>[confirm before publishing]</em>. Contact for privacy
                questions: <em>[confirm before publishing — e.g. privacy@futureminds.in]</em>.
              </p>
            </Section>

            <Section title="2. What personal data we collect">
              <p>
                <strong>From parents/guardians:</strong> name, phone number,
                email address, address, area/city, pincode, and WhatsApp
                number.
              </p>
              <p>
                <strong>About students,</strong> submitted by their
                parent/guardian: name, age or grade, gender, prior tutoring
                experience, and any notes or special requirements. We do not
                collect this information directly from a child — it is
                provided and consented to by the parent or guardian account
                holder.
              </p>
              <p>
                <strong>From tutors:</strong> name, phone number, email
                address, qualifications, experience, subjects and skills
                taught, preferred teaching locations and mode, availability,
                expected rate, a government ID document (for identity
                verification), bank account or UPI details (for payouts), and
                an optional profile photo.
              </p>
              <p>
                <strong>Reviews:</strong> ratings and comments a parent
                chooses to leave about a tutor after a confirmed class.
              </p>
              <p>
                <strong>Technical data:</strong> basic account activity
                (e.g. sign-in timestamps) generated automatically by our
                hosting infrastructure.
              </p>
            </Section>

            <Section title="3. Why we collect it">
              <ul className="list-disc space-y-1.5 pl-5">
                <li>To match a parent&apos;s requirement with a suitable tutor</li>
                <li>To coordinate and confirm demo classes</li>
                <li>
                  To verify a tutor&apos;s identity (KYC) before they are matched
                  with families
                </li>
                <li>To track attendance and calculate tutor payouts</li>
                <li>
                  To let a matched parent and tutor know who they&apos;ve been
                  connected with
                </li>
                <li>
                  To let parents share feedback about a tutor after a class
                </li>
                <li>To respond to support queries</li>
              </ul>
            </Section>

            <Section title="4. Consent, and data about children">
              <p>
                Because Future Minds involves information about students who
                may be minors, we treat this carefully under India&apos;s Digital
                Personal Data Protection Act, 2023 (DPDP Act). Processing a
                child&apos;s personal data requires verifiable consent from a
                parent or lawful guardian — which is why student details can
                only be submitted through a parent/guardian&apos;s own account, and
                why every account requires ticking a consent checkbox before
                the account can be created or a requirement submitted.
              </p>
              <p>
                That consent, together with the time it was given, is
                recorded against your account so there is a permanent record
                of it — not just a checkbox on a form.
              </p>
            </Section>

            <Section title="5. How your data is stored and protected">
              <ul className="list-disc space-y-1.5 pl-5">
                <li>
                  Data is stored in a hosted database (Supabase/Postgres)
                  with access rules that restrict each account to its own
                  data — parents see their own requirements and matched
                  tutor, tutors see their own matched families, and only our
                  admin team can see across all accounts.
                </li>
                <li>All connections to our platform use HTTPS encryption.</li>
                <li>
                  Government ID documents uploaded for KYC are stored in a
                  private location visible only to our admin team for
                  verification — never shown to other parents or tutors.
                </li>
                <li>
                  Bank/UPI details are visible only to our admin team, and
                  used only to process payouts.
                </li>
                <li>
                  A tutor&apos;s profile photo is stored separately and is shown
                  publicly as part of their profile.
                </li>
              </ul>
            </Section>

            <Section title="6. Who we share it with">
              <p>
                We do not sell your personal data to anyone. We share it only
                in these situations:
              </p>
              <ul className="list-disc space-y-1.5 pl-5">
                <li>
                  Once a parent and tutor are matched and a demo is
                  confirmed, we share the minimum contact details needed
                  (name and phone number) so they can coordinate directly.
                </li>
                <li>
                  With Supabase, our database and hosting provider, who
                  stores data on our behalf under their own security
                  practices, strictly to run the platform.
                </li>
                <li>If required to by law, court order, or regulation.</li>
              </ul>
            </Section>

            <Section title="7. How long we keep your data">
              <p>
                We keep account and activity data for as long as your account
                is active, and afterward for as long as reasonably necessary
                for dispute resolution, accounting, or legal compliance. You
                can request deletion at any time (see Section 9), subject to
                anything we&apos;re legally required to retain.
              </p>
            </Section>

            <Section title="8. Payments">
              <p>
                Future Minds does not currently process class fees through
                the platform. Parents pay tutors directly, as agreed between
                them. Future Minds separately collects its own service
                commission from the tutor for the matching, verification, and
                coordination service provided. This section will be updated
                if the platform begins collecting payments directly in the
                future.
              </p>
            </Section>

            <Section title="9. Your rights">
              <p>Under the DPDP Act, 2023, you have the right to:</p>
              <ul className="list-disc space-y-1.5 pl-5">
                <li>Access the personal data we hold about you</li>
                <li>Request correction of inaccurate or incomplete data</li>
                <li>
                  Request erasure of your data, subject to information we&apos;re
                  required to retain by law
                </li>
                <li>
                  Withdraw your consent at any time (which may mean we can no
                  longer provide the matching service to you)
                </li>
                <li>
                  Raise a grievance with us, and escalate to the Data
                  Protection Board of India if it isn&apos;t resolved
                </li>
              </ul>
              <p>
                To exercise any of these rights, contact us at{" "}
                <em>[confirm before publishing]</em>.
              </p>
            </Section>

            <Section title="10. Grievance officer">
              <p>
                Name and contact details of our designated Grievance Officer:{" "}
                <em>[confirm before publishing]</em>.
              </p>
            </Section>

            <Section title="11. Terms of use">
              <p>
                This page covers privacy specifically. For the full rules
                covering accounts, fees and commission, cancellations,
                conduct, and liability, see our{" "}
                <a href="/terms" className="font-semibold text-amber-700 underline">
                  Terms of Service
                </a>
                .
              </p>
            </Section>

            <Section title="12. Changes to this policy">
              <p>
                We may update this policy from time to time as the platform
                evolves. Material changes will be reflected with a new
                &quot;last updated&quot; date at the top of this page.
              </p>
            </Section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
