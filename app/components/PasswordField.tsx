"use client";

import { useState } from "react";
import FieldLabel from "./FieldLabel";

export default function PasswordField({
  label,
  value,
  onChange,
  error,
  placeholder,
  hint,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  hint?: string;
  required?: boolean;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-navy">
        <FieldLabel label={label} required={required} error={error} />
      </label>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-lg border px-4 py-2.5 pr-11 text-sm text-navy placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber/50 ${
            error ? "border-red-400" : "border-slate-200"
          }`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-navy"
        >
          {visible ? (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 3l18 18" strokeLinecap="round" />
              <path d="M10.58 10.58a2 2 0 002.83 2.83" strokeLinecap="round" />
              <path d="M9.36 5.32A9.77 9.77 0 0112 5c5 0 9 4.5 10 7-.34.94-1.02 2.1-2.02 3.2M6.53 6.53C4.6 7.86 3.14 9.72 2 12c1 2.5 5 7 10 7 1.36 0 2.62-.28 3.74-.76" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
      {error ? (
        <p className="mt-1.5 text-xs text-red-600">{error}</p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-slate-400">{hint}</p>
      )}
    </div>
  );
}
