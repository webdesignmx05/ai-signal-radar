import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { loadRequestStatusV2, loadSignalsV2 } from "./server/v2Data.js";
import { submitRequestV2 } from "./server/submitRequest.js";

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(payload));
}

async function readJsonBody(request) {
  let body = "";
  for await (const chunk of request) body += chunk;
  return body ? JSON.parse(body) : {};
}

function localApi(env) {
  return {
    name: "ai-signal-radar-v2-local-api",
    configureServer(server) {
      server.middlewares.use("/api/signals", async (_request, response) => {
        try {
          const result = await loadSignalsV2({
            csvUrl: env.PUBLIC_SIGNALS_V2_CSV_URL,
            allowSample: env.USE_SAMPLE_DATA !== "false"
          });
          sendJson(response, 200, {
            signals: result.signals,
            meta: {
              count: result.signals.length,
              source: result.source,
              fetched_at: new Date().toISOString()
            }
          });
        } catch (error) {
          sendJson(response, 500, {
            error: "Unable to load V2 AI signals.",
            detail: error instanceof Error ? error.message : "Unknown error"
          });
        }
      });

      server.middlewares.use("/api/status", async (request, response) => {
        try {
          const url = new URL(request.url, "http://localhost");
          const requestId = String(url.searchParams.get("request_id") || "").trim();
          if (!requestId) return sendJson(response, 400, { error: "request_id is required." });

          const result = await loadRequestStatusV2({
            statusCsvUrl: env.PUBLIC_REQUEST_STATUS_V2_CSV_URL,
            signalsCsvUrl: env.PUBLIC_SIGNALS_V2_CSV_URL,
            requestId
          });
          sendJson(response, result.found ? 200 : 202, result);
        } catch (error) {
          sendJson(response, 500, {
            error: "Unable to check the request status.",
            detail: error instanceof Error ? error.message : "Unknown error"
          });
        }
      });

      server.middlewares.use("/api/submit", async (request, response) => {
        if (request.method !== "POST") return sendJson(response, 405, { error: "POST required." });

        try {
          const result = await submitRequestV2({
            payload: await readJsonBody(request),
            webhookUrl: env.MAKE_WEBHOOK_URL,
            turnstileSecretKey:
              env.TURNSTILE_SECRET_KEY
          });
          sendJson(response, 202, result);
        } catch (error) {
          sendJson(response, 400, {
            error: "Unable to submit the request.",
            detail: error instanceof Error ? error.message : "Unknown error"
          });
        }
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react(), localApi(env)],
    server: { port: 5173, strictPort: false }
  };
});
