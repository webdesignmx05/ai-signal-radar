export default function MetricCard({ label, value, detail }) {
  return (
    <article className="metric-card">
      <p className="metric-label">{label}</p>
      <strong className="metric-value">{value}</strong>
      <p className="metric-detail">{detail}</p>
    </article>
  );
}
