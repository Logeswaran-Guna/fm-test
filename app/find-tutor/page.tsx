"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import Header from "../components/Header";
import BackButton from "../components/BackButton";
import EducationBackground from "../components/EducationBackground";
import PasswordField from "../components/PasswordField";
import HoneypotField from "../components/HoneypotField";
import LocationField from "../components/LocationField";
import FieldLabel from "../components/FieldLabel";
import { createClient } from "@/lib/supabase/client";
import { signUpOrSignIn } from "@/lib/supabase/auth-helpers";
import { getCurrentProfile, homePathForRole, type Profile } from "@/lib/supabase/profile";
import { isLikelyBot } from "@/lib/antiSpam";
import {
  BOARDS,
  CREATIVE_LEARNING_ITEMS,
  GRADE_BANDS,
  MODES,
  SCHEDULE_PREFERENCES,
  SOFT_SKILLS_ITEMS,
  TIME_PREFERENCES_BY_SCHEDULE,
  TEACHER_GENDER_PREFERENCES,
  TUTORING_FOR,
  type Mode,
  type TutoringFor,
} from "@/lib/categories";

const PRICING_TYPES = ["Fixed budget", "Negotiable"] as const;
type PricingType = (typeof PRICING_TYPES)[number];

type FormState = {
  parentName: string;
  email: string;
  password: string;
  studentName: string;
  gradeClass: string;
  location: string;
  phoneNumber: string;
  referralCode: string;
  modes: Mode[];
  address: string;
  pincode: string;
  schedulePref: string;
  timePreference: string;
  pricingType: PricingType;
  budget: number;
  preferredGender: string;
  priorExperience: string;
  notes: string;
  consent: boolean;
  tutoringFor: TutoringFor[];
  boards: string[];
  gradeSubjects: Record<string, string[]>;
  creativeItems: string[];
  softSkillItems: string[];
};

type FormErrors = Record<string, string | undefined>;

const initialFormState: FormState = {
  parentName: "",
  email: "",
  password: "",
  studentName: "",
  gradeClass: "",
  location: "",
  phoneNumber: "",
  referralCode: "",
  modes: [],
  address: "",
  pincode: "",
  schedulePref: SCHEDULE_PREFERENCES[0],
  timePreference: TIME_PREFERENCES_BY_SCHEDULE[SCHEDULE_PREFERENCES[0]]?.[0] ?? "",
  pricingType: "Fixed budget",
  budget: 3500,
  preferredGender: TEACHER_GENDER_PREFERENCES[0],
  priorExperience: "",
  notes: "",
  consent: false,
  tutoringFor: [],
  boards: [],
  gradeSubjects: {},
  creativeItems: [],
  softSkillItems: [],
};

// Every leaf pick becomes its own requirement row (same "one row per
// subject" model as before) — Academic picks are labeled the same way a
// teacher's profile labels them ("<grade band> — <subject>") so the
// admin's subject-matching logic lines up exactly between the two sides.
function buildSubjectList(form: FormState): string[] {
  const out: string[] = [];
  if (form.tutoringFor.includes("Academics")) {
    for (const band of GRADE_BANDS) {
      for (const subject of form.gradeSubjects[band.label] ?? []) {
        out.push(`${band.label} — ${subject}`);
      }
    }
  }
  if (form.tutoringFor.includes("Creative Learning")) out.push(...form.creativeItems);
  if (form.tutoringFor.includes("Soft Skills")) out.push(...form.softSkillItems);
  return out;
}

function validate(form: FormState, skipAccountFields: boolean): FormErrors {
  const errors: FormErrors = {};

  if (!skipAccountFields) {
    if (!form.parentName.trim()) errors.parentName = "Parent name is required.";

    if (!form.email.trim()) {
      errors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errors.email = "Enter a valid email address.";
    }

    if (!form.password.trim()) {
      errors.password = "Please choose a password.";
    } else if (form.password.length < 8) {
      errors.password = "Password must be at least 8 characters.";
    }

    const digitsOnly = form.phoneNumber.replace(/\D/g, "");
    if (!form.phoneNumber.trim()) {
      errors.phoneNumber = "Phone number is required.";
    } else if (digitsOnly.length < 10 || digitsOnly.length > 12) {
      errors.phoneNumber = "Enter a valid phone number.";
    }
  }

  if (!form.studentName.trim()) errors.studentName = "Student name is required.";
  if (!form.gradeClass.trim()) errors.gradeClass = "Grade / class is required.";
  if (!form.location.trim()) errors.location = "Location is required.";
  if (!form.address.trim()) errors.address = "Address is required.";
  if (!form.pincode.trim()) {
    errors.pincode = "Pincode is required.";
  } else if (!/^\d{6}$/.test(form.pincode.trim())) {
    errors.pincode = "Enter a valid 6-digit pincode.";
  }
  if (form.modes.length === 0) errors.modes = "Please select at least one mode.";

  if (form.tutoringFor.length === 0)
    errors.tutoringFor = "Please select at least one option.";

  if (form.tutoringFor.includes("Academics")) {
    if (form.boards.length === 0) errors.boards = "Pick at least one board.";
    const anyGradeSubject = Object.values(form.gradeSubjects).some((l) => l.length > 0);
    if (!anyGradeSubject) errors.gradeSubjects = "Pick at least one grade level and subject.";
  }
  if (form.tutoringFor.includes("Creative Learning") && form.creativeItems.length === 0) {
    errors.creativeItems = "Pick at least one creative learning area.";
  }
  if (form.tutoringFor.includes("Soft Skills") && form.softSkillItems.length === 0) {
    errors.softSkillItems = "Pick at least one soft skill area.";
  }
  if (buildSubjectList(form).length === 0) {
    errors.tutoringFor = "Pick at least one subject or area.";
  }

  if (!form.consent) {
    errors.consent = "Please provide consent to continue under DPDP Act norms.";
  }

  return errors;
}

export default function FindTutorPage() {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [submittedParentName, setSubmittedParentName] = useState("");
  const [signedInAs, setSignedInAs] = useState<Profile | null>(null);
  const [loggedInParent, setLoggedInParent] = useState<Profile | null>(null);
  const [honeypot, setHoneypot] = useState("");
  const formStartedAt = useRef(0);
  // Claimed synchronously at the very top of handleSubmit, before any state
  // update or await — the `submitting` state alone isn't enough to stop a
  // fast double-click, since disabling the button only takes effect after
  // React re-renders, leaving a real window for two clicks to both start
  // handleSubmit before either sees the button as disabled. This ref closes
  // that window; a state-only guard doesn't (same class of bug fixed in
  // PendingSignupResolver, just a different spot).
  const submittingRef = useRef(false);
  // Survive across a retry (a fresh handleSubmit call after a mid-loop
  // failure below) — a plain local variable inside handleSubmit would
  // reset to null every time, so a retry would create a brand-new student
  // for subjects that already succeeded instead of reusing the one from
  // the first successful call, quietly burning the "4 students per
  // parent" cap and duplicating requirements for subjects already saved.
  const studentIdRef = useRef<string | null>(null);
  const submittedSubjectsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    formStartedAt.current = Date.now();
  }, []);

  // Auto-fill from a shared referral link (?ref=CODE) — read directly off
  // window.location rather than useSearchParams() so this page can stay
  // statically prerendered (useSearchParams would force it dynamic /
  // require a Suspense boundary). Only fills an empty field, never
  // overwrites something the visitor already typed.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (!ref) return;
    Promise.resolve().then(() => {
      setForm((f) => (f.referralCode ? f : { ...f, referralCode: ref }));
    });
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      const supabase = createClient();
      const profile = await getCurrentProfile(supabase);
      if (!active) return;
      // Each role requires its own account — a Teacher signed in here
      // can't also submit a requirement as a Parent on the same login.
      if (profile && profile.role !== "PARENT") {
        setSignedInAs(profile);
      } else {
        setLoggedInParent(profile);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setSignedInAs(null);
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  }

  function toggleInArray<K extends "modes" | "tutoringFor" | "boards" | "creativeItems" | "softSkillItems">(
    key: K,
    value: string
  ) {
    setForm((prev) => {
      const current = prev[key] as unknown as string[];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [key]: next } as FormState;
    });
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function toggleGradeSubject(bandLabel: string, subject: string) {
    setForm((prev) => {
      const current = prev.gradeSubjects[bandLabel] ?? [];
      const next = current.includes(subject)
        ? current.filter((s) => s !== subject)
        : [...current, subject];
      return { ...prev, gradeSubjects: { ...prev.gradeSubjects, [bandLabel]: next } };
    });
    setErrors((prev) => ({ ...prev, gradeSubjects: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;

    if (isLikelyBot(honeypot, formStartedAt.current)) {
      // Don't reveal detection — show the same success state a real
      // submission would, without ever writing to the database.
      setSubmittedParentName(loggedInParent ? loggedInParent.name : form.parentName.trim());
      setSuccess(true);
      submittingRef.current = false;
      return;
    }

    const validationErrors = validate(form, Boolean(loggedInParent));
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      submittingRef.current = false;
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    setNeedsConfirmation(false);

    try {
      const supabase = createClient();

      if (!loggedInParent) {
        // Carried on the account itself (not the browser) so it survives
        // the confirmation link being opened on a different device than
        // the one this form was filled out on — see PendingSignupResolver.
        const pendingRequirement = {
          studentName: form.studentName.trim(),
          ageGrade: form.gradeClass.trim(),
          subjects: buildSubjectList(form),
          modes: form.modes,
          location: form.location.trim(),
          address: form.address.trim(),
          pincode: form.pincode.trim(),
          schedulePref: form.schedulePref,
          timePreference: TIME_PREFERENCES_BY_SCHEDULE[form.schedulePref]
            ? form.timePreference
            : undefined,
          pricingType: form.pricingType,
          budget: form.budget,
          preferredGender: form.preferredGender,
          whatsapp: form.phoneNumber.trim(),
          notes: form.notes.trim() || undefined,
          priorExperience: form.priorExperience.trim() || undefined,
        };

        const { hasSession } = await signUpOrSignIn(supabase, {
          email: form.email.trim(),
          password: form.password,
          name: form.parentName.trim(),
          phone: form.phoneNumber.trim(),
          role: "PARENT",
          referralCode: form.referralCode,
          extraMetadata: { pending_requirement: pendingRequirement },
        });

        if (!hasSession) {
          setNeedsConfirmation(true);
          return;
        }
      }

      const whatsapp = loggedInParent ? loggedInParent.phone : form.phoneNumber.trim();
      const subjects = buildSubjectList(form);
      // On a fresh submission these refs are already empty; on a retry
      // after a partial failure, this skips subjects already saved and
      // reuses the student created by the first successful call.
      const remaining = subjects.filter((s) => !submittedSubjectsRef.current.has(s));

      for (const subject of remaining) {
        const { data, error } = await supabase.rpc("submit_requirement", {
          p_subject: subject,
          p_mode: form.modes,
          p_consent: true,
          p_location: form.location.trim(),
          p_address: form.address.trim(),
          p_pincode: form.pincode.trim(),
          p_schedule_pref: form.schedulePref,
          p_time_preference: TIME_PREFERENCES_BY_SCHEDULE[form.schedulePref] ? form.timePreference : undefined,
          p_pricing_type: form.pricingType,
          p_budget: form.budget,
          p_preferred_teacher_gender: form.preferredGender,
          p_student_id: studentIdRef.current ?? undefined,
          p_student_name: studentIdRef.current ? undefined : form.studentName.trim(),
          p_age_grade: studentIdRef.current ? undefined : form.gradeClass.trim(),
          p_whatsapp: whatsapp,
          p_notes: form.notes.trim() || undefined,
          p_prior_tutoring_experience: form.priorExperience.trim() || undefined,
        });

        if (error) {
          throw new Error(
            submittedSubjectsRef.current.size > 0
              ? `${error.message} (${submittedSubjectsRef.current.size} of ${subjects.length} subjects were already submitted — click Submit again to retry just the rest.)`
              : error.message
          );
        }
        if (!studentIdRef.current) studentIdRef.current = data.student_id as string;
        submittedSubjectsRef.current.add(subject);
      }

      studentIdRef.current = null;
      submittedSubjectsRef.current = new Set();
      setSubmittedParentName(loggedInParent ? loggedInParent.name : form.parentName.trim());
      setSuccess(true);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
      submittingRef.current = false;
    }
  }

  function handleReset() {
    studentIdRef.current = null;
    submittedSubjectsRef.current = new Set();
    setForm(initialFormState);
    setErrors({});
    setSubmitError(null);
    setNeedsConfirmation(false);
    setSuccess(false);
  }

  const sectionNumbers: Partial<Record<TutoringFor, number>> = {};
  form.tutoringFor.forEach((t, i) => {
    sectionNumbers[t] = i + 1;
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <BackButton />
      <main className="flex-1 bg-[#FAFBFC]">
        <section className="bg-navy">
          <div className="mx-auto max-w-3xl px-6 py-14 text-center sm:px-8">
            <div className="mx-auto flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber">
              <span className="h-px w-4 bg-amber" />
              Get Matched · Step 1 of 4
              <span className="h-px w-4 bg-amber" />
            </div>
            <h1 className="mt-4 font-heading text-3xl font-bold text-white sm:text-4xl">
              Tell us what you&apos;re looking for
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm text-white/70 sm:text-base">
              We review every submission personally — no bidding wars, no
              cold calls from strangers.
            </p>
          </div>
        </section>

        <div className="relative overflow-hidden">
          <EducationBackground />
          <div className="relative z-10 mx-auto max-w-2xl px-6 py-12 sm:px-8">
          {signedInAs ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
              <h2 className="font-heading text-xl font-semibold text-navy">
                You&apos;re signed in as a {signedInAs.role === "TEACHER" ? "tutor" : "admin"}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">
                This form creates a new parent account, so it can&apos;t be
                used while you&apos;re signed in as {signedInAs.name}. Log out
                to continue as a parent, or go to your own dashboard.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-xl bg-amber px-6 py-3 text-sm font-semibold text-navy shadow-lg shadow-amber/30 transition-transform hover:-translate-y-0.5"
                >
                  Log out and continue
                </button>
                <Link
                  href={homePathForRole(signedInAs.role)}
                  className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-navy transition-colors hover:bg-slate-50"
                >
                  Go to my dashboard
                </Link>
              </div>
            </div>
          ) : needsConfirmation ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber/10 text-2xl font-bold text-amber">
                ✉
              </div>
              <h2 className="mt-5 font-heading text-2xl font-semibold text-navy">
                Confirm your email to finish
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">
                We&apos;ve sent a confirmation link to {form.email}. Once
                you click it, we&apos;ll automatically finish submitting your
                requirement — you don&apos;t need to fill this form again or
                come back to this page.
              </p>
            </div>
          ) : success ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber/10 text-2xl font-bold text-amber">
                ✓
              </div>
              <h2 className="mt-5 font-heading text-2xl font-semibold text-navy">
                Requirement received
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">
                Thank you{submittedParentName ? `, ${submittedParentName}` : ""}
                . Our team will review your requirement and reach out within
                4 hours to help find the right tutor.
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="mt-6 inline-flex items-center justify-center rounded-xl border border-navy/20 px-5 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-navy hover:text-white"
              >
                Submit another requirement
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              noValidate
              className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
            >
              <HoneypotField value={honeypot} onChange={setHoneypot} />
              {loggedInParent ? (
                <p className="rounded-lg bg-slate-50 px-4 py-3 text-xs text-slate-500">
                  Submitting as <strong>{loggedInParent.name}</strong> ({loggedInParent.email || loggedInParent.phone}).
                </p>
              ) : (
                <>
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Your details
                  </div>
                  <Field
                    label="Parent Name"
                    value={form.parentName}
                    onChange={(value) => updateField("parentName", value)}
                    error={errors.parentName}
                    placeholder="e.g. Meera Krishnan"
                    required
                  />
                  <Field
                    label="Email"
                    type="email"
                    value={form.email}
                    onChange={(value) => updateField("email", value)}
                    error={errors.email}
                    placeholder="e.g. meera@email.com"
                    hint="Used to create your account so you can track this requirement later."
                    required
                  />
                  <PasswordField
                    label="Password"
                    value={form.password}
                    onChange={(value) => updateField("password", value)}
                    error={errors.password}
                    placeholder="At least 8 characters"
                    required
                  />
                  <Field
                    label="Phone Number"
                    value={form.phoneNumber}
                    onChange={(value) => updateField("phoneNumber", value)}
                    error={errors.phoneNumber}
                    placeholder="e.g. 98765 43210"
                    type="tel"
                    required
                  />
                  <Field
                    label="Referral Code (optional)"
                    value={form.referralCode}
                    onChange={(value) => updateField("referralCode", value)}
                    placeholder="e.g. FMPAR260803-01"
                    hint="Were you referred by another parent or tutor? Enter their code here."
                  />
                </>
              )}

              <div className="pt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                What you&apos;re looking for
              </div>

              <ChipGroup
                label="Tutoring For (select all that apply)"
                options={TUTORING_FOR as readonly string[]}
                selected={form.tutoringFor}
                onToggle={(v) => toggleInArray("tutoringFor", v)}
                error={errors.tutoringFor}
                required
              />

              {form.tutoringFor.includes("Academics") && (
                <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {sectionNumbers["Academics"]}. Academics
                  </p>
                  <ChipGroup
                    label={`${sectionNumbers["Academics"]}.1 Board`}
                    options={BOARDS}
                    selected={form.boards}
                    onToggle={(v) => toggleInArray("boards", v)}
                    error={errors.boards}
                    required
                  />
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-navy">
                      <FieldLabel
                        label={`${sectionNumbers["Academics"]}.2 Grade & ${sectionNumbers["Academics"]}.3 Subjects`}
                        required
                        error={errors.gradeSubjects}
                      />
                    </label>
                    <div className="space-y-3">
                      {GRADE_BANDS.map((band) => (
                        <div key={band.label} className="rounded-lg border border-slate-200 bg-white p-3">
                          <p className="mb-2 text-xs font-semibold text-navy">{band.label}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {band.subjects.map((subject) => (
                              <Chip
                                key={subject}
                                label={subject}
                                selected={(form.gradeSubjects[band.label] ?? []).includes(subject)}
                                onClick={() => toggleGradeSubject(band.label, subject)}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    {errors.gradeSubjects && (
                      <p className="mt-1.5 text-xs text-red-600">{errors.gradeSubjects}</p>
                    )}
                  </div>
                </div>
              )}

              {form.tutoringFor.includes("Creative Learning") && (
                <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {sectionNumbers["Creative Learning"]}. Creative Learning
                  </p>
                  <ChipGroup
                    label="Areas of interest"
                    options={CREATIVE_LEARNING_ITEMS}
                    selected={form.creativeItems}
                    onToggle={(v) => toggleInArray("creativeItems", v)}
                    error={errors.creativeItems}
                    required
                  />
                </div>
              )}

              {form.tutoringFor.includes("Soft Skills") && (
                <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {sectionNumbers["Soft Skills"]}. Soft Skills
                  </p>
                  <ChipGroup
                    label="Areas of interest"
                    options={SOFT_SKILLS_ITEMS}
                    selected={form.softSkillItems}
                    onToggle={(v) => toggleInArray("softSkillItems", v)}
                    error={errors.softSkillItems}
                    required
                  />
                </div>
              )}

              <ChipGroup
                label="Mode (select all that apply)"
                options={MODES as readonly string[]}
                selected={form.modes}
                onToggle={(v) => toggleInArray("modes", v)}
                error={errors.modes}
                required
              />

              <LocationField
                label="Location"
                value={form.location}
                onChange={(value) => updateField("location", value)}
                onSelectPincode={(pincode) => updateField("pincode", pincode)}
                error={errors.location}
                placeholder="e.g. Anna Nagar, Coimbatore"
                required
              />

              <Field
                label="Address"
                value={form.address}
                onChange={(value) => updateField("address", value)}
                error={errors.address}
                placeholder="Full address — house/flat no., street, area"
                required
              />

              <Field
                label="Pincode"
                value={form.pincode}
                onChange={(value) => updateField("pincode", value.replace(/\D/g, "").slice(0, 6))}
                error={errors.pincode}
                placeholder="e.g. 641001"
                required
              />

              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy">
                  Schedule preference
                </label>
                <select
                  value={form.schedulePref}
                  onChange={(e) => {
                    const nextSchedule = e.target.value;
                    updateField("schedulePref", nextSchedule);
                    updateField("timePreference", TIME_PREFERENCES_BY_SCHEDULE[nextSchedule]?.[0] ?? "");
                  }}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-amber/50"
                >
                  {SCHEDULE_PREFERENCES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {TIME_PREFERENCES_BY_SCHEDULE[form.schedulePref] && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-navy">
                    Time preference
                  </label>
                  <select
                    value={form.timePreference}
                    onChange={(e) => updateField("timePreference", e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-amber/50"
                  >
                    {TIME_PREFERENCES_BY_SCHEDULE[form.schedulePref].map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy">Pricing</label>
                <div className="flex gap-2.5">
                  {PRICING_TYPES.map((pt) => {
                    const selected = form.pricingType === pt;
                    return (
                      <button
                        type="button"
                        key={pt}
                        onClick={() => updateField("pricingType", pt)}
                        aria-pressed={selected}
                        className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                          selected
                            ? "border-amber bg-amber/10 text-navy"
                            : "border-slate-200 bg-white text-slate-600 hover:border-amber/50"
                        }`}
                      >
                        {pt}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy">
                  Monthly budget — <b className="text-amber-600">₹{form.budget.toLocaleString("en-IN")}</b>
                </label>
                <input
                  type="range"
                  min={500}
                  max={12000}
                  step={250}
                  value={form.budget}
                  onChange={(e) => updateField("budget", Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
                <div className="flex justify-between text-xs text-slate-400">
                  <span>₹500</span>
                  <span>₹12,000</span>
                </div>
              </div>

              <div className="pt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                About the learner
              </div>
              <Field
                label="Student Name"
                value={form.studentName}
                onChange={(value) => updateField("studentName", value)}
                error={errors.studentName}
                placeholder="e.g. Aarav Krishnan"
                required
              />
              <Field
                label="Age / Grade / Class"
                value={form.gradeClass}
                onChange={(value) => updateField("gradeClass", value)}
                error={errors.gradeClass}
                placeholder="e.g. Class 10"
                required
              />

              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy">
                  Preferred teacher gender
                </label>
                <select
                  value={form.preferredGender}
                  onChange={(e) => updateField("preferredGender", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-amber/50"
                >
                  {TEACHER_GENDER_PREFERENCES.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <Field
                label="Prior tutoring experience"
                value={form.priorExperience}
                onChange={(value) => updateField("priorExperience", value)}
                placeholder="e.g. Had a home tutor for 6 months last year"
                hint="Optional — helps our matching team."
              />

              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy">
                  Additional notes / special requirements
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                  rows={3}
                  placeholder="Optional"
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber/50"
                />
              </div>

              <div className="rounded-lg bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-500">
                <strong className="text-navy">On fees:</strong>
                {" "}class fees are paid directly to the tutor, as agreed between you. Once you approve a tutor,
                Future Minds charges a one-time platform fee of 20% of your monthly budget, paid directly to us.
                The tutor separately pays Future Minds a 10% commission from their own earnings every month, for as
                long as the class stays active. For Community Pooling batches, it&apos;s different: both sides pay
                a recurring 10% each month instead — see{" "}
                <a href="/tutor-platform" className="font-semibold text-amber-700 underline">
                  how Community Pooling works
                </a>
                .
              </div>

              <div>
                <label
                  className={`flex items-start gap-3 text-sm ${
                    errors.consent ? "text-red-600" : "text-slate-600"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form.consent}
                    onChange={(event) => updateField("consent", event.target.checked)}
                    className={`mt-0.5 h-4 w-4 shrink-0 rounded text-amber focus:ring-amber ${
                      errors.consent ? "border-red-400" : "border-slate-300"
                    }`}
                  />
                  <span>
                    I consent to Future Minds processing this requirement
                    under DPDP Act norms, as described in the{" "}
                    <a
                      href="/privacy-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-amber-700 underline"
                    >
                      Privacy Policy &amp; Terms
                    </a>
                    . <span className="text-red-500">*</span>
                    {errors.consent && (
                      <span
                        className="ml-1.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-red-100 text-[10px] font-bold leading-none text-red-600"
                        aria-hidden="true"
                      >
                        !
                      </span>
                    )}
                  </span>
                </label>
                {errors.consent && (
                  <p className="mt-1.5 text-xs text-red-600">{errors.consent}</p>
                )}
              </div>

              {submitError && (
                <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                  {submitError}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-amber px-6 py-3 text-sm font-semibold text-navy shadow-lg shadow-amber/30 transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {submitting ? "Submitting…" : "Submit Requirement"}
              </button>
            </form>
          )}
          </div>
        </div>
      </main>
    </div>
  );
}

function ChipGroup({
  label,
  options,
  selected,
  onToggle,
  error,
  required,
}: {
  label: string;
  options: readonly string[];
  selected: string[];
  onToggle: (value: string) => void;
  error?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-navy">
        <FieldLabel label={label} required={required} error={error} />
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <Chip
            key={option}
            label={option}
            selected={selected.includes(option)}
            onClick={() => onToggle(option)}
          />
        ))}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function Chip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
        selected
          ? "border-amber bg-amber/10 text-navy"
          : "border-slate-200 bg-white text-slate-600 hover:border-amber/50"
      }`}
    >
      {label}
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  placeholder,
  type = "text",
  hint,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  type?: string;
  hint?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-navy">
        <FieldLabel label={label} required={required} error={error} />
      </label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-lg border px-4 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber/50 ${
          error ? "border-red-400" : "border-slate-200"
        }`}
      />
      {error ? (
        <p className="mt-1.5 text-xs text-red-600">{error}</p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-slate-400">{hint}</p>
      )}
    </div>
  );
}
