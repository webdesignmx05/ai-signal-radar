import { submitRequestV2 } from "../server/submitRequest.js";

export async function POST(request) {
  try {
    const payload = await request.json();
    const result = await submitRequestV2({
      payload,
      webhookUrl: process.env.MAKE_WEBHOOK_URL,
      turnstileSecretKey:
        process.env.TURNSTILE_SECRET_KEY
    });

    return Response.json(result, {
      status: 202,
      headers: { "Cache-Control": "no-store" }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to submit the request.";
    const isValidation =
      message.includes("valid") ||
      message.includes("complete question") ||
      message.includes("under 700") ||
      message === "Submission rejected.";

    console.error("AI Signal Radar V2 submit error:", error);
    return Response.json(
      { error: isValidation ? message : "Unable to submit the request.", detail: message },
      { status: isValidation ? 400 : 502 }
    );
  }
}
