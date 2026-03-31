import { useState, useEffect } from "react";
import { ShieldCheck, Phone, ScanFace, Sun, Moon, Zap } from "lucide-react";

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

  const colorMap = {
    cyan: "text-cyan-400",
    purple: "text-purple-400",
    emerald: "text-emerald-400"
  };

  // Intro Page
  if (currentView === "intro") {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === "dark" ? "bg-[#020617]" : "bg-slate-50"}`}>
        <div className="text-center px-6 max-w-5xl">
          <div className="flex justify-center mb-8">
            <div className="w-28 h-28 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl">
              <Zap className="w-16 h-16 text-white" />
            </div>
          </div>

          <h1 className={`text-7xl font-bold mb-6 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
            FROST
          </h1>
          <p className="text-xl mb-10">Defending Reality in Real Time</p>

          <button
            onClick={() => navigate("dashboard")}
            className="px-10 py-5 bg-gradient-to-r from-cyan-500 to-purple-600 text-black text-xl rounded-2xl"
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
        <nav className="flex justify-between p-6">
          <h1 className="text-2xl font-bold text-cyan-400">FROST</h1>
          <button onClick={toggleTheme}>
            {theme === "dark" ? <Sun /> : <Moon />}
          </button>
        </nav>

        <div className="grid md:grid-cols-3 gap-6 p-6">
          {[
            { id: "fake-news", icon: ShieldCheck, title: "Fake News", color: "cyan" },
            { id: "phone", icon: Phone, title: "Caller Intelligence", color: "purple" },
            { id: "deepfake", icon: ScanFace, title: "Deepfake Detection", color: "emerald" }
          ].map((tool) => (
            <div
              key={tool.id}
              onClick={() => navigate(tool.id)}
              className="p-6 bg-slate-800 rounded-xl cursor-pointer hover:scale-105"
            >
              <tool.icon className={`w-12 h-12 ${colorMap[tool.color]}`} />
              <h3 className="text-xl mt-4">{tool.title}</h3>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (currentView === "phone") return <PhoneView goBack={() => navigate("dashboard")} />;
  if (currentView === "deepfake") return <Deepfake goBack={() => navigate("dashboard")} />;
  if (currentView === "fake-news") return <Fakenews goBack={() => navigate("dashboard")} />;

  return null;
}

// Phone View
function PhoneView({ goBack }) {
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkPhone = async () => {
    if (!phone.match(/^\+?[0-9]{10,15}$/)) {
      alert("Enter valid phone number");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`${API_BASE}/phone-check`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ number: phone })
      });

      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ error: "API failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <button onClick={goBack}>← Back</button>

      <h2 className="text-2xl mb-4">Caller Intelligence</h2>

      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="+91XXXXXXXXXX"
        className="border p-3 w-full mb-4"
      />

      <button onClick={checkPhone} className="bg-blue-500 text-white p-3 w-full">
        {loading ? "Scanning..." : "Check"}
      </button>

      {loading && <p className="mt-4">Analyzing...</p>}

      {result && !result.error && (
        <div className="mt-6">
          <p>Carrier: {result.carrier}</p>
          <p>Location: {result.location}</p>
          <p>Risk: {result.fraudScore}%</p>
          <p>{result.verdict}</p>
        </div>
      )}

      {result?.error && <p className="text-red-500">{result.error}</p>}
    </div>
  );
}

export default App;
