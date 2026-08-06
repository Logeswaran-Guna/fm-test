"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import logo from "../../public/images/fm-header-logo.png";
import { createClient } from "@/lib/supabase/client";
import { getCurrentProfile, type Profile } from "@/lib/supabase/profile";

const tutoringServices = [
  { href: "/tutor-platform", label: "Tutor Platform" },
  { href: "/creative-learning", label: "Creative Learning" },
  { href: "/soft-skills", label: "Soft Skills" },
];

const standaloneLinks = [
  { href: "/ai-robotics", label: "AI & Robotics" },
  { href: "/academy", label: "Academy" },
];


function TutoringServicesDropdown() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex items-center gap-1 text-[15px] font-medium text-navy/70 transition-colors hover:font-semibold hover:text-navy"
      >
        Tutoring Services
        <svg
          viewBox="0 0 24 24"
          width={14}
          height={14}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 top-full z-10 w-56 rounded-xl border border-slate-200 bg-white py-2 shadow-lg">
          {tutoringServices.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm font-medium text-navy/80 transition-colors hover:bg-slate-50 hover:text-navy"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

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
          <Link
            href="/"
            className="text-[15px] font-medium text-navy/70 transition-colors hover:font-semibold hover:text-navy"
          >
            Home
          </Link>

          <TutoringServicesDropdown />

          {standaloneLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[15px] font-medium text-navy/70 transition-colors hover:font-semibold hover:text-navy"
            >
              {link.label}
            </Link>
          ))}

          <div className="flex items-center gap-2">
            <Link
              href="/find-tutor"
              className="rounded-full border border-navy px-4 py-2 text-sm font-semibold text-navy transition-colors hover:bg-navy hover:text-white"
            >
              Find a Tutor
            </Link>
            <Link
              href="/become-a-tutor"
              className="rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-navy/85"
            >
              Become a Tutor
            </Link>
          </div>

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
