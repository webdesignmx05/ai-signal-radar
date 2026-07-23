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

export default function SignalCard({ signal, formatDate }) {
  const steps = Array.isArray(signal.action_steps) ? signal.action_steps : [];
  const sources = Array.isArray(signal.sources) ? signal.sources : [];

  return (
    <article className="signal-card">
      <div className="signal-card-topline">
        <span className="topic-pill">{signal.topic || "Practical AI"}</span>
        <span className={`score-pill ${scoreClass(signal.confidence_score)}`}>
          {signal.confidence_score}/100 confidence
        </span>
      </div>

      <div className="signal-heading">
        <p className="eyebrow">{matchLabel(signal.match_status)}</p>
        <h3>{signal.request_type || "Practical guidance"}</h3>
        <p className="published">Completed {formatDate(signal.created_at)}</p>
      </div>

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
    </article>
  );
}
