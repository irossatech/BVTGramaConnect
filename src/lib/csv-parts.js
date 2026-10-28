// Geography CSV upload in parts.
//
// A whole state (about 18,000 villages) used to take longer than the 60 s request limit; the backend now imports
// in bulk (about 10 s) and gives the import endpoints 300 s, but servers not yet updated still stop at 60 s.
// 4,000 rows take about 14 s on an old server and 2 to 3 s on an updated one, so parts are safe everywhere.
// The importer is built for repeat runs (every row carries its full state > district > mandal > village path,
// and importing the same rows twice changes nothing), so the console sends the file in parts of about
// PART_ROWS rows, keeping every mandal's villages in the same part. Same column rules as the backend importer
// (apps/geography/importer.py): required state, district, mandal, village; header names are compared in
// lower case with non-letters as "_", plus a few aliases.

export const PART_ROWS = 4000;
export const REQUIRED = ["state", "district", "mandal", "village"];
const ALIASES = { state_name: "state", district_name: "district", mandal_name: "mandal", village_name: "village" };

// Header cell -> the importer's column key ("Village Name" -> "village").
export function columnKey(name) {
  const k = String(name || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return ALIASES[k] || k;
}

// Split CSV text into records, keeping each record's raw text (quotes and all) and its first line number.
// A newline inside quotes stays part of the record.
export function splitRecords(text) {
  const out = [];
  let start = 0, line = 1, startLine = 1, quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') quoted = !quoted;
    else if (ch === "\n" && !quoted) {
      out.push({ raw: text.slice(start, text[i - 1] === "\r" ? i - 1 : i), line: startLine });
      start = i + 1; line++; startLine = line;
    } else if (ch === "\n") line++;
  }
  if (start < text.length) out.push({ raw: text.slice(start), line: startLine });
  return out.filter((r) => r.raw.trim() !== "");
}

// The cells of one record ("a,""b"",c" style quoting).
export function cells(raw) {
  const out = [];
  let cur = "", quoted = false;
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (quoted) {
      if (ch === '"' && raw[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cur += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") { out.push(cur); cur = ""; }
    else cur += ch;
  }
  out.push(cur);
  return out;
}

// Decode the file as UTF-8 (BOM removed). Returns null when the bytes are not UTF-8 (e.g. Excel "CSV" in ANSI).
export function decodeUtf8(buffer) {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(buffer).replace(/^﻿/, "");
  } catch (e) {
    return null;
  }
}

// Read the file and plan the parts.
// Returns {error} with a sentence for the user, or {rows, districts, mandals, parts:[{text, lines}]}, where
// lines[i] is the original line number of data line i + 2 of that part (line 1 is the header).
export function planParts(text, partRows = PART_ROWS) {
  const records = splitRecords(text);
  if (!records.length) return { error: "The file is empty." };
  const header = cells(records[0].raw);
  const keys = header.map(columnKey);
  const missing = REQUIRED.filter((k) => !keys.includes(k));
  if (missing.length) {
    return {
      error: "This is not a villages import file. It needs the columns " + REQUIRED.join(", ") + "; it is missing " +
        missing.join(", ") + " (it has: " + header.map((h) => h.trim()).filter(Boolean).join(", ") + ")." +
        " Lists for reading, such as the files in a reports folder, cannot be imported.",
    };
  }
  const data = records.slice(1);
  if (!data.length) return { error: "The file has a header but no villages." };
  const di = keys.indexOf("district"), mi = keys.indexOf("mandal");
  // Keep each mandal's villages together, in the order the file lists them.
  const groups = new Map();
  for (const r of data) {
    const c = cells(r.raw);
    const k = String(c[di] || "").trim().toLowerCase() + "\u0000" + String(c[mi] || "").trim().toLowerCase();
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(r);
  }
  const parts = [];
  let cur = [];
  const flush = () => { if (cur.length) { parts.push(cur); cur = []; } };
  for (const rows of groups.values()) {
    if (cur.length && cur.length + rows.length > partRows) flush();
    for (let i = 0; i < rows.length; i += partRows) {     // a mandal bigger than a part is cut (rare)
      cur.push(...rows.slice(i, i + partRows));
      if (cur.length >= partRows) flush();
    }
  }
  flush();
  const head = records[0].raw;
  return {
    rows: data.length,
    districts: new Set([...groups.keys()].map((k) => k.split("\u0000")[0])).size,
    mandals: groups.size,
    parts: parts.map((p) => ({ text: head + "\n" + p.map((r) => r.raw).join("\n") + "\n", lines: p.map((r) => r.line) })),
  };
}

// "Line 7: …" from the server, for a part -> the same message with the line number in the user's file.
export function fileLine(message, part) {
  return String(message).replace(/^Line (\d+):/, (m, n) => {
    const orig = part.lines[Number(n) - 2];
    return orig ? "Line " + orig + ":" : m;
  });
}
