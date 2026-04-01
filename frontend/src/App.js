import { useState, useEffect } from "react";
import { ShieldCheck, Phone, ScanFace, Sun, Moon } from "lucide-react";

import Deepfake from "./pages/Deepfake";
import Fakenews from "./pages/Fakenews";
import AdminDashboard from "./pages/AdminDashboard";

const API_BASE =
  process.env.REACT_APP_API_URL ||
  "https://frost-7sn1.onrender.com";

function App() {
  const [currentView, setCurrentView] = useState("intro");
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    if (window.location.hash === "#admin") {
      setCurrentView("admin");
    }
  }, []);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.body.style.backgroundColor = "#020617";
      document.body.style.color = "#ffffff";
    } else {
      document.documentElement.classList.remove("dark");
      document.body.style.backgroundColor = "#f8fafc";
      document.body.style.color = "#0f172a";
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const navigate = (view) => setCurrentView(view);

  // ==================== INTRO ====================
  if (currentView === "intro") {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          theme === "dark"
            ? "bg-[#020617] text-white"
            : "bg-slate-50 text-slate-900"
        }`}
      >
        <div className="text-center">
          <h1 className="text-7xl font-bold mb-6">FROST</h1>
          <button
            onClick={() => navigate("dashboard")}
            className="px-12 py-6 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-3xl hover:scale-105 transition-all duration-200"
          >
            ENTER
          </button>
        </div>
      </div>
    );
  }

  // ==================== DASHBOARD ====================
  if (currentView === "dashboard") {
    return (
      <div
        className={`min-h-screen ${
          theme === "dark"
            ? "bg-[#020617] text-white"
            : "bg-slate-50 text-slate-900"
        }`}
      >
        <nav className="p-6 flex justify-between">
          <div className="text-2xl font-bold">FROST</div>

          <div className="flex gap-4">
            <button onClick={toggleTheme}>
              {theme === "dark" ? <Sun /> : <Moon />}
            </button>
            <button onClick={() => navigate("intro")}>← Home</button>
          </div>
        </nav>

        <div className="grid md:grid-cols-3 gap-6 p-10">
          <div
            onClick={() => navigate("fake-news")}
            className={`p-10 rounded-2xl cursor-pointer hover:scale-105 transition-all duration-200 ${
              theme === "dark"
                ? "glass bg-white/5 text-white"
                : "bg-white text-black shadow-lg"
            }`}
          >
            <ShieldCheck /> Fake News
          </div>

          <div
            onClick={() => navigate("phone")}
            className={`p-10 rounded-2xl cursor-pointer hover:scale-105 transition-all duration-200 ${
              theme === "dark"
                ? "glass bg-white/5 text-white"
                : "bg-white text-black shadow-lg"
            }`}
          >
            <Phone /> Phone Check
          </div>

          <div
            onClick={() => navigate("deepfake")}
            className={`p-10 rounded-2xl cursor-pointer hover:scale-105 transition-all duration-200 ${
              theme === "dark"
                ? "glass bg-white/5 text-white"
                : "bg-white text-black shadow-lg"
            }`}
          >
            <ScanFace /> Deepfake
          </div>
        </div>
      </div>
    );
  }

  if (currentView === "admin") return <AdminDashboard />;

  if (currentView === "phone")
    return (
      <PhoneView
        goBack={() => navigate("dashboard")}
        API_BASE={API_BASE}
        theme={theme}
      />
    );

  if (currentView === "deepfake")
    return (
      <Deepfake
        goBack={() => navigate("dashboard")}
        API_BASE={API_BASE}
        theme={theme}
      />
    );

  if (currentView === "fake-news")
    return (
      <Fakenews
        goBack={() => navigate("dashboard")}
        API_BASE={API_BASE}
        theme={theme}
      />
    );

  return null;
}

// ==================== PHONE VIEW ====================
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();

      // FIX: backend returns { success, data }
      setResult(data.data);
    } catch {
      setResult({ error: "Lookup failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen pt-20 px-6 ${
        theme === "dark"
          ? "bg-[#020617] text-white"
          : "bg-slate-50 text-slate-900"
      }`}
    >
      <div className="max-w-xl mx-auto">
        <button
          onClick={goBack}
          className="mb-6 hover:scale-105 transition-all duration-200"
        >
          ← Back
        </button>

        <div
          className={`p-10 rounded-3xl ${
            theme === "dark"
              ? "glass bg-white/5"
              : "bg-white shadow-lg"
          }`}
        >
          <h2 className="text-3xl mb-6">Caller Intelligence</h2>

          <input
            placeholder="Enter phone number"
            className={`w-full px-4 py-4 mb-6 rounded-xl ${
              theme === "dark"
                ? "bg-black/30 text-white placeholder-gray-400"
                : "bg-gray-100 text-black placeholder-gray-500"
            }`}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <button
            onClick={checkPhone}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl hover:scale-105 transition-all duration-200"
          >
            {loading ? "Checking..." : "Check"}
          </button>

          {loading && (
            <p className="text-center mt-4 text-purple-400">
              Checking number...
            </p>
          )}

          {result && !result.error && (
            <div className="mt-6 p-6 bg-white/5 rounded-xl">
              <p>📍 {result.location}</p>
              <p>📡 {result.carrier}</p>

              <p className="text-red-400 mt-3">
                Risk: {result.fraudScore}%
              </p>

              <p>{result.verdict}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
