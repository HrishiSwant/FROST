import "./ThreatBadge.css";

const COLORS = {
  SAFE: "safe",
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
};

export default function ThreatBadge({ level = "UNKNOWN" }) {
  const type = COLORS[level?.toUpperCase()] || "unknown";

  return (
    <span className={`intel-threat-badge ${type}`}>
      {level}
    </span>
  );
}
