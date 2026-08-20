"use client";

import { Fragment, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { StatusSelect } from "./StatusBadge";
import type { EntityStatus, ParentRow, TutorRow } from "./types";

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

type ResetCandidate = {
  profileId: string;
  name: string;
  phone: string;
  email: string | null;
};

export default function ManageUsers({
  tutors,
  onTutorsChanged,
}: {
  tutors: TutorRow[];
  onTutorsChanged: () => void;
}) {
  const [parents, setParents] = useState<ParentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  const [resetCandidate, setResetCandidate] = useState<ResetCandidate | null>(null);
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetResult, setResetResult] = useState<{ name: string; tempPassword: string } | null>(
    null
  );

  async function confirmResetPassword() {
    if (!resetCandidate) return;
    setResetSubmitting(true);
    setResetError(null);
    try {
      const response = await fetch("/api/admin/reset-user-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId: resetCandidate.profileId }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setResetError(data?.error || "Could not reset the password.");
        return;
      }
      setResetResult({ name: resetCandidate.name, tempPassword: data.tempPassword });
      setResetCandidate(null);
    } catch {
      setResetError("We couldn't reach the server. Please check your connection.");
    } finally {
      setResetSubmitting(false);
    }
  }

  async function loadParents() {
    const supabase = createClient();
    const { data, error: rpcError } = await supabase.rpc("admin_parents_directory");
    if (rpcError) {
      setError(rpcError.message);
    } else {
      setError(null);
      setParents((data as ParentRow[]) ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    Promise.resolve().then(loadParents);
  }, []);

  function toggleExpanded(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function setParentStatus(profileId: string, status: EntityStatus) {
    setBusyId(profileId);
    setError(null);
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("admin_set_profile_status", {
      p_profile_id: profileId,
      p_status: status,
    });
    if (rpcError) setError(rpcError.message);
    else await loadParents();
    setBusyId(null);
  }

  async function setStudentStatus(studentId: string, status: EntityStatus) {
    setBusyId(studentId);
    setError(null);
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("admin_set_student_status", {
      p_student_id: studentId,
      p_status: status,
    });
    if (rpcError) setError(rpcError.message);
    else await loadParents();
    setBusyId(null);
  }

  async function setTeacherStatus(profileId: string, status: EntityStatus) {
    setBusyId(profileId);
    setError(null);
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("admin_set_profile_status", {
      p_profile_id: profileId,
      p_status: status,
    });
    if (rpcError) setError(rpcError.message);
    else onTutorsChanged();
    setBusyId(null);
  }

  const query = search.trim().toLowerCase();
  function matches(...fields: (string | null | undefined)[]): boolean {
    if (!query) return true;
    return fields.some((f) => f && f.toLowerCase().includes(query));
  }
  const filteredParents = parents.filter((p) =>
    matches(p.name, p.phone, p.email, p.display_id)
  );
  const filteredTutors = tutors.filter((t) =>
    matches(t.name, t.phone, t.email, t.display_id)
  );

  return (
    <div className="space-y-8 p-4">
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}

      <div className="max-w-sm">
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
          Search by name, phone, email or ID
        </label>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search parents & teachers…"
          className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber/50"
        />
      </div>

      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Parents &amp; Students ({filteredParents.length}{query ? ` of ${parents.length}` : ""})
        </h3>
        {loading ? (
          <div className="py-8 text-center text-sm text-slate-400">Loading…</div>
        ) : parents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-400">
            No parent accounts yet.
          </div>
        ) : filteredParents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-400">
            No parents match &quot;{search}&quot;.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <th className="px-4 py-3">Parent</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3">Kids</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Password</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredParents.map((p) => (
                  <Fragment key={p.id}>
                    <tr className="align-top">
                      <td className="px-4 py-3 font-medium text-navy">
                        {p.name}
                        <span className="block text-xs font-normal text-slate-400">{p.display_id}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {p.phone}
                        {p.email && <span className="block text-xs text-slate-400">{p.email}</span>}
                      </td>
                      <td className="px-4 py-3 text-slate-500">{formatDate(p.created_at)}</td>
                      <td className="px-4 py-3">
                        {p.students.length > 0 ? (
                          <button
                            type="button"
                            onClick={() => toggleExpanded(p.id)}
                            className="text-xs font-semibold text-amber-700 underline"
                          >
                            {expanded.has(p.id) ? "Hide" : "Show"} {p.students.length}{" "}
                            {p.students.length === 1 ? "kid" : "kids"}
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">None</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <StatusSelect
                          status={p.status}
                          disabled={busyId === p.id}
                          onChange={(next) => setParentStatus(p.id, next)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() =>
                            setResetCandidate({
                              profileId: p.id,
                              name: p.name,
                              phone: p.phone,
                              email: p.email,
                            })
                          }
                          className="text-xs font-semibold text-amber-700 underline"
                        >
                          Reset Password
                        </button>
                      </td>
                    </tr>
                    {expanded.has(p.id) &&
                      p.students.map((s) => (
                        <tr key={s.id} className="bg-slate-50/60 align-top">
                          <td className="px-4 py-2 pl-8 text-slate-600">
                            ↳ {s.student_name || "Student"}
                            <span className="block text-xs text-slate-400">{s.display_id}</span>
                          </td>
                          <td className="px-4 py-2 text-xs text-slate-400" colSpan={2}>
                            {s.age_grade || "Grade not set"}
                          </td>
                          <td className="px-4 py-2" />
                          <td className="px-4 py-2">
                            <StatusSelect
                              status={s.status}
                              disabled={busyId === s.id}
                              onChange={(next) => setStudentStatus(s.id, next)}
                            />
                          </td>
                          <td className="px-4 py-2" />
                        </tr>
                      ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Teachers ({filteredTutors.length}{query ? ` of ${tutors.length}` : ""})
        </h3>
        {tutors.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-400">
            No tutor accounts yet.
          </div>
        ) : filteredTutors.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-400">
            No teachers match &quot;{search}&quot;.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <th className="px-4 py-3">Teacher</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">KYC</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Password</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTutors.map((t) => (
                  <tr key={t.id} className="align-top">
                    <td className="px-4 py-3 font-medium text-navy">
                      {t.name}
                      <span className="block text-xs font-normal text-slate-400">{t.display_id}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {t.phone}
                      {t.email && <span className="block text-xs text-slate-400">{t.email}</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{t.kyc_status}</td>
                    <td className="px-4 py-3">
                      <StatusSelect
                        status={t.status}
                        disabled={busyId === t.user_id}
                        onChange={(next) => setTeacherStatus(t.user_id, next)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() =>
                          setResetCandidate({
                            profileId: t.user_id,
                            name: t.name,
                            phone: t.phone,
                            email: t.email,
                          })
                        }
                        className="text-xs font-semibold text-amber-700 underline"
                      >
                        Reset Password
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {resetCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h4 className="font-heading text-lg font-semibold text-navy">Reset Password</h4>
            <p className="mt-2 text-sm text-slate-500">
              Confirm these details match who you have on the call before generating a temporary
              password.
            </p>
            <dl className="mt-4 space-y-1.5 rounded-lg bg-slate-50 px-4 py-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-400">Name</dt>
                <dd className="font-medium text-navy">{resetCandidate.name}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-400">Phone</dt>
                <dd className="font-medium text-navy">{resetCandidate.phone}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-400">Email</dt>
                <dd className="font-medium text-navy">{resetCandidate.email || "—"}</dd>
              </div>
            </dl>

            {resetError && (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {resetError}
              </p>
            )}

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setResetCandidate(null);
                  setResetError(null);
                }}
                disabled={resetSubmitting}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmResetPassword}
                disabled={resetSubmitting}
                className="flex-1 rounded-xl bg-amber px-4 py-2.5 text-sm font-semibold text-navy shadow-lg shadow-amber/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {resetSubmitting ? "Generating…" : "Confirm & Generate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {resetResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h4 className="font-heading text-lg font-semibold text-navy">
              Temporary password for {resetResult.name}
            </h4>
            <p className="mt-2 text-sm text-slate-500">
              Read this out on the call. It only works for one login — they&apos;ll be asked to
              set a permanent password right after.
            </p>
            <p className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-center font-mono text-xl font-semibold tracking-widest text-navy">
              {resetResult.tempPassword}
            </p>
            <button
              type="button"
              onClick={() => setResetResult(null)}
              className="mt-5 w-full rounded-xl bg-amber px-4 py-2.5 text-sm font-semibold text-navy shadow-lg shadow-amber/30"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
