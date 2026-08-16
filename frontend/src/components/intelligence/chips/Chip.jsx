import "./Chip.css";

export default function Chip({
  children,
  color = "default",
}) {
  return (
    <span className={`intel-chip ${color}`}>
      {children}
    </span>
  );
}
