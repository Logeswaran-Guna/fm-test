"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import Header from "../components/Header";
import { createClient } from "@/lib/supabase/client";
import { signUpOrSignIn } from "@/lib/supabase/auth-helpers";
import { ACADEMIC_CATEGORIES, MODES, OTHER_CATEGORIES, type Mode } from "@/lib/categories";

const EXPERIENCE_OPTIONS = ["0-2 years", "2-5 years", "5+ years"] as const;
type ExperienceRange = (typeof EXPERIENCE_OPTIONS)[number];

type FormState = {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  qualifications: string;
  yearsExperience: ExperienceRange | "";
  expectedRate: string;
  subjects: string[];
  serviceArea: string;
  bankUpiRef: string;
  teachingMode: Mode | "";
  consent: boolean;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const initialFormState: FormState = {
  fullName: "",
  email: "",
  password: "",
  phoneNumber: "",
  qualifications: "",
  yearsExperience: "",
  expectedRate: "",
  subjects: [],
  serviceArea: "",
  bankUpiRef: "",
  teachingMode: "",
  consent: false,
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};

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

  if (!form.qualifications.trim())
    errors.qualifications = "Primary qualifications are required.";

  if (!form.yearsExperience)
    errors.yearsExperience = "Please select your experience range.";

  if (form.subjects.length === 0)
    errors.subjects = "Pick at least one subject or area you teach.";

  if (!form.serviceArea.trim())
    errors.serviceArea = "Service area / address is required.";

  if (!form.teachingMode)
    errors.teachingMode = "Please select a mode.";

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

  function updateField<K extends keyof FormState>(
    key: K,
    value: FormState[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  }

  function toggleSubject(value: string) {
    setForm((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(value)
        ? prev.subjects.filter((s) => s !== value)
        : [...prev.subjects, value],
    }));
    setErrors((prev) => (prev.subjects ? { ...prev, subjects: undefined } : prev));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validate(form);
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
        p_subjects: form.subjects,
        p_preferred_locations: [form.serviceArea.trim()],
        p_teaching_mode: form.teachingMode,
        p_rate_expectation: form.expectedRate ? Number(form.expectedRate) : null,
        p_bank_upi_ref: form.bankUpiRef.trim() || null,
        p_whatsapp: form.phoneNumber.trim(),
        p_area_city: form.serviceArea.trim(),
      });

      if (error) throw new Error(error.message);

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
              `Profile saved, but the ID document upload failed: ${uploadError.message}. You can try uploading it again later from your dashboard.`
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
          {needsConfirmation ? (
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
              <Field
                label="Password"
                type="password"
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
                      event.target.value as ExperienceRange | ""
                    )
                  }
                  className={`w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-amber/50 ${
                    errors.yearsExperience
                      ? "border-red-400"
                      : "border-slate-200"
                  }`}
                >
                  <option value="" disabled>
                    Select a range
                  </option>
                  {EXPERIENCE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {errors.yearsExperience && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {errors.yearsExperience}
                  </p>
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

              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy">
                  Mode
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {MODES.map((mode) => {
                    const selected = form.teachingMode === mode;
                    return (
                      <button
                        type="button"
                        key={mode}
                        onClick={() => updateField("teachingMode", mode)}
                        aria-pressed={selected}
                        className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                          selected
                            ? "border-amber bg-amber/10 text-navy"
                            : "border-slate-200 bg-white text-slate-600 hover:border-amber/50"
                        }`}
                      >
                        {mode}
                      </button>
                    );
                  })}
                </div>
                {errors.teachingMode && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {errors.teachingMode}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy">
                  Subjects &amp; classes you teach
                </label>
                <div className="flex flex-wrap gap-2">
                  {ACADEMIC_CATEGORIES.map((c) => (
                    <Chip
                      key={c}
                      label={c}
                      selected={form.subjects.includes(c)}
                      onClick={() => toggleSubject(c)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy">
                  Other areas you teach
                </label>
                <div className="flex flex-wrap gap-2">
                  {OTHER_CATEGORIES.map((c) => (
                    <Chip
                      key={c}
                      label={c}
                      selected={form.subjects.includes(c)}
                      onClick={() => toggleSubject(c)}
                    />
                  ))}
                </div>
                {errors.subjects && (
                  <p className="mt-1.5 text-xs text-red-600">{errors.subjects}</p>
                )}
              </div>

              <Field
                label="Bank Account / UPI ID"
                value={form.bankUpiRef}
                onChange={(value) => updateField("bankUpiRef", value)}
                placeholder="e.g. priya@upi or account details"
                hint="Optional now — required before your first payout."
              />

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

              <div>
                <label className="flex items-start gap-3 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={form.consent}
                    onChange={(event) =>
                      updateField("consent", event.target.checked)
                    }
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-amber focus:ring-amber"
                  />
                  <span>
                    I consent to Future Minds storing and processing my tutor
                    application under DPDP Act norms.
                  </span>
                </label>
                {errors.consent && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {errors.consent}
                  </p>
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
      <label className="mb-1.5 block text-sm font-medium text-navy">
        {label}
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
