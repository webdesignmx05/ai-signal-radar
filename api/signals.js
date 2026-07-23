import { loadSignalsV2 } from "../server/v2Data.js";

export async function GET() {
  try {
    const result = await loadSignalsV2({
      csvUrl: process.env.PUBLIC_SIGNALS_V2_CSV_URL,
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
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300"
        }
      }
    );
  } catch (error) {
    console.error("AI Signal Radar V2 signals error:", error);
    return Response.json(
      {
        error: "Unable to load V2 AI signals.",
        detail: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
