export type CsvColumn<T> = {
  header: string;
  value: (row: T) => string | number | null | undefined;
};

function escapeCsvValue(value: unknown): string {
  const s = value == null ? "" : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function exportToCsv<T>(
  filename: string,
  columns: CsvColumn<T>[],
  rows: T[]
) {
  const header = columns.map((c) => escapeCsvValue(c.header)).join(",");
  const lines = rows.map((row) =>
    columns.map((c) => escapeCsvValue(c.value(row))).join(",")
  );
  // Leading BOM so Excel opens the UTF-8 file (e.g. ₹) without mangling it.
  const csv = "﻿" + [header, ...lines].join("\n");
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
