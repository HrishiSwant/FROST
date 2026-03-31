// src/App.js
import { useState, useEffect } from "react";
import { ShieldCheck, Phone, ScanFace, Sun, Moon, Zap, ArrowLeft } from "lucide-react";

import Deepfake from "./pages/Deepfake";
import Fakenews from "./pages/Fakenews";

const API_BASE = process.env.REACT_APP_API_URL || "https://frost-7sn1.onrender.com";

function App() {
  const [currentView, setCurrentView] = useState("intro");
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
      document.body.style.backgroundColor = "#020617";
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      document.body.style.backgroundColor = "#f8fafc";
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === "dark" ? "light" : "dark");
  const navigate = (view) => setCurrentView(view);

  // Intro / Landing
  if (currentView === "intro") {
    return (
      <div className={`min-h-screen flex items-center justify-center relative overflow-hidden ${theme === "dark" ? "bg-[#020617]" : "bg-slate-50"}`}>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#22d3ee10_1px,transparent_1px),linear-gradient(to_bottom,#22d3ee10_1px,transparent_1px)] bg-[size:60px_60px]" />

        <div className="relative z-10 text-center px-6 max-w-5xl">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-28 h-28 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl">
                <Zap className="w-16 h-16 text-white" />
              </div>
              <div className="absolute inset-0 border border-cyan-400/50 rounded-3xl animate-ping" />
            </div>
          </div>

          <h1 className={`text-7xl md:text-8xl font-bold tracking-tighter mb-6 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
            FROST
          </h1>
          <p className={`text-4xl md:text-5xl font-light tracking-tight mb-8 ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>
            Defending Reality in Real Time
          </p>
          <p className={`text-xl max-w-xl mx-auto mb-12 ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
            Advanced AI-powered detection for deepfakes, fake news, and scam calls.
          </p>

          <button
            onClick={() => navigate("dashboard")}
            className="neon-button px-12 py-6 bg-gradient-to-r from-cyan-500 to-purple-600 text-black font-semibold text-2xl rounded-3xl hover:scale-105 transition-all shadow-xl"
          >
            Enter Command Center
          </button>
        </div>
      </div>
    );
  }

  // Dashboard
  if (currentView === "dashboard") {
    return (
      <div className={`min-h-screen ${theme === "dark" ? "bg-[#020617] text-white" : "bg-slate-50 text-slate-900"}`}>
        <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10 dark:border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold tracking-tighter text-cyan-400">FROST</div>
              <div className="text-xs uppercase tracking-widest text-slate-400">CYBER INTELLIGENCE</div>
            </div>

            <div className="flex items-center gap-6">
              <button onClick={toggleTheme} className="p-3 rounded-2xl hover:bg-white/10 transition">
                {theme === "dark" ? <Sun size={24} /> : <Moon size={24} />}
              </button>
              <button onClick={() => navigate("intro")} className="text-sm hover:text-cyan-400 transition">
                ← Home
              </button>
            </div>
          </div>
        </nav>

        <div className="pt-28 pb-20 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold tracking-tight mb-4">Security Command Center</h2>
            <p className="text-xl text-slate-400">Choose your intelligence tool</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { id: "fake-news", icon: ShieldCheck, title: "Fake News Detection", desc: "Analyze articles and URLs", color: "cyan" },
              { id: "phone", icon: Phone, title: "Caller Intelligence", desc: "Detect scam & fraud calls", color: "purple" },
              { id: "deepfake", icon: ScanFace, title: "Deepfake Detection", desc: "Verify image authenticity", color: "emerald" }
            ].map((tool) => (
              <div
                key={tool.id}
                onClick={() => navigate(tool.id)}
                className="glass rounded-3xl p-10 cursor-pointer hover:scale-105 transition-all group border border-transparent hover:border-cyan-400/30"
              >
                <tool.icon className={`w-16 h-16 mb-8 transition group-hover:scale-110 ${theme === "dark" ? `text-${tool.color}-400` : `text-${tool.color}-600`}`} />
                <h3 className="text-3xl font-semibold mb-4">{tool.title}</h3>
                <p className="text-slate-400 mb-10">{tool.desc}</p>
                <div className="text-sm tracking-widest text-cyan-400 group-hover:text-white">LAUNCH TOOL →</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Tool Pages
  if (currentView === "phone") return <PhoneView goBack={() => navigate("dashboard")} API_BASE={API_BASE} theme={theme} />;
  if (currentView === "deepfake") return <Deepfake goBack={() => navigate("dashboard")} API_BASE={API_BASE} theme={theme} />;
  if (currentView === "fake-news") return <Fakenews goBack={() => navigate("dashboard")} API_BASE={API_BASE} theme={theme} />;

  return null;
}

// Phone View Component
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
      setResult({ error: "Lookup failed. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen pt-20 pb-12 px-6 ${theme === "dark" ? "bg-[#020617]" : "bg-slate-50"}`}>
      <div className="max-w-xl mx-auto">
        <button onClick={goBack} className={`mb-8 flex items-center gap-2 ${theme === "dark" ? "text-cyan-400" : "text-cyan-600"}`}>
          ← Back to Dashboard
        </button>

        <div className="glass rounded-3xl p-12">
          <div className="flex items-center gap-4 mb-10">
            <Phone className={`w-12 h-12 ${theme === "dark" ? "text-purple-400" : "text-purple-600"}`} />
            <div>
              <h2 className={`text-4xl font-semibold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>Caller Intelligence</h2>
              <p className={theme === "dark" ? "text-slate-400" : "text-slate-600"}>Real-time scam detection</p>
            </div>
          </div>

          <input
            placeholder="+91 98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={`w-full p-5 rounded-2xl border text-lg mb-8 focus:outline-none ${theme === "dark" ? "bg-slate-900 border-slate-700" : "bg-white border-slate-300"}`}
          />

          <button
            onClick={checkPhone}
            disabled={loading}
            className="w-full py-6 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-2xl font-semibold text-xl text-black hover:brightness-110 disabled:opacity-70"
          >
            {loading ? "Scanning..." : "Check Number"}
          </button>

          {result && !result.error && (
            <div className="mt-10 space-y-6">
              <div className={`p-6 rounded-2xl ${theme === "dark" ? "bg-slate-900/70" : "bg-white border"}`}>
                <p className="text-sm text-slate-400">Carrier</p>
                <p className="text-2xl font-medium">{result.carrier}</p>
              </div>
              <div className={`p-6 rounded-2xl ${theme === "dark" ? "bg-slate-900/70" : "bg-white border"}`}>
                <p className="text-sm text-slate-400">Location</p>
                <p className="text-2xl font-medium">{result.location}</p>
              </div>
              <div className={`p-6 rounded-2xl ${theme === "dark" ? "bg-slate-900/70" : "bg-white border"}`}>
                <p className="text-sm text-slate-400">Fraud Risk</p>
                <p className={`text-4xl font-bold ${result.fraudScore > 50 ? "text-red-400" : "text-emerald-400"}`}>{result.fraudScore}%</p>
              </div>
              <div className="text-center">
                <span className={`text-3xl font-bold ${result.verdict === "HIGH RISK" ? "text-red-400" : "text-emerald-400"}`}>
                  {result.verdict}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
