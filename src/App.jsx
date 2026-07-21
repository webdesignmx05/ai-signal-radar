import { useEffect, useMemo, useState } from "react";
import MetricCard from "./components/MetricCard.jsx";
import SignalCard from "./components/SignalCard.jsx";

const formUrl = import.meta.env.VITE_RESEARCH_FORM_URL || "";
const githubUrl = import.meta.env.VITE_GITHUB_URL || "";

function parseDate(value) {
  if (!value) return null;

  const compact = String(value).match(
    /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/
  );

  if (compact) {
    const [, year, month, day, hour, minute, second] = compact;
    return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`);
  }

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

export default function App() {
  const [signals, setSignals] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [topic, setTopic] = useState("all");
  const [minimumScore, setMinimumScore] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/signals", {
          signal: controller.signal,
          headers: { Accept: "application/json" }
        });

        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.detail || payload.error || "The data request failed.");
        }

        setSignals(Array.isArray(payload.signals) ? payload.signals : []);
        setMeta(payload.meta || null);
      } catch (loadError) {
        if (loadError.name !== "AbortError") {
          setError(loadError.message || "Unable to load signals.");
        }
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, []);

  const topics = useMemo(
    () => [...new Set(signals.map((signal) => signal.topic).filter(Boolean))].sort(),
    [signals]
  );

  const filteredSignals = useMemo(() => {
    const query = search.trim().toLowerCase();

    return signals.filter((signal) => {
      const matchesTopic = topic === "all" || signal.topic === topic;
      const matchesScore = Number(signal.relevance_score || 0) >= minimumScore;
      const searchable = [
        signal.topic,
        signal.business_question,
        signal.title,
        signal.category,
        signal.summary,
        signal.why_it_matters,
        signal.prototype_idea
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesTopic && matchesScore && (!query || searchable.includes(query));
    });
  }, [signals, search, topic, minimumScore]);

  const averageScore = signals.length
    ? Math.round(
        signals.reduce((total, signal) => total + Number(signal.relevance_score || 0), 0) /
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
          <a href="#signals">Signals</a>
          <a href="#workflow">How it works</a>
          {githubUrl && (
            <a href={githubUrl} target="_blank" rel="noreferrer">GitHub</a>
          )}
        </nav>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <p className="hero-kicker">Practical AI discovery, without the jargon</p>
            <h1>Explore how AI is showing up in real work and everyday life.</h1>
            <p className="hero-description">
              AI Signal Radar connects a plain-spoken question to a recent example,
              explains why it matters, and suggests a small project worth trying.
            </p>
            <div className="hero-actions">
              {formUrl ? (
                <a className="primary-button" href={formUrl} target="_blank" rel="noreferrer">
                  Ask a practical AI question
                </a>
              ) : (
                <a className="primary-button" href="#signals">Explore the signals</a>
              )}
              <a className="secondary-button" href="#workflow">See the workflow</a>
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

        {meta?.source === "sample" && (
          <div className="notice" role="status">
            <strong>Sample data mode:</strong> add your published Google Sheets CSV URL to
            <code>SHEET_CSV_URL</code> to display live workflow results.
          </div>
        )}

        <section className="metrics" aria-label="Dashboard summary">
          <MetricCard label="Completed signals" value={signals.length} detail="Practical examples collected" />
          <MetricCard label="Average usefulness" value={`${averageScore}/100`} detail="Across current results" />
          <MetricCard label="Areas explored" value={topics.length} detail="Work, life and industry topics" />
          <MetricCard
            label="Newest signal"
            value={newestSignal ? formatDate(newestSignal.created_at || newestSignal.published_at) : "—"}
            detail={newestSignal?.category || "Waiting for the first result"}
          />
        </section>

        <section className="signals-section" id="signals">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Live discovery feed</p>
              <h2>Practical AI signals</h2>
              <p>Search the examples, narrow the topic, or raise the minimum usefulness score.</p>
            </div>
            {meta?.fetched_at && (
              <p className="sync-label">Updated {formatDate(meta.fetched_at)}</p>
            )}
          </div>

          <div className="filters">
            <label>
              <span>Search</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Try customer service, music, job search…"
              />
            </label>
            <label>
              <span>Area</span>
              <select value={topic} onChange={(event) => setTopic(event.target.value)}>
                <option value="all">All practical areas</option>
                {topics.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Minimum usefulness</span>
              <select
                value={minimumScore}
                onChange={(event) => setMinimumScore(Number(event.target.value))}
              >
                <option value={0}>Any score</option>
                <option value={60}>60 and above</option>
                <option value={75}>75 and above</option>
                <option value={85}>85 and above</option>
              </select>
            </label>
          </div>

          {loading && <div className="state-card">Loading practical AI signals…</div>}

          {error && (
            <div className="state-card error-card" role="alert">
              <h3>The dashboard could not load its data.</h3>
              <p>{error}</p>
              <p>
                Confirm that <code>SHEET_CSV_URL</code> contains the published CSV link for
                the <code>Public_Signals</code> worksheet.
              </p>
            </div>
          )}

          {!loading && !error && filteredSignals.length === 0 && (
            <div className="state-card">
              No signals match the current filters. Try a broader search or lower score.
            </div>
          )}

          <div className="signal-grid">
            {filteredSignals.map((signal, index) => (
              <SignalCard
                key={`${signal.source_url}-${index}`}
                signal={signal}
                formatDate={formatDate}
              />
            ))}
          </div>
        </section>

        <section className="workflow-section" id="workflow">
          <div className="section-heading narrow-heading">
            <div>
              <p className="eyebrow">Behind the dashboard</p>
              <h2>How one question becomes a useful signal</h2>
            </div>
          </div>
          <div className="workflow-grid">
            {[
              ["01", "Ask", "A Zapier form collects a practical topic and a plain-language question."],
              ["02", "Queue", "Zapier writes the request to Google Sheets with a queued status."],
              ["03", "Research", "Make searches GDELT for recent real-world examples connected to AI."],
              ["04", "Explain", "AI Toolkit selects a relevant example and returns structured, beginner-friendly guidance."],
              ["05", "Store", "Make saves the signal and marks the original request completed."],
              ["06", "Share", "Zapier emails the completed result and Vercel displays it here."]
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
              This is an AI-assisted portfolio simulation conceived, directed, configured,
              tested, and deployed as a practical automation demonstration. External article
              results and AI-generated explanations should be reviewed before being treated as
              authoritative guidance.
            </p>
          </div>
        </section>
      </main>

      <footer>
        <p>AI Signal Radar · Practical AI automation portfolio project</p>
        <p>Zapier · Google Sheets · Make · GDELT · React · Vercel</p>
      </footer>
    </div>
  );
}
