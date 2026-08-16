import "./RiskProgress.css";

export default function RiskProgress({ score = 0 }) {
  const value = Math.max(0, Math.min(score, 100));

  return (
    <div className="intel-progress">
      <div className="intel-progress-bar">
        <div
          className="intel-progress-fill"
          style={{
            width: `${value}%`,
          }}
        />
      </div>

      <div className="intel-progress-value">
        {value}/100
      </div>
    </div>
  );
}
