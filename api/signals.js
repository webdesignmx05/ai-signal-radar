import { loadSignals } from "../server/loadSignals.js";

export default async function handler() {
  try {
    const result = await loadSignals({
      csvUrl: process.env.SHEET_CSV_URL,
      allowSample: process.env.USE_SAMPLE_DATA === "true"
    });

    return Response.json(
      {
        signals: result.signals,
        meta: {
          count: result.signals.length,
          source: result.source,
          fetched_at: new Date().toISOString()
        }
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600"
        }
      }
    );
  } catch (error) {
    console.error("AI Signal Radar API error:", error);

    return Response.json(
      {
        error: "Unable to load AI signals.",
        detail: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
