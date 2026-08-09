// One small badge icon per taxonomy label (boards, grade bands, subjects,
// creative categories, soft skills) — shown on the chip pills wherever
// that taxonomy is listed (Home's Learning Categories panel, Tutor
// Platform's Subjects & boards). Related labels intentionally share an
// icon (all 4 boards, the 4 foreign languages, Tamil/Second Language) —
// "relevant" beats "forced-unique" when there's no real per-item mark to
// draw from.
import type { ReactNode } from "react";

const p = {
  viewBox: "0 0 24 24",
  width: 14,
  height: 14,
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const board = (
  <svg {...p}>
    <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
    <path d="M8.5 12.2l2.3 2.3 4.7-4.8" />
  </svg>
);
const cap = (
  <svg {...p}>
    <path d="M12 3L2 8l10 5 10-5-10-5z" />
    <path d="M6 10.5V15c0 1.7 2.7 3 6 3s6-1.3 6-3v-4.5" />
  </svg>
);
const music = (
  <svg {...p}>
    <path d="M9 18V5l11-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="17" cy="16" r="3" />
  </svg>
);
const dance = (
  <svg {...p}>
    <circle cx="12" cy="4.5" r="1.6" fill="currentColor" stroke="none" />
    <path d="M12 6.5v5.5M12 8.5l-5 3.5M12 8.5l5 1.5M12 12l-4 6M12 12l4 6" />
  </svg>
);
const art = (
  <svg {...p}>
    <path d="M12 3a9 9 0 100 18c1.4 0 2-1 2-1.8s-.5-1.4-1-1.8.2-1.6 1.3-1.6H16a4 4 0 004-4c0-4.4-3.6-8.8-8-8.8z" />
    <circle cx="8" cy="10" r=".9" fill="currentColor" stroke="none" />
    <circle cx="8.5" cy="14.5" r=".9" fill="currentColor" stroke="none" />
    <circle cx="13" cy="16" r=".9" fill="currentColor" stroke="none" />
  </svg>
);
const abacus = (
  <svg {...p}>
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <path d="M4 9h16M4 14h16" />
    <circle cx="8" cy="6.5" r="1" fill="currentColor" stroke="none" />
    <circle cx="14" cy="6.5" r="1" fill="currentColor" stroke="none" />
    <circle cx="10" cy="11.5" r="1" fill="currentColor" stroke="none" />
    <circle cx="16" cy="11.5" r="1" fill="currentColor" stroke="none" />
    <circle cx="7" cy="16.5" r="1" fill="currentColor" stroke="none" />
    <circle cx="13" cy="16.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);
const speechLines = (
  <svg {...p}>
    <path d="M4 6.5a3 3 0 013-3h10a3 3 0 013 3v6a3 3 0 01-3 3H10l-4.5 3.5v-3.5A3 3 0 014 12.5z" />
    <path d="M8 9.5h8M8 12h5" />
  </svg>
);
const soundWave = (
  <svg {...p}>
    <path d="M3 12h2M7 8v8M11 5v14M15 8v8M19 12h2" />
  </svg>
);
const presentScreen = (
  <svg {...p}>
    <rect x="3" y="4" width="18" height="12" rx="2" />
    <path d="M7 13l2.5-3 2 2L16 8" />
    <path d="M8 20h8M12 16v4" />
  </svg>
);
const megaphone = (
  <svg {...p}>
    <path d="M3 10v4h3l7 4V6l-7 4H3z" />
    <path d="M15 9a4 4 0 010 6" />
  </svg>
);
const star = (
  <svg {...p}>
    <path d="M12 2l1.8 5.5H19l-4.6 3.4L16 16.5 12 13l-4 3.5 1.6-5.6L5 7.5h5.2z" />
  </svg>
);
const briefcase = (
  <svg {...p}>
    <rect x="3" y="8" width="18" height="12" rx="2" />
    <path d="M8 8V6a2 2 0 012-2h4a2 2 0 012 2v2" />
  </svg>
);
const people = (
  <svg {...p}>
    <circle cx="8" cy="9" r="3" />
    <circle cx="17" cy="9" r="2.5" />
    <path d="M2.5 20c0-3.3 2.5-6 5.5-6s5.5 2.7 5.5 6" />
    <path d="M14.5 14.5c2.5.3 4.5 2.6 4.5 5.5" />
  </svg>
);
const langGlobe = (
  <svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.5 4 5.8 4 9s-1.5 6.5-4 9c-2.5-2.5-4-5.8-4-9s1.5-6.5 4-9z" />
  </svg>
);
const pencil = (
  <svg {...p}>
    <path d="M4 20l3.5-1 11-11a2.1 2.1 0 00-3-3l-11 11z" />
    <path d="M14.5 6L18 9.5" />
  </svg>
);
const openBook = (
  <svg {...p}>
    <path d="M4 5.5A2.5 2.5 0 016.5 3H19v15H6.5A2.5 2.5 0 004 15.5z" />
    <path d="M4 15.5A2.5 2.5 0 016.5 18H19" />
  </svg>
);
const blocks = (
  <svg {...p}>
    <rect x="3" y="12" width="7" height="7" rx="1" />
    <rect x="12" y="12" width="7" height="7" rx="1" />
    <rect x="7" y="5" width="7" height="7" rx="1" />
  </svg>
);
const bookStack = (
  <svg {...p}>
    <path d="M12 6c-1.8-1.3-4.3-2-7-2v13c2.7 0 5.2.7 7 2 1.8-1.3 4.3-2 7-2V4c-2.7 0-5.2.7-7 2z" />
    <path d="M12 6v13" />
  </svg>
);
const backpack = (
  <svg {...p}>
    <path d="M8 8V6a4 4 0 018 0v2" />
    <rect x="5" y="8" width="14" height="12" rx="2" />
    <path d="M9 12h6M9 15h6" />
  </svg>
);
const divide = (
  <svg {...p}>
    <path d="M6 12h12" />
    <circle cx="12" cy="7.5" r="1" fill="currentColor" stroke="none" />
    <circle cx="12" cy="16.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);
const flask = (
  <svg {...p}>
    <path d="M9 3h6M10 3v5l-5 9a2 2 0 001.8 3h10.4a2 2 0 001.8-3l-5-9V3" />
    <path d="M8 15h8" />
  </svg>
);
const flaskBubbles = (
  <svg {...p}>
    <path d="M9 3h6M10 3v5l-5 9a2 2 0 001.8 3h10.4a2 2 0 001.8-3l-5-9V3" />
    <circle cx="10.5" cy="16" r=".8" fill="currentColor" stroke="none" />
    <circle cx="13.5" cy="14" r=".8" fill="currentColor" stroke="none" />
  </svg>
);
const globeGrid = (
  <svg {...p}>
    <circle cx="12" cy="12" r="8" />
    <path d="M4 12h16M12 4c2.5 2.5 4 5.8 4 8s-1.5 5.5-4 8c-2.5-2.5-4-5.8-4-8s1.5-5.5 4-8z" />
  </svg>
);
const pinGlobe = (
  <svg {...p}>
    <circle cx="12" cy="10" r="6" />
    <path d="M12 4c1.8 1.8 2.8 4 2.8 6s-1 4.2-2.8 6c-1.8-1.8-2.8-4-2.8-6s1-4.2 2.8-6z" />
    <path d="M12 20v2M9.5 22h5" />
  </svg>
);
const monitor = (
  <svg {...p}>
    <rect x="3" y="5" width="18" height="12" rx="2" />
    <path d="M8 21h8M12 17v4" />
  </svg>
);
const atom = (
  <svg {...p}>
    <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
    <ellipse cx="12" cy="12" rx="9" ry="3.5" />
    <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(60 12 12)" />
    <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(120 12 12)" />
  </svg>
);
const leaf = (
  <svg {...p}>
    <path d="M5 19c8 0 14-6 14-14-8 0-14 6-14 14z" />
    <path d="M5 19c2-4 5-7 9-9" />
  </svg>
);
const codeBrackets = (
  <svg {...p}>
    <path d="M8.5 7L3 12l5.5 5M15.5 7L21 12l-5.5 5" />
  </svg>
);
const trend = (
  <svg {...p}>
    <path d="M4 19h16M7 15l4-4 3 3 5-6" />
  </svg>
);
const ledger = (
  <svg {...p}>
    <path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" />
    <path d="M9 8h6M9 12h6" />
  </svg>
);
const hourglass = (
  <svg {...p}>
    <path d="M7 3h10M7 21h10M7 3c0 5 5 6 5 9s-5 4-5 9M17 3c0 5-5 6-5 9s5 4 5 9" />
  </svg>
);
const building = (
  <svg {...p}>
    <path d="M4 21h16M6 21V9l6-5 6 5v12M10 21v-6h4v6" />
  </svg>
);
const bulb = (
  <svg {...p}>
    <path d="M9 18h6M10 21h4M8 14a4 4 0 118 0c0 2-1 3-1.5 4h-5C8 17 8 16 8 14z" />
    <path d="M12 2v2M6 6l1.5 1.5M18 6l-1.5 1.5" />
  </svg>
);
const fallback = (
  <svg {...p}>
    <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
  </svg>
);

const CATEGORY_ICONS: Record<string, ReactNode> = {
  "State Board": board,
  CBSE: board,
  ICSE: board,
  IGCSE: board,
  "Academics (Pre-Primary – Higher Secondary (K-12))": cap,
  "Music & Instruments": music,
  Dance: dance,
  Art: art,
  Abacus: abacus,
  "Communication Skills": speechLines,
  "Spoken English": soundWave,
  "Spoken Hindi": soundWave,
  "Presentation Skills": presentScreen,
  "Public Speaking": megaphone,
  "Personality Development": star,
  "Interview Skills": briefcase,
  "Group Discussion": people,
  French: langGlobe,
  German: langGlobe,
  Japanese: langGlobe,
  Chinese: langGlobe,
  Handwriting: pencil,
  Phonics: openBook,
  "Pre-Primary (LKG - UKG)": blocks,
  "Primary (1st - 5th Std)": bookStack,
  "Middle School (6th - 8th Std)": backpack,
  "Secondary (9th - 10th Std)": pencil,
  "Higher Secondary (11th - 12th Std)": cap,
  Mathematics: divide,
  Science: flask,
  "Social Science": globeGrid,
  English: openBook,
  Tamil: speechLines,
  "Second Language": speechLines,
  "Computer Applications": monitor,
  Physics: atom,
  Chemistry: flaskBubbles,
  Biology: leaf,
  "Computer Science": codeBrackets,
  Economics: trend,
  "Business Studies": briefcase,
  Accountancy: ledger,
  History: hourglass,
  "Political Science": building,
  Geography: pinGlobe,
  Psychology: bulb,
  Sociology: people,
};

export function getCategoryIcon(label: string): ReactNode {
  return CATEGORY_ICONS[label] ?? fallback;
}
