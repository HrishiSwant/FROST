import "./SectionCard.css";

export default function SectionCard({
  children,
  className = "",
}) {
  return (
    <section
      className={`intel-section-card ${className}`}
    >
      {children}
    </section>
  );
}
