import { ShieldCheck } from "lucide-react";
import "./EmptyState.css";

export default function EmptyState({
  title,
  description,
}) {
  return (
    <div className="intel-empty">

      <ShieldCheck size={56} />

      <h2>{title}</h2>

      <p>{description}</p>

    </div>
  );
}
