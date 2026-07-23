import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MetricCard from "./components/MetricCard.jsx";
import SignalCard from "./components/SignalCard.jsx";

const githubUrl = import.meta.env.VITE_GITHUB_URL || "";

const TOPICS = [
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
];

const REQUEST_TYPES = [
  "A practical step-by-step plan",
  "Recent examples or news",
  "Tools and resources to try",
  "Risks and important considerations",
  "Ideas for a small project or automation"
];

function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value, fallback = "Date unavailable") {
  const date = parseDate(value);
  if (!date) return fallback;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

function finalStatus(status) {
  return ["completed", "insufficient_sources", "failed"].includes(status);
}

export default function App() {
  const [signals, setSignals] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [topicFilter, setTopicFilter] = useState("all");
  const [minimumScore, setMinimumScore] = useState(0);
  const [form, setForm] = useState({
    topic: TOPICS[0],
    request_type: REQUEST_TYPES[0],
    business_question: "",
    website: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [requestState, setRequestState] = useState(null);
  const pollTimer = useRef(null);

  const loadSignals = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/signals", {
        headers: { Accept: "application/json" },
        cache: "no-store"
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.detail || payload.error || "The data request failed.");
      setSignals(Array.isArray(payload.signals) ? payload.signals : []);
      setMeta(payload.meta || null);
    } catch (loadError) {
      setError(loadError.message || "Unable to load answers.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSignals();
    return () => clearTimeout(pollTimer.current);
  }, [loadSignals]);

  const pollStatus = useCallback(async (requestId, attempt = 0) => {
    try {
      const response = await fetch(`/api/status?request_id=${encodeURIComponent(requestId)}`, {
        headers: { Accept: "application/json" },
        cache: "no-store"
      });
      const payload = await response.json();
      if (!response.ok && response.status !== 202) {
        throw new Error(payload.detail || payload.error || "Status check failed.");
      }

      setRequestState(payload);

      if (finalStatus(payload.status)) {
        if (payload.signal) {
          setSignals((current) => {
            const remaining = current.filter((item) => item.request_id !== payload.signal.request_id);
            return [payload.signal, ...remaining];
          });
        } else {
          await loadSignals();
        }
        setSubmitting(false);
        return;
      }

      if (attempt >= 39) {
        setSubmitting(false);
        setRequestState((current) => ({
          ...current,
          status_message:
            "The request is still processing. Keep this request ID and refresh the page shortly."
        }));
        return;
      }

      pollTimer.current = setTimeout(() => pollStatus(requestId, attempt + 1), 3000);
    } catch (statusError) {
      setSubmitting(false);
      setRequestState((current) => ({
        ...current,
        status: "failed",
        error_message: statusError.message || "Unable to check the request status."
      }));
    }
  }, [loadSignals]);

  async function submitQuestion(event) {
    event.preventDefault();
    clearTimeout(pollTimer.current);
    setSubmitting(true);
    setRequestState({ status: "submitting", status_message: "Sending your question…" });

    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(form)
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.detail || payload.error || "Submission failed.");

      setRequestState(payload);
      setForm((current) => ({ ...current, business_question: "", website: "" }));
      pollTimer.current = setTimeout(() => pollStatus(payload.request_id), 1800);
    } catch (submitError) {
      setSubmitting(false);
      setRequestState({
        status: "failed",
        status_message: "The question could not be submitted.",
        error_message: submitError.message || "Submission failed."
      });
    }
  }

  const topics = useMemo(
    () => [...new Set(signals.map((signal) => signal.topic).filter(Boolean))].sort(),
    [signals]
  );

  const filteredSignals = useMemo(() => {
    const query = search.trim().toLowerCase();
    return signals.filter((signal) => {
      const matchesTopic = topicFilter === "all" || signal.topic === topicFilter;
      const matchesScore = Number(signal.confidence_score || 0) >= minimumScore;
      const searchable = [
        signal.topic,
        signal.request_type,
        signal.business_question,
        signal.direct_answer,
        signal.quick_win,
        signal.ai_opportunity,
        signal.monetization_note
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesTopic && matchesScore && (!query || searchable.includes(query));
    });
  }, [signals, search, topicFilter, minimumScore]);

  const averageScore = signals.length
    ? Math.round(
        signals.reduce((total, signal) => total + Number(signal.confidence_score || 0), 0) /
          signals.length
      )
    : 0;

  const newestSignal = signals[0];

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="AI Signal Radar home">
          <span className="brand-mark" aria-hidden="true">◉</span>
          <span>AI Signal Radar</span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#ask">Ask</a>
          <a href="#signals">Answers</a>
          <a href="#workflow">How it works</a>
          {githubUrl && <a href={githubUrl} target="_blank" rel="noreferrer">GitHub</a>}
        </nav>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <p className="hero-kicker">Practical AI discovery, grounded in relevant sources</p>
            <h1>Ask a real-world question and get an approachable action plan.</h1>
            <p className="hero-description">
              AI Signal Radar searches the web for material that directly relates to your question,
              evaluates the strength of the match, and separates practical advice from optional ways AI could assist.
            </p>
            <div className="hero-actions">
              <a className="primary-button" href="#ask">Ask a practical question</a>
              <a className="secondary-button" href="#signals">Explore completed answers</a>
            </div>
          </div>
          <div className="radar-visual" aria-hidden="true">
            <span className="radar-ring ring-one" />
            <span className="radar-ring ring-two" />
            <span className="radar-ring ring-three" />
            <span className="radar-sweep" />
            <span className="radar-dot dot-one" />
            <span className="radar-dot dot-two" />
            <span className="radar-dot dot-three" />
            <span className="radar-center" />
          </div>
        </section>

        <section className="ask-section" id="ask">
          <div className="section-heading narrow-heading">
            <div>
              <p className="eyebrow">Instant webhook intake</p>
              <h2>What would you like to understand or build?</h2>
              <p>Use ordinary language. The system will not force an unrelated source to fit your question.</p>
            </div>
          </div>

          <div className="ask-grid">
            <form className="question-form" onSubmit={submitQuestion}>
              <label>
                <span>Practical area</span>
                <select
                  value={form.topic}
                  onChange={(event) => setForm({ ...form, topic: event.target.value })}
                  disabled={submitting}
                >
                  {TOPICS.map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>

              <label>
                <span>What kind of help are you looking for?</span>
                <select
                  value={form.request_type}
                  onChange={(event) => setForm({ ...form, request_type: event.target.value })}
                  disabled={submitting}
                >
                  {REQUEST_TYPES.map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>

              <label>
                <span>Your question</span>
                <textarea
                  value={form.business_question}
                  onChange={(event) => setForm({ ...form, business_question: event.target.value })}
                  minLength={15}
                  maxLength={700}
                  required
                  disabled={submitting}
                  placeholder="For example: How should I promote a webcomic, grow readership, and introduce a paid membership after a free first season?"
                />
                <small>{form.business_question.length}/700 characters</small>
              </label>

              <label className="honeypot" aria-hidden="true">
                <span>Website</span>
                <input
                  tabIndex="-1"
                  autoComplete="off"
                  value={form.website}
                  onChange={(event) => setForm({ ...form, website: event.target.value })}
                />
              </label>

              <button className="primary-button form-button" type="submit" disabled={submitting}>
                {submitting ? "Preparing your answer…" : "Submit question"}
              </button>
            </form>

            <aside className="request-status" aria-live="polite">
              <h3>Request status</h3>
              {requestState ? (
                <>
                  <span className={`status-badge status-${requestState.status || "queued"}`}>
                    {(requestState.status || "queued").replaceAll("_", " ")}
                  </span>
                  <p>{requestState.status_message || requestState.message}</p>
                  {requestState.request_id && (
                    <p className="request-id">Request ID: <code>{requestState.request_id}</code></p>
                  )}
                  {requestState.error_message && <p className="status-error">{requestState.error_message}</p>}
                </>
              ) : (
                <p>Your progress will appear here after you submit a question.</p>
              )}
            </aside>
          </div>
        </section>

        {meta?.source === "sample" && (
          <div className="notice" role="status">
            <strong>Sample data mode:</strong> add the V2 CSV and Make webhook environment variables to display live workflow results.
          </div>
        )}

        <section className="metrics" aria-label="Dashboard summary">
          <MetricCard label="Completed answers" value={signals.length} detail="Source-evaluated practical results" />
          <MetricCard label="Average confidence" value={`${averageScore}/100`} detail="Across retained source matches" />
          <MetricCard label="Areas explored" value={topics.length} detail="Work, life and industry topics" />
          <MetricCard
            label="Newest answer"
            value={newestSignal ? formatDate(newestSignal.created_at) : "—"}
            detail={newestSignal?.request_type || "Waiting for the first result"}
          />
        </section>

        <section className="signals-section" id="signals">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Grounded answer feed</p>
              <h2>Practical AI answers</h2>
              <p>Search completed questions or raise the minimum source-confidence score.</p>
            </div>
            {meta?.fetched_at && <p className="sync-label">Updated {formatDate(meta.fetched_at)}</p>}
          </div>

          <div className="filters">
            <label>
              <span>Search</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Try webcomic, customer service, job search…"
              />
            </label>
            <label>
              <span>Area</span>
              <select value={topicFilter} onChange={(event) => setTopicFilter(event.target.value)}>
                <option value="all">All practical areas</option>
                {topics.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label>
              <span>Minimum confidence</span>
              <select value={minimumScore} onChange={(event) => setMinimumScore(Number(event.target.value))}>
                <option value={0}>Any score</option>
                <option value={45}>45 and above</option>
                <option value={75}>75 and above</option>
                <option value={85}>85 and above</option>
              </select>
            </label>
          </div>

          {loading && <div className="state-card">Loading practical AI answers…</div>}
          {error && (
            <div className="state-card error-card" role="alert">
              <h3>The dashboard could not load its V2 data.</h3>
              <p>{error}</p>
              <p>Confirm that <code>PUBLIC_SIGNALS_V2_CSV_URL</code> contains the published V2 signals CSV link.</p>
            </div>
          )}
          {!loading && !error && filteredSignals.length === 0 && (
            <div className="state-card">No answers match the current filters.</div>
          )}

          <div className="signal-grid">
            {filteredSignals.map((signal) => (
              <SignalCard key={signal.request_id} signal={signal} formatDate={formatDate} />
            ))}
          </div>
        </section>

        <section className="workflow-section" id="workflow">
          <div className="section-heading narrow-heading">
            <div>
              <p className="eyebrow">Behind the dashboard</p>
              <h2>How one question becomes a source-evaluated answer</h2>
            </div>
          </div>
          <div className="workflow-grid">
            {[
              ["01", "Ask", "The embedded form collects a practical area, help type, and plain-language question."],
              ["02", "Validate", "A Vercel Function validates the submission and privately calls the Make webhook."],
              ["03", "Search", "Make immediately sends the actual question to Tavily for ranked web results."],
              ["04", "Evaluate", "AI Toolkit rejects weak matches and returns a direct structured answer with confidence rules."],
              ["05", "Store", "Google Sheets records the answer and updates the request lifecycle through native Make Functions switches."],
              ["06", "Display", "The browser checks request status and displays the completed answer without a six-hour wait."]
            ].map(([number, title, description]) => (
              <article className="workflow-step" key={number}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
          <div className="disclosure">
            <h3>Project disclosure</h3>
            <p>
              This is an AI-assisted portfolio demonstration conceived, directed, configured,
              tested, and deployed as a practical automation project. Search excerpts and generated
              guidance should be reviewed before being treated as authoritative professional advice.
            </p>
          </div>
        </section>
      </main>

      <footer>
        <p>AI Signal Radar V2 · Practical, source-evaluated AI automation</p>
        <p>Vercel · Make · Tavily · Google Sheets · Make AI Toolkit · Zapier email</p>
      </footer>
    </div>
  );
}
