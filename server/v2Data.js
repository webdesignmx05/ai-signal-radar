import Papa from "papaparse";
import { sampleSignalsV2 } from "./sampleSignalsV2.js";

function normalizeHeader(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

function normalizeObject(row) {
  const normalized = {};
  for (const [key, value] of Object.entries(row ?? {})) {
    normalized[normalizeHeader(key)] = typeof value === "string" ? value.trim() : value;
  }
  return normalized;
}

function parseJsonArray(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];

  try {
    const parsed = JSON.parse(String(value));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function clampScore(value) {
  const score = Number.parseInt(value, 10);
  return Number.isFinite(score) ? Math.min(100, Math.max(0, score)) : 0;
}

function sortableDate(value) {
  if (!value) return 0;
  return Date.parse(value) || 0;
}

function parseCsv(csvText) {
  const parsed = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: normalizeHeader
  });

  if (parsed.errors.length > 0 && parsed.data.length === 0) {
    throw new Error(`CSV parsing failed: ${parsed.errors[0].message}`);
  }

  return parsed.data.map(normalizeObject);
}

async function fetchCsv(csvUrl, label) {
  if (!csvUrl) {
    throw new Error(`${label} is not configured.`);
  }

  const response = await fetch(csvUrl, {
    headers: { "User-Agent": "AI-Signal-Radar-V2/1.0" },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`${label} request failed with status ${response.status}.`);
  }

  return parseCsv(await response.text());
}

export function normalizeSignal(row) {
  const normalized = normalizeObject(row);

  return {
    ...normalized,
    confidence_score: clampScore(normalized.confidence_score),
    action_steps: parseJsonArray(normalized.action_steps_json).filter(Boolean),
    sources: parseJsonArray(normalized.sources_json)
      .map((source) => ({
        title: String(source?.title ?? "").trim(),
        url: String(source?.url ?? "").trim(),
        relevance_score: Number(source?.relevance_score ?? 0)
      }))
      .filter((source) => source.title && source.url)
  };
}

export async function loadSignalsV2({ csvUrl, allowSample = false } = {}) {
  if (!csvUrl) {
    if (allowSample) {
      return {
        signals: sampleSignalsV2.map(normalizeSignal),
        source: "sample"
      };
    }

    throw new Error(
      "PUBLIC_SIGNALS_V2_CSV_URL is not configured. Add the published Public_Signals_V2 CSV URL."
    );
  }

  const rows = await fetchCsv(csvUrl, "PUBLIC_SIGNALS_V2_CSV_URL");
  const signals = rows
    .map(normalizeSignal)
    .filter((row) => row.request_id && row.business_question && row.direct_answer)
    .sort((a, b) => sortableDate(b.created_at) - sortableDate(a.created_at));

  return { signals, source: "google-sheets-v2" };
}

export async function loadRequestStatusV2({ statusCsvUrl, signalsCsvUrl, requestId } = {}) {
  if (!requestId) throw new Error("request_id is required.");

  const statusRows = await fetchCsv(statusCsvUrl, "PUBLIC_REQUEST_STATUS_V2_CSV_URL");
  const statusRow = statusRows.find((row) => row.request_id === requestId);

  if (!statusRow) {
    return {
      found: false,
      request_id: requestId,
      status: "queued",
      status_message: "Request accepted. Waiting for processing to begin."
    };
  }

  const result = {
    found: true,
    request_id: requestId,
    status: statusRow.status || "queued",
    status_message: statusRow.status_message || "",
    completed_at: statusRow.completed_at || "",
    error_message: statusRow.error_message || ""
  };

  if (["completed", "insufficient_sources"].includes(result.status) && signalsCsvUrl) {
    const signalRows = await fetchCsv(signalsCsvUrl, "PUBLIC_SIGNALS_V2_CSV_URL");
    const signalRow = signalRows.find((row) => row.request_id === requestId);
    if (signalRow) result.signal = normalizeSignal(signalRow);
  }

  return result;
}
