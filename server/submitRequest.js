const TOPICS = new Set([
  "AI for everyday work and productivity",
  "AI for small business and customer service",
  "AI for marketing, sales and content",
  "AI for education and learning",
  "AI in healthcare and wellness",
  "AI for creativity, music and media",
  "AI for accessibility and independent living",
  "AI for job searching and career development",
  "AI for money, shopping and personal planning",
  "AI for software and workflow automation"
]);

const REQUEST_TYPES = new Set([
  "A practical step-by-step plan",
  "Recent examples or news",
  "Tools and resources to try",
  "Risks and important considerations",
  "Ideas for a small project or automation"
]);

function clean(value) {
  return String(value ?? "").trim();
}

function validatePayload(payload) {
  const topic = clean(payload?.topic);
  const requestType = clean(payload?.request_type);
  const businessQuestion = clean(payload?.business_question);
  const website = clean(payload?.website);

  if (website) throw new Error("Submission rejected.");
  if (!TOPICS.has(topic)) throw new Error("Select a valid practical AI area.");
  if (!REQUEST_TYPES.has(requestType)) throw new Error("Select a valid type of help.");
  if (businessQuestion.length < 15) throw new Error("Enter a more complete question.");
  if (businessQuestion.length > 700) throw new Error("Keep the question under 700 characters.");

  return { topic, request_type: requestType, business_question: businessQuestion };
}

export async function submitRequestV2({ payload, webhookUrl } = {}) {
  if (!webhookUrl) throw new Error("MAKE_WEBHOOK_URL is not configured.");

  const validated = validatePayload(payload);
  const requestId = `v2-${crypto.randomUUID()}`;
  const submittedAt = new Date().toISOString();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        request_id: requestId,
        submitted_at: submittedAt,
        ...validated
      }),
      signal: controller.signal,
      cache: "no-store"
    });

    const text = await response.text();
    let makePayload = null;
    try {
      makePayload = text ? JSON.parse(text) : null;
    } catch {
      makePayload = null;
    }

    if (!response.ok) {
      throw new Error(
        makePayload?.message || `Make rejected the request with status ${response.status}.`
      );
    }

    return {
      accepted: true,
      request_id: requestId,
      submitted_at: submittedAt,
      status: makePayload?.status || "queued",
      message:
        makePayload?.message || "Request received. Your practical AI answer is being prepared."
    };
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("The automation did not acknowledge the request in time.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
