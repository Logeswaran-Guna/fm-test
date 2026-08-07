"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { AcademyCourseRow, AcademyEnrollmentRow, AcademyEnrollmentStatus } from "./types";

const COURSE_STATUS_STYLES: Record<AcademyCourseRow["status"], string> = {
  OPEN: "bg-emerald-100 text-emerald-700",
  COMING_SOON: "bg-amber/20 text-amber-800",
  CLOSED: "bg-slate-200 text-slate-500",
};

const COURSE_STATUSES: AcademyCourseRow["status"][] = ["OPEN", "COMING_SOON", "CLOSED"];

const ENROLLMENT_STATUS_STYLES: Record<AcademyEnrollmentStatus, string> = {
  NEW: "bg-slate-100 text-slate-600",
  CONTACTED: "bg-sky-100 text-sky-700",
  ENROLLED: "bg-emerald-100 text-emerald-700",
  DECLINED: "bg-red-100 text-red-600",
};

const ENROLLMENT_STATUSES: AcademyEnrollmentStatus[] = ["NEW", "CONTACTED", "ENROLLED", "DECLINED"];

function formatCurrency(amount: number): string {
  return `Rs ${amount.toLocaleString("en-IN")}`;
}

function CourseCard({ course, busy, onUpdated }: { course: AcademyCourseRow; busy: boolean; onUpdated: () => void }) {
  const [localBusy, setLocalBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function editField(field: "price" | "duration", label: string, current: string) {
    const value = window.prompt(label, current);
    if (value === null) return;
    setLocalBusy(true);
    setError(null);
    const supabase = createClient();
    const payload: Record<string, unknown> = { p_id: course.id };
    if (field === "price") payload.p_price = value.trim() === "" ? null : Number(value) || 0;
    if (field === "duration") payload.p_duration = value.trim() || null;
    const { error: rpcError } = await supabase.rpc("upsert_academy_course", payload);
    if (rpcError) setError(rpcError.message);
    else onUpdated();
    setLocalBusy(false);
  }

  async function updateStatus(status: AcademyCourseRow["status"]) {
    setLocalBusy(true);
    setError(null);
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("upsert_academy_course", { p_id: course.id, p_status: status });
    if (rpcError) setError(rpcError.message);
    else onUpdated();
    setLocalBusy(false);
  }

  async function uploadFlyer(file: File) {
    setLocalBusy(true);
    setError(null);
    const supabase = createClient();
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${course.id}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("academy-flyers").upload(path, file, {
      upsert: true,
      contentType: file.type,
    });
    if (uploadError) {
      setError(`Could not upload flyer: ${uploadError.message}`);
      setLocalBusy(false);
      return;
    }
    const { data: publicUrl } = supabase.storage.from("academy-flyers").getPublicUrl(path);
    const { error: rpcError } = await supabase.rpc("upsert_academy_course", {
      p_id: course.id,
      p_image_url: publicUrl.publicUrl,
    });
    if (rpcError) setError(rpcError.message);
    else onUpdated();
    setLocalBusy(false);
  }

  return (
    <div className="flex flex-wrap gap-4 rounded-xl border border-slate-200 bg-white p-4">
      {course.image_url ? (
        <button
          type="button"
          disabled={busy || localBusy}
          onClick={() => fileInputRef.current?.click()}
          className="h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-slate-200 disabled:cursor-not-allowed"
          title="Click to replace flyer"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={course.image_url} alt={`${course.title} flyer`} className="h-full w-full object-cover" />
        </button>
      ) : (
        <button
          type="button"
          disabled={busy || localBusy}
          onClick={() => fileInputRef.current?.click()}
          className="flex h-24 w-24 shrink-0 items-center justify-center rounded-lg border border-dashed border-slate-300 text-center text-[10px] text-slate-400 hover:border-amber-500 hover:text-amber-700 disabled:cursor-not-allowed"
        >
          Add flyer
        </button>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) uploadFlyer(file);
          e.target.value = "";
        }}
      />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{course.display_id}</p>
            <h4 className="font-heading text-sm font-semibold text-navy">
              {course.title} {course.age_range && `· ${course.age_range}`}
            </h4>
            <p className="mt-1 text-xs text-slate-500">{course.format}</p>
          </div>
          <select
            value={course.status}
            disabled={busy || localBusy}
            onChange={(e) => updateStatus(e.target.value as AcademyCourseRow["status"])}
            className={`rounded-full border-0 px-2.5 py-1 text-xs font-semibold disabled:cursor-not-allowed ${COURSE_STATUS_STYLES[course.status]}`}
          >
            {COURSE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500">
          <button
            type="button"
            disabled={busy || localBusy}
            onClick={() => editField("price", "Price (Rs)?", course.price != null ? String(course.price) : "")}
            className="underline decoration-dotted hover:text-amber-700 disabled:cursor-not-allowed"
          >
            Price: {course.price != null ? formatCurrency(course.price) : "Not set — click to add"}
          </button>
          <button
            type="button"
            disabled={busy || localBusy}
            onClick={() => editField("duration", "Duration?", course.duration ?? "")}
            className="underline decoration-dotted hover:text-amber-700 disabled:cursor-not-allowed"
          >
            Duration: {course.duration ?? "Not set"}
          </button>
          <span>Enrollment requests: <strong className="text-navy">{course.enrollment_count}</strong></span>
        </div>
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      </div>
    </div>
  );
}

function EnrollmentRow({ enrollment, onUpdated }: { enrollment: AcademyEnrollmentRow; onUpdated: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function updateStatus(status: AcademyEnrollmentStatus) {
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("set_academy_enrollment_status", {
      p_id: enrollment.id,
      p_status: status,
    });
    if (rpcError) setError(rpcError.message);
    else onUpdated();
    setBusy(false);
  }

  return (
    <tr>
      <td className="px-3 py-2 text-navy">{enrollment.enrollee_name}</td>
      <td className="px-3 py-2 text-slate-500">{enrollment.student_name ?? "—"}</td>
      <td className="px-3 py-2 text-navy">{enrollment.course_title}</td>
      <td className="px-3 py-2 text-slate-500">
        {enrollment.contact_phone}
        {enrollment.contact_email && <div>{enrollment.contact_email}</div>}
      </td>
      <td className="px-3 py-2">
        <select
          value={enrollment.status}
          disabled={busy}
          onChange={(e) => updateStatus(e.target.value as AcademyEnrollmentStatus)}
          className={`rounded-full border-0 px-2.5 py-1 text-xs font-semibold disabled:cursor-not-allowed ${ENROLLMENT_STATUS_STYLES[enrollment.status]}`}
        >
          {ENROLLMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-[10px] text-red-600">{error}</p>}
      </td>
    </tr>
  );
}

export default function AcademyTab({
  courses,
  enrollments,
  onUpdated,
}: {
  courses: AcademyCourseRow[];
  enrollments: AcademyEnrollmentRow[];
  onUpdated: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [format, setFormat] = useState("");

  async function createCourse() {
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("upsert_academy_course", {
      p_title: title.trim(),
      p_age_range: ageRange.trim() || null,
      p_format: format.trim() || null,
      p_display_order: courses.length + 1,
    });
    if (rpcError) setError(rpcError.message);
    else {
      setTitle("");
      setAgeRange("");
      setFormat("");
      onUpdated();
    }
    setBusy(false);
  }

  return (
    <div className="space-y-8 p-5">
      <div>
        <h3 className="font-heading text-sm font-semibold text-navy">Add a Course</h3>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (e.g. Robotics Starter)"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-amber/50"
          />
          <input
            value={ageRange}
            onChange={(e) => setAgeRange(e.target.value)}
            placeholder="Age range (e.g. Ages 6-9)"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-amber/50"
          />
          <input
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            placeholder="Format (e.g. Weekend Workshop)"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-amber/50"
          />
          <button
            type="button"
            disabled={busy}
            onClick={createCourse}
            className="rounded-lg bg-amber px-4 py-2 text-sm font-semibold text-navy transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "Adding…" : "Add Course"}
          </button>
        </div>
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      </div>

      <div>
        <h3 className="mb-3 font-heading text-sm font-semibold text-navy">Courses ({courses.length})</h3>
        <div className="space-y-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} busy={busy} onUpdated={onUpdated} />
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 font-heading text-sm font-semibold text-navy">
          Enrollment Requests ({enrollments.length})
        </h3>
        {enrollments.length === 0 ? (
          <p className="rounded-lg bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            No enrollment requests yet.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full min-w-[720px] text-left text-xs">
              <thead className="bg-slate-50 text-slate-400">
                <tr>
                  <th className="px-3 py-2 font-semibold">Enrollee</th>
                  <th className="px-3 py-2 font-semibold">Student</th>
                  <th className="px-3 py-2 font-semibold">Course</th>
                  <th className="px-3 py-2 font-semibold">Contact</th>
                  <th className="px-3 py-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {enrollments.map((enrollment) => (
                  <EnrollmentRow key={enrollment.id} enrollment={enrollment} onUpdated={onUpdated} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
