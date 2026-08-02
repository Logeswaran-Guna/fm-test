"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import { createClient } from "@/lib/supabase/client";
import MatchModal from "./MatchModal";
import {
  STATUS_OPTIONS,
  normalizeStatus,
  type RecordStatus,
  type RequirementRow,
  type TutorRow,
} from "./types";

type Tab = "requirements" | "tutors";
type StatusFilter = "All" | RecordStatus;

const STATUS_STYLES: Record<RecordStatus, string> = {
  Pending: "bg-slate-100 text-slate-600",
  Matched: "bg-amber/15 text-amber-700",
  "Demo Scheduled": "bg-sky-100 text-sky-700",
  Completed: "bg-emerald-100 text-emerald-700",
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

function StatusBadge({ status }: { status: RecordStatus | string | null }) {
  const resolved = normalizeStatus(status);
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[resolved]}`}
    >
      {resolved}
    </span>
  );
}

function StatusSelect({
  status,
  onChange,
}: {
  status: RecordStatus | string | null;
  onChange: (status: RecordStatus) => void;
}) {
  return (
    <select
      value={normalizeStatus(status)}
      onChange={(event) => onChange(event.target.value as RecordStatus)}
      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-navy focus:outline-none focus:ring-2 focus:ring-amber/50"
    >
      {STATUS_OPTIONS.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-navy p-6">
      <p className="font-heading text-3xl font-bold text-white">{value}</p>
      <p className="mt-1 text-xs font-medium uppercase tracking-wide text-white/60">
        {label}
      </p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <tr>
      <td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-400">
        {message}
      </td>
    </tr>
  );
}

export default function AdminDashboardPage() {
  const [requirements, setRequirements] = useState<RequirementRow[]>([]);
  const [tutors, setTutors] = useState<TutorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<Tab>("requirements");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [matchTarget, setMatchTarget] = useState<RequirementRow | null>(null);

  useEffect(() => {
    let active = true;

    async function loadData() {
      setLoading(true);
      setLoadError(null);
      const supabase = createClient();

      const [requirementsRes, tutorsRes] = await Promise.all([
        supabase
          .from("requirements")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("tutors")
          .select("*")
          .order("created_at", { ascending: false }),
      ]);

      if (!active) return;

      if (requirementsRes.error || tutorsRes.error) {
        setLoadError(
          requirementsRes.error?.message ||
            tutorsRes.error?.message ||
            "Failed to load dashboard data."
        );
      } else {
        setRequirements((requirementsRes.data as RequirementRow[]) ?? []);
        setTutors((tutorsRes.data as TutorRow[]) ?? []);
      }
      setLoading(false);
    }

    loadData();
    return () => {
      active = false;
    };
  }, []);

  const filteredRequirements = useMemo(() => {
    const term = search.trim().toLowerCase();
    return requirements.filter((row) => {
      const status = normalizeStatus(row.status);
      const matchesStatus = statusFilter === "All" || status === statusFilter;
      if (!matchesStatus) return false;
      if (!term) return true;
      const haystack = `${row.subjects_needed ?? ""} ${
        row.location_address ?? ""
      }`.toLowerCase();
      return haystack.includes(term);
    });
  }, [requirements, search, statusFilter]);

  const filteredTutors = useMemo(() => {
    const term = search.trim().toLowerCase();
    return tutors.filter((row) => {
      const status = normalizeStatus(row.status);
      const matchesStatus = statusFilter === "All" || status === statusFilter;
      if (!matchesStatus) return false;
      if (!term) return true;
      const haystack = `${(row.subjects_handled ?? []).join(" ")} ${(
        row.preferred_locations ?? []
      ).join(" ")}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [tutors, search, statusFilter]);

  const pendingMatches = useMemo(
    () =>
      requirements.filter((row) => normalizeStatus(row.status) === "Pending")
        .length,
    [requirements]
  );

  async function updateRequirementStatus(id: string, status: RecordStatus) {
    const previous = requirements;
    setRequirements((rows) =>
      rows.map((row) => (row.id === id ? { ...row, status } : row))
    );
    setActionError(null);

    const supabase = createClient();
    const { error } = await supabase
      .from("requirements")
      .update({ status })
      .eq("id", id);

    if (error) {
      setRequirements(previous);
      setActionError(error.message || "Could not update requirement status.");
    }
  }

  async function updateTutorStatus(id: string, status: RecordStatus) {
    const previous = tutors;
    setTutors((rows) =>
      rows.map((row) => (row.id === id ? { ...row, status } : row))
    );
    setActionError(null);

    const supabase = createClient();
    const { error } = await supabase
      .from("tutors")
      .update({ status })
      .eq("id", id);

    if (error) {
      setTutors(previous);
      setActionError(error.message || "Could not update tutor status.");
    }
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
              <MetricCard
                label="Total Parent Requirements"
                value={requirements.length}
              />
              <MetricCard
                label="Total Tutor Applications"
                value={tutors.length}
              />
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
                  activeTab === "requirements"
                    ? "bg-navy text-white"
                    : "text-slate-500 hover:text-navy"
                }`}
              >
                Parent Requirements
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("tutors")}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  activeTab === "tutors"
                    ? "bg-navy text-white"
                    : "text-slate-500 hover:text-navy"
                }`}
              >
                Tutor Applications
              </button>
            </div>

            <div className="flex flex-1 flex-wrap items-center justify-end gap-3 sm:flex-nowrap">
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by location or subject…"
                className="w-full max-w-xs rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber/50"
              />
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as StatusFilter)
                }
                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-amber/50"
              >
                <option value="All">All Statuses</option>
                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
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
                    <th className="px-4 py-3">Subjects</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Submitted</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRequirements.length === 0 ? (
                    <EmptyState message="No parent requirements match your filters." />
                  ) : (
                    filteredRequirements.map((row) => (
                      <tr key={row.id} className="align-top">
                        <td className="px-4 py-4 font-medium text-navy">
                          {row.parent_name || "—"}
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          {row.student_name || "—"}
                          {row.grade_class ? ` · ${row.grade_class}` : ""}
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          {row.subjects_needed || "—"}
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          {row.location_address || "—"}
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          {row.phone_number ? (
                            <a
                              href={`tel:${row.phone_number}`}
                              className="hover:text-amber-600"
                            >
                              {row.phone_number}
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-4 py-4 text-slate-500">
                          {formatDate(row.created_at)}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col items-start gap-2">
                            <StatusBadge status={row.status} />
                            <StatusSelect
                              status={row.status}
                              onChange={(status) =>
                                updateRequirementStatus(row.id, status)
                              }
                            />
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <button
                            type="button"
                            onClick={() => setMatchTarget(row)}
                            className="whitespace-nowrap rounded-full bg-amber px-3.5 py-2 text-xs font-semibold text-navy transition-transform hover:-translate-y-0.5"
                          >
                            Find Matching Tutors
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <th className="px-4 py-3">Full Name</th>
                    <th className="px-4 py-3">Qualifications</th>
                    <th className="px-4 py-3">Experience</th>
                    <th className="px-4 py-3">Subjects Handled</th>
                    <th className="px-4 py-3">Preferred Locations</th>
                    <th className="px-4 py-3">Mode</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTutors.length === 0 ? (
                    <EmptyState message="No tutor applications match your filters." />
                  ) : (
                    filteredTutors.map((row) => (
                      <tr key={row.id} className="align-top">
                        <td className="px-4 py-4 font-medium text-navy">
                          {row.full_name || "—"}
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          {row.qualifications || "—"}
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          {row.years_experience || "—"}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-1.5">
                            {(row.subjects_handled ?? []).length > 0 ? (
                              row.subjects_handled!.map((subject) => (
                                <span
                                  key={subject}
                                  className="rounded-full bg-navy/5 px-2.5 py-1 text-[11px] font-medium text-navy"
                                >
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
                                <span
                                  key={location}
                                  className="rounded-full bg-amber/10 px-2.5 py-1 text-[11px] font-medium text-amber-700"
                                >
                                  {location}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          {row.teaching_mode || "—"}
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          {row.phone_number ? (
                            <a
                              href={`tel:${row.phone_number}`}
                              className="hover:text-amber-600"
                            >
                              {row.phone_number}
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col items-start gap-2">
                            <StatusBadge status={row.status} />
                            <StatusSelect
                              status={row.status}
                              onChange={(status) =>
                                updateTutorStatus(row.id, status)
                              }
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {matchTarget && (
        <MatchModal
          requirement={matchTarget}
          tutors={tutors}
          onClose={() => setMatchTarget(null)}
        />
      )}
    </div>
  );
}
