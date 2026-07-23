import { loadRequestStatusV2 } from "../server/v2Data.js";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const requestId = String(url.searchParams.get("request_id") || "").trim();

    if (!requestId) {
      return Response.json({ error: "request_id is required." }, { status: 400 });
    }

    const result = await loadRequestStatusV2({
      statusCsvUrl: process.env.PUBLIC_REQUEST_STATUS_V2_CSV_URL,
      signalsCsvUrl: process.env.PUBLIC_SIGNALS_V2_CSV_URL,
      requestId
    });

    return Response.json(result, {
      status: result.found ? 200 : 202,
      headers: { "Cache-Control": "no-store" }
    });
  } catch (error) {
    console.error("AI Signal Radar V2 status error:", error);
    return Response.json(
      {
        error: "Unable to check the request status.",
        detail: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
