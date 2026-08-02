"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import Header from "../components/Header";
import { createClient } from "@/lib/supabase/client";

const EXPERIENCE_OPTIONS = ["0-2 years", "2-5 years", "5+ years"] as const;
const TEACHING_MODES = ["Home Tuition", "Online Classes", "Both"] as const;

type ExperienceRange = (typeof EXPERIENCE_OPTIONS)[number];
type TeachingMode = (typeof TEACHING_MODES)[number];

type FormState = {
  fullName: string;
  email: string;
  phoneNumber: string;
  qualifications: string;
  yearsExperience: ExperienceRange | "";
  subjectsHandled: string;
  preferredLocations: string;
  teachingMode: TeachingMode | "";
  consent: boolean;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const initialFormState: FormState = {
  fullName: "",
  email: "",
  phoneNumber: "",
  qualifications: "",
  yearsExperience: "",
  subjectsHandled: "",
  preferredLocations: "",
  teachingMode: "",
  consent: false,
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function toArray(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};

  if (!form.fullName.trim()) errors.fullName = "Full name is required.";

  if (!form.email.trim()) {
    errors.email = "Email address is required.";
  } else if (!EMAIL_PATTERN.test(form.email.trim())) {
    errors.email = "Enter a valid email address.";
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

  if (!toArray(form.subjectsHandled).length)
    errors.subjectsHandled = "List at least one subject you can teach.";

  if (!toArray(form.preferredLocations).length)
    errors.preferredLocations = "List at least one preferred location.";

  if (!form.teachingMode)
    errors.teachingMode = "Please select a teaching mode.";

  if (!form.consent)
    errors.consent =
      "Please provide consent to continue under DPDP Act norms.";

  return errors;
}

export default function BecomeATutorPage() {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function updateField<K extends keyof FormState>(
    key: K,
    value: FormState[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.from("tutors").insert([
        {
          full_name: form.fullName.trim(),
          email: form.email.trim(),
          phone_number: form.phoneNumber.trim(),
          qualifications: form.qualifications.trim(),
          years_experience: form.yearsExperience,
          subjects_handled: toArray(form.subjectsHandled),
          preferred_locations: toArray(form.preferredLocations),
          teaching_mode: form.teachingMode,
          dpdp_consent: form.consent,
        },
      ]);

      if (error) {
        setSubmitError(
          error.message || "Something went wrong. Please try again."
        );
        return;
      }

      setSuccess(true);
    } catch {
      setSubmitError(
        "We couldn't reach the server. Please check your connection and try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setForm(initialFormState);
    setErrors({});
    setSubmitError(null);
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
              Join Our Educator Network
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
          {success ? (
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
                label="Phone Number"
                type="tel"
                value={form.phoneNumber}
                onChange={(value) => updateField("phoneNumber", value)}
                error={errors.phoneNumber}
                placeholder="e.g. 98765 43210"
              />
              <Field
                label="Primary Qualifications"
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
                label="Subjects You Can Teach"
                value={form.subjectsHandled}
                onChange={(value) => updateField("subjectsHandled", value)}
                error={errors.subjectsHandled}
                placeholder="e.g. Mathematics, Physics, Spoken English"
                hint="Separate multiple subjects with commas."
              />
              <Field
                label="Preferred Locations / Areas"
                value={form.preferredLocations}
                onChange={(value) => updateField("preferredLocations", value)}
                error={errors.preferredLocations}
                placeholder="e.g. Anna Nagar, Adyar, Online"
                hint="Separate multiple areas with commas."
              />

              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy">
                  Teaching Mode
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {TEACHING_MODES.map((mode) => {
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
