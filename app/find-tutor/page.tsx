"use client";

import { useState, type FormEvent } from "react";
import Header from "../components/Header";
import { createClient } from "@/lib/supabase/client";

type FormState = {
  parentName: string;
  studentName: string;
  gradeClass: string;
  subjectsNeeded: string;
  locationAddress: string;
  phoneNumber: string;
  consent: boolean;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const initialFormState: FormState = {
  parentName: "",
  studentName: "",
  gradeClass: "",
  subjectsNeeded: "",
  locationAddress: "",
  phoneNumber: "",
  consent: false,
};

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};

  if (!form.parentName.trim()) errors.parentName = "Parent name is required.";
  if (!form.studentName.trim())
    errors.studentName = "Student name is required.";
  if (!form.gradeClass.trim())
    errors.gradeClass = "Grade / class is required.";
  if (!form.subjectsNeeded.trim())
    errors.subjectsNeeded = "Please list at least one subject.";
  if (!form.locationAddress.trim())
    errors.locationAddress = "Location / address is required.";

  const digitsOnly = form.phoneNumber.replace(/\D/g, "");
  if (!form.phoneNumber.trim()) {
    errors.phoneNumber = "Phone number is required.";
  } else if (digitsOnly.length < 10 || digitsOnly.length > 12) {
    errors.phoneNumber = "Enter a valid phone number.";
  }

  if (!form.consent) {
    errors.consent =
      "Please provide consent to continue under DPDP Act norms.";
  }

  return errors;
}

export default function FindTutorPage() {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submittedParentName, setSubmittedParentName] = useState("");

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
      const { error } = await supabase.from("requirements").insert([
        {
          parent_name: form.parentName.trim(),
          student_name: form.studentName.trim(),
          grade_class: form.gradeClass.trim(),
          subjects_needed: form.subjectsNeeded.trim(),
          location_address: form.locationAddress.trim(),
          phone_number: form.phoneNumber.trim(),
          dpdp_consent: form.consent,
        },
      ]);

      if (error) {
        setSubmitError(
          error.message || "Something went wrong. Please try again."
        );
        return;
      }

      setSubmittedParentName(form.parentName.trim());
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
              Get Matched
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

        <div className="mx-auto max-w-2xl px-6 py-12 sm:px-8">
          {success ? (
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
              <Field
                label="Parent Name"
                value={form.parentName}
                onChange={(value) => updateField("parentName", value)}
                error={errors.parentName}
                placeholder="e.g. Meera Krishnan"
              />
              <Field
                label="Student Name"
                value={form.studentName}
                onChange={(value) => updateField("studentName", value)}
                error={errors.studentName}
                placeholder="e.g. Aarav Krishnan"
              />
              <Field
                label="Grade / Class"
                value={form.gradeClass}
                onChange={(value) => updateField("gradeClass", value)}
                error={errors.gradeClass}
                placeholder="e.g. Class 10, CBSE"
              />
              <Field
                label="Subjects Needed"
                value={form.subjectsNeeded}
                onChange={(value) => updateField("subjectsNeeded", value)}
                error={errors.subjectsNeeded}
                placeholder="e.g. Mathematics, Physics"
              />
              <Field
                label="Location / Address"
                value={form.locationAddress}
                onChange={(value) => updateField("locationAddress", value)}
                error={errors.locationAddress}
                placeholder="e.g. Anna Nagar, Coimbatore"
              />
              <Field
                label="Phone Number"
                value={form.phoneNumber}
                onChange={(value) => updateField("phoneNumber", value)}
                error={errors.phoneNumber}
                placeholder="e.g. 98765 43210"
                type="tel"
              />

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
                    I consent to Future Minds processing this requirement
                    under DPDP Act norms.
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
                {submitting ? "Submitting…" : "Submit Requirement"}
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
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  type?: string;
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
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}
