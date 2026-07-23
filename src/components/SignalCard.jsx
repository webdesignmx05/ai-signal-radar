import { useEffect, useMemo, useRef, useState } from "react";

function scoreClass(score) {
  if (score >= 80) return "score-high";
  if (score >= 55) return "score-medium";
  return "score-low";
}

function matchLabel(value) {
  if (value === "strong_match") return "Strong source match";
  if (value === "partial_match") return "Partial source match";
  if (value === "insufficient_sources") return "Limited source support";
  return "Source match not rated";
}

function cleanStepText(value) {
  return String(value ?? "")
    .replace(/^\s*(?:step\s*)?\d+\s*[.):-]\s*/i, "")
    .trim();
}

function safeCardId(value) {
  const safeValue = String(value || "signal").replace(/[^a-zA-Z0-9_-]/g, "-");
  return `answer-${safeValue}`;
}

function copyText(value) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(value);

  const field = document.createElement("textarea");
  field.value = value;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.opacity = "0";
  document.body.appendChild(field);
  field.select();
  document.execCommand("copy");
  field.remove();
  return Promise.resolve();
}

export default function SignalCard({ signal, formatDate }) {
  const steps = Array.isArray(signal.action_steps) ? signal.action_steps : [];
  const sources = Array.isArray(signal.sources) ? signal.sources : [];
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef(null);
  const cardId = useMemo(() => safeCardId(signal.request_id), [signal.request_id]);
  const answerPreview = String(signal.direct_answer || "").trim();

  useEffect(() => {
    function openFromHash() {
      const activeHash = decodeURIComponent(window.location.hash.replace(/^#/, ""));
      if (activeHash !== cardId) return;

      setExpanded(true);
      window.requestAnimationFrame(() => {
        cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }

    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, [cardId]);

  function toggleExpanded() {
    const nextExpanded = !expanded;
    setExpanded(nextExpanded);

    if (nextExpanded) {
      window.history.replaceState(null, "", `#${cardId}`);
    } else if (window.location.hash === `#${cardId}`) {
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    }
  }

  async function copyDirectLink() {
    const url = new URL(window.location.href);
    url.hash = cardId;
    await copyText(url.toString());
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  function printCard() {
    setExpanded(true);

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const card = cardRef.current;
        if (!card) return;

        card.classList.add("print-target");
        const cleanup = () => card.classList.remove("print-target");
        window.addEventListener("afterprint", cleanup, { once: true });
        window.print();
      });
    });
  }

  return (
    <article
      className="signal-card"
      id={cardId}
      ref={cardRef}
      data-expanded={expanded ? "true" : "false"}
    >
      <div className="signal-card-summary">
        <div className="signal-card-topline">
          <span className="topic-pill">{signal.topic || "Practical AI"}</span>
          <span className={`score-pill ${scoreClass(signal.confidence_score)}`}>
            {signal.confidence_score}/100 confidence
          </span>
        </div>

        <div className="signal-summary-layout">
          <div className="signal-heading">
            <p className="eyebrow">{matchLabel(signal.match_status)}</p>
            <h3>{signal.request_type || "Practical guidance"}</h3>
            <p className="published">Completed {formatDate(signal.created_at)}</p>
          </div>

          <div className="card-actions no-print" aria-label="Answer controls">
            <button
              type="button"
              className="card-action card-action-primary"
              onClick={toggleExpanded}
              aria-expanded={expanded}
              aria-controls={`${cardId}-body`}
            >
              <span aria-hidden="true">{expanded ? "−" : "+"}</span>
              {expanded ? "Collapse" : "View answer"}
            </button>
            <button type="button" className="card-action" onClick={copyDirectLink}>
              <span aria-hidden="true">↗</span>
              {copied ? "Link copied" : "Copy link"}
            </button>
            <button type="button" className="card-action icon-print" onClick={printCard}>
              <span aria-hidden="true">⎙</span>
              Print
            </button>
          </div>
        </div>

        <div className="signal-summary-question">
          <span>Question explored</span>
          <p>{signal.business_question || "No question was supplied."}</p>
        </div>

        {!expanded && answerPreview && (
          <p className="answer-preview">{answerPreview}</p>
        )}
      </div>

      {expanded && (
        <div className="signal-card-body" id={`${cardId}-body`}>
          <section className="question-panel">
            <span>Question explored</span>
            <p>{signal.business_question || "No question was supplied."}</p>
          </section>

          <div className="signal-copy">
            <section>
              <h4>Practical answer</h4>
              <p>{signal.direct_answer}</p>
            </section>

            {steps.length > 0 && (
              <section>
                <h4>Recommended steps</h4>
                <ol className="action-steps">
                  {steps.map((step, index) => (
                    <li key={`${signal.request_id || "signal"}-${index}`}>
                      {cleanStepText(step)}
                    </li>
                  ))}
                </ol>
              </section>
            )}

            <section className="idea-panel">
              <h4>Quick win</h4>
              <p>{signal.quick_win}</p>
            </section>

            <section>
              <h4>Monetization or implementation note</h4>
              <p>{signal.monetization_note}</p>
            </section>

            <section>
              <h4>Where AI could assist</h4>
              <p>{signal.ai_opportunity}</p>
            </section>

            <section className="risk-panel">
              <h4>Keep in mind</h4>
              <p>{signal.risk_note}</p>
            </section>
          </div>

          <section className="sources-panel">
            <h4>Sources used</h4>
            {sources.length ? (
              <ul>
                {sources.map((source, index) => (
                  <li key={`${source.url}-${index}`}>
                    <a href={source.url} target="_blank" rel="noreferrer">
                      {source.title} <span aria-hidden="true">↗</span>
                    </a>
                    {Number.isFinite(source.relevance_score) && (
                      <span>{Math.round(source.relevance_score * 100)}% search relevance</span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No sufficiently relevant sources were retained.</p>
            )}
          </section>
        </div>
      )}
    </article>
  );
}
