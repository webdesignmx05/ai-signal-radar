function scoreClass(score) {
  if (score >= 85) return "score-high";
  if (score >= 65) return "score-medium";
  return "score-low";
}

export default function SignalCard({ signal, formatDate }) {
  return (
    <article className="signal-card">
      <div className="signal-card-topline">
        <span className="topic-pill">{signal.topic || "Practical AI"}</span>
        <span className={`score-pill ${scoreClass(signal.relevance_score)}`}>
          {signal.relevance_score}/100 useful
        </span>
      </div>

      <div className="signal-heading">
        <p className="eyebrow">{signal.category || "AI in practice"}</p>
        <h3>{signal.title}</h3>
        <p className="published">Published {formatDate(signal.published_at)}</p>
      </div>

      <section className="question-panel">
        <span>Question explored</span>
        <p>{signal.business_question || "No question was supplied."}</p>
      </section>

      <div className="signal-copy">
        <section>
          <h4>What it means</h4>
          <p>{signal.summary}</p>
        </section>
        <section>
          <h4>Why you might care</h4>
          <p>{signal.why_it_matters}</p>
        </section>
        <section className="idea-panel">
          <h4>Try this small project</h4>
          <p>{signal.prototype_idea}</p>
        </section>
        <section className="risk-panel">
          <h4>Keep in mind</h4>
          <p>{signal.risk_note}</p>
        </section>
      </div>

      <a
        className="source-link"
        href={signal.source_url}
        target="_blank"
        rel="noreferrer"
      >
        View the original source <span aria-hidden="true">↗</span>
      </a>
    </article>
  );
}
