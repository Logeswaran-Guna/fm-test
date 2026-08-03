"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import { createClient } from "@/lib/supabase/client";
import { getCurrentProfile } from "@/lib/supabase/profile";

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

export default function MyRequirementsPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [requirements, setRequirements] = useState<MyRequirement[]>([]);
  const [sessions, setSessions] = useState<MySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

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
      setCheckingAuth(false);
    })();
    return () => {
      active = false;
    };
  }, [router]);

  async function loadData() {
    const supabase = createClient();
    const [reqRes, sessRes] = await Promise.all([
      supabase.rpc("my_requirements"),
      supabase.rpc("my_sessions"),
    ]);
    const rpcError = reqRes.error || sessRes.error;
    setError(rpcError ? rpcError.message : null);
    if (!reqRes.error) setRequirements((reqRes.data as MyRequirement[]) ?? []);
    if (!sessRes.error) setSessions((sessRes.data as MySession[]) ?? []);
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
              My Requirements
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

          {loading ? (
            <div className="py-16 text-center text-sm text-slate-400">
              Loading your requirements…
            </div>
          ) : requirements.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center text-sm text-slate-400">
              No requirements yet.{" "}
              <a href="/find-tutor" className="text-amber-600 underline">
                Submit one
              </a>
              .
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {requirements.map((r) => (
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
                    <div className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
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
