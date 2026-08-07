import AppShell from "../../../components/layouts/AppShell/AppShell";
import ModuleGrid from "../components/ModuleGrid";
import DashboardHeader from "../components/DashboardHeader";
import StatsGrid from "../components/StatsGrid";
import QuickActions from "../components/QuickActions";

export default function DashboardPage() {
  return (
    <AppShell>
      <DashboardHeader />

      <StatsGrid />

      <QuickActions />
      <ModuleGrid />
    </AppShell>
  );
}
