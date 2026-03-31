import { useState, useEffect } from "react";
import { ShieldCheck, Phone, ScanFace, Sun, Moon, Zap } from "lucide-react";

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

        <nav className="fixed top-0 left-0 right-0 z-50 glass border-b">
          <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">

            <div className="text-3xl font-bold">FROST</div>

            <div className="flex gap-4">
              <button onClick={toggleTheme}>
                {theme === "dark" ? <Sun /> : <Moon />}
              </button>
              <button onClick={() => navigate("intro")}>← Home</button>
            </div>
          </div>
        </nav>

        <div className="pt-28 px-6 max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          <div onClick={() => navigate("fake-news")} className="glass p-10 cursor-pointer">
            <ShieldCheck /> Fake News
          </div>

          <div onClick={() => navigate("phone")} className="glass p-10 cursor-pointer">
            <Phone /> Phone Check
          </div>

          <div onClick={() => navigate("deepfake")} className="glass p-10 cursor-pointer">
            <ScanFace /> Deepfake
          </div>
        </div>
      </div>
    );
  }

  if (currentView === "admin") return <AdminDashboard />;
  if (currentView === "phone") return <PhoneView goBack={() => navigate("dashboard")} API_BASE={API_BASE} />;
  if (currentView === "deepfake") return <Deepfake goBack={() => navigate("dashboard")} API_BASE={API_BASE} />;
  if (currentView === "fake-news") return <Fakenews goBack={() => navigate("dashboard")} API_BASE={API_BASE} />;

  return null;
}

// ✅ FIXED MISSING COMPONENT
function PhoneView({ goBack, API_BASE }) {
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState(null);

  const check = async () => {
    const res = await fetch(`${API_BASE}/api/phone/check`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ phone })
    });
    setResult(await res.json());
  };

  return (
    <div className="p-10">
      <button onClick={goBack}>← Back</button>

      <input value={phone} onChange={(e)=>setPhone(e.target.value)} />

      <button onClick={check}>Check</button>

      {result && <pre>{JSON.stringify(result,null,2)}</pre>}
    </div>
  );
}

export default App;
