import { describe, expect, it } from "vitest";
import { buildCsv, escapeCsvValue, type CsvColumn } from "./csv";

describe("escapeCsvValue", () => {
  it("passes plain values through unchanged", () => {
    expect(escapeCsvValue("Mathematics")).toBe("Mathematics");
    expect(escapeCsvValue(42)).toBe("42");
  });

  it("renders null/undefined as an empty string", () => {
    expect(escapeCsvValue(null)).toBe("");
    expect(escapeCsvValue(undefined)).toBe("");
  });

  it("quotes and escapes values containing commas, quotes, or newlines", () => {
    expect(escapeCsvValue("Coimbatore, Tamil Nadu")).toBe('"Coimbatore, Tamil Nadu"');
    expect(escapeCsvValue('Say "hello"')).toBe('"Say ""hello"""');
    expect(escapeCsvValue("line1\nline2")).toBe('"line1\nline2"');
  });

  it("neutralizes values that would execute as a formula in Excel/Sheets", () => {
    expect(escapeCsvValue('=HYPERLINK("http://evil.com","click")')).toBe(
      '"\'=HYPERLINK(""http://evil.com"",""click"")"'
    );
    expect(escapeCsvValue("+1+1")).toBe("'+1+1");
    expect(escapeCsvValue("-1+1")).toBe("'-1+1");
    expect(escapeCsvValue("@SUM(A1)")).toBe("'@SUM(A1)");
  });

  it("leaves ordinary values starting with non-trigger characters alone", () => {
    expect(escapeCsvValue("Mathematics")).toBe("Mathematics");
    expect(escapeCsvValue("9876543210")).toBe("9876543210");
  });
});

describe("buildCsv", () => {
  type Row = { name: string; city: string | null };
  const columns: CsvColumn<Row>[] = [
    { header: "Name", value: (r) => r.name },
    { header: "City", value: (r) => r.city },
  ];

  it("builds a header row plus one row per input, comma-joined", () => {
    const rows: Row[] = [
      { name: "Arun", city: "Coimbatore" },
      { name: "Priya", city: null },
    ];
    const csv = buildCsv(columns, rows);
    const lines = csv.replace(/^﻿/, "").split("\n");
    expect(lines).toEqual(["Name,City", "Arun,Coimbatore", "Priya,"]);
  });

  it("leads with a UTF-8 BOM so Excel doesn't mangle non-ASCII text", () => {
    const csv = buildCsv(columns, []);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
  });

  it("escapes values that need it when building the full CSV", () => {
    const csv = buildCsv(columns, [{ name: "Arun, Kumar", city: "Chennai" }]);
    expect(csv.replace(/^﻿/, "")).toBe('Name,City\n"Arun, Kumar",Chennai');
  });
});
