"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import StatusBadge from "../components/StatusBadge";
import { createClient } from "@/lib/supabase/client";
import { getCurrentProfile, type Profile } from "@/lib/supabase/profile";
import type { EntityStatus } from "@/lib/status";

type MatchStatus =
  | "PROPOSED"
  | "DEMO_PROPOSED"
  | "DEMO_SCHEDULED"
  | "CONFIRMED"
  | "DECLINED";

type MyRequirement = {
  id: string;
  display_id: string;
  subject: string;
  mode: string;
  location: string | null;
  status: "open" | "assigned";
  created_at: string;
  student_display_id: string | null;
  student_name: string | null;
  student_grade: string | null;
  match_id: string | null;
  match_label: string | null;
  match_status: MatchStatus | null;
  demo_date: string | null;
  parent_accepted_demo: boolean | null;
  teacher_accepted_demo: boolean | null;
  teacher_name: string | null;
  teacher_phone: string | null;
  time_slot: string | null;
};

type MyStudent = {
  id: string;
  display_id: string;
  student_name: string | null;
  age_grade: string | null;
  status: EntityStatus;
};

const STATUS_LABELS: Record<MatchStatus, string> = {
  PROPOSED: "Match Proposed",
  DEMO_PROPOSED: "Demo Proposed",
  DEMO_SCHEDULED: "Demo Scheduled",
  CONFIRMED: "Confirmed",
  DECLINED: "Declined",
};

type SessionStatus = "LOGGED" | "PARENT_CONFIRMED" | "DISPUTED" | "ADMIN_VALIDATED";

type MySession = {
  id: string;
  display_id: string;
  match_label: string;
  date: string;
  status: SessionStatus;
  amount: number | null;
};

const SESSION_STATUS_LABELS: Record<SessionStatus, string> = {
  LOGGED: "Awaiting your confirmation",
  PARENT_CONFIRMED: "Confirmed — awaiting admin",
  DISPUTED: "Disputed",
  ADMIN_VALIDATED: "Validated",
};

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
          className={`text-xl leading-none ${star <= value ? "text-amber-500" : "text-slate-300"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function RateTutorForm({
  matchId,
  onDone,
}: {
  matchId: string;
  onDone: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (rating < 1) {
      setError("Pick a star rating first.");
      return;
    }
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("submit_teacher_review", {
      p_match_id: matchId,
      p_rating: rating,
      p_comment: comment.trim() || null,
    });
    setBusy(false);
    if (rpcError) {
      setError(rpcError.message);
      return;
    }
    onDone();
  }

  return (
    <div className="mt-3 space-y-2 rounded-lg border border-emerald-200 bg-white p-3">
      <StarPicker value={rating} onChange={setRating} />
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Anything you'd like to share about this tutor? (optional)"
        rows={2}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-navy placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber/50"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button
        type="button"
        disabled={busy}
        onClick={submit}
        className="w-full rounded-lg bg-amber px-3 py-2 text-xs font-semibold text-navy transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? "Submitting…" : "Submit review"}
      </button>
    </div>
  );
}

export default function MyDashboardPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [requirements, setRequirements] = useState<MyRequirement[]>([]);
  const [sessions, setSessions] = useState<MySession[]>([]);
  const [students, setStudents] = useState<MyStudent[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [ratingOpenFor, setRatingOpenFor] = useState<string | null>(null);
  const [ratedMatches, setRatedMatches] = useState<Set<string>>(new Set());
  const [parentProfile, setParentProfile] = useState<Profile | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const supabase = createClient();
      const profile = await getCurrentProfile(supabase);
      if (!active) return;
      if (!profile || profile.role !== "PARENT") {
        router.replace("/login");
        return;
      }
      setParentProfile(profile);
      setCheckingAuth(false);
    })();
    return () => {
      active = false;
    };
  }, [router]);

  async function loadData() {
    const supabase = createClient();
    const [reqRes, sessRes, studentsRes] = await Promise.all([
      supabase.rpc("my_requirements"),
      supabase.rpc("my_sessions"),
      supabase.rpc("my_students"),
    ]);
    const rpcError = reqRes.error || sessRes.error || studentsRes.error;
    setError(rpcError ? rpcError.message : null);
    if (!reqRes.error) setRequirements((reqRes.data as MyRequirement[]) ?? []);
    if (!sessRes.error) setSessions((sessRes.data as MySession[]) ?? []);
    if (!studentsRes.error) setStudents((studentsRes.data as MyStudent[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    if (checkingAuth) return;
    Promise.resolve().then(loadData);
  }, [checkingAuth]);

  async function respondToDemo(matchId: string, accept: boolean) {
    setBusyId(matchId);
    setError(null);
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc(
      accept ? "accept_demo" : "decline_demo",
      { p_match_id: matchId }
    );
    if (rpcError) setError(rpcError.message);
    else await loadData();
    setBusyId(null);
  }

  async function approveTeacher(matchId: string) {
    setBusyId(matchId);
    setError(null);
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("approve_teacher", {
      p_match_id: matchId,
    });
    if (rpcError) setError(rpcError.message);
    else await loadData();
    setBusyId(null);
  }

  async function respondToSession(sessionId: string, confirm: boolean) {
    setBusyId(sessionId);
    setError(null);
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc(
      confirm ? "confirm_session" : "dispute_session",
      { p_session_id: sessionId }
    );
    if (rpcError) setError(rpcError.message);
    else await loadData();
    setBusyId(null);
  }

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-400">
        Checking your session…
      </div>
    );
  }

  const assignmentCounts = requirements.reduce<Record<string, number>>((acc, r) => {
    if (r.match_status === "CONFIRMED" && r.student_display_id) {
      acc[r.student_display_id] = (acc[r.student_display_id] || 0) + 1;
    }
    return acc;
  }, {});

  const selectedStudent = students.find((s) => s.id === selectedStudentId) || null;
  const visibleRequirements = selectedStudent
    ? requirements.filter((r) => r.student_display_id === selectedStudent.display_id)
    : requirements;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-slate-50">
        <section className="bg-navy">
          <div className="mx-auto max-w-5xl px-6 py-10 sm:px-8">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber">
              <span className="h-px w-4 bg-amber" />
              Your Account
            </div>
            <h1 className="mt-3 font-heading text-3xl font-bold text-white">
              My Dashboard
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-white/60">
              Track each subject you&apos;ve submitted, respond to proposed
              demos, and approve a teacher once the demo has happened.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-5xl px-6 py-8 sm:px-8">
          {error && (
            <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          )}

          {!loading && parentProfile && (
            <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-navy">
                    Parent Profile
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {parentProfile.name} <span className="text-slate-400">· {parentProfile.display_id}</span>
                  </p>
                  <div className="mt-1">
                    <StatusBadge status={parentProfile.status} />
                  </div>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                  {students.length} {students.length === 1 ? "kid" : "kids"} enrolled
                </span>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {students.map((s) => (
                  <div
                    key={s.id}
                    className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-heading text-sm font-semibold text-navy">
                        {s.student_name || "Student"}
                      </p>
                      <StatusBadge status={s.status} />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {s.display_id} · {s.age_grade || "Grade not set"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {assignmentCounts[s.display_id] || 0}{" "}
                      {(assignmentCounts[s.display_id] || 0) === 1
                        ? "ongoing assignment"
                        : "ongoing assignments"}
                    </p>
                  </div>
                ))}
              </div>

              {students.length > 1 && (
                <div className="mt-4">
                  <label className="mb-1.5 block text-xs font-medium text-navy">
                    View requirements for
                  </label>
                  <select
                    value={selectedStudentId ?? ""}
                    onChange={(e) => setSelectedStudentId(e.target.value || null)}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-amber/50 sm:w-72"
                  >
                    <option value="">All students</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.student_name || "Student"} ({s.display_id})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {loading ? (
            <div className="py-16 text-center text-sm text-slate-400">
              Loading your requirements…
            </div>
          ) : visibleRequirements.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center text-sm text-slate-400">
              No requirements yet.{" "}
              <a href="/find-tutor" className="text-amber-600 underline">
                Submit one
              </a>
              .
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {visibleRequirements.map((r) => (
                <div
                  key={r.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-heading text-sm font-semibold text-navy">
                        {r.student_name || "Student"}
                        {r.student_grade ? ` · ${r.student_grade}` : ""}
                      </p>
                      <p className="text-xs text-slate-500">{r.subject}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                      {r.match_status
                        ? STATUS_LABELS[r.match_status]
                        : "No match yet"}
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-slate-400">
                    {r.display_id} · {r.location || "Location not set"}
                  </p>

                  {!r.match_status && (
                    <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                      Our team is reviewing this requirement and will match
                      you with a tutor soon.
                    </p>
                  )}

                  {r.match_status === "PROPOSED" && (
                    <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                      Matched with <strong>{r.teacher_name}</strong> —
                      waiting for a demo date to be proposed.
                    </p>
                  )}

                  {r.match_status === "DEMO_PROPOSED" && (
                    <div className="mt-4 space-y-2">
                      <p className="text-xs text-slate-600">
                        Demo with <strong>{r.teacher_name}</strong> proposed
                        for {formatDate(r.demo_date)} ({r.time_slot}).
                      </p>
                      {r.parent_accepted_demo ? (
                        <p className="text-xs text-emerald-600">
                          You accepted — waiting for the teacher.
                        </p>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={busyId === r.match_id}
                            onClick={() =>
                              respondToDemo(r.match_id as string, true)
                            }
                            className="flex-1 rounded-lg bg-amber px-3 py-2 text-xs font-semibold text-navy transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Accept
                          </button>
                          <button
                            type="button"
                            disabled={busyId === r.match_id}
                            onClick={() =>
                              respondToDemo(r.match_id as string, false)
                            }
                            className="flex-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {r.match_status === "DEMO_SCHEDULED" && (
                    <div className="mt-4 space-y-2">
                      <p className="text-xs text-slate-600">
                        Demo scheduled with <strong>{r.teacher_name}</strong>{" "}
                        on {formatDate(r.demo_date)} ({r.time_slot}).
                      </p>
                      <button
                        type="button"
                        disabled={busyId === r.match_id}
                        onClick={() => approveTeacher(r.match_id as string)}
                        className="w-full rounded-lg bg-amber px-3 py-2 text-xs font-semibold text-navy transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {busyId === r.match_id
                          ? "Approving…"
                          : "Approve teacher after demo"}
                      </button>
                    </div>
                  )}

                  {r.match_status === "CONFIRMED" && (
                    <div className="mt-4 space-y-2">
                      <div className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                        Ongoing assignment ({r.match_label}) with{" "}
                        <strong>{r.teacher_name}</strong>
                        {r.teacher_phone && (
                          <>
                            {" "}
                            ·{" "}
                            <a
                              href={`tel:${r.teacher_phone}`}
                              className="underline"
                            >
                              {r.teacher_phone}
                            </a>
                          </>
                        )}
                      </div>

                      {ratedMatches.has(r.match_id as string) ? (
                        <p className="text-xs text-emerald-600">
                          Thanks for your feedback!
                        </p>
                      ) : ratingOpenFor === r.match_id ? (
                        <RateTutorForm
                          matchId={r.match_id as string}
                          onDone={() => {
                            setRatedMatches((prev) => new Set(prev).add(r.match_id as string));
                            setRatingOpenFor(null);
                          }}
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => setRatingOpenFor(r.match_id)}
                          className="w-full rounded-lg border border-amber-200 px-3 py-2 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-50"
                        >
                          Rate this tutor
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {sessions.length > 0 && (
            <div className="mt-10">
              <h2 className="mb-4 font-heading text-lg font-semibold text-navy">
                Classes to confirm
              </h2>
              <div className="space-y-2">
                {sessions.map((s) => (
                  <div
                    key={s.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"
                  >
                    <div className="text-xs text-slate-600">
                      <span className="font-medium text-navy">
                        {s.display_id}
                      </span>{" "}
                      · {s.match_label} · {formatDate(s.date)}
                      {s.amount != null ? ` · ₹${s.amount}` : ""}
                    </div>
                    {s.status === "LOGGED" ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={busyId === s.id}
                          onClick={() => respondToSession(s.id, true)}
                          className="rounded-lg bg-amber px-3 py-1.5 text-xs font-semibold text-navy transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Confirm happened
                        </button>
                        <button
                          type="button"
                          disabled={busyId === s.id}
                          onClick={() => respondToSession(s.id, false)}
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Dispute
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs font-medium text-slate-500">
                        {SESSION_STATUS_LABELS[s.status]}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
