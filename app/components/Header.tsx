import Image from "next/image";
import Link from "next/link";
import logo from "../../public/images/FM LOGO.jpeg";

const navLinks = [
  { href: "/find-tutor", label: "Find a Tutor" },
  { href: "/become-a-tutor", label: "Become a Tutor" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-navy/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-3 sm:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <Image
            src={logo}
            alt="Future Minds Logo"
            className="h-10 w-auto md:h-12"
            priority
          />
          <span className="font-heading text-lg font-semibold text-white sm:text-xl">
            Future Minds
          </span>
        </Link>

        <nav className="flex flex-wrap items-center justify-end gap-x-6 gap-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-white/80 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="rounded-full bg-amber px-5 py-2 text-sm font-semibold text-navy transition-transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber/30"
          >
            Login
          </Link>
          <Link 
  href="/Teacher" 
  className="text-xs bg-slate-800 text-teal-400 px-2.5 py-1 rounded border border-teal-500/30 hover:bg-slate-700 transition-colors"
>
  Teacher Portal
</Link>
          <Link 
  href="/admin" 
  className="text-xs bg-slate-800 text-amber-400 px-2.5 py-1 rounded border border-amber-500/30 hover:bg-slate-700 transition-colors"
>
  Admin Portal
</Link>
        </nav>
      </div>
      
    </header>
  );
}
