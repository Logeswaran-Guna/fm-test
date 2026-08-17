export type CsvColumn<T> = {
  header: string;
  value: (row: T) => string | number | null | undefined;
};

// Values starting with =, +, -, or @ get evaluated as a formula by Excel/
// Sheets on open (CSV injection, CWE-1236) — these exports carry
// user-submitted free text (notes, qualifications), so a value like
// `=HYPERLINK("http://evil","x")` would otherwise execute for whoever
// opens the file. Prefixing with a leading apostrophe forces it to render
// as literal text instead.
const FORMULA_TRIGGER = /^[=+\-@\t\r]/;

export function escapeCsvValue(value: unknown): string {
  let s = value == null ? "" : String(value);
  if (FORMULA_TRIGGER.test(s)) s = `'${s}`;
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// Pure string-building, split out from exportToCsv so it's testable without
// a DOM (Blob/URL/document are browser-only side effects, not logic).
export function buildCsv<T>(columns: CsvColumn<T>[], rows: T[]): string {
  const header = columns.map((c) => escapeCsvValue(c.header)).join(",");
  const lines = rows.map((row) =>
    columns.map((c) => escapeCsvValue(c.value(row))).join(",")
  );
  // Leading BOM so Excel opens the UTF-8 file (e.g. ₹) without mangling it.
  return "﻿" + [header, ...lines].join("\n");
}

export function exportToCsv<T>(
  filename: string,
  columns: CsvColumn<T>[],
  rows: T[]
) {
  const csv = buildCsv(columns, rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
