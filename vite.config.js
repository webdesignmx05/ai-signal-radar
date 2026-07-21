import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { loadSignals } from "./server/loadSignals.js";

function localSignalsApi(env) {
  return {
    name: "ai-signal-radar-local-api",
    configureServer(server) {
      server.middlewares.use("/api/signals", async (_request, response) => {
        response.setHeader("Content-Type", "application/json; charset=utf-8");
        response.setHeader("Cache-Control", "no-store");

        try {
          const result = await loadSignals({
            csvUrl: env.SHEET_CSV_URL,
            allowSample: env.USE_SAMPLE_DATA !== "false"
          });

          response.statusCode = 200;
          response.end(
            JSON.stringify({
              signals: result.signals,
              meta: {
                count: result.signals.length,
                source: result.source,
                fetched_at: new Date().toISOString()
              }
            })
          );
        } catch (error) {
          response.statusCode = 500;
          response.end(
            JSON.stringify({
              error: "Unable to load AI signals.",
              detail: error instanceof Error ? error.message : "Unknown error"
            })
          );
        }
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), localSignalsApi(env)],
    server: {
      port: 5173,
      strictPort: false
    }
  };
});
