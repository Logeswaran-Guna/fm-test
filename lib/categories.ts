// Shared taxonomy used across the Find a Tutor and Become a Tutor forms
// (and the admin dashboard's matching logic). This is exactly the kind of
// master data the developer requirements spec says should come from the
// founder rather than be invented ad hoc (Section 8) — treat these lists
// as a first draft to be corrected, not a locked-in final taxonomy.

export const TUTORING_FOR = ["Academics", "Creative Learning", "Soft Skills", "Tech-Skills Training"] as const;
export type TutoringFor = (typeof TUTORING_FOR)[number];

export const BOARDS = ["State Board", "CBSE", "ICSE", "IGCSE"];

// Each grade band has its own subject list. Pre-Primary/Primary don't
// split by subject (young grades are taught holistically), Middle/
// Secondary share a common subject set, Higher Secondary lists individual
// subjects (per the founder's call — not combined streams like PCM/PCB).
export const GRADE_BANDS = [
  { label: "Pre-Primary (LKG - UKG)", subjects: ["All Subjects"] },
  { label: "Primary (1st - 5th Std)", subjects: ["All Subjects"] },
  {
    label: "Middle School (6th - 8th Std)",
    subjects: [
      "Mathematics",
      "Science",
      "Social Science",
      "English",
      "Tamil",
      "Second Language",
      "Computer Applications",
    ],
  },
  {
    label: "Secondary (9th - 10th Std)",
    subjects: [
      "Mathematics",
      "Science",
      "Social Science",
      "English",
      "Tamil",
      "Second Language",
      "Computer Applications",
    ],
  },
  {
    label: "Higher Secondary (11th - 12th Std)",
    subjects: [
      "Physics",
      "Chemistry",
      "Mathematics",
      "Biology",
      "Computer Science",
      "Economics",
      "Business Studies",
      "Accountancy",
      "History",
      "Political Science",
      "Geography",
      "Psychology",
      "Sociology",
      "English",
    ],
  },
] as const;
export type GradeBandLabel = (typeof GRADE_BANDS)[number]["label"];

export const CREATIVE_MUSIC_ITEMS = [
  "Music - Vocals",
  "Music - Guitar",
  "Music - Keyboard / Piano",
  "Music - Violin",
  "Music - Drums",
  "Music - Flute",
  "Music - Tabla",
  "Music - Mridangam",
  "Music - Veena",
  "Music - Sitar",
];
export const CREATIVE_DANCE_ITEMS = [
  "Dance - Bharatanatyam",
  "Dance - Western",
  "Dance - Folk",
  "Dance - Group",
  "Dance - Zumba",
];
export const CREATIVE_OTHER_ITEMS = ["Art", "Abacus"];
export const CREATIVE_LEARNING_ITEMS = [
  ...CREATIVE_MUSIC_ITEMS,
  ...CREATIVE_DANCE_ITEMS,
  ...CREATIVE_OTHER_ITEMS,
];

// Feeds admin's view of tutor supply for the Academy course catalog shown
// on the AI & Robotics page — admin_teachers_directory() already surfaces
// each tutor's full subjects list, these items just show up in it like any
// other tutoring-for category.
export const TECH_SKILLS_ITEMS = [
  "Java",
  "Python",
  "JavaScript",
  "SQL",
  "AWS",
  "Google Cloud Platform (GCP)",
  "Microsoft Azure",
  "Data Structures & Algorithms",
  "Web Development",
  "Machine Learning",
  "DevOps",
];

export const SOFT_SKILLS_ITEMS = [
  "Communication Skills",
  "Spoken English",
  "Spoken Hindi",
  "Presentation Skills",
  "Public Speaking",
  "Personality Development",
  "Interview Skills",
  "Group Discussion",
  "French",
  "German",
  "Japanese",
  "Chinese",
  "Handwriting",
  "Phonics",
];

// Common languages actually taught/offered as a school subject in India.
export const LANGUAGES = [
  "Hindi",
  "English",
  "Tamil",
  "Telugu",
  "Kannada",
  "Malayalam",
  "Marathi",
  "Gujarati",
  "Bengali",
  "Punjabi",
  "Sanskrit",
  "Urdu",
];

export const MODES = [
  "Online",
  "Home Tuition",
  "Teacher Location",
  "Community Pooling",
  "Flexible",
] as const;
export type Mode = (typeof MODES)[number];

export const SCHEDULE_PREFERENCES = [
  "Weekday evenings",
  "Weekday mornings",
  "Weekends only",
  "Flexible",
];

// Narrower time windows offered once a schedule preference is picked.
// "Flexible" has no entry here — it already means no specific time
// constraint, so the time-preference question is skipped entirely for it.
export const TIME_PREFERENCES_BY_SCHEDULE: Record<string, string[]> = {
  "Weekday evenings": ["4PM - 6PM", "5PM - 7PM", "6PM - 8PM", "7PM - 9PM", "Flexible"],
  "Weekday mornings": ["6AM - 7AM", "7AM - 8AM", "Flexible"],
  "Weekends only": [
    "9AM - 11AM",
    "10AM - 12PM",
    "11AM - 1PM",
    "12PM - 2PM",
    "1PM - 3PM",
    "2PM - 4PM",
    "3PM - 5PM",
    "4PM - 6PM",
    "5PM - 7PM",
    "Flexible",
  ],
};

export const TEACHER_GENDER_PREFERENCES = ["No preference", "Male", "Female"];

// 2-year steps up to 10 years, coarser non-overlapping bands after.
export const EXPERIENCE_BANDS = [
  "0-2 years",
  "2-4 years",
  "4-6 years",
  "6-8 years",
  "8-10 years",
  "11-15 years",
  "16-20 years",
  "20+ years",
] as const;
export type ExperienceBand = (typeof EXPERIENCE_BANDS)[number];

export const AVAILABILITY_SLOTS = [
  "Weekday mornings",
  "Weekday afternoons",
  "Weekday evenings",
  "Weekend mornings",
  "Weekend afternoons",
  "Weekend evenings",
];
