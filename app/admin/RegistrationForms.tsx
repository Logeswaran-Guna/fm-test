"use client";

import { useState } from "react";
import {
  BOARDS,
  EXPERIENCE_BANDS,
  MODES,
  SCHEDULE_PREFERENCES,
  SOFT_SKILLS_ITEMS,
  TEACHER_GENDER_PREFERENCES,
  type Mode,
} from "@/lib/categories";

// Streamlined, on-call quick-entry versions of the public Find a Tutor /
// Become a Tutor forms — captures enough to create the account and a first
// requirement/profile so an executive can register a caller over the
// phone. Not the full nested Board/Grade/Subject picker from the public
// forms (that level of detail the parent/tutor can fill in themselves
// after logging in) — this is meant to be fast, not exhaustive.

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-navy">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-navy placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber/50"
      />
    </div>
  );
}

function ChipRow({
  options,
  selected,
  onToggle,
}: {
  options: readonly string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = selected.includes(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() => onToggle(option)}
            aria-pressed={isSelected}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              isSelected
                ? "border-amber bg-amber/10 text-amber-700"
                : "border-slate-200 bg-white text-slate-600 hover:border-amber/50"
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

function toggle(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function ParentRegistrationForm() {
  const [parentName, setParentName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [studentName, setStudentName] = useState("");
  const [gradeClass, setGradeClass] = useState("");
  const [subject, setSubject] = useState("");
  const [board, setBoard] = useState("");
  const [location, setLocation] = useState("");
  const [modes, setModes] = useState<Mode[]>([]);
  const [schedulePref, setSchedulePref] = useState(SCHEDULE_PREFERENCES[0]);
  const [budget, setBudget] = useState("");
  const [preferredGender, setPreferredGender] = useState(TEACHER_GENDER_PREFERENCES[0]);
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    setSuccess(null);
    if (!parentName.trim() || !email.trim() || !phoneNumber.trim() || !subject.trim() || modes.length === 0) {
      setError("Parent name, email, phone, subject, and at least one mode are required.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/register-parent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentName: parentName.trim(),
          email: email.trim(),
          phoneNumber: phoneNumber.trim(),
          subject: board ? `${board} — ${subject.trim()}` : subject.trim(),
          modes,
          location: location.trim(),
          schedulePref,
          budget: budget ? Number(budget) : null,
          preferredGender,
          studentName: studentName.trim() || null,
          gradeClass: gradeClass.trim() || null,
          notes: notes.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not register this parent.");
      setSuccess(`Registered — requirement ${data.requirement?.display_id ?? ""} created. They can log in later via "Forgot password" to set their own password and see full details.`);
      setParentName("");
      setEmail("");
      setPhoneNumber("");
      setStudentName("");
      setGradeClass("");
      setSubject("");
      setBoard("");
      setLocation("");
      setModes([]);
      setBudget("");
      setNotes("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
      {success && <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Parent Name" value={parentName} onChange={setParentName} placeholder="e.g. Meera Krishnan" />
        <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="e.g. meera@email.com" />
        <Field label="Phone Number" type="tel" value={phoneNumber} onChange={setPhoneNumber} placeholder="e.g. 98765 43210" />
        <Field label="Location / Address" value={location} onChange={setLocation} placeholder="e.g. RS Puram, Coimbatore" />
        <Field label="Student Name" value={studentName} onChange={setStudentName} placeholder="Optional" />
        <Field label="Grade / Class" value={gradeClass} onChange={setGradeClass} placeholder="e.g. Class 8" />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-navy">Medium / Board (optional)</label>
        <ChipRow options={BOARDS} selected={board ? [board] : []} onToggle={(v) => setBoard(board === v ? "" : v)} />
      </div>

      <Field label="Subject / What they need help with" value={subject} onChange={setSubject} placeholder="e.g. Class 8 Mathematics, or Spoken English" />

      <div>
        <label className="mb-1.5 block text-xs font-medium text-navy">Mode</label>
        <ChipRow options={MODES} selected={modes} onToggle={(v) => setModes(toggle(modes, v) as Mode[])} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-navy">Schedule Preference</label>
          <select
            value={schedulePref}
            onChange={(e) => setSchedulePref(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-navy"
          >
            {SCHEDULE_PREFERENCES.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        <Field label="Budget (₹ / month)" type="number" value={budget} onChange={setBudget} placeholder="e.g. 3500" />
        <div>
          <label className="mb-1.5 block text-xs font-medium text-navy">Preferred Teacher Gender</label>
          <select
            value={preferredGender}
            onChange={(e) => setPreferredGender(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-navy"
          >
            {TEACHER_GENDER_PREFERENCES.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-navy">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-navy placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber/50"
          placeholder="Anything else worth noting from the call"
        />
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full rounded-xl bg-amber px-6 py-3 text-sm font-semibold text-navy shadow-lg shadow-amber/30 transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Registering…" : "Register Parent & Requirement"}
      </button>
    </div>
  );
}

function TeacherRegistrationForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [qualifications, setQualifications] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [subjectsText, setSubjectsText] = useState("");
  const [softSkills, setSoftSkills] = useState<string[]>([]);
  const [serviceArea, setServiceArea] = useState("");
  const [expectedRate, setExpectedRate] = useState("");
  const [modes, setModes] = useState<Mode[]>([]);
  const [bankUpiRef, setBankUpiRef] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    setSuccess(null);
    if (!fullName.trim() || !email.trim() || !phoneNumber.trim()) {
      setError("Name, email, and phone are required.");
      return;
    }
    setSubmitting(true);
    try {
      const subjects = [
        ...subjectsText.split(",").map((s) => s.trim()).filter(Boolean),
        ...softSkills,
      ];
      const res = await fetch("/api/admin/register-teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          phoneNumber: phoneNumber.trim(),
          qualifications: qualifications.trim() || null,
          yearsExperience: yearsExperience || null,
          expectedRate: expectedRate ? Number(expectedRate) : null,
          serviceArea: serviceArea.trim() || null,
          bankUpiRef: bankUpiRef.trim() || null,
          modes,
          subjects,
          availability: [],
          tutoringFor: softSkills.length > 0 && subjects.length === softSkills.length ? ["Soft Skills"] : ["Academics"],
          boards: [],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not register this tutor.");
      setSuccess(`Registered — teacher ID ${data.profile?.display_id ?? ""} created. They can log in later via "Forgot password" to set their own password, upload KYC, and complete their profile.`);
      setFullName("");
      setEmail("");
      setPhoneNumber("");
      setQualifications("");
      setYearsExperience("");
      setSubjectsText("");
      setSoftSkills([]);
      setServiceArea("");
      setExpectedRate("");
      setModes([]);
      setBankUpiRef("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
      {success && <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Full Name" value={fullName} onChange={setFullName} placeholder="e.g. Priya Ramesh" />
        <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="e.g. priya.ramesh@email.com" />
        <Field label="Phone Number" type="tel" value={phoneNumber} onChange={setPhoneNumber} placeholder="e.g. 98765 43210" />
        <Field label="Highest Qualification" value={qualifications} onChange={setQualifications} placeholder="e.g. B.Tech, M.Sc, B.Ed" />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-navy">Years of Experience</label>
        <select
          value={yearsExperience}
          onChange={(e) => setYearsExperience(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-navy sm:w-72"
        >
          <option value="">Select a range</option>
          {EXPERIENCE_BANDS.map((band) => (
            <option key={band} value={band}>{band}</option>
          ))}
        </select>
      </div>

      <Field
        label="Subjects taught (comma-separated)"
        value={subjectsText}
        onChange={setSubjectsText}
        placeholder="e.g. Class 10 Mathematics, Class 10 Science"
      />

      <div>
        <label className="mb-1.5 block text-xs font-medium text-navy">Soft Skills (optional)</label>
        <ChipRow options={SOFT_SKILLS_ITEMS} selected={softSkills} onToggle={(v) => setSoftSkills(toggle(softSkills, v))} />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-navy">Mode</label>
        <ChipRow options={MODES} selected={modes} onToggle={(v) => setModes(toggle(modes, v) as Mode[])} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Service Area" value={serviceArea} onChange={setServiceArea} placeholder="e.g. Peelamedu, Coimbatore" />
        <Field label="Expected Rate (₹ / month)" type="number" value={expectedRate} onChange={setExpectedRate} />
        <Field label="Bank Account / UPI ID" value={bankUpiRef} onChange={setBankUpiRef} placeholder="Optional" />
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full rounded-xl bg-amber px-6 py-3 text-sm font-semibold text-navy shadow-lg shadow-amber/30 transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Registering…" : "Register Tutor"}
      </button>
    </div>
  );
}

export default function RegistrationForms() {
  const [which, setWhich] = useState<"parent" | "teacher">("parent");

  return (
    <div className="p-4">
      <div className="mb-5 flex rounded-full border border-slate-200 bg-white p-1 sm:w-fit">
        <button
          type="button"
          onClick={() => setWhich("parent")}
          className={`flex-1 rounded-full px-4 py-2 text-xs font-semibold transition-colors sm:flex-none ${
            which === "parent" ? "bg-navy text-white" : "text-slate-500 hover:text-navy"
          }`}
        >
          Parent / Requirement
        </button>
        <button
          type="button"
          onClick={() => setWhich("teacher")}
          className={`flex-1 rounded-full px-4 py-2 text-xs font-semibold transition-colors sm:flex-none ${
            which === "teacher" ? "bg-navy text-white" : "text-slate-500 hover:text-navy"
          }`}
        >
          Teacher / Become a Tutor
        </button>
      </div>

      <p className="mb-5 text-xs text-slate-400">
        Registers the caller with a temporary password — they&apos;ll set their own via &quot;Forgot password&quot; on the login page. This captures the essentials only; the parent/tutor can fill in full details (grade-band subjects, KYC, photo) themselves after logging in.
      </p>

      {which === "parent" ? <ParentRegistrationForm /> : <TeacherRegistrationForm />}
    </div>
  );
}
