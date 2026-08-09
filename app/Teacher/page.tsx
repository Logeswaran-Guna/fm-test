"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import BackButton from "../components/BackButton";
import ReferralCard from "../components/ReferralCard";
import { createClient } from "@/lib/supabase/client";
import { getCurrentProfile } from "@/lib/supabase/profile";
import { exportToCsv, type CsvColumn } from "@/lib/csv";
import { SESSION_STATUS_LABELS, type MyMatch, type MySession } from "./types";

type MyPayout = {
  id: string;
  period: string | null;
  gross_amount: number;
  commission_percent: number;
  commission_deducted: number;
  amount: number;
  status: string;
  released_at: string;
  referral_discount_amount: number | null;
};

const PAYOUT_COLUMNS: CsvColumn<MyPayout>[] = [
  { header: "Period", value: (r) => r.period },
  { header: "Gross Amount", value: (r) => r.gross_amount },
  { header: "Commission %", value: (r) => r.commission_percent },
  { header: "Commission Deducted", value: (r) => r.commission_deducted },
  { header: "Referral Discount", value: (r) => r.referral_discount_amount },
  { header: "Net Amount", value: (r) => r.amount },
  { header: "Status", value: (r) => r.status },
];

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

function formatTime12h(value: string): string {
  if (!value) return "";
  const [hStr, mStr] = value.split(":");
  const h = Number(hStr);
  const suffix = h >= 12 ? "PM" : "AM";
  const displayHour = h % 12 === 0 ? 12 : h % 12;
  return `${displayHour}:${mStr} ${suffix}`;
}

function LogSessionForm({
  matchId,
  onLogged,
}: {
  matchId: string;
  onLogged: () => void;
}) {
  const [date, setDate] = useState("");
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!date) {
      setError("Pick the class date first.");
      return;
    }
    if (!fromTime || !toTime) {
      setError("Pick both a start and end time.");
      return;
    }
    setBusy(true);
    setError(null);
    const timeSlot = `${formatTime12h(fromTime)} – ${formatTime12h(toTime)}`;
    const [fromH, fromM] = fromTime.split(":").map(Number);
    const [toH, toM] = toTime.split(":").map(Number);
    let durationHours = (toH * 60 + toM - (fromH * 60 + fromM)) / 60;
    if (durationHours <= 0) durationHours += 24;
    durationHours = Math.round(durationHours * 100) / 100;
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("log_session", {
      p_match_id: matchId,
      p_date: date,
      p_time_slot: timeSlot,
      p_amount: amount ? Number(amount) : null,
      p_duration_hours: durationHours,
    });
    setBusy(false);
    if (rpcError) {
      setError(rpcError.message);
      return;
    }
    setDate("");
    setFromTime("");
    setToTime("");
    setAmount("");
    onLogged();
  }

  return (
    <div className="mt-3 space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-xs text-navy"
      />
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-[10px] uppercase tracking-wide text-slate-500">From</label>
          <input
            type="time"
            value={fromTime}
            onChange={(e) => setFromTime(e.target.value)}
            className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-xs text-navy"
          />
        </div>
        <div>
          <label className="mb-1 block text-[10px] uppercase tracking-wide text-slate-500">To</label>
          <input
            type="time"
            value={toTime}
            onChange={(e) => setToTime(e.target.value)}
            className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-xs text-navy"
          />
        </div>
      </div>
      <input
        type="number"
        placeholder="Amount (₹)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-xs text-navy"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button
        onClick={submit}
        disabled={busy}
        className="w-full rounded bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? "Logging…" : "Log this class"}
      </button>
    </div>
  );
}

export default function TeacherDashboard() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [matches, setMatches] = useState<MyMatch[]>([]);
  const [sessions, setSessions] = useState<MySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [loggingFor, setLoggingFor] = useState<string | null>(null);
  const [statementBusy, setStatementBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const supabase = createClient();
      const profile = await getCurrentProfile(supabase);
      if (!active) return;
      if (!profile || profile.role !== "TEACHER") {
        router.replace("/login");
        return;
      }
      setCheckingAuth(false);
    })();
    return () => {
      active = false;
    };
  }, [router]);

  async function fetchData() {
    const supabase = createClient();
    const [matchesRes, sessionsRes] = await Promise.all([
      supabase.rpc("my_matches"),
      supabase.rpc("my_sessions"),
    ]);
    setErrorBanner(null);
    if (matchesRes.error || sessionsRes.error) {
      setErrorBanner(
        matchesRes.error?.message ||
          sessionsRes.error?.message ||
          "Failed to load your dashboard."
      );
    } else {
      setMatches(
        ((matchesRes.data as MyMatch[]) ?? []).filter(
          (m) => m.status !== "DECLINED"
        )
      );
      setSessions((sessionsRes.data as MySession[]) ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (checkingAuth) return;
    Promise.resolve().then(fetchData);
  }, [checkingAuth]);

  async function respondToDemo(matchId: string, accept: boolean) {
    setBusyId(matchId);
    setErrorBanner(null);
    const supabase = createClient();
    const { error } = await supabase.rpc(
      accept ? "accept_demo" : "decline_demo",
      { p_match_id: matchId }
    );
    if (error) setErrorBanner(error.message);
    else fetchData();
    setBusyId(null);
  }

  async function downloadStatement() {
    setStatementBusy(true);
    setErrorBanner(null);
    const supabase = createClient();
    const { data, error } = await supabase.rpc("my_payouts");
    if (error) {
      setErrorBanner(error.message);
    } else {
      exportToCsv(
        `my-payout-statement-${new Date().toISOString().slice(0, 10)}.csv`,
        PAYOUT_COLUMNS,
        (data as MyPayout[]) ?? []
      );
    }
    setStatementBusy(false);
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
      <BackButton />
      <main className="flex-1 bg-slate-50">
        <section className="bg-navy">
          <div className="mx-auto max-w-6xl px-6 py-10 sm:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber">
                  <span className="h-px w-4 bg-amber" />
                  Instructor Portal
                </div>
                <h1 className="mt-3 font-heading text-3xl font-bold text-white">
                  Teacher Dashboard
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/Teacher/profile"
                  className="rounded-full border border-white/30 px-4 py-2 text-xs font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
                >
                  My Profile
                </Link>
                <button
                  onClick={fetchData}
                  className="rounded-full border border-white/30 px-4 py-2 text-xs font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
                >
                  Refresh Data
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-6 py-8 sm:px-8">
          {errorBanner && (
            <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {errorBanner}
            </div>
          )}

          <div className="mb-8">
            <ReferralCard />
          </div>

          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold text-navy">
              My Matches &amp; Demos
            </h2>
            <span className="text-xs text-slate-400">
              Total: {matches.length}
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-sm text-slate-400">
              Loading your matches…
            </div>
          ) : matches.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white py-12 text-center text-sm text-slate-400">
              No matches yet. Admin will assign you a student once your profile
              is reviewed.
            </div>
          ) : (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {matches.map((m) => (
                <div
                  key={m.id}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-heading text-base font-semibold text-navy">
                          {m.student_name || "Student"}{" "}
                          <span className="text-xs font-normal text-slate-400">
                            {m.student_grade ? `(${m.student_grade})` : ""}
                          </span>
                        </h3>
                        <p className="text-xs text-slate-500">
                          Parent: {m.parent_name}
                        </p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                        {m.display_id}
                      </span>
                    </div>

                    <hr className="border-slate-100" />

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="block text-slate-400">Subject:</span>
                        <span className="font-medium text-amber-700">
                          {m.subject}
                        </span>
                      </div>
                      <div>
                        <span className="block text-slate-400">Location:</span>
                        <span className="text-slate-600">
                          {m.location || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 space-y-2 border-t border-slate-100 pt-3">
                    <a
                      href={`tel:${m.parent_phone}`}
                      className="block rounded-lg border border-slate-200 px-3 py-1.5 text-center text-xs font-medium text-navy transition-colors hover:bg-slate-50"
                    >
                      Call Parent
                    </a>

                    {m.status === "PROPOSED" && (
                      <p className="text-center text-xs text-slate-400">
                        Waiting for admin to propose a demo date.
                      </p>
                    )}

                    {m.status === "DEMO_PROPOSED" && !m.teacher_accepted_demo && (
                      <div className="space-y-2">
                        <p className="text-center text-xs text-amber-700">
                          Demo proposed for {formatDate(m.demo_date)} (
                          {m.demo_time_slot})
                        </p>
                        <div className="flex gap-2">
                          <button
                            disabled={busyId === m.id}
                            onClick={() => respondToDemo(m.id, true)}
                            className="flex-1 rounded-lg bg-amber px-3 py-2 text-xs font-semibold text-navy transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Accept
                          </button>
                          <button
                            disabled={busyId === m.id}
                            onClick={() => respondToDemo(m.id, false)}
                            className="flex-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    )}

                    {(m.status === "DEMO_PROPOSED" || m.status === "DEMO_SCHEDULED") &&
                      m.teacher_accepted_demo && (
                        <p className="text-center text-xs text-slate-400">
                          {m.status === "DEMO_SCHEDULED"
                            ? "Demo scheduled — waiting for parent's final approval."
                            : "You accepted — waiting for parent to accept too."}
                        </p>
                      )}

                    {m.status === "CONFIRMED" && (
                      <>
                        <p className="text-center text-xs text-emerald-600">
                          Confirmed assignment ({m.display_id})
                        </p>
                        {loggingFor === m.id ? (
                          <LogSessionForm
                            matchId={m.id}
                            onLogged={() => {
                              setLoggingFor(null);
                              fetchData();
                            }}
                          />
                        ) : (
                          <button
                            onClick={() => setLoggingFor(m.id)}
                            className="w-full rounded-lg bg-amber px-3 py-2 text-xs font-semibold text-navy transition-transform hover:-translate-y-0.5"
                          >
                            Log a Class
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-heading text-lg font-semibold text-navy">
              My Logged Classes
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">
                Total: {sessions.length}
              </span>
              <button
                type="button"
                disabled={statementBusy}
                onClick={downloadStatement}
                className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-navy transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {statementBusy ? "Preparing…" : "Download My Payout Statement"}
              </button>
            </div>
          </div>

          {sessions.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white py-8 text-center text-sm text-slate-400">
              No classes logged yet.
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <th className="px-4 py-3">Class</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Hours</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Paid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sessions.map((s) => (
                    <tr key={s.id}>
                      <td className="px-4 py-3 text-navy">
                        {s.display_id} · {s.match_label}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {formatDate(s.date)}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {s.duration_hours != null ? `${s.duration_hours} hrs` : "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {s.amount != null ? `₹${s.amount}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {SESSION_STATUS_LABELS[s.status]}
                      </td>
                      <td className="px-4 py-3">
                        {s.payment_released ? (
                          <span className="text-emerald-600">Paid</span>
                        ) : (
                          <span className="text-slate-400">Pending</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
