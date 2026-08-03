// Shared subject/category list — same set already shown on the homepage
// (see app/components/PlatformHighlights.tsx). The developer requirements
// spec notes this master list isn't finalized yet ("Section 8"), so forms
// use it as suggestions (via <datalist>/chips) rather than a hard-locked
// dropdown, letting a parent or tutor still type something not yet listed.
export const ACADEMIC_CATEGORIES = [
  "State Board",
  "CBSE",
  "ICSE",
  "IGCSE",
  "Engineering",
  "Commerce",
  "Languages",
];

export const OTHER_CATEGORIES = [
  "Public Speaking",
  "Personality Development",
  "AI & Robotics",
  "Music & Instruments",
  "Dance",
];

export const ALL_CATEGORIES = [...ACADEMIC_CATEGORIES, ...OTHER_CATEGORIES];

export const MODES = [
  "Online",
  "Home Tuition",
  "Teacher Location",
  "Community Pooling",
] as const;
export type Mode = (typeof MODES)[number];

export const SCHEDULE_PREFERENCES = [
  "Weekday evenings",
  "Weekday mornings",
  "Weekends only",
  "Flexible",
];

export const TEACHER_GENDER_PREFERENCES = ["No preference", "Male", "Female"];
