"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import Header from "../components/Header";
import BackButton from "../components/BackButton";
import PasswordField from "../components/PasswordField";
import HoneypotField from "../components/HoneypotField";
import { createClient } from "@/lib/supabase/client";
import { signUpOrSignIn } from "@/lib/supabase/auth-helpers";
import { getCurrentProfile, homePathForRole, type Profile } from "@/lib/supabase/profile";
import { isLikelyBot } from "@/lib/antiSpam";
import {
  BOARDS,
  CREATIVE_LEARNING_ITEMS,
  EXPERIENCE_BANDS,
  GRADE_BANDS,
  LANGUAGES,
  MODES,
  SOFT_SKILLS_ITEMS,
  TUTORING_FOR,
  type ExperienceBand,
  type Mode,
  type TutoringFor,
} from "@/lib/categories";

type LanguageRow = {
  language: string;
  canRead: boolean;
  canWrite: boolean;
  canSpeak: boolean;
};

type FormState = {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  qualifications: string;
  yearsExperience: ExperienceBand | "";
  expectedRate: string;
  serviceArea: string;
  bankUpiRef: string;
  bankIfsc: string;
  bankHolderName: string;
  bankBranch: string;
  modes: Mode[];
  tutoringFor: TutoringFor[];
  boards: string[];
  gradeSubjects: Record<string, string[]>;
  creativeItems: string[];
  softSkillItems: string[];
  languages: LanguageRow[];
  consent: boolean;
};

type FormErrors = Record<string, string | undefined>;

// Just the fields the pending/active messaging below needs from
// my_teacher_profile() — not the full row.
type ExistingTeacherProfile = {
  name: string;
  kyc_status: string;
  status: string;
};

const initialFormState: FormState = {
  fullName: "",
  email: "",
  password: "",
  phoneNumber: "",
  qualifications: "",
  yearsExperience: "",
  expectedRate: "",
  serviceArea: "",
  bankUpiRef: "",
  bankIfsc: "",
  bankHolderName: "",
  bankBranch: "",
  modes: [],
  tutoringFor: [],
  boards: [],
  gradeSubjects: {},
  creativeItems: [],
  softSkillItems: [],
  languages: [],
  consent: false,
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function buildSubjectsArray(form: FormState): string[] {
  const out: string[] = [];
  if (form.tutoringFor.includes("Academics")) {
    for (const band of GRADE_BANDS) {
      for (const subject of form.gradeSubjects[band.label] ?? []) {
        out.push(`${band.label} — ${subject}`);
      }
    }
  }
  if (form.tutoringFor.includes("Creative Learning")) {
    out.push(...form.creativeItems);
  }
  if (form.tutoringFor.includes("Soft Skills")) {
    out.push(...form.softSkillItems);
  }
  return out;
}

function validate(form: FormState, skipDetails: boolean): FormErrors {
  const errors: FormErrors = {};

  if (!skipDetails) {
    if (!form.fullName.trim()) errors.fullName = "Full name is required.";

    if (!form.email.trim()) {
      errors.email = "Email address is required.";
    } else if (!EMAIL_PATTERN.test(form.email.trim())) {
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

  if (!form.qualifications.trim())
    errors.qualifications = "Primary qualifications are required.";

  if (!form.yearsExperience)
    errors.yearsExperience = "Please select your experience range.";

  if (!form.serviceArea.trim())
    errors.serviceArea = "Service area / address is required.";

  if (form.modes.length === 0) errors.modes = "Pick at least one mode.";

  if (form.tutoringFor.length === 0)
    errors.tutoringFor = "Pick at least one option.";

  if (form.tutoringFor.includes("Academics")) {
    if (form.boards.length === 0)
      errors.boards = "Pick at least one board / medium.";
    const anyGradeSubject = Object.values(form.gradeSubjects).some(
      (list) => list.length > 0
    );
    if (!anyGradeSubject)
      errors.gradeSubjects = "Pick at least one grade level and subject.";
  }

  if (
    form.tutoringFor.includes("Creative Learning") &&
    form.creativeItems.length === 0
  ) {
    errors.creativeItems = "Pick at least one creative learning area.";
  }

  if (
    form.tutoringFor.includes("Soft Skills") &&
    form.softSkillItems.length === 0
  ) {
    errors.softSkillItems = "Pick at least one soft skill area.";
  }

  if (buildSubjectsArray(form).length === 0) {
    errors.tutoringFor = "Pick at least one subject or area you teach.";
  }

  if (!form.consent)
    errors.consent =
      "Please provide consent to continue under DPDP Act norms.";

  return errors;
}

export default function BecomeATutorPage() {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [idFile, setIdFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);
  // Each role requires its own account — a Parent (or Admin) signed in
  // here is blocked outright (signedInAs); only a Teacher account can
  // reach this form. existingTeacherProfile / loggedInProfile then
  // distinguish "already applied, show status" from "logged in as a
  // teacher but hasn't filled this out yet."
  const [signedInAs, setSignedInAs] = useState<Profile | null>(null);
  const [existingTeacherProfile, setExistingTeacherProfile] = useState<ExistingTeacherProfile | null>(null);
  const [loggedInProfile, setLoggedInProfile] = useState<Profile | null>(null);
  const [honeypot, setHoneypot] = useState("");
  const formStartedAt = useRef(0);

  useEffect(() => {
    formStartedAt.current = Date.now();
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      const supabase = createClient();
      const profile = await getCurrentProfile(supabase);
      if (!active) return;

      if (profile && profile.role !== "TEACHER") {
        setSignedInAs(profile);
        setCheckingRole(false);
        return;
      }

      if (profile) {
        const { data } = await supabase.rpc("my_teacher_profile");
        if (!active) return;
        const existing = data?.[0] as ExistingTeacherProfile | undefined;
        if (existing) {
          setExistingTeacherProfile(existing);
        } else {
          setLoggedInProfile(profile);
        }
      }
      setCheckingRole(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setSignedInAs(null);
    setExistingTeacherProfile(null);
    setLoggedInProfile(null);
  }

  function updateField<K extends keyof FormState>(
    key: K,
    value: FormState[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  }

  function toggleInArray<K extends "modes" | "tutoringFor" | "boards" | "creativeItems" | "softSkillItems">(
    key: K,
    value: FormState[K][number]
  ) {
    setForm((prev) => {
      const current = prev[key] as unknown as string[];
      const next = current.includes(value as string)
        ? current.filter((v) => v !== value)
        : [...current, value as string];
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
      return {
        ...prev,
        gradeSubjects: { ...prev.gradeSubjects, [bandLabel]: next },
      };
    });
    setErrors((prev) => ({ ...prev, gradeSubjects: undefined }));
  }

  function addLanguageRow() {
    setForm((prev) => ({
      ...prev,
      languages: [
        ...prev.languages,
        { language: LANGUAGES[0], canRead: false, canWrite: false, canSpeak: false },
      ],
    }));
  }

  function updateLanguageRow(index: number, patch: Partial<LanguageRow>) {
    setForm((prev) => ({
      ...prev,
      languages: prev.languages.map((row, i) =>
        i === index ? { ...row, ...patch } : row
      ),
    }));
  }

  function removeLanguageRow(index: number) {
    setForm((prev) => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index),
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isLikelyBot(honeypot, formStartedAt.current)) {
      // Don't reveal detection — show the same success state a real
      // submission would, without ever writing to the database.
      setSuccess(true);
      return;
    }

    const validationErrors = validate(form, Boolean(loggedInProfile));
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    setSubmitError(null);
    setNeedsConfirmation(false);

    try {
      const supabase = createClient();
      const { hasSession } = await signUpOrSignIn(supabase, {
        email: form.email.trim(),
        password: form.password,
        name: form.fullName.trim(),
        phone: form.phoneNumber.trim(),
        role: "TEACHER",
      });

      if (!hasSession) {
        setNeedsConfirmation(true);
        return;
      }

      const { error } = await supabase.rpc("upsert_teacher_profile", {
        p_qualification: form.qualifications.trim(),
        p_experience: form.yearsExperience,
        p_subjects: buildSubjectsArray(form),
        p_preferred_locations: [form.serviceArea.trim()],
        p_teaching_mode: form.modes,
        p_rate_expectation: form.expectedRate ? Number(form.expectedRate) : null,
        p_bank_upi_ref: form.bankUpiRef.trim() || null,
        p_bank_ifsc: form.bankIfsc.trim() || null,
        p_bank_holder_name: form.bankHolderName.trim() || null,
        p_bank_branch: form.bankBranch.trim() || null,
        p_whatsapp: loggedInProfile ? loggedInProfile.phone : form.phoneNumber.trim(),
        p_area_city: form.serviceArea.trim(),
        p_tutoring_for: form.tutoringFor,
        p_boards: form.boards,
      });

      if (error) throw new Error(error.message);

      if (form.languages.length > 0) {
        const { error: langError } = await supabase.rpc("set_teacher_languages", {
          p_languages: form.languages.map((l) => ({
            language: l.language,
            can_read: l.canRead,
            can_write: l.canWrite,
            can_speak: l.canSpeak,
          })),
        });
        if (langError) throw new Error(langError.message);
      }

      if (idFile) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const path = `${user.id}/${Date.now()}-${idFile.name}`;
          const { error: uploadError } = await supabase.storage
            .from("kyc-documents")
            .upload(path, idFile);
          if (uploadError) {
            throw new Error(
              `Profile saved, but the ID document upload failed: ${uploadError.message}. You can try uploading it again later from your profile.`
            );
          }
          const { error: kycError } = await supabase.rpc("set_kyc_document", {
            p_path: path,
          });
          if (kycError) throw new Error(kycError.message);
        }
      }

      setSuccess(true);
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setForm(initialFormState);
    setIdFile(null);
    setErrors({});
    setSubmitError(null);
    setNeedsConfirmation(false);
    setSuccess(false);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <BackButton />
      <main className="flex-1 bg-slate-50">
        <section className="bg-navy">
          <div className="mx-auto max-w-3xl px-6 py-14 text-center sm:px-8">
            <div className="mx-auto flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber">
              <span className="h-px w-4 bg-amber" />
              Join Our Educator Network · Step 1 of 3
              <span className="h-px w-4 bg-amber" />
            </div>
            <h1 className="mt-4 font-heading text-3xl font-bold text-white sm:text-4xl">
              Become a Future Minds Tutor
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm text-white/70 sm:text-base">
              Tell us about your expertise and availability — our team
              personally reviews every application before onboarding.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-2xl px-6 py-12 sm:px-8">
          {checkingRole ? (
            <div className="py-16 text-center text-sm text-slate-400">
              Checking your session…
            </div>
          ) : existingTeacherProfile?.kyc_status === "PENDING" ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
              <h2 className="font-heading text-xl font-semibold text-navy">
                You&apos;re already registered — and waiting for approval
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">
                {existingTeacherProfile.name}, your tutor application is in
                and our team is reviewing your ID document. We&apos;ll be in
                touch once it&apos;s verified — no need to submit again.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                  href="/Teacher/profile"
                  className="rounded-xl bg-amber px-6 py-3 text-sm font-semibold text-navy shadow-lg shadow-amber/30 transition-transform hover:-translate-y-0.5"
                >
                  View my application
                </Link>
              </div>
            </div>
          ) : existingTeacherProfile?.kyc_status === "REJECTED" ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
              <h2 className="font-heading text-xl font-semibold text-navy">
                Your application needs another look
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">
                {existingTeacherProfile.name}, we weren&apos;t able to verify
                your application as submitted. Update your profile and ID
                document and we&apos;ll take another look.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                  href="/Teacher/profile"
                  className="rounded-xl bg-amber px-6 py-3 text-sm font-semibold text-navy shadow-lg shadow-amber/30 transition-transform hover:-translate-y-0.5"
                >
                  Update my profile
                </Link>
              </div>
            </div>
          ) : existingTeacherProfile ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
              <h2 className="font-heading text-xl font-semibold text-navy">
                You&apos;re already registered with us
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">
                {existingTeacherProfile.name}, you already have a tutor
                account — please log in instead of registering a new
                application. To add new skills, availability, or update your
                fees, edit your existing profile.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                  href="/Teacher/profile"
                  className="rounded-xl bg-amber px-6 py-3 text-sm font-semibold text-navy shadow-lg shadow-amber/30 transition-transform hover:-translate-y-0.5"
                >
                  Edit my profile
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-navy transition-colors hover:bg-slate-50"
                >
                  Log out to register someone else
                </button>
              </div>
            </div>
          ) : signedInAs ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
              <h2 className="font-heading text-xl font-semibold text-navy">
                You&apos;re signed in as a {signedInAs.role === "PARENT" ? "parent" : "admin"}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">
                This form creates a new tutor account, so it can&apos;t be
                used while you&apos;re signed in as {signedInAs.name}. Log out
                to continue as a tutor, or go to your own
                dashboard.
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
                you&apos;ve confirmed, come back to this page and submit the
                form again — you won&apos;t need to sign up a second time.
              </p>
            </div>
          ) : success ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber/10 text-2xl font-bold text-amber">
                ✓
              </div>
              <h2 className="mt-5 font-heading text-2xl font-semibold text-navy">
                Application Received!
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">
                Our team will review your profile and get in touch shortly.
                You can update any of this later from your Teacher Profile
                page.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center justify-center rounded-xl border border-navy/20 px-5 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-navy hover:text-white"
                >
                  Submit another application
                </button>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-xl bg-amber px-5 py-2.5 text-sm font-semibold text-navy shadow-lg shadow-amber/30 transition-transform hover:-translate-y-0.5"
                >
                  Back to home
                </Link>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              noValidate
              className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
            >
              <HoneypotField value={honeypot} onChange={setHoneypot} />
              {loggedInProfile ? (
                <p className="rounded-lg bg-slate-50 px-4 py-3 text-xs text-slate-500">
                  Registering as <strong>{loggedInProfile.name}</strong> ({loggedInProfile.email || loggedInProfile.phone}).
                </p>
              ) : (
                <>
                  <Field
                    label="Full Name"
                    value={form.fullName}
                    onChange={(value) => updateField("fullName", value)}
                    error={errors.fullName}
                    placeholder="e.g. Priya Ramesh"
                  />
                  <Field
                    label="Email Address"
                    type="email"
                    value={form.email}
                    onChange={(value) => updateField("email", value)}
                    error={errors.email}
                    placeholder="e.g. priya.ramesh@email.com"
                  />
                  <PasswordField
                    label="Password"
                    value={form.password}
                    onChange={(value) => updateField("password", value)}
                    error={errors.password}
                    placeholder="At least 8 characters"
                  />
                  <Field
                    label="Phone Number"
                    type="tel"
                    value={form.phoneNumber}
                    onChange={(value) => updateField("phoneNumber", value)}
                    error={errors.phoneNumber}
                    placeholder="e.g. 98765 43210"
                  />
                </>
              )}
              <Field
                label="Highest Qualification"
                value={form.qualifications}
                onChange={(value) => updateField("qualifications", value)}
                error={errors.qualifications}
                placeholder="e.g. B.Tech, M.Sc, B.Ed"
              />

              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy">
                  Years of Experience
                </label>
                <select
                  value={form.yearsExperience}
                  onChange={(event) =>
                    updateField(
                      "yearsExperience",
                      event.target.value as ExperienceBand | ""
                    )
                  }
                  className={`w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-amber/50 ${
                    errors.yearsExperience ? "border-red-400" : "border-slate-200"
                  }`}
                >
                  <option value="" disabled>
                    Select a range
                  </option>
                  {EXPERIENCE_BANDS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {errors.yearsExperience && (
                  <p className="mt-1.5 text-xs text-red-600">{errors.yearsExperience}</p>
                )}
              </div>

              <Field
                label="Expected Rate (₹ / month)"
                type="number"
                value={form.expectedRate}
                onChange={(value) => updateField("expectedRate", value)}
                placeholder="e.g. 4000"
                hint="Optional — helps us match your expectations with parent budgets."
              />

              <Field
                label="Service Area / Address"
                value={form.serviceArea}
                onChange={(value) => updateField("serviceArea", value)}
                error={errors.serviceArea}
                placeholder="e.g. Anna Nagar, Coimbatore"
              />

              <ChipGroup
                label="Mode (select all that apply)"
                options={MODES as readonly string[]}
                selected={form.modes}
                onToggle={(v) => toggleInArray("modes", v as Mode)}
                error={errors.modes}
              />

              <ChipGroup
                label="Tutoring For (select all that apply)"
                options={TUTORING_FOR as readonly string[]}
                selected={form.tutoringFor}
                onToggle={(v) => toggleInArray("tutoringFor", v as TutoringFor)}
                error={errors.tutoringFor}
              />

              {form.tutoringFor.includes("Academics") && (
                <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Academics
                  </p>
                  <ChipGroup
                    label="Medium / Board"
                    options={BOARDS}
                    selected={form.boards}
                    onToggle={(v) => toggleInArray("boards", v)}
                    error={errors.boards}
                  />
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-navy">
                      Grade Levels &amp; Subjects You Teach
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
                    Creative Learning
                  </p>
                  <ChipGroup
                    label="Areas you teach"
                    options={CREATIVE_LEARNING_ITEMS}
                    selected={form.creativeItems}
                    onToggle={(v) => toggleInArray("creativeItems", v)}
                    error={errors.creativeItems}
                  />
                </div>
              )}

              {form.tutoringFor.includes("Soft Skills") && (
                <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Soft Skills
                  </p>
                  <ChipGroup
                    label="Areas you teach"
                    options={SOFT_SKILLS_ITEMS}
                    selected={form.softSkillItems}
                    onToggle={(v) => toggleInArray("softSkillItems", v)}
                    error={errors.softSkillItems}
                  />
                </div>
              )}

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="block text-sm font-medium text-navy">
                    Languages Known
                  </label>
                  <button
                    type="button"
                    onClick={addLanguageRow}
                    className="text-xs font-semibold text-amber-700 underline"
                  >
                    + Add language
                  </button>
                </div>
                {form.languages.length === 0 ? (
                  <p className="text-xs text-slate-400">Optional.</p>
                ) : (
                  <div className="space-y-2">
                    {form.languages.map((row, index) => (
                      <div
                        key={index}
                        className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 px-3 py-2"
                      >
                        <select
                          value={row.language}
                          onChange={(e) => updateLanguageRow(index, { language: e.target.value })}
                          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-navy"
                        >
                          {LANGUAGES.map((lang) => (
                            <option key={lang} value={lang}>
                              {lang}
                            </option>
                          ))}
                        </select>
                        <label className="flex items-center gap-1 text-xs text-slate-600">
                          <input
                            type="checkbox"
                            checked={row.canRead}
                            onChange={(e) => updateLanguageRow(index, { canRead: e.target.checked })}
                          />
                          Read
                        </label>
                        <label className="flex items-center gap-1 text-xs text-slate-600">
                          <input
                            type="checkbox"
                            checked={row.canWrite}
                            onChange={(e) => updateLanguageRow(index, { canWrite: e.target.checked })}
                          />
                          Write
                        </label>
                        <label className="flex items-center gap-1 text-xs text-slate-600">
                          <input
                            type="checkbox"
                            checked={row.canSpeak}
                            onChange={(e) => updateLanguageRow(index, { canSpeak: e.target.checked })}
                          />
                          Speak
                        </label>
                        <button
                          type="button"
                          onClick={() => removeLanguageRow(index)}
                          className="ml-auto text-xs text-red-600 underline"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Field
                label="Bank Account / UPI ID"
                value={form.bankUpiRef}
                onChange={(value) => updateField("bankUpiRef", value)}
                placeholder="e.g. priya@upi or your account number"
                hint="Optional now — required before your first payout."
              />
              {form.bankUpiRef.trim() !== "" && !form.bankUpiRef.includes("@") && (
                <div className="grid grid-cols-1 gap-4 rounded-lg bg-slate-50 p-4 sm:grid-cols-2">
                  <p className="text-xs text-slate-500 sm:col-span-2">
                    That looks like an account number, not a UPI ID — we&apos;ll also need these to pay you:
                  </p>
                  <Field
                    label="IFSC Code"
                    value={form.bankIfsc}
                    onChange={(value) => updateField("bankIfsc", value)}
                    placeholder="e.g. HDFC0001234"
                  />
                  <Field
                    label="Account Holder Name"
                    value={form.bankHolderName}
                    onChange={(value) => updateField("bankHolderName", value)}
                    placeholder="As per bank records"
                  />
                  <Field
                    label="Branch"
                    value={form.bankBranch}
                    onChange={(value) => updateField("bankBranch", value)}
                    placeholder="e.g. RS Puram, Coimbatore"
                  />
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy">
                  Government ID (for verification)
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setIdFile(e.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-amber/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-navy hover:file:bg-amber/20"
                />
                <p className="mt-1.5 text-xs text-slate-400">
                  Optional now, but required before you can be matched with
                  families. Stored privately — only you and our admin team
                  can view it.
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-500">
                <strong className="text-navy">On fees:</strong>
                {" "}parents pay you directly, as agreed between you. Future Minds deducts a 10% commission from
                your payout every month, for as long as the class stays active — separately, the parent pays
                Future Minds a one-time 20% platform fee directly once they approve you, which doesn&apos;t come
                out of your payout. For Community Pooling batches specifically, it&apos;s different: Future Minds
                takes a recurring 10% from your payout{" "}
                <em>and</em>{" "}
                a separate recurring 10% from each participating household, every month for as long as the pooled
                batch stays active.
              </div>

              <div>
                <label className="flex items-start gap-3 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={form.consent}
                    onChange={(event) => updateField("consent", event.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-amber focus:ring-amber"
                  />
                  <span>
                    I consent to Future Minds storing and processing my tutor
                    application under DPDP Act norms, as described in the{" "}
                    <a
                      href="/privacy-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-amber-700 underline"
                    >
                      Privacy Policy &amp; Terms
                    </a>
                    .
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
                {submitting ? "Submitting…" : "Submit Application"}
              </button>
            </form>
          )}
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
}: {
  label: string;
  options: readonly string[];
  selected: string[];
  onToggle: (value: string) => void;
  error?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-navy">{label}</label>
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
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  type?: string;
  hint?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-navy">{label}</label>
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
