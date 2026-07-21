import Papa from "papaparse";
import { sampleSignals } from "./sampleSignals.js";

const REQUIRED_FIELDS = [
  "topic",
  "business_question",
  "title",
  "source_url",
  "published_at",
  "category",
  "relevance_score",
  "summary",
  "why_it_matters",
  "prototype_idea",
  "risk_note",
  "created_at"
];

function normalizeHeader(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

function normalizeRow(row) {
  const normalized = {};

  for (const [key, value] of Object.entries(row)) {
    normalized[normalizeHeader(key)] = typeof value === "string" ? value.trim() : value;
  }

  const score = Number.parseInt(normalized.relevance_score, 10);

  return {
    ...normalized,
    relevance_score: Number.isFinite(score) ? Math.min(100, Math.max(0, score)) : 0
  };
}

function sortableDate(value) {
  if (!value) return 0;

  const compact = String(value).match(
    /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/
  );

  if (compact) {
    const [, year, month, day, hour, minute, second] = compact;
    return Date.parse(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`) || 0;
  }

  return Date.parse(value) || 0;
}

function validateRows(rows) {
  return rows
    .map(normalizeRow)
    .filter((row) => row.title && row.source_url && row.summary)
    .map((row) => {
      const complete = REQUIRED_FIELDS.every((field) => field in row);
      return { ...row, _complete: complete };
    })
    .sort(
      (a, b) =>
        sortableDate(b.created_at || b.published_at) -
        sortableDate(a.created_at || a.published_at)
    );
}

export async function loadSignals({ csvUrl, allowSample = false } = {}) {
  if (!csvUrl) {
    if (allowSample) {
      return {
        signals: validateRows(sampleSignals),
        source: "sample"
      };
    }

    throw new Error(
      "SHEET_CSV_URL is not configured. Add the published Public_Signals CSV URL to the environment variables."
    );
  }

  const response = await fetch(csvUrl, {
    headers: {
      "User-Agent": "AI-Signal-Radar/1.0"
    }
  });

  if (!response.ok) {
    throw new Error(`Google Sheets CSV request failed with status ${response.status}.`);
  }

  const csvText = await response.text();
  const parsed = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: normalizeHeader
  });

  if (parsed.errors.length > 0 && parsed.data.length === 0) {
    throw new Error(`CSV parsing failed: ${parsed.errors[0].message}`);
  }

  return {
    signals: validateRows(parsed.data),
    source: "google-sheets"
  };
}
