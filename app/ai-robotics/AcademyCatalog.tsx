"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import HoneypotField from "../components/HoneypotField";
import { isLikelyBot } from "@/lib/antiSpam";

type Course = {
  id: string;
  display_id: string;
  title: string;
  age_range: string | null;
  format: string | null;
  description: string | null;
  duration: string | null;
  price: number | null;
  status: "OPEN" | "COMING_SOON" | "CLOSED";
  image_url: string | null;
};

function formatPrice(price: number | null): string {
  return price != null ? `Rs ${price.toLocaleString("en-IN")}` : "Contact us for pricing";
}

function EnrollForm({ course, onClose }: { course: Course; onClose: () => void }) {
  const [enrolleeName, setEnrolleeName] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentAge, setStudentAge] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const startedAtRef = useRef(0);

  useEffect(() => {
    startedAtRef.current = Date.now();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!enrolleeName.trim() || !contactPhone.trim()) {
      setError("Name and phone number are required.");
      return;
    }
    if (isLikelyBot(honeypot, startedAtRef.current)) {
      setSubmitted(true); // fail silently, same success state
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: rpcError } = await supabase.rpc("submit_academy_enrollment", {
        p_course_id: course.id,
        p_enrollee_name: enrolleeName.trim(),
        p_contact_phone: contactPhone.trim(),
        p_contact_email: contactEmail.trim() || null,
        p_student_name: studentName.trim() || null,
        p_student_age: studentAge.trim() || null,
        p_notes: notes.trim() || null,
      });
      if (rpcError) throw new Error(rpcError.message);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit your enrollment request.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-navy/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {submitted ? (
          <div className="py-6 text-center">
            <h3 className="font-heading text-lg font-semibold text-navy">Request received!</h3>
            <p className="mt-2 text-sm text-slate-500">
              We&apos;ll reach out to confirm your spot in <strong>{course.title}</strong> and arrange payment.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 rounded-xl bg-amber px-6 py-2.5 text-sm font-semibold text-navy"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-amber-700">Enroll</p>
                <h3 className="font-heading text-lg font-semibold text-navy">{course.title}</h3>
                <p className="text-xs text-slate-400">{formatPrice(course.price)} · {course.duration}</p>
              </div>
              <button type="button" onClick={onClose} className="text-slate-400 hover:text-navy">
                ✕
              </button>
            </div>

            <HoneypotField value={honeypot} onChange={setHoneypot} />

            <div>
              <label className="mb-1 block text-sm font-medium text-navy">Your name</label>
              <input
                value={enrolleeName}
                onChange={(e) => setEnrolleeName(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber/50"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-navy">Phone</label>
              <input
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber/50"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-navy">Email (optional)</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber/50"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-navy">Student name (if for a child)</label>
                <input
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber/50"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-navy">Age</label>
                <input
                  value={studentAge}
                  onChange={(e) => setStudentAge(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber/50"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-navy">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber/50"
              />
            </div>

            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-amber px-6 py-3 text-sm font-semibold text-navy shadow-lg shadow-amber/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Submitting…" : "Submit Enrollment Request"}
            </button>
            <p className="text-center text-[11px] text-slate-400">
              No payment happens here — our team will contact you to arrange it.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default function AcademyCatalog() {
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [enrollTarget, setEnrollTarget] = useState<Course | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.rpc("academy_courses_public").then(({ data }) => {
      setCourses((data as Course[]) ?? []);
    });
  }, []);

  if (courses === null) {
    return <p className="text-sm text-slate-400">Loading courses…</p>;
  }

  if (courses.length === 0) {
    return null;
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {courses.map((course) => (
          <div
            key={course.id}
            className="flex gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            {course.image_url && (
              <div
                className="relative hidden w-28 shrink-0 sm:block"
                style={{ animation: "float-slow 4s ease-in-out infinite" }}
              >
                <div className="absolute -inset-2 rounded-2xl bg-amber/50 blur-xl" aria-hidden="true" />
                <div className="relative h-full w-full overflow-hidden rounded-xl shadow-[0_0_16px_rgba(245,158,11,0.45)] ring-1 ring-amber/40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={course.image_url}
                    alt={`${course.title} flyer`}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-heading text-base font-semibold text-navy">{course.title}</h4>
                  <p className="mt-1 text-xs text-slate-400">
                    {course.age_range} {course.format && `· ${course.format}`}
                  </p>
                </div>
                {course.status === "COMING_SOON" && (
                  <span className="shrink-0 rounded-full bg-amber/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
                    Coming Soon
                  </span>
                )}
              </div>
              {course.description && (
                <p className="mt-3 text-sm leading-relaxed text-slate-500">{course.description}</p>
              )}
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm font-semibold text-navy">
                  {formatPrice(course.price)}
                  {course.duration && <span className="ml-1 font-normal text-slate-400">· {course.duration}</span>}
                </p>
                {course.status === "OPEN" ? (
                  <button
                    type="button"
                    onClick={() => setEnrollTarget(course)}
                    className="rounded-full bg-navy px-4 py-2 text-xs font-semibold text-white transition-transform hover:-translate-y-0.5"
                  >
                    Enroll →
                  </button>
                ) : (
                  <span className="text-xs text-slate-400">Not open yet</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {enrollTarget && <EnrollForm course={enrollTarget} onClose={() => setEnrollTarget(null)} />}
    </>
  );
}
