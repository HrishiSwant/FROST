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
      document.body.className = "bg-[#020617] text-white";
    } else {
      document.body.className = "bg-slate-50 text-slate-900";
    }
  }, [theme]);

  const navigate = (view) => setCurrentView(view);

  // ==================== INTRO / LANDING ====================
  if (currentView === "intro") {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#020617]">
        {/* Animated Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#22d3ee10_1px,transparent_1px),linear-gradient(to_bottom,#22d3ee10_1px,transparent_1px)] bg-[size:50px_50px]" />
        
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 bg-cyan-500/10 rounded-full flex items-center justify-center border border-cyan-400/30 animate-pulse">
                <Zap className="w-14 h-14 text-cyan-400" />
              </div>
              <div className="absolute inset-0 border border-cyan-400/30 rounded-full animate-ping" />
            </div>
          </div>

          <h1 className="text-7xl md:text-8xl font-bold tracking-tighter mb-4 bg-gradient-to-r from-cyan-300 via-white to-purple-300 bg-clip-text text-transparent">
            FROST
          </h1>
          <p className="text-4xl md:text-5xl font-light tracking-tight text-slate-300 mb-6">
            Defending Reality
          </p>
          <p className="text-xl text-slate-400 max-w-md mx-auto mb-12">
            AI-Powered Deepfake • Fake News • Scam Detection Platform
          </p>

          <button
            onClick={() => navigate("dashboard")}
            className="group relative px-12 py-6 bg-gradient-to-r from-cyan-500 to-purple-600 text-black font-semibold text-2xl rounded-3xl overflow-hidden hover:scale-105 transition-all duration-300 neon-cyan"
          >
            ENTER COMMAND CENTER
            <div className="absolute inset-0 bg-white/30 translate-y-full group-hover:translate-y-0 transition-all duration-300" />
          </button>

          <p className="text-xs text-slate-500 mt-12 tracking-widest">POWERED BY ADVANCED AI • REAL-TIME INTELLIGENCE</p>
        </div>
      </div>
    );
  }

  // ==================== DASHBOARD ====================
  if (currentView === "dashboard") {
    return (
      <div className="min-h-screen bg-[#020617] text-white">
        {/* Navbar */}
        <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-cyan-400/20">
          <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold tracking-tighter text-cyan-400">FROST</div>
              <div className="text-[10px] uppercase tracking-[3px] text-cyan-400/70">CYBER INTELLIGENCE</div>
            </div>

            <div className="flex items-center gap-6">
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-3 hover:bg-white/10 rounded-2xl transition"
              >
                {theme === "dark" ? <Sun size={22} /> : <Moon size={22} />}
              </button>
              <button
                onClick={() => navigate("intro")}
                className="text-sm text-cyan-400 hover:text-white transition"
              >
                ← Home
              </button>
            </div>
          </div>
        </nav>

        <div className="pt-28 pb-20 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold tracking-tight mb-3">Security Command Center</h2>
            <p className="text-slate-400 text-lg">Select your intelligence tool</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Fake News Card */}
            <div
              onClick={() => navigate("fake-news")}
              className="glass rounded-3xl p-10 cursor-pointer hover:scale-[1.03] transition-all duration-300 group border border-transparent hover:border-cyan-400/50"
            >
              <ShieldCheck className="w-16 h-16 text-cyan-400 mb-8 group-hover:scale-110 transition" />
              <h3 className="text-3xl font-semibold mb-3">Fake News Detection</h3>
              <p className="text-slate-400">Analyze articles &amp; URLs with deep semantic intelligence</p>
              <div className="mt-10 text-cyan-400 text-sm tracking-widest group-hover:text-white">LAUNCH TOOL →</div>
            </div>

            {/* Phone Card */}
            <div
              onClick={() => navigate("phone")}
              className="glass rounded-3xl p-10 cursor-pointer hover:scale-[1.03] transition-all duration-300 group border border-transparent hover:border-purple-400/50"
            >
              <Phone className="w-16 h-16 text-purple-400 mb-8 group-hover:scale-110 transition" />
              <h3 className="text-3xl font-semibold mb-3">Caller Intelligence</h3>
              <p className="text-slate-400">Real-time scam &amp; fraud risk assessment</p>
              <div className="mt-10 text-purple-400 text-sm tracking-widest group-hover:text-white">LAUNCH TOOL →</div>
            </div>

            {/* Deepfake Card */}
            <div
              onClick={() => navigate("deepfake")}
              className="glass rounded-3xl p-10 cursor-pointer hover:scale-[1.03] transition-all duration-300 group border border-transparent hover:border-emerald-400/50"
            >
              <ScanFace className="w-16 h-16 text-emerald-400 mb-8 group-hover:scale-110 transition" />
              <h3 className="text-3xl font-semibold mb-3">Deepfake Detection</h3>
              <p className="text-slate-400">Upload images for instant authenticity verification</p>
              <div className="mt-10 text-emerald-400 text-sm tracking-widest group-hover:text-white">LAUNCH TOOL →</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== TOOL PAGES ====================
  if (currentView === "phone") {
    return <PhoneView goBack={() => navigate("dashboard")} API_BASE={API_BASE} />;
  }

  if (currentView === "deepfake") {
    return <Deepfake goBack={() => navigate("dashboard")} API_BASE={API_BASE} />;
  }

  if (currentView === "fake-news") {
    return <Fakenews goBack={() => navigate("dashboard")} API_BASE={API_BASE} />;
  }

  return null;
}

// ==================== PHONE VIEW COMPONENT ====================
function PhoneView({ goBack, API_BASE }) {
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkPhone = async () => {
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
    <div className="min-h-screen bg-[#020617] pt-20 pb-12 px-6">
      <div className="max-w-xl mx-auto">
        <button onClick={goBack} className="flex items-center gap-2 text-cyan-400 mb-8 hover:text-white">
          ← Back to Dashboard
        </button>

        <div className="glass rounded-3xl p-12">
          <div className="flex items-center gap-4 mb-10">
            <Phone className="w-12 h-12 text-purple-400" />
            <div>
              <h2 className="text-4xl font-semibold">Caller Intelligence</h2>
              <p className="text-slate-400">Global Scam Detection</p>
            </div>
          </div>

          <input
            placeholder="Enter phone number (e.g. +91 9876543210)"
            className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-6 py-5 text-lg focus:outline-none focus:border-purple-400 mb-8"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <button
            onClick={checkPhone}
            disabled={loading}
            className="w-full py-6 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-2xl font-semibold text-xl hover:brightness-110 transition disabled:opacity-70"
          >
            {loading ? "Scanning Networks..." : "Initiate Global Trace"}
          </button>

          {result && !result.error && (
            <div className="mt-10 space-y-6">
              <div className="bg-slate-900/70 p-6 rounded-2xl border border-slate-700">
                <p className="text-sm text-slate-400">Carrier</p>
                <p className="text-2xl font-medium">{result.carrier || "Unknown"}</p>
              </div>
              <div className="bg-slate-900/70 p-6 rounded-2xl border border-slate-700">
                <p className="text-sm text-slate-400">Location</p>
                <p className="text-2xl font-medium">{result.location || "Unknown"}</p>
              </div>
              <div className="bg-slate-900/70 p-6 rounded-2xl border border-slate-700">
                <p className="text-sm text-slate-400">Fraud Risk</p>
                <p className="text-4xl font-bold text-orange-400">{result.fraudScore || 0}%</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold text-emerald-400">{result.verdict}</p>
              </div>
            </div>
          )}

          {result?.error && <p className="mt-6 text-red-400 text-center">{result.error}</p>}
        </div>
      </div>
    </div>
  );
}

export default App;
