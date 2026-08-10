import { useNavigate } from "react-router-dom";
import { MessageCircle, ArrowLeft } from "lucide-react";

import AppShell from "../../../components/layouts/AppShell/AppShell";
import ModuleGrid from "../components/ModuleGrid";

export default function DashboardPage() {
  const navigate = useNavigate();

  return (
    <AppShell>
      {/* Back to Landing Page */}
      <button
        type="button"
        onClick={() => navigate("/")}
        className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </button>

      {/* Dashboard Modules */}
      <ModuleGrid />

      {/* FROST AI */}
      <button
        type="button"
        onClick={() => navigate("/chat")}
        aria-label="Open FROST AI"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-cyan-400/30 bg-gradient-to-br from-cyan-400 to-purple-600 text-slate-950 shadow-[0_0_30px_rgba(34,211,238,0.25)] transition duration-300 hover:scale-110 hover:shadow-[0_0_40px_rgba(34,211,238,0.4)]"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    </AppShell>
  );
}
