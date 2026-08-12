"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import BackButton from "../components/BackButton";
import { createClient } from "@/lib/supabase/client";
import { getCurrentProfile } from "@/lib/supabase/profile";
import { exportToCsv, type CsvColumn } from "@/lib/csv";
import MatchModal from "./MatchModal";
import ManageUsers from "./ManageUsers";
import RegistrationForms from "./RegistrationForms";
import PoolingTab from "./PoolingTab";
import AcademyTab from "./AcademyTab";
import NotificationsTab from "./NotificationsTab";
import ReferralsTab from "./ReferralsTab";
import PartnersTab from "./PartnersTab";
import TestimonialsTab from "./TestimonialsTab";
import FunnelStats from "./FunnelStats";
import { StatusBadge } from "./StatusBadge";
import {
  MATCH_STATUS_LABELS,
  type AcademyCourseRow,
  type AcademyEnrollmentRow,
  type PoolingGroupRow,
  type RequirementRow,
  type TutorRow,
} from "./types";

type Tab =
  | "requirements"
  | "tutors"
  | "attendance"
  | "logged-classes"
  | "pooling"
  | "academy"
  | "notifications"
  | "referrals"
  | "partners"
  | "testimonials"
  | "registration-forms"
  | "manage-users";

type SessionRow = {
  id: string;
  display_id: string;
  match_id: string;
  match_label: string;
  date: string;
  time_slot: string | null;
  duration_hours: number | null;
  status: "LOGGED" | "PARENT_CONFIRMED" | "DISPUTED" | "ADMIN_VALIDATED";
  amount: number | null;
  student_name: string | null;
  student_grade: string | null;
  subject: string | null;
  teacher_display_id: string | null;
  teacher_name: string | null;
  teacher_phone: string | null;
  parent_name: string | null;
  parent_phone: string | null;
  payment_released: boolean;
  payout_amount: number | null;
  payout_commission_percent: number | null;
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

const REQUIREMENT_COLUMNS: CsvColumn<RequirementRow>[] = [
  { header: "Requirement ID", value: (r) => r.display_id },
  { header: "Parent Name", value: (r) => r.parent_name },
  { header: "Parent Phone", value: (r) => r.parent_phone },
  { header: "Student Name", value: (r) => r.student_name },
  { header: "Student Grade", value: (r) => r.student_grade },
  { header: "Subject", value: (r) => r.subject },
  { header: "Mode", value: (r) => (r.mode ?? []).join("; ") },
  { header: "Location", value: (r) => r.location },
  { header: "Budget", value: (r) => r.budget },
  { header: "Submitted", value: (r) => formatDate(r.created_at) },
  { header: "Status", value: (r) => (r.match_status ? MATCH_STATUS_LABELS[r.match_status] : "No match yet") },
  { header: "Match Score", value: (r) => r.match_score },
  { header: "Teacher Name", value: (r) => r.teacher_name },
  { header: "Parent One-Time Fee", value: (r) => r.parent_onetime_fee_amount },
  { header: "Parent Fee Collected", value: (r) => (r.parent_fee_collected ? "Yes" : "No") },
];

const TUTOR_COLUMNS: CsvColumn<TutorRow>[] = [
  { header: "Teacher ID", value: (r) => r.display_id },
  { header: "Full Name", value: (r) => r.name },
  { header: "Phone", value: (r) => r.phone },
  { header: "Email", value: (r) => r.email },
  { header: "Qualification", value: (r) => r.qualification },
  { header: "Experience", value: (r) => r.experience },
  { header: "Tutoring For", value: (r) => (r.tutoring_for ?? []).join("; ") },
  { header: "Boards", value: (r) => (r.boards ?? []).join("; ") },
  { header: "Subjects", value: (r) => (r.subjects ?? []).join("; ") },
  { header: "Locations", value: (r) => (r.preferred_locations ?? []).join("; ") },
  { header: "Mode", value: (r) => (r.teaching_mode ?? []).join("; ") },
  { header: "KYC Status", value: (r) => r.kyc_status },
  { header: "Total Hours", value: (r) => r.total_hours },
  { header: "Students Trained", value: (r) => r.students_trained },
  { header: "Active Batches", value: (r) => r.active_batches },
  { header: "Rating", value: (r) => r.rating_avg },
  { header: "Review Count", value: (r) => r.rating_count },
];

const SESSION_COLUMNS: CsvColumn<SessionRow>[] = [
  { header: "Class ID", value: (r) => r.display_id },
  { header: "Match", value: (r) => r.match_label },
  { header: "Student Name", value: (r) => r.student_name },
  { header: "Student Grade", value: (r) => r.student_grade },
  { header: "Subject", value: (r) => r.subject },
  { header: "Teacher Name", value: (r) => r.teacher_name },
  { header: "Teacher Phone", value: (r) => r.teacher_phone },
  { header: "Date", value: (r) => formatDate(r.date) },
  { header: "Time", value: (r) => r.time_slot },
  { header: "Hours", value: (r) => r.duration_hours },
  { header: "Amount", value: (r) => r.amount },
  { header: "Status", value: (r) => r.status },
  { header: "Paid", value: (r) => (r.payment_released ? "Yes" : "No") },
  { header: "Payout Amount", value: (r) => r.payout_amount },
];

type PayoutRow = {
  id: string;
  period: string | null;
  gross_amount: number;
  commission_percent: number;
  commission_deducted: number;
  amount: number;
  status: string;
  released_at: string;
  referral_discount_amount: number | null;
  referral_discount_code: string | null;
};

const PAYOUT_COLUMNS: CsvColumn<PayoutRow>[] = [
  { header: "Period", value: (r) => r.period },
  { header: "Gross Amount", value: (r) => r.gross_amount },
  { header: "Commission %", value: (r) => r.commission_percent },
  { header: "Commission Deducted", value: (r) => r.commission_deducted },
  { header: "Referral Discount", value: (r) => r.referral_discount_amount },
  { header: "Net Amount", value: (r) => r.amount },
  { header: "Status", value: (r) => r.status },
  { header: "Released", value: (r) => formatDate(r.released_at) },
];

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
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${styles[row.match_status]}`}
      >
        {MATCH_STATUS_LABELS[row.match_status]}
      </span>
      {row.match_score != null && (
        <span className="inline-flex items-center rounded-full bg-navy/5 px-2 py-1 text-[11px] font-bold text-navy/70">
          {row.match_score}%
        </span>
      )}
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
  const [poolingGroups, setPoolingGroups] = useState<PoolingGroupRow[]>([]);
  const [academyCourses, setAcademyCourses] = useState<AcademyCourseRow[]>([]);
  const [academyEnrollments, setAcademyEnrollments] = useState<AcademyEnrollmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<Tab>("requirements");
  const [search, setSearch] = useState("");
  const [matchTarget, setMatchTarget] = useState<RequirementRow | null>(null);
  const [statementTeacherId, setStatementTeacherId] = useState("");
  const [statementBusy, setStatementBusy] = useState(false);

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

    const [requirementsRes, tutorsRes, sessionsRes, poolingRes, coursesRes, enrollmentsRes] = await Promise.all([
      supabase.rpc("admin_requirements_queue"),
      supabase.rpc("admin_teachers_directory"),
      supabase.rpc("admin_sessions_queue"),
      supabase.rpc("admin_pooling_groups"),
      supabase.rpc("admin_academy_courses"),
      supabase.rpc("admin_academy_enrollments"),
    ]);

    setLoadError(null);
    if (
      requirementsRes.error ||
      tutorsRes.error ||
      sessionsRes.error ||
      poolingRes.error ||
      coursesRes.error ||
      enrollmentsRes.error
    ) {
      setLoadError(
        requirementsRes.error?.message ||
          tutorsRes.error?.message ||
          sessionsRes.error?.message ||
          poolingRes.error?.message ||
          coursesRes.error?.message ||
          enrollmentsRes.error?.message ||
          "Failed to load dashboard data."
      );
    } else {
      setRequirements((requirementsRes.data as RequirementRow[]) ?? []);
      setTutors((tutorsRes.data as TutorRow[]) ?? []);
      setSessions((sessionsRes.data as SessionRow[]) ?? []);
      setPoolingGroups((poolingRes.data as PoolingGroupRow[]) ?? []);
      setAcademyCourses((coursesRes.data as AcademyCourseRow[]) ?? []);
      setAcademyEnrollments((enrollmentsRes.data as AcademyEnrollmentRow[]) ?? []);
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
      ).join(" ")} ${(row.tutoring_for ?? []).join(" ")} ${(
        row.boards ?? []
      ).join(" ")}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [tutors, search]);

  const pendingMatches = useMemo(
    () => requirements.filter((row) => !row.match_status).length,
    [requirements]
  );

  function handleExport() {
    const today = new Date().toISOString().slice(0, 10);
    if (activeTab === "requirements") {
      exportToCsv(`parent-requirements-${today}.csv`, REQUIREMENT_COLUMNS, filteredRequirements);
    } else if (activeTab === "tutors") {
      exportToCsv(`tutor-applications-${today}.csv`, TUTOR_COLUMNS, filteredTutors);
    } else {
      exportToCsv(
        activeTab === "attendance" ? `attendance-payouts-${today}.csv` : `logged-classes-${today}.csv`,
        SESSION_COLUMNS,
        sessions
      );
    }
  }

  const awaitingValidation = sessions.filter((s) => s.status === "PARENT_CONFIRMED");
  const payable = sessions.filter(
    (s) => s.status === "ADMIN_VALIDATED" && !s.payment_released
  );
  const disputesOpen = sessions.filter((s) => s.status === "DISPUTED").length;

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
    // 10% default matches Model A (commission on teacher payout) from the
    // business case; admin can override per payout.
    const pct = window.prompt("Commission percentage for this payout?", "10");
    if (pct === null) return;
    setBusyId(matchId);
    setActionError(null);
    const supabase = createClient();
    const { data, error } = await supabase.rpc("release_payout", {
      p_match_id: matchId,
      p_commission_percent: Number(pct) || 0,
    });
    if (error) {
      setActionError(error.message);
      setBusyId(null);
      return;
    }

    const code = window.prompt(
      "Teacher's referral discount code, if any (leave blank to skip):",
      ""
    );
    if (code && code.trim()) {
      const payoutId = (data as { id: string } | null)?.id;
      if (payoutId) {
        const { error: discountError } = await supabase.rpc("admin_apply_discount_to_payout", {
          p_payout_id: payoutId,
          p_code: code.trim(),
        });
        if (discountError) setActionError(discountError.message);
      }
    }

    loadData();
    setBusyId(null);
  }

  async function downloadPayoutStatement() {
    if (!statementTeacherId) {
      setActionError("Pick a tutor first.");
      return;
    }
    setStatementBusy(true);
    setActionError(null);
    const supabase = createClient();
    const { data, error } = await supabase.rpc("admin_teacher_payouts", {
      p_teacher_id: statementTeacherId,
    });
    if (error) {
      setActionError(error.message);
    } else {
      const teacher = tutors.find((t) => t.id === statementTeacherId);
      const today = new Date().toISOString().slice(0, 10);
      exportToCsv(
        `payout-statement-${teacher?.display_id ?? statementTeacherId}-${today}.csv`,
        PAYOUT_COLUMNS,
        (data as PayoutRow[]) ?? []
      );
    }
    setStatementBusy(false);
  }

  async function setKycStatus(teacherId: string, status: "APPROVED" | "REJECTED") {
    setBusyId(teacherId);
    setActionError(null);
    const supabase = createClient();
    const { error } = await supabase.rpc("set_teacher_kyc_status", {
      p_teacher_id: teacherId,
      p_status: status,
    });
    if (error) setActionError(error.message);
    else loadData();
    setBusyId(null);
  }

  async function viewKycDocument(path: string) {
    const supabase = createClient();
    const { data, error } = await supabase.storage
      .from("kyc-documents")
      .createSignedUrl(path, 60);
    if (error || !data) {
      setActionError(error?.message ?? "Could not open document.");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
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

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-4">
              <MetricCard label="Total Parent Requirements" value={requirements.length} />
              <MetricCard label="Total Tutor Applications" value={tutors.length} />
              <MetricCard label="Pending Matches" value={pendingMatches} />
              <MetricCard label="Disputes Open" value={disputesOpen} />
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
              <button
                type="button"
                onClick={() => setActiveTab("logged-classes")}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  activeTab === "logged-classes" ? "bg-navy text-white" : "text-slate-500 hover:text-navy"
                }`}
              >
                Logged Classes
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("pooling")}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  activeTab === "pooling" ? "bg-navy text-white" : "text-slate-500 hover:text-navy"
                }`}
              >
                Community Pooling
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("academy")}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  activeTab === "academy" ? "bg-navy text-white" : "text-slate-500 hover:text-navy"
                }`}
              >
                Academy
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("notifications")}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  activeTab === "notifications" ? "bg-navy text-white" : "text-slate-500 hover:text-navy"
                }`}
              >
                Notifications
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("referrals")}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  activeTab === "referrals" ? "bg-navy text-white" : "text-slate-500 hover:text-navy"
                }`}
              >
                Referrals
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("partners")}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  activeTab === "partners" ? "bg-navy text-white" : "text-slate-500 hover:text-navy"
                }`}
              >
                Partners
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("testimonials")}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  activeTab === "testimonials" ? "bg-navy text-white" : "text-slate-500 hover:text-navy"
                }`}
              >
                Testimonials
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("registration-forms")}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  activeTab === "registration-forms" ? "bg-navy text-white" : "text-slate-500 hover:text-navy"
                }`}
              >
                Form for Registration
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("manage-users")}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  activeTab === "manage-users" ? "bg-navy text-white" : "text-slate-500 hover:text-navy"
                }`}
              >
                Manage Users
              </button>
            </div>

            <div className="flex items-center gap-3">
              {activeTab !== "attendance" &&
                activeTab !== "logged-classes" &&
                activeTab !== "manage-users" &&
                activeTab !== "registration-forms" &&
                activeTab !== "pooling" &&
                activeTab !== "academy" &&
                activeTab !== "notifications" &&
                activeTab !== "referrals" &&
                activeTab !== "partners" &&
                activeTab !== "testimonials" && (
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by location or subject…"
                  className="w-full max-w-xs rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber/50"
                />
              )}
              {activeTab !== "manage-users" &&
                activeTab !== "registration-forms" &&
                activeTab !== "pooling" &&
                activeTab !== "academy" &&
                activeTab !== "notifications" &&
                activeTab !== "referrals" &&
                activeTab !== "partners" &&
                activeTab !== "testimonials" && (
                <button
                  type="button"
                  onClick={handleExport}
                  className="whitespace-nowrap rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-slate-50"
                >
                  Export to Excel
                </button>
              )}
            </div>
          </div>

          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            {loading ? (
              <div className="px-4 py-16 text-center text-sm text-slate-400">
                Loading dashboard data…
              </div>
            ) : activeTab === "requirements" ? (
              <>
                <FunnelStats />
                <table className="w-full min-w-[900px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <th className="px-4 py-3">Parent Name</th>
                    <th className="px-4 py-3">Student &amp; Grade</th>
                    <th className="px-4 py-3">Subject</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Schedule</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Submitted</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRequirements.length === 0 ? (
                    <EmptyState message="No parent requirements match your filters." colSpan={9} />
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
                          {row.schedule_pref || "—"}
                          {row.time_preference ? ` · ${row.time_preference}` : ""}
                        </td>
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
              </>
            ) : activeTab === "tutors" ? (
              <table className="w-full min-w-[1400px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <th className="px-4 py-3">Full Name</th>
                    <th className="px-4 py-3">Qualifications</th>
                    <th className="px-4 py-3">Experience</th>
                    <th className="px-4 py-3">Tutoring For / Boards</th>
                    <th className="px-4 py-3">Subjects</th>
                    <th className="px-4 py-3">Languages</th>
                    <th className="px-4 py-3">Locations</th>
                    <th className="px-4 py-3">Mode</th>
                    <th className="px-4 py-3">Schedule</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">KYC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTutors.length === 0 ? (
                    <EmptyState message="No tutor applications match your filters." colSpan={11} />
                  ) : (
                    filteredTutors.map((row) => (
                      <tr key={row.id} className="align-top">
                        <td className="px-4 py-4 font-medium text-navy">
                          <div className="flex items-center gap-2.5">
                            {row.photo_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={row.photo_url}
                                alt=""
                                className="h-8 w-8 shrink-0 rounded-full object-cover"
                              />
                            ) : (
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy/10 text-xs font-semibold text-navy">
                                {(row.name || "?").charAt(0).toUpperCase()}
                              </span>
                            )}
                            <div>
                              <p>{row.name || "—"}</p>
                              <StatusBadge status={row.status} />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-slate-600">{row.qualification || "—"}</td>
                        <td className="px-4 py-4 text-slate-600">{row.experience || "—"}</td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-1.5">
                            {[...(row.tutoring_for ?? []), ...(row.boards ?? [])].length > 0 ? (
                              [...(row.tutoring_for ?? []), ...(row.boards ?? [])].map((item) => (
                                <span key={item} className="rounded-full bg-navy/5 px-2.5 py-1 text-[11px] font-medium text-navy">
                                  {item}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </div>
                        </td>
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
                            {(row.languages ?? []).length > 0 ? (
                              row.languages!.map((lang) => (
                                <span
                                  key={lang.language}
                                  title={[
                                    lang.can_read ? "Read" : null,
                                    lang.can_write ? "Write" : null,
                                    lang.can_speak ? "Speak" : null,
                                  ]
                                    .filter(Boolean)
                                    .join(", ")}
                                  className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600"
                                >
                                  {lang.language}
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
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-1.5">
                            {(row.teaching_mode ?? []).length > 0 ? (
                              row.teaching_mode!.map((mode) => (
                                <span key={mode} className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                                  {mode}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          {row.schedule_pref || "—"}
                          {row.time_preference ? ` · ${row.time_preference}` : ""}
                        </td>
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
                          <div className="flex flex-col items-start gap-1.5">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                                row.kyc_status === "APPROVED"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : row.kyc_status === "REJECTED"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {row.kyc_status}
                            </span>
                            {row.kyc_document_path && (
                              <button
                                type="button"
                                onClick={() => viewKycDocument(row.kyc_document_path as string)}
                                className="text-xs text-amber-700 underline"
                              >
                                View ID
                              </button>
                            )}
                            {row.kyc_status !== "APPROVED" && (
                              <button
                                type="button"
                                disabled={busyId === row.id || !row.kyc_document_path}
                                onClick={() => setKycStatus(row.id, "APPROVED")}
                                className="text-xs font-semibold text-emerald-700 underline disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Approve
                              </button>
                            )}
                            {row.kyc_status !== "REJECTED" && (
                              <button
                                type="button"
                                disabled={busyId === row.id || !row.kyc_document_path}
                                onClick={() => setKycStatus(row.id, "REJECTED")}
                                className="text-xs font-semibold text-red-600 underline disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Reject
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : activeTab === "attendance" ? (
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

                <div className="px-4 py-4">
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Payout Statements
                  </h3>
                  <div className="flex flex-wrap items-center gap-3">
                    <select
                      value={statementTeacherId}
                      onChange={(e) => setStatementTeacherId(e.target.value)}
                      className="min-w-[220px] rounded-lg border border-slate-200 px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-amber/50"
                    >
                      <option value="">Select a tutor…</option>
                      {tutors.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name || t.display_id}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      disabled={statementBusy || !statementTeacherId}
                      onClick={downloadPayoutStatement}
                      className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-navy transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {statementBusy ? "Preparing…" : "Download Statement"}
                    </button>
                  </div>
                </div>
              </div>
            ) : activeTab === "pooling" ? (
              <div className="p-5">
                <PoolingTab
                  groups={poolingGroups}
                  requirements={requirements}
                  tutors={tutors}
                  onUpdated={loadData}
                />
              </div>
            ) : activeTab === "academy" ? (
              <AcademyTab courses={academyCourses} enrollments={academyEnrollments} onUpdated={loadData} />
            ) : activeTab === "notifications" ? (
              <NotificationsTab />
            ) : activeTab === "referrals" ? (
              <ReferralsTab />
            ) : activeTab === "partners" ? (
              <PartnersTab />
            ) : activeTab === "testimonials" ? (
              <TestimonialsTab />
            ) : activeTab === "manage-users" ? (
              <ManageUsers tutors={tutors} onTutorsChanged={loadData} />
            ) : activeTab === "registration-forms" ? (
              <RegistrationForms />
            ) : (
              <table className="w-full min-w-[1100px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Teacher</th>
                    <th className="px-4 py-3">Subject</th>
                    <th className="px-4 py-3">Date &amp; Time</th>
                    <th className="px-4 py-3">Hours</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Payout</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sessions.length === 0 ? (
                    <EmptyState message="No classes logged yet." colSpan={8} />
                  ) : (
                    sessions.map((s) => (
                      <tr key={s.id} className="align-top">
                        <td className="px-4 py-4 text-slate-600">
                          {s.student_name || "—"}
                          {s.student_grade ? ` · ${s.student_grade}` : ""}
                        </td>
                        <td className="px-4 py-4 font-medium text-navy">
                          {s.teacher_name || "—"}
                          {s.teacher_phone && (
                            <a href={`tel:${s.teacher_phone}`} className="block text-xs font-normal text-slate-400 hover:text-amber-600">
                              {s.teacher_phone}
                            </a>
                          )}
                        </td>
                        <td className="px-4 py-4 text-slate-600">{s.subject || "—"}</td>
                        <td className="px-4 py-4 text-slate-500">
                          {formatDate(s.date)}
                          {s.time_slot ? ` · ${s.time_slot}` : ""}
                        </td>
                        <td className="px-4 py-4 text-slate-600">{s.duration_hours != null ? `${s.duration_hours} hrs` : "—"}</td>
                        <td className="px-4 py-4 text-slate-600">{s.amount != null ? `₹${s.amount}` : "—"}</td>
                        <td className="px-4 py-4 text-slate-600">{s.status}</td>
                        <td className="px-4 py-4">
                          {s.payment_released ? (
                            <span className="text-emerald-600">
                              Paid{s.payout_amount != null ? ` (₹${s.payout_amount})` : ""}
                            </span>
                          ) : (
                            <span className="text-slate-400">Pending</span>
                          )}
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
          onUpdated={() => {
            setMatchTarget(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}
