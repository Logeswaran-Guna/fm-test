"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getCurrentProfile } from "@/lib/supabase/profile";
import { SESSION_STATUS_LABELS, type MyMatch, type MySession } from "./types";

const TIME_SLOTS = [
  "Weekday mornings",
  "Weekday afternoons",
  "Weekday evenings",
  "Weekend mornings",
  "Weekend afternoons",
  "Weekend evenings",
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

function LogSessionForm({
  matchId,
  onLogged,
}: {
  matchId: string;
  onLogged: () => void;
}) {
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState(TIME_SLOTS[0]);
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!date) {
      setError("Pick the class date first.");
      return;
    }
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("log_session", {
      p_match_id: matchId,
      p_date: date,
      p_time_slot: slot,
      p_amount: amount ? Number(amount) : null,
    });
    setBusy(false);
    if (rpcError) {
      setError(rpcError.message);
      return;
    }
    setDate("");
    setAmount("");
    onLogged();
  }

  return (
    <div className="mt-3 space-y-2 rounded-lg border border-slate-800 bg-slate-950/60 p-3">
      <div className="grid grid-cols-3 gap-2">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="col-span-1 rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-100"
        />
        <select
          value={slot}
          onChange={(e) => setSlot(e.target.value)}
          className="col-span-1 rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-100"
        >
          {TIME_SLOTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Amount (₹)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="col-span-1 rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-100"
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
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

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-sm text-slate-500">
        Checking your session…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <header className="mb-8 border-b border-slate-800 pb-4 flex justify-between items-center">
        <div>
          <span className="text-xs uppercase tracking-wider text-amber-500 font-semibold">
            Instructor Portal
          </span>
          <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
        </div>
        <button
          onClick={fetchData}
          className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded border border-slate-700 transition-colors"
        >
          Refresh Data
        </button>
      </header>

      {errorBanner && (
        <div className="mb-6 p-4 bg-red-950/50 border border-red-500/50 text-red-200 text-sm rounded-lg">
          {errorBanner}
        </div>
      )}

      <main className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-200">
            My Matches &amp; Demos
          </h2>
          <span className="text-xs text-slate-400">
            Total: {matches.length}
          </span>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500">
            Loading your matches…
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-12 text-slate-500 border border-dashed border-slate-800 rounded-xl">
            No matches yet. Admin will assign you a student once your profile
            is reviewed.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {matches.map((m) => (
              <div
                key={m.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-base text-slate-100 capitalize">
                        {m.student_name || "Student"}{" "}
                        <span className="text-xs text-slate-400 font-normal">
                          {m.student_grade ? `(Grade ${m.student_grade})` : ""}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400 capitalize">
                        Parent: {m.parent_name}
                      </p>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full capitalize font-medium bg-slate-800 text-slate-300 border border-slate-700">
                      {m.display_id}
                    </span>
                  </div>

                  <hr className="border-slate-800/60" />

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 block">Subject:</span>
                      <span className="text-amber-300 font-medium capitalize">
                        {m.subject}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Location:</span>
                      <span className="text-slate-300 capitalize">
                        {m.location || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800/60 space-y-2">
                  <a
                    href={`tel:${m.parent_phone}`}
                    className="block text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded transition-colors text-center"
                  >
                    Call Parent
                  </a>

                  {m.status === "PROPOSED" && (
                    <p className="text-center text-xs text-slate-500">
                      Waiting for admin to propose a demo date.
                    </p>
                  )}

                  {m.status === "DEMO_PROPOSED" && !m.teacher_accepted_demo && (
                    <div className="space-y-2">
                      <p className="text-center text-xs text-amber-400">
                        Demo proposed for {formatDate(m.demo_date)} (
                        {m.demo_time_slot})
                      </p>
                      <div className="flex gap-2">
                        <button
                          disabled={busyId === m.id}
                          onClick={() => respondToDemo(m.id, true)}
                          className="flex-1 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3 py-1.5 rounded transition-colors disabled:opacity-60"
                        >
                          Accept
                        </button>
                        <button
                          disabled={busyId === m.id}
                          onClick={() => respondToDemo(m.id, false)}
                          className="flex-1 text-xs bg-red-700 hover:bg-red-600 text-white font-semibold px-3 py-1.5 rounded transition-colors disabled:opacity-60"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  )}

                  {(m.status === "DEMO_PROPOSED" || m.status === "DEMO_SCHEDULED") &&
                    m.teacher_accepted_demo && (
                      <p className="text-center text-xs text-slate-500">
                        {m.status === "DEMO_SCHEDULED"
                          ? "Demo scheduled — waiting for parent's final approval."
                          : "You accepted — waiting for parent to accept too."}
                      </p>
                    )}

                  {m.status === "CONFIRMED" && (
                    <>
                      <p className="text-center text-xs text-emerald-400">
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
                          className="w-full text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-3 py-1.5 rounded transition-colors"
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

        <div className="flex justify-between items-center pt-4">
          <h2 className="text-lg font-semibold text-slate-200">
            My Logged Classes
          </h2>
          <span className="text-xs text-slate-400">
            Total: {sessions.length}
          </span>
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-8 text-slate-500 border border-dashed border-slate-800 rounded-xl">
            No classes logged yet.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">Class</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {sessions.map((s) => (
                  <tr key={s.id}>
                    <td className="px-4 py-3 text-slate-300">
                      {s.display_id} · {s.match_label}
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {formatDate(s.date)}
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {s.amount != null ? `₹${s.amount}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {SESSION_STATUS_LABELS[s.status]}
                    </td>
                    <td className="px-4 py-3">
                      {s.payment_released ? (
                        <span className="text-emerald-400">Paid</span>
                      ) : (
                        <span className="text-slate-500">Pending</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
