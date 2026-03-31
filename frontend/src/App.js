import { useState, useEffect } from "react";
import { ShieldCheck, Phone, ScanFace, Sun, Moon, Zap } from "lucide-react";

import Deepfake from "./pages/Deepfake";
import Fakenews from "./pages/Fakenews";

const API_BASE =
  process.env.REACT_APP_API_URL ||
  "https://frost-7sn1.onrender.com";

function App() {
  const [currentView, setCurrentView] = useState("intro");
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
      document.body.style.backgroundColor = "#020617";
      document.body.style.color = "#ffffff";
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      document.body.style.backgroundColor = "#f8fafc";
      document.body.style.color = "#0f172a";
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === "dark" ? "light" : "dark");
  };

  const navigate = (view) => setCurrentView(view);

  // ==================== INTRO ====================
  if (currentView === "intro") {
    return (
      <div className={`min-h-screen flex items-center justify-center relative overflow-hidden transition-all duration-500
        ${theme === "dark" ? "bg-[#020617]" : "bg-slate-50"}`}>

        <div className="absolute inset-0 bg-[linear-gradient(to_right,#22d3ee10_1px,transparent_1px),linear-gradient(to_bottom,#22d3ee10_1px,transparent_1px)] bg-[size:50px_50px] opacity-30" />

        <div className="relative z-10 text-center px-6 max-w-4xl">
          <div className="flex justify-center mb-8">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center border transition-all duration-300
              ${theme === "dark" ? "bg-cyan-500/10 border-cyan-400/30" : "bg-cyan-600/10 border-cyan-500/30"} animate-pulse`}>
              <Zap className={`w-14 h-14 ${theme === "dark" ? "text-cyan-400" : "text-cyan-600"}`} />
            </div>
          </div>

          <h1 className={`text-7xl md:text-8xl font-bold tracking-tighter mb-4 transition-colors
            ${theme === "dark" 
              ? "bg-gradient-to-r from-cyan-300 via-white to-purple-300 bg-clip-text text-transparent" 
              : "text-slate-900"}`}>
            FROST
          </h1>

          <p className={`text-4xl md:text-5xl font-light tracking-tight mb-6 transition-colors
            ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>
            Defending Reality
          </p>

          <p className={`text-xl max-w-md mx-auto mb-12 transition-colors
            ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
            AI-Powered Deepfake • Fake News • Scam Detection Platform
          </p>

          <button
            onClick={() => navigate("dashboard")}
            className="group relative px-12 py-6 bg-gradient-to-r from-cyan-500 to-purple-600 text-black font-semibold text-2xl rounded-3xl overflow-hidden hover:scale-105 transition-all duration-300 shadow-xl"
          >
            ENTER COMMAND CENTER
            <div className="absolute inset-0 bg-white/30 translate-y-full group-hover:translate-y-0 transition-all duration-300" />
          </button>
        </div>
      </div>
    );
  }

  // ==================== DASHBOARD ====================
  if (currentView === "dashboard") {
    return (
      <div className={`min-h-screen transition-all duration-500
        ${theme === "dark" ? "bg-[#020617] text-white" : "bg-slate-50 text-slate-900"}`}>

        {/* Navbar */}
        <nav className={`fixed top-0 left-0 right-0 z-50 glass border-b transition-all
          ${theme === "dark" ? "border-cyan-400/20" : "border-slate-200"}`}>
          <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className={`text-3xl font-bold tracking-tighter ${theme === "dark" ? "text-cyan-400" : "text-cyan-600"}`}>
                FROST
              </div>
              <div className={`text-[10px] uppercase tracking-[3px] ${theme === "dark" ? "text-cyan-400/70" : "text-slate-500"}`}>
                CYBER INTELLIGENCE
              </div>
            </div>

            <div className="flex items-center gap-6">
              <button
                onClick={toggleTheme}
                className="p-3 rounded-2xl hover:bg-white/10 dark:hover:bg-white/10 hover:bg-slate-200 transition"
              >
                {theme === "dark" ? <Sun size={22} /> : <Moon size={22} />}
              </button>
              <button
                onClick={() => navigate("intro")}
                className={`text-sm transition ${theme === "dark" ? "text-cyan-400 hover:text-white" : "text-slate-600 hover:text-slate-900"}`}
              >
                ← Home
              </button>
            </div>
          </div>
        </nav>

        <div className="pt-28 pb-20 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-5xl font-bold tracking-tight mb-3 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
              Security Command Center
            </h2>
            <p className={`text-lg ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
              Select your intelligence tool
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { id: "fake-news", icon: ShieldCheck, title: "Fake News Detection", desc: "Analyze articles & URLs with deep semantic intelligence", color: "cyan" },
              { id: "phone", icon: Phone, title: "Caller Intelligence", desc: "Real-time scam & fraud risk assessment", color: "purple" },
              { id: "deepfake", icon: ScanFace, title: "Deepfake Detection", desc: "Upload images for instant authenticity verification", color: "emerald" }
            ].map((tool) => (
              <div
                key={tool.id}
                onClick={() => navigate(tool.id)}
                className={`glass rounded-3xl p-10 cursor-pointer hover:scale-[1.03] transition-all duration-300 group border
                  ${theme === "dark" 
                    ? `hover:border-${tool.color}-400/50` 
                    : `hover:border-${tool.color}-600/50`}`}
              >
                <tool.icon className={`w-16 h-16 mb-8 group-hover:scale-110 transition 
                  ${theme === "dark" ? `text-${tool.color}-400` : `text-${tool.color}-600`}`} />
                <h3 className={`text-3xl font-semibold mb-3 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                  {tool.title}
                </h3>
                <p className={`mb-10 ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
                  {tool.desc}
                </p>
                <div className={`text-sm tracking-widest group-hover:underline transition 
                  ${theme === "dark" ? `text-${tool.color}-400` : `text-${tool.color}-600`}`}>
                  LAUNCH TOOL →
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ==================== TOOL PAGES ====================
  if (currentView === "phone") {
    return <PhoneView goBack={() => navigate("dashboard")} API_BASE={API_BASE} theme={theme} />;
  }
  if (currentView === "deepfake") {
    return <Deepfake goBack={() => navigate("dashboard")} API_BASE={API_BASE} theme={theme} />;
  }
  if (currentView === "fake-news") {
    return <Fakenews goBack={() => navigate("dashboard")} API_BASE={API_BASE} theme={theme} />;
  }

  return null;
}

// PhoneView with proper light/dark text colors
function PhoneView({ goBack, API_BASE, theme }) {
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkPhone = async () => {
    if (!phone) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${API_BASE}/api/phone/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone })
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ error: "Lookup failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen pt-20 pb-12 px-6 transition-all duration-500
      ${theme === "dark" ? "bg-[#020617]" : "bg-slate-50"}`}>

      <div className="max-w-xl mx-auto">
        <button 
          onClick={goBack} 
          className={`flex items-center gap-2 mb-8 transition ${theme === "dark" ? "text-cyan-400 hover:text-white" : "text-cyan-600 hover:text-cyan-700"}`}
        >
          ← Back to Dashboard
        </button>

        <div className="glass rounded-3xl p-12">
          <div className="flex items-center gap-4 mb-10">
            <Phone className={`w-12 h-12 ${theme === "dark" ? "text-purple-400" : "text-purple-600"}`} />
            <div>
              <h2 className={`text-4xl font-semibold tracking-tight ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                Caller Intelligence
              </h2>
              <p className={theme === "dark" ? "text-slate-400" : "text-slate-600"}>Global Scam Detection</p>
            </div>
          </div>

          <input
            placeholder="Enter phone number (e.g. +91 9876543210)"
            className={`w-full border rounded-2xl px-6 py-5 text-lg focus:outline-none mb-8 transition-all
              ${theme === "dark" 
                ? "bg-slate-900 border-slate-700 focus:border-purple-400 text-white" 
                : "bg-white border-slate-300 focus:border-purple-500 text-slate-900"}`}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <button
            onClick={checkPhone}
            disabled={loading}
            className="w-full py-6 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-2xl font-semibold text-xl text-black hover:brightness-110 transition disabled:opacity-70"
          >
            {loading ? "Scanning Networks..." : "Initiate Global Trace"}
          </button>

          {result && !result.error && (
            <div className="mt-10 space-y-6">
              {["carrier", "location", "fraudScore", "verdict"].map((key, i) => (
                <div key={i} className={`p-6 rounded-2xl border transition-all
                  ${theme === "dark" ? "bg-slate-900/70 border-slate-700" : "bg-white border-slate-200"}`}>
                  <p className={`text-sm ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                    {key === "fraudScore" ? "Fraud Risk" : key.charAt(0).toUpperCase() + key.slice(1)}
                  </p>
                  <p className={`text-2xl font-medium ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                    {result[key] || "Unknown"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
