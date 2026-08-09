import Link from "next/link";

const SOCIAL_LINKS: { name: string; href: string; icon: React.ReactNode }[] = [
  {
    name: "Instagram",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4.2" />
        <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="12" cy="12" r="9" />
        <path d="M14 8.5h-1.5A2 2 0 0010.5 10.5V12H9v2.2h1.5V21H13v-6.8h1.8l.3-2.2H13v-1.2c0-.4.3-.6.7-.6H14z" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    name: "YouTube",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="2.5" y="6" width="19" height="12" rx="4" />
        <path d="M10.5 9.5l5 2.5-5 2.5z" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3" y="3" width="18" height="18" rx="4" />
        <circle cx="8" cy="8.5" r="0.9" fill="currentColor" stroke="none" />
        <path d="M8 11v6M12 11v6M12 13.5c0-1.5 1-2.5 2.3-2.5S17 12 17 13.5V17" />
      </svg>
    ),
  },
  {
    name: "X",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M5 5l14 14M19 5L5 19" />
      </svg>
    ),
  },
];

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-amber">{title}</p>
      <div className="space-y-1.5 text-sm text-white/70">{children}</div>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-navy pt-14 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber/10 blur-3xl"
      />
      <div className="relative mx-auto max-w-3xl px-6 text-center sm:px-8">
        <div className="mx-auto mb-6 flex w-fit items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber">
          <span className="h-px w-4 bg-amber" />
          Learn Today. Lead Tomorrow.
          <span className="h-px w-4 bg-amber" />
        </div>

        <p className="font-heading text-lg font-semibold leading-relaxed text-amber-300 sm:text-xl">
          கற்க கசடறக் கற்பவை கற்றபின்
          <br />
          நிற்க அதற்குத் தக.
        </p>
        <p className="mt-2 font-mono text-[11px] text-white/40">
          திருக்குறள் · குறள் 391 · பால்: பொருட்பால் · அதிகாரம்: கல்வி (40ஆம் அதிகாரம்)
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 text-left sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="mb-2 font-mono text-[10.5px] uppercase tracking-widest text-amber-400">
              English
            </p>
            <p className="text-sm leading-relaxed text-white/80">
              Learn thoroughly whatever is worth learning — and once learned,
              live faithfully by what you have learned.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="mb-2 font-mono text-[10.5px] uppercase tracking-widest text-amber-400">
              हिन्दी
            </p>
            <p className="text-sm leading-relaxed text-white/80">
              जो सीखने योग्य है, उसे पूर्ण और त्रुटिरहित होकर सीखो; और सीखने के
              बाद, उसी अनुसार आचरण करो।
            </p>
          </div>
        </div>
      </div>

      <div className="relative mx-auto mt-14 max-w-7xl border-t border-white/10 px-6 pt-12 sm:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <FooterColumn title="Quick Links">
            <Link href="/" className="block hover:text-white">Home</Link>
            <Link href="/about" className="block hover:text-white">About Us</Link>
            <Link href="/faq" className="block hover:text-white">FAQ</Link>
            <a href="mailto:careers@futureminds.in" className="block hover:text-white">Careers</a>
          </FooterColumn>

          <FooterColumn title="Contact Us">
            <a href="mailto:hello@futureminds.in" className="block hover:text-white">
              hello@futureminds.in
            </a>
            <a href="tel:+919876543210" className="block hover:text-white">
              +91 98765 43210
            </a>
          </FooterColumn>

          <FooterColumn title="Head Office">
            <p className="font-medium text-white">Future Minds</p>
            <p>Old Pallavaram,</p>
            <p>Chennai, Tamil Nadu</p>
          </FooterColumn>

          <FooterColumn title="Branch">
            <p className="font-medium text-white">Future Minds</p>
            <p>Gudiyattam,</p>
            <p>Vellore, Tamil Nadu</p>
          </FooterColumn>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11.5px] text-white/40">
            <span>Future Minds — Learn Today. Lead Tomorrow.</span>
            <Link href="/privacy-policy" className="underline hover:text-white/70">
              Privacy Policy
            </Link>
            <Link href="/terms" className="underline hover:text-white/70">
              Terms of Service
            </Link>
            <span>© {new Date().getFullYear()} Future Minds. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-3">
            {SOCIAL_LINKS.map((social, i) => (
              <a
                key={social.name}
                href={social.href}
                aria-label={social.name}
                className={`flex h-9 w-9 items-center justify-center rounded-full shadow-sm transition-transform hover:-translate-y-0.5 ${
                  i % 2 === 0 ? "bg-navy text-amber ring-1 ring-amber/40" : "bg-amber text-navy"
                }`}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
