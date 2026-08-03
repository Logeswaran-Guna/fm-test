"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getCurrentProfile } from "@/lib/supabase/profile";
import {
  AVAILABILITY_SLOTS,
  BOARDS,
  CREATIVE_LEARNING_ITEMS,
  EXPERIENCE_BANDS,
  GRADE_BANDS,
  LANGUAGES,
  MODES,
  SOFT_SKILLS_ITEMS,
  TUTORING_FOR,
  type ExperienceBand,
} from "@/lib/categories";

type LanguageRow = {
  language: string;
  canRead: boolean;
  canWrite: boolean;
  canSpeak: boolean;
};

type TeacherProfileRow = {
  id: string;
  display_id: string;
  name: string;
  phone: string;
  email: string | null;
  qualification: string | null;
  experience: string | null;
  subjects: string[] | null;
  preferred_locations: string[] | null;
  teaching_mode: string[] | null;
  availability: string[] | null;
  rate_expectation: number | null;
  bank_upi_ref: string | null;
  kyc_status: string;
  kyc_document_path: string | null;
  photo_url: string | null;
  tutoring_for: string[] | null;
  boards: string[] | null;
  rating: number | null;
  languages: { language: string; can_read: boolean; can_write: boolean; can_speak: boolean }[] | null;
  total_hours: number | null;
  students_trained: number | null;
  active_batches: number | null;
  rating_avg: number | null;
  rating_count: number | null;
};

type TeacherReview = {
  id: string;
  student_name: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
};

function parseSubjects(subjects: string[]) {
  const gradeSubjects: Record<string, string[]> = {};
  const creativeItems: string[] = [];
  const softSkillItems: string[] = [];
  for (const s of subjects) {
    const parts = s.split(" — ");
    if (parts.length === 2 && GRADE_BANDS.some((b) => b.label === parts[0])) {
      gradeSubjects[parts[0]] = [...(gradeSubjects[parts[0]] ?? []), parts[1]];
      continue;
    }
    if ((CREATIVE_LEARNING_ITEMS as string[]).includes(s)) {
      creativeItems.push(s);
      continue;
    }
    if ((SOFT_SKILLS_ITEMS as string[]).includes(s)) {
      softSkillItems.push(s);
    }
  }
  return { gradeSubjects, creativeItems, softSkillItems };
}

function buildSubjectsArray(
  tutoringFor: string[],
  gradeSubjects: Record<string, string[]>,
  creativeItems: string[],
  softSkillItems: string[]
): string[] {
  const out: string[] = [];
  if (tutoringFor.includes("Academics")) {
    for (const band of GRADE_BANDS) {
      for (const subject of gradeSubjects[band.label] ?? []) {
        out.push(`${band.label} — ${subject}`);
      }
    }
  }
  if (tutoringFor.includes("Creative Learning")) out.push(...creativeItems);
  if (tutoringFor.includes("Soft Skills")) out.push(...softSkillItems);
  return out;
}

export default function TeacherProfilePage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [editing, setEditing] = useState(false);
  const [reviews, setReviews] = useState<TeacherReview[]>([]);

  const [profile, setProfile] = useState<TeacherProfileRow | null>(null);
  const [qualification, setQualification] = useState("");
  const [experience, setExperience] = useState<ExperienceBand | "">("");
  const [rate, setRate] = useState("");
  const [serviceArea, setServiceArea] = useState("");
  const [bankUpiRef, setBankUpiRef] = useState("");
  const [modes, setModes] = useState<string[]>([]);
  const [availability, setAvailability] = useState<string[]>([]);
  const [tutoringFor, setTutoringFor] = useState<string[]>([]);
  const [boards, setBoards] = useState<string[]>([]);
  const [gradeSubjects, setGradeSubjects] = useState<Record<string, string[]>>({});
  const [creativeItems, setCreativeItems] = useState<string[]>([]);
  const [softSkillItems, setSoftSkillItems] = useState<string[]>([]);
  const [languages, setLanguages] = useState<LanguageRow[]>([]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [idFile, setIdFile] = useState<File | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const supabase = createClient();
      const currentProfile = await getCurrentProfile(supabase);
      if (!active) return;
      if (!currentProfile || currentProfile.role !== "TEACHER") {
        router.replace("/login");
        return;
      }
      setCheckingAuth(false);
    })();
    return () => {
      active = false;
    };
  }, [router]);

  function populateFormFromRow(row: TeacherProfileRow) {
    setQualification(row.qualification ?? "");
    setExperience((row.experience as ExperienceBand) ?? "");
    setRate(row.rate_expectation != null ? String(row.rate_expectation) : "");
    setServiceArea(row.preferred_locations?.[0] ?? "");
    setBankUpiRef(row.bank_upi_ref ?? "");
    setModes(row.teaching_mode ?? []);
    setAvailability(row.availability ?? []);
    setTutoringFor(row.tutoring_for ?? []);
    setBoards(row.boards ?? []);
    const parsed = parseSubjects(row.subjects ?? []);
    setGradeSubjects(parsed.gradeSubjects);
    setCreativeItems(parsed.creativeItems);
    setSoftSkillItems(parsed.softSkillItems);
    setLanguages(
      (row.languages ?? []).map((l) => ({
        language: l.language,
        canRead: l.can_read,
        canWrite: l.can_write,
        canSpeak: l.can_speak,
      }))
    );
  }

  async function loadProfile() {
    const supabase = createClient();
    const [profileRes, reviewsRes] = await Promise.all([
      supabase.rpc("my_teacher_profile"),
      supabase.rpc("my_teacher_reviews"),
    ]);
    if (profileRes.error) {
      setError(profileRes.error.message);
      setLoading(false);
      return;
    }
    const row = (profileRes.data?.[0] as TeacherProfileRow) ?? null;
    setProfile(row);
    if (row) populateFormFromRow(row);
    if (!reviewsRes.error) setReviews((reviewsRes.data as TeacherReview[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    if (checkingAuth) return;
    Promise.resolve().then(loadProfile);
  }, [checkingAuth]);

  function toggle(list: string[], setList: (v: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  function toggleGradeSubject(bandLabel: string, subject: string) {
    setGradeSubjects((prev) => {
      const current = prev[bandLabel] ?? [];
      const next = current.includes(subject)
        ? current.filter((s) => s !== subject)
        : [...current, subject];
      return { ...prev, [bandLabel]: next };
    });
  }

  function addLanguageRow() {
    setLanguages((prev) => [
      ...prev,
      { language: LANGUAGES[0], canRead: false, canWrite: false, canSpeak: false },
    ]);
  }

  function updateLanguageRow(index: number, patch: Partial<LanguageRow>) {
    setLanguages((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function removeLanguageRow(index: number) {
    setLanguages((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const supabase = createClient();

      const { error: upsertError } = await supabase.rpc("upsert_teacher_profile", {
        p_qualification: qualification.trim() || null,
        p_experience: experience || null,
        p_subjects: buildSubjectsArray(tutoringFor, gradeSubjects, creativeItems, softSkillItems),
        p_preferred_locations: serviceArea.trim() ? [serviceArea.trim()] : null,
        p_teaching_mode: modes,
        p_availability: availability,
        p_rate_expectation: rate ? Number(rate) : null,
        p_bank_upi_ref: bankUpiRef.trim() || null,
        p_area_city: serviceArea.trim() || null,
        p_tutoring_for: tutoringFor,
        p_boards: boards,
      });
      if (upsertError) throw new Error(upsertError.message);

      const { error: langError } = await supabase.rpc("set_teacher_languages", {
        p_languages: languages.map((l) => ({
          language: l.language,
          can_read: l.canRead,
          can_write: l.canWrite,
          can_speak: l.canSpeak,
        })),
      });
      if (langError) throw new Error(langError.message);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (photoFile && user) {
        const path = `${user.id}/${Date.now()}-${photoFile.name}`;
        const { error: uploadError } = await supabase.storage.from("avatars").upload(path, photoFile, {
          upsert: true,
        });
        if (uploadError) throw new Error(`Could not upload photo: ${uploadError.message}`);
        const { data: publicUrl } = supabase.storage.from("avatars").getPublicUrl(path);
        const { error: photoRpcError } = await supabase.rpc("upsert_teacher_profile", {
          p_photo_url: publicUrl.publicUrl,
        });
        if (photoRpcError) throw new Error(photoRpcError.message);
      }

      if (idFile && user) {
        const path = `${user.id}/${Date.now()}-${idFile.name}`;
        const { error: uploadError } = await supabase.storage.from("kyc-documents").upload(path, idFile);
        if (uploadError) throw new Error(`Could not upload ID document: ${uploadError.message}`);
        const { error: kycError } = await supabase.rpc("set_kyc_document", { p_path: path });
        if (kycError) throw new Error(kycError.message);
      }

      setPhotoFile(null);
      setIdFile(null);
      setSaved(true);
      await loadProfile();
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your profile.");
    } finally {
      setSaving(false);
    }
  }

  if (checkingAuth || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-sm text-slate-500">
        Loading your profile…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <header className="mb-8 border-b border-slate-800 pb-4 flex flex-wrap justify-between items-center gap-3">
        <div>
          <span className="text-xs uppercase tracking-wider text-amber-500 font-semibold">
            Instructor Portal
          </span>
          <h1 className="text-2xl font-bold">My Profile</h1>
        </div>
        <div className="flex items-center gap-2">
          {editing ? (
            <button
              type="button"
              onClick={() => {
                if (profile) populateFormFromRow(profile);
                setPhotoFile(null);
                setIdFile(null);
                setError(null);
                setEditing(false);
              }}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded border border-slate-700 transition-colors"
            >
              Cancel
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-3 py-1.5 rounded transition-colors"
            >
              Edit Profile
            </button>
          )}
          <Link
            href="/Teacher"
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded border border-slate-700 transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      {error && (
        <div className="mb-6 max-w-3xl p-4 bg-red-950/50 border border-red-500/50 text-red-200 text-sm rounded-lg">
          {error}
        </div>
      )}
      {saved && (
        <div className="mb-6 max-w-3xl p-4 bg-emerald-950/50 border border-emerald-500/50 text-emerald-200 text-sm rounded-lg">
          Profile saved.
        </div>
      )}

      <main className="max-w-3xl space-y-6">
        <div className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900 p-5">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full bg-slate-800">
            {profile?.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.photo_url} alt={profile.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-slate-500">
                {profile?.name?.[0]?.toUpperCase() ?? "T"}
              </div>
            )}
          </div>
          <div className="flex-1">
            <p className="text-lg font-bold">{profile?.name}</p>
            <p className="text-xs text-slate-400">Teacher ID: {profile?.display_id}</p>
            <p className="text-xs text-slate-400">
              KYC status:{" "}
              <span
                className={
                  profile?.kyc_status === "APPROVED"
                    ? "text-emerald-400"
                    : profile?.kyc_status === "REJECTED"
                      ? "text-red-400"
                      : "text-amber-400"
                }
              >
                {profile?.kyc_status}
              </span>
            </p>
            {editing && (
              <>
                <label className="mt-2 inline-block cursor-pointer text-xs font-semibold text-amber-400 underline">
                  Change photo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
                  />
                </label>
                {photoFile && <span className="ml-2 text-xs text-slate-400">{photoFile.name} (unsaved)</span>}
              </>
            )}
          </div>
        </div>

        {!editing && profile && (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatTile value={`${profile.total_hours ?? 0} hrs`} label="Tutoring hours logged" />
              <StatTile value={String(profile.students_trained ?? 0)} label="Students trained" />
              <StatTile
                value={profile.rating_avg != null ? `${profile.rating_avg} ★` : "— ★"}
                label={
                  profile.rating_count ? `Rating, ${profile.rating_count} review${profile.rating_count === 1 ? "" : "s"}` : "No ratings yet"
                }
              />
              <StatTile value={String(profile.active_batches ?? 0)} label="Active batches" />
            </div>

            <Section title="Profile Summary">
              <SummaryRow label="Highest Qualification" value={profile.qualification} />
              <SummaryRow label="Years of Experience" value={profile.experience} />
              <SummaryRow label="Expected Rate (₹ / month)" value={profile.rate_expectation != null ? String(profile.rate_expectation) : null} />
              <SummaryRow label="Service Area / Address" value={profile.preferred_locations?.[0] ?? null} />
              <SummaryRow label="Mode" value={(profile.teaching_mode ?? []).join(", ") || null} />
              <SummaryRow label="Availability" value={(profile.availability ?? []).join(", ") || null} />
              <SummaryRow label="Tutoring For" value={(profile.tutoring_for ?? []).join(", ") || null} />
              <SummaryRow label="Medium / Board" value={(profile.boards ?? []).join(", ") || null} />
              <SummaryRow label="Subjects & Skills" value={(profile.subjects ?? []).join(", ") || null} />
              <SummaryRow
                label="Languages Known"
                value={
                  (profile.languages ?? [])
                    .map((l) => {
                      const abilities = [l.can_read ? "Read" : null, l.can_write ? "Write" : null, l.can_speak ? "Speak" : null]
                        .filter(Boolean)
                        .join("/");
                      return abilities ? `${l.language} (${abilities})` : l.language;
                    })
                    .join(", ") || null
                }
              />
            </Section>

            <Section title="Parent &amp; Student Appreciation">
              {reviews.length === 0 ? (
                <p className="text-xs text-slate-500">No reviews yet.</p>
              ) : (
                <div className="space-y-3">
                  {reviews.map((r) => (
                    <div key={r.id} className="rounded-lg border border-slate-800 bg-slate-950/50 p-3">
                      <div className="text-amber-400">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
                      {r.comment && <p className="mt-1.5 text-sm text-slate-200">&quot;{r.comment}&quot;</p>}
                      <p className="mt-1.5 text-xs text-slate-500">
                        — Parent of {r.student_name || "a student"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Section>
          </>
        )}

        {editing && (
        <>
        <Section title="Basics">
          <TextField label="Highest Qualification" value={qualification} onChange={setQualification} />
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-300">Years of Experience</label>
            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value as ExperienceBand)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            >
              <option value="">Select a range</option>
              {EXPERIENCE_BANDS.map((band) => (
                <option key={band} value={band}>
                  {band}
                </option>
              ))}
            </select>
          </div>
          <TextField label="Expected Rate (₹ / month)" value={rate} onChange={setRate} type="number" />
          <TextField label="Service Area / Address" value={serviceArea} onChange={setServiceArea} />
          <TextField label="Bank Account / UPI ID" value={bankUpiRef} onChange={setBankUpiRef} />
        </Section>

        <Section title="Mode &amp; Availability">
          <ChipRow options={MODES as readonly string[]} selected={modes} onToggle={(v) => toggle(modes, setModes, v)} />
          <p className="mb-1.5 mt-3 text-xs font-medium text-slate-300">Availability</p>
          <ChipRow
            options={AVAILABILITY_SLOTS}
            selected={availability}
            onToggle={(v) => toggle(availability, setAvailability, v)}
          />
        </Section>

        <Section title="Tutoring For">
          <ChipRow
            options={TUTORING_FOR as readonly string[]}
            selected={tutoringFor}
            onToggle={(v) => toggle(tutoringFor, setTutoringFor, v)}
          />
        </Section>

        {tutoringFor.includes("Academics") && (
          <Section title="Academics">
            <p className="mb-1.5 text-xs font-medium text-slate-300">Medium / Board</p>
            <ChipRow options={BOARDS} selected={boards} onToggle={(v) => toggle(boards, setBoards, v)} />
            <div className="mt-4 space-y-3">
              {GRADE_BANDS.map((band) => (
                <div key={band.label} className="rounded-lg border border-slate-800 bg-slate-950/50 p-3">
                  <p className="mb-2 text-xs font-semibold text-slate-300">{band.label}</p>
                  <ChipRow
                    options={band.subjects}
                    selected={gradeSubjects[band.label] ?? []}
                    onToggle={(v) => toggleGradeSubject(band.label, v)}
                  />
                </div>
              ))}
            </div>
          </Section>
        )}

        {tutoringFor.includes("Creative Learning") && (
          <Section title="Creative Learning">
            <ChipRow
              options={CREATIVE_LEARNING_ITEMS}
              selected={creativeItems}
              onToggle={(v) => toggle(creativeItems, setCreativeItems, v)}
            />
          </Section>
        )}

        {tutoringFor.includes("Soft Skills") && (
          <Section title="Soft Skills">
            <ChipRow
              options={SOFT_SKILLS_ITEMS}
              selected={softSkillItems}
              onToggle={(v) => toggle(softSkillItems, setSoftSkillItems, v)}
            />
          </Section>
        )}

        <Section title="Languages Known">
          <button type="button" onClick={addLanguageRow} className="mb-3 text-xs font-semibold text-amber-400 underline">
            + Add language
          </button>
          <div className="space-y-2">
            {languages.map((row, index) => (
              <div key={index} className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-800 px-3 py-2">
                <select
                  value={row.language}
                  onChange={(e) => updateLanguageRow(index, { language: e.target.value })}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-100"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
                <label className="flex items-center gap-1 text-xs text-slate-400">
                  <input type="checkbox" checked={row.canRead} onChange={(e) => updateLanguageRow(index, { canRead: e.target.checked })} />
                  Read
                </label>
                <label className="flex items-center gap-1 text-xs text-slate-400">
                  <input type="checkbox" checked={row.canWrite} onChange={(e) => updateLanguageRow(index, { canWrite: e.target.checked })} />
                  Write
                </label>
                <label className="flex items-center gap-1 text-xs text-slate-400">
                  <input type="checkbox" checked={row.canSpeak} onChange={(e) => updateLanguageRow(index, { canSpeak: e.target.checked })} />
                  Speak
                </label>
                <button type="button" onClick={() => removeLanguageRow(index)} className="ml-auto text-xs text-red-400 underline">
                  Remove
                </button>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Government ID (KYC)">
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => setIdFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-amber-500/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-amber-400"
          />
          <p className="mt-1.5 text-xs text-slate-500">
            Uploading a new document resets your KYC status to Pending for re-review.
          </p>
        </Section>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-xl bg-amber-500 px-6 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save Profile"}
        </button>
        </>
        )}
      </main>
    </div>
  );
}

function StatTile({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-center">
      <p className="text-xl font-bold text-slate-100">{value}</p>
      <p className="mt-1 text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-slate-800/60 pb-2 last:border-0 last:pb-0 sm:flex-row sm:justify-between">
      <span className="text-xs font-medium text-slate-400">{label}</span>
      <span className="text-xs text-slate-200 sm:text-right">{value || "Not set"}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-3">
      <h2 className="text-sm font-semibold text-slate-200">{title}</h2>
      {children}
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
                ? "border-amber-500 bg-amber-500/10 text-amber-300"
                : "border-slate-700 bg-slate-950 text-slate-400 hover:border-amber-500/50"
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-slate-300">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
      />
    </div>
  );
}
