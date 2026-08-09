import AppShell from "../../../components/layouts/AppShell/AppShell";
import ModuleGrid from "../components/ModuleGrid";
import StatsGrid from "../components/StatsGrid";

export default function DashboardPage() {
  return (
    <AppShell>
      <StatsGrid />

      <ModuleGrid />
    </AppShell>
  );
}
