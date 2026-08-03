"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import logo from "../../public/images/fm-header-logo.png";
import { createClient } from "@/lib/supabase/client";
import { getCurrentProfile, type Profile } from "@/lib/supabase/profile";

const navLinks = [
  { href: "/find-tutor", label: "Find a Tutor" },
  { href: "/become-a-tutor", label: "Become a Tutor" },
];

export default function Header() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    getCurrentProfile(supabase).then((p) => {
      if (active) {
        setProfile(p);
        setLoaded(true);
      }
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(() => {
      getCurrentProfile(supabase).then((p) => active && setProfile(p));
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    function updateScrollProgress() {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
      setScrollPct(Math.min(100, Math.max(0, pct)));
    }
    updateScrollProgress();
    window.addEventListener("scroll", updateScrollProgress, { passive: true });
    window.addEventListener("resize", updateScrollProgress);
    return () => {
      window.removeEventListener("scroll", updateScrollProgress);
      window.removeEventListener("resize", updateScrollProgress);
    };
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setProfile(null);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div
        className="h-[3px] bg-gradient-to-r from-amber to-amber/60 transition-[width] duration-150 ease-out"
        style={{ width: `${scrollPct}%` }}
        aria-hidden
      />
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-2.5 sm:px-8">
        <Link href="/" className="flex shrink-0 items-center">
          <Image
            src={logo}
            alt="Future Minds"
            className="h-11 w-auto md:h-12"
            priority
          />
        </Link>

        <nav className="flex flex-wrap items-center justify-end gap-x-6 gap-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[15px] font-medium text-navy/70 transition-colors hover:font-semibold hover:text-navy"
            >
              {link.label}
            </Link>
          ))}

          {loaded && profile && (
            <Link
              href={
                profile.role === "ADMIN"
                  ? "/admin"
                  : profile.role === "TEACHER"
                    ? "/Teacher"
                    : "/my-dashboard"
              }
              className="text-[15px] font-medium text-navy/70 transition-colors hover:font-semibold hover:text-navy"
            >
              {profile.role === "ADMIN" ? "Admin Dashboard" : "My Dashboard"}
            </Link>
          )}

          {loaded && profile ? (
            <>
              <span className="text-xs text-slate-500">
                Signed in as {profile.name}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full bg-amber px-6 py-2.5 text-[15px] font-semibold text-navy transition-transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber/30"
              >
                Log out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-amber px-6 py-2.5 text-[15px] font-semibold text-navy transition-transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber/30"
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
