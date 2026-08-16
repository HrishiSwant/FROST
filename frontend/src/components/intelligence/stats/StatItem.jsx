import "./StatItem.css";

export default function StatItem({
  label,
  value,
}) {
  return (
    <div className="intel-stat">
      <div className="intel-stat-label">
        {label}
      </div>

      <div className="intel-stat-value">
        {value}
      </div>
    </div>
  );
}
