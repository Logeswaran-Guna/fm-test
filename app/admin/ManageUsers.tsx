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

  return (
    <div className="space-y-8 p-4">
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}

      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Parents &amp; Students ({parents.length})
        </h3>
        {loading ? (
          <div className="py-8 text-center text-sm text-slate-400">Loading…</div>
        ) : parents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-400">
            No parent accounts yet.
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
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {parents.map((p) => (
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
          Teachers ({tutors.length})
        </h3>
        {tutors.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-400">
            No tutor accounts yet.
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
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tutors.map((t) => (
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
