import "./SectionHeader.css";

export default function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}) {
  return (
    <div className="intel-section-header">
      <div className="intel-section-title">
        {Icon && (
          <div className="intel-section-icon">
            <Icon size={22} />
          </div>
        )}

        <div>
          <h2>{title}</h2>

          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}
