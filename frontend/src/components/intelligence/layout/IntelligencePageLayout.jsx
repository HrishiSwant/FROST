import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import AppShell from "../../layouts/AppShell/AppShell";
import "./IntelligencePageLayout.css";

export default function IntelligencePageLayout({
  title,
  subtitle,
  children,
}) {
  const navigate = useNavigate();

  return (
    <AppShell>
      <div className="intel-page">

        <button
          type="button"
          className="intel-back-button"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft size={18} />
          <span>Back to Dashboard</span>
        </button>

        <header className="intel-header">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </header>

        {children}

      </div>
    </AppShell>
  );
}
