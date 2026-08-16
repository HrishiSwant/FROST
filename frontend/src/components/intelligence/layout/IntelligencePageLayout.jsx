import AppShell from "../../layouts/AppShell/AppShell";
import "./IntelligencePageLayout.css";

export default function IntelligencePageLayout({
  title,
  subtitle,
  children,
}) {
  return (
    <AppShell>
      <div className="intel-page">

        <header className="intel-header">

          <h1>{title}</h1>

          <p>{subtitle}</p>

        </header>

        {children}

      </div>
    </AppShell>
  );
}
