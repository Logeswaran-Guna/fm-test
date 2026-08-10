// Custom lightweight SVG illustrations for EducationBackground.tsx (the
// find-tutor / become-a-tutor decorative frame). Each icon is a small,
// self-contained component on a 0-100 viewBox so it scales cleanly at
// any size. Gradient fills reference shared <linearGradient> defs
// rendered once by EducationBackground (#eduGradNavyTeal / #eduGradTealAqua)
// — SVG gradient IDs resolve document-wide, not just within their own
// <svg> root, so every icon here can share the same two defs.

export type IconProps = { size: number; className?: string };

export function GraduationCapIcon({ size, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <path d="M50 20 L92 38 L50 56 L8 38 Z" fill="url(#eduGradNavyTeal)" />
      <path
        d="M28 46 L28 66 Q50 78 72 66 L72 46"
        fill="none"
        stroke="url(#eduGradNavyTeal)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path d="M90 40 L90 62" stroke="#FF9933" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="90" cy="40" r="3" fill="#FF9933" />
      <circle cx="90" cy="65" r="3.5" fill="#FF9933" />
    </svg>
  );
}

export function LaptopIcon({ size, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <rect x="20" y="18" width="60" height="42" rx="4" fill="url(#eduGradNavyTeal)" />
      <rect x="26" y="24" width="48" height="30" rx="2" fill="#FAFBFC" />
      <path d="M28 66 L72 66 L84 78 L16 78 Z" fill="url(#eduGradTealAqua)" />
      <circle cx="50" cy="39" r="8" fill="#18D4C5" opacity="0.9" />
      <path d="M47 35 L55 39 L47 43 Z" fill="#FAFBFC" />
    </svg>
  );
}

export function BooksStackIcon({ size, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <rect x="10" y="60" width="80" height="14" rx="3" fill="#081B4B" />
      <rect x="14" y="44" width="72" height="14" rx="3" fill="#18D4C5" />
      <rect x="18" y="28" width="64" height="14" rx="3" fill="#FF9933" />
    </svg>
  );
}

export function OpenBookIcon({ size, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <path d="M50 30 C40 22 22 20 12 24 L12 72 C22 68 40 70 50 78 Z" fill="url(#eduGradNavyTeal)" />
      <path d="M50 30 C60 22 78 20 88 24 L88 72 C78 68 60 70 50 78 Z" fill="url(#eduGradTealAqua)" />
      <path d="M50 30 L50 78" stroke="#FAFBFC" strokeWidth="1.5" />
    </svg>
  );
}

export function LightBulbIcon({ size, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <circle cx="50" cy="38" r="26" fill="#FF9933" opacity="0.92" />
      <rect x="40" y="60" width="20" height="14" rx="3" fill="#081B4B" />
      <path d="M42 78 L58 78" stroke="#081B4B" strokeWidth="3" strokeLinecap="round" />
      <path
        d="M44 44 L50 50 L58 32"
        stroke="#FAFBFC"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function GlobeIcon({ size, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <circle cx="50" cy="50" r="36" fill="url(#eduGradTealAqua)" />
      <ellipse cx="50" cy="50" rx="36" ry="14" fill="none" stroke="#FAFBFC" strokeWidth="2" opacity="0.7" />
      <ellipse cx="50" cy="50" rx="14" ry="36" fill="none" stroke="#FAFBFC" strokeWidth="2" opacity="0.7" />
      <path d="M14 50 L86 50" stroke="#FAFBFC" strokeWidth="2" opacity="0.7" />
    </svg>
  );
}

export function HeadphonesIcon({ size, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <path
        d="M20 55 A30 30 0 0 1 80 55"
        fill="none"
        stroke="url(#eduGradNavyTeal)"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <rect x="12" y="52" width="16" height="26" rx="8" fill="#FF9933" />
      <rect x="72" y="52" width="16" height="26" rx="8" fill="#18D4C5" />
    </svg>
  );
}

export function CertificateIcon({ size, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <rect x="14" y="8" width="72" height="52" rx="4" fill="#FAFBFC" stroke="url(#eduGradNavyTeal)" strokeWidth="3" />
      <path d="M24 22 L64 22 M24 32 L64 32 M24 42 L50 42" stroke="#18D4C5" strokeWidth="3" strokeLinecap="round" />
      <circle cx="50" cy="70" r="14" fill="#FF9933" />
      <path d="M44 70 L48 75 L57 64" stroke="#FAFBFC" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M40 80 L34 94 L50 86 L66 94 L60 80" fill="#081B4B" />
    </svg>
  );
}

export function PencilIcon({ size, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <path d="M20 80 L26 56 L64 18 A9 9 0 0 1 82 36 L44 74 Z" fill="url(#eduGradNavyTeal)" />
      <path d="M64 18 L82 36" stroke="#FAFBFC" strokeWidth="2" />
      <path d="M26 56 L44 74 L20 80 Z" fill="#FF9933" />
    </svg>
  );
}

export function NotebookIcon({ size, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <rect x="20" y="10" width="60" height="80" rx="6" fill="url(#eduGradTealAqua)" />
      <rect x="30" y="26" width="40" height="4" rx="2" fill="#FAFBFC" opacity="0.85" />
      <rect x="30" y="38" width="40" height="4" rx="2" fill="#FAFBFC" opacity="0.85" />
      <rect x="30" y="50" width="26" height="4" rx="2" fill="#FAFBFC" opacity="0.85" />
      {[18, 30, 42, 54, 66, 78].map((y) => (
        <circle key={y} cx="14" cy={y} r="3" fill="#FAFBFC" />
      ))}
    </svg>
  );
}

export function CalendarIcon({ size, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <rect x="14" y="20" width="72" height="64" rx="6" fill="#FAFBFC" stroke="url(#eduGradNavyTeal)" strokeWidth="3" />
      <rect x="14" y="20" width="72" height="18" rx="6" fill="url(#eduGradNavyTeal)" />
      <path d="M30 12 L30 26 M70 12 L70 26" stroke="#FF9933" strokeWidth="4" strokeLinecap="round" />
      {[32, 50, 68].flatMap((x) => [50, 64].map((y) => ({ x, y }))).map(({ x, y }) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="3" fill="#18D4C5" />
      ))}
    </svg>
  );
}

export function TargetIcon({ size, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <circle cx="50" cy="50" r="38" fill="none" stroke="url(#eduGradNavyTeal)" strokeWidth="6" />
      <circle cx="50" cy="50" r="24" fill="none" stroke="#18D4C5" strokeWidth="6" />
      <circle cx="50" cy="50" r="10" fill="#FF9933" />
    </svg>
  );
}

export function AtomIcon({ size, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <circle cx="50" cy="50" r="6" fill="#FF9933" />
      <ellipse cx="50" cy="50" rx="40" ry="15" fill="none" stroke="url(#eduGradNavyTeal)" strokeWidth="3.5" />
      <ellipse
        cx="50"
        cy="50"
        rx="40"
        ry="15"
        fill="none"
        stroke="url(#eduGradNavyTeal)"
        strokeWidth="3.5"
        transform="rotate(60 50 50)"
      />
      <ellipse
        cx="50"
        cy="50"
        rx="40"
        ry="15"
        fill="none"
        stroke="url(#eduGradNavyTeal)"
        strokeWidth="3.5"
        transform="rotate(120 50 50)"
      />
    </svg>
  );
}

export function FlaskIcon({ size, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <path
        d="M40 10 L60 10 L60 38 L82 78 A8 8 0 0 1 75 90 L25 90 A8 8 0 0 1 18 78 L40 38 Z"
        fill="none"
        stroke="url(#eduGradNavyTeal)"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path d="M26 66 A24 24 0 0 0 74 66 L82 78 A8 8 0 0 1 75 90 L25 90 A8 8 0 0 1 18 78 Z" fill="url(#eduGradTealAqua)" />
      <circle cx="45" cy="74" r="3" fill="#FAFBFC" />
      <circle cx="58" cy="80" r="2.5" fill="#FAFBFC" />
    </svg>
  );
}

export function RocketIcon({ size, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <path d="M50 8 C68 24 68 52 58 68 L42 68 C32 52 32 24 50 8 Z" fill="url(#eduGradNavyTeal)" />
      <circle cx="50" cy="34" r="8" fill="#FAFBFC" />
      <path d="M42 60 L26 76 L38 72 Z" fill="#18D4C5" />
      <path d="M58 60 L74 76 L62 72 Z" fill="#18D4C5" />
      <path d="M45 68 L55 68 L52 88 L48 88 Z" fill="#FF9933" />
    </svg>
  );
}

export function MagnifyingGlassIcon({ size, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <circle cx="42" cy="42" r="26" fill="none" stroke="url(#eduGradNavyTeal)" strokeWidth="6" />
      <path d="M62 62 L86 86" stroke="url(#eduGradNavyTeal)" strokeWidth="7" strokeLinecap="round" />
    </svg>
  );
}

export function MusicNoteIcon({ size, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <path d="M62 14 L62 62" stroke="url(#eduGradNavyTeal)" strokeWidth="5" strokeLinecap="round" />
      <path d="M62 14 L82 22 L82 34 L62 26 Z" fill="#FF9933" />
      <circle cx="50" cy="66" r="14" fill="url(#eduGradTealAqua)" />
    </svg>
  );
}

export function ChalkboardIcon({ size, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <rect x="12" y="16" width="76" height="50" rx="4" fill="url(#eduGradNavyTeal)" />
      <path d="M28 34 L40 46 L60 26" stroke="#FAFBFC" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="30" y="66" width="40" height="5" rx="2" fill="#FF9933" />
      <path d="M42 71 L38 90 M58 71 L62 90" stroke="#081B4B" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export function StarIcon({ size, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <path d="M50 12 L61 40 L91 40 L67 58 L76 88 L50 70 L24 88 L33 58 L9 40 L39 40 Z" fill="#FF9933" />
    </svg>
  );
}

export function DotIcon({ size, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <circle cx="50" cy="50" r="40" fill="url(#eduGradTealAqua)" />
    </svg>
  );
}
