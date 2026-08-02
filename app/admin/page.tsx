"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import { createClient } from "@/lib/supabase/client";
import { getCurrentProfile } from "@/lib/supabase/profile";
import MatchModal from "./MatchModal";
import {
  MATCH_STATUS_LABELS,
  type RequirementRow,
  type TutorRow,
} from "./types";

type Tab = "requirements" | "tutors" | "attendance";

type SessionRow = {
  id: string;
  display_id: string;
  match_id: string;
  match_label: string;
  date: string;
  status: "LOGGED" | "PARENT_CONFIRMED" | "DISPUTED" | "ADMIN_VALIDATED";
  amount: number | null;
  payment_released: boolean;
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

function RequirementStatusBadge({ row }: { row: RequirementRow }) {
  if (!row.match_status) {
    return (
      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
        No match yet
      </span>
    );
  }
  const styles: Record<string, string> = {
    PROPOSED: "bg-slate-100 text-slate-600",
    DEMO_PROPOSED: "bg-sky-100 text-sky-700",
    DEMO_SCHEDULED: "bg-sky-100 text-sky-700",
    CONFIRMED: "bg-emerald-100 text-emerald-700",
    DECLINED: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${styles[row.match_status]}`}
    >
      {MATCH_STATUS_LABELS[row.match_status]}
    </span>
  );
}

function MetricCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-navy p-6">
      <p className="font-heading text-3xl font-bold text-white">{value}</p>
      <p className="mt-1 text-xs font-medium uppercase tracking-wide text-white/60">
        {label}
      </p>
    </div>
  );
}

function EmptyState({ message, colSpan }: { message: string; colSpan: number }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-10 text-center text-sm text-slate-400">
        {message}
      </td>
    </tr>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [requirements, setRequirements] = useState<RequirementRow[]>([]);
  const [tutors, setTutors] = useState<TutorRow[]>([]);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<Tab>("requirements");
  const [search, setSearch] = useState("");
  const [matchTarget, setMatchTarget] = useState<RequirementRow | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const supabase = createClient();
      const profile = await getCurrentProfile(supabase);
      if (!active) return;
      if (!profile || profile.role !== "ADMIN") {
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

    const [requirementsRes, tutorsRes, sessionsRes] = await Promise.all([
      supabase.rpc("admin_requirements_queue"),
      supabase.rpc("admin_teachers_directory"),
      supabase.rpc("my_sessions"),
    ]);

    setLoadError(null);
    if (requirementsRes.error || tutorsRes.error || sessionsRes.error) {
      setLoadError(
        requirementsRes.error?.message ||
          tutorsRes.error?.message ||
          sessionsRes.error?.message ||
          "Failed to load dashboard data."
      );
    } else {
      setRequirements((requirementsRes.data as RequirementRow[]) ?? []);
      setTutors((tutorsRes.data as TutorRow[]) ?? []);
      setSessions((sessionsRes.data as SessionRow[]) ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (checkingAuth) return;
    Promise.resolve().then(loadData);
  }, [checkingAuth]);

  const filteredRequirements = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return requirements;
    return requirements.filter((row) => {
      const haystack = `${row.subject} ${row.location ?? ""}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [requirements, search]);

  const filteredTutors = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return tutors;
    return tutors.filter((row) => {
      const haystack = `${(row.subjects ?? []).join(" ")} ${(
        row.preferred_locations ?? []
      ).join(" ")}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [tutors, search]);

  const pendingMatches = useMemo(
    () => requirements.filter((row) => !row.match_status).length,
    [requirements]
  );

  const awaitingValidation = sessions.filter((s) => s.status === "PARENT_CONFIRMED");
  const payable = sessions.filter(
    (s) => s.status === "ADMIN_VALIDATED" && !s.payment_released
  );

  async function validateSession(sessionId: string) {
    setBusyId(sessionId);
    setActionError(null);
    const supabase = createClient();
    const { error } = await supabase.rpc("validate_session", {
      p_session_id: sessionId,
    });
    if (error) setActionError(error.message);
    else loadData();
    setBusyId(null);
  }

  async function releasePayout(matchId: string) {
    const pct = window.prompt("Commission percentage for this payout?", "20");
    if (pct === null) return;
    setBusyId(matchId);
    setActionError(null);
    const supabase = createClient();
    const { error } = await supabase.rpc("release_payout", {
      p_match_id: matchId,
      p_commission_percent: Number(pct) || 0,
    });
    if (error) setActionError(error.message);
    else loadData();
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
          <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber">
              <span className="h-px w-4 bg-amber" />
              Internal Tools
            </div>
            <h1 className="mt-3 font-heading text-3xl font-bold text-white">
              Future Minds Admin Dashboard
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-white/60">
              Review parent requirements, tutor applications, and coordinate
              matches from one place.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <MetricCard label="Total Parent Requirements" value={requirements.length} />
              <MetricCard label="Total Tutor Applications" value={tutors.length} />
              <MetricCard label="Pending Matches" value={pendingMatches} />
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-6 py-8 sm:px-8">
          {loadError && (
            <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {loadError}
            </p>
          )}
          {actionError && (
            <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {actionError}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex rounded-full border border-slate-200 bg-white p-1">
              <button
                type="button"
                onClick={() => setActiveTab("requirements")}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  activeTab === "requirements" ? "bg-navy text-white" : "text-slate-500 hover:text-navy"
                }`}
              >
                Parent Requirements
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("tutors")}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  activeTab === "tutors" ? "bg-navy text-white" : "text-slate-500 hover:text-navy"
                }`}
              >
                Tutor Applications
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("attendance")}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  activeTab === "attendance" ? "bg-navy text-white" : "text-slate-500 hover:text-navy"
                }`}
              >
                Attendance &amp; Payouts
                {awaitingValidation.length + payable.length > 0 && (
                  <span className="ml-2 rounded-full bg-amber px-2 py-0.5 text-[10px] text-navy">
                    {awaitingValidation.length + payable.length}
                  </span>
                )}
              </button>
            </div>

            {activeTab !== "attendance" && (
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by location or subject…"
                className="w-full max-w-xs rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber/50"
              />
            )}
          </div>

          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            {loading ? (
              <div className="px-4 py-16 text-center text-sm text-slate-400">
                Loading dashboard data…
              </div>
            ) : activeTab === "requirements" ? (
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <th className="px-4 py-3">Parent Name</th>
                    <th className="px-4 py-3">Student &amp; Grade</th>
                    <th className="px-4 py-3">Subject</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Submitted</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRequirements.length === 0 ? (
                    <EmptyState message="No parent requirements match your filters." colSpan={8} />
                  ) : (
                    filteredRequirements.map((row) => (
                      <tr key={row.id} className="align-top">
                        <td className="px-4 py-4 font-medium text-navy">{row.parent_name || "—"}</td>
                        <td className="px-4 py-4 text-slate-600">
                          {row.student_name || "—"}
                          {row.student_grade ? ` · ${row.student_grade}` : ""}
                        </td>
                        <td className="px-4 py-4 text-slate-600">{row.subject}</td>
                        <td className="px-4 py-4 text-slate-600">{row.location || "—"}</td>
                        <td className="px-4 py-4 text-slate-600">
                          {row.parent_phone ? (
                            <a href={`tel:${row.parent_phone}`} className="hover:text-amber-600">
                              {row.parent_phone}
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-4 py-4 text-slate-500">{formatDate(row.created_at)}</td>
                        <td className="px-4 py-4">
                          <RequirementStatusBadge row={row} />
                        </td>
                        <td className="px-4 py-4">
                          <button
                            type="button"
                            onClick={() => setMatchTarget(row)}
                            className="whitespace-nowrap rounded-full bg-amber px-3.5 py-2 text-xs font-semibold text-navy transition-transform hover:-translate-y-0.5"
                          >
                            {row.match_status ? "View Match" : "Find Matching Tutors"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : activeTab === "tutors" ? (
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <th className="px-4 py-3">Full Name</th>
                    <th className="px-4 py-3">Qualifications</th>
                    <th className="px-4 py-3">Experience</th>
                    <th className="px-4 py-3">Subjects</th>
                    <th className="px-4 py-3">Locations</th>
                    <th className="px-4 py-3">Mode</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">KYC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTutors.length === 0 ? (
                    <EmptyState message="No tutor applications match your filters." colSpan={8} />
                  ) : (
                    filteredTutors.map((row) => (
                      <tr key={row.id} className="align-top">
                        <td className="px-4 py-4 font-medium text-navy">{row.name || "—"}</td>
                        <td className="px-4 py-4 text-slate-600">{row.qualification || "—"}</td>
                        <td className="px-4 py-4 text-slate-600">{row.experience || "—"}</td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-1.5">
                            {(row.subjects ?? []).length > 0 ? (
                              row.subjects!.map((subject) => (
                                <span key={subject} className="rounded-full bg-navy/5 px-2.5 py-1 text-[11px] font-medium text-navy">
                                  {subject}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-1.5">
                            {(row.preferred_locations ?? []).length > 0 ? (
                              row.preferred_locations!.map((location) => (
                                <span key={location} className="rounded-full bg-amber/10 px-2.5 py-1 text-[11px] font-medium text-amber-700">
                                  {location}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-slate-600">{row.teaching_mode || "—"}</td>
                        <td className="px-4 py-4 text-slate-600">
                          {row.phone ? (
                            <a href={`tel:${row.phone}`} className="hover:text-amber-600">
                              {row.phone}
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                            {row.kyc_status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              <div className="divide-y divide-slate-100">
                <div className="px-4 py-4">
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Awaiting validation ({awaitingValidation.length})
                  </h3>
                  {awaitingValidation.length === 0 ? (
                    <p className="py-4 text-center text-sm text-slate-400">Nothing waiting on validation.</p>
                  ) : (
                    <div className="space-y-2">
                      {awaitingValidation.map((session) => (
                        <div key={session.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm">
                          <span>
                            {session.display_id} · {session.match_label} · {formatDate(session.date)}
                          </span>
                          <button
                            type="button"
                            disabled={busyId === session.id}
                            onClick={() => validateSession(session.id)}
                            className="rounded-full bg-amber px-3.5 py-1.5 text-xs font-semibold text-navy transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {busyId === session.id ? "Validating…" : "Validate"}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="px-4 py-4">
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Validated, unpaid ({payable.length})
                  </h3>
                  {payable.length === 0 ? (
                    <p className="py-4 text-center text-sm text-slate-400">No pending payouts.</p>
                  ) : (
                    <div className="space-y-2">
                      {payable.map((session) => (
                        <div key={session.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm">
                          <span>
                            {session.display_id} · {session.match_label} · ₹{session.amount ?? "—"}
                          </span>
                          <button
                            type="button"
                            disabled={busyId === session.match_id}
                            onClick={() => releasePayout(session.match_id)}
                            className="rounded-full bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {busyId === session.match_id ? "Releasing…" : "Release Payout"}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="mt-3 text-xs text-slate-400">
                    Releasing a payout pays out every validated, unpaid class
                    for that tutor at once (requires bank/UPI details on
                    file).
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {matchTarget && (
        <MatchModal
          requirement={matchTarget}
          tutors={tutors}
          onClose={() => setMatchTarget(null)}
          onUpdated={() => {
            setMatchTarget(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}
