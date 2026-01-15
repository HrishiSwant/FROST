import { useState } from "react";
import Fakenews from "./pages/Fakenews";
import {
  LogOut,
  ShieldCheck,
  Phone,
  ScanFace
} from "lucide-react";

// 🔑 Backend base URL (Render)
const API_BASE = "https://frost-7sn1.onrender.com";

function App() {
  // 🔥 CHANGE IS HERE (login → fake-news)
  const [currentView, setCurrentView] = useState("login");

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loggedInUser, setLoggedInUser] = useState(null);

  /* =========================
     VALIDATION HELPERS
  ========================= */

  const handlePasswordPaste = (e) => {
    e.preventDefault();
    alert("Pasting password is not allowed.");
  };

  const validateEmail = (value) => {
    if (!value.trim()) return "Email cannot be blank";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return "Enter a valid email address";
    return "";
  };

  const validateName = (value) => {
    if (!value.trim()) return "Name cannot be blank";
    if (value.trim().length < 4) return "Name must be at least 4 characters";
    return "";
  };

  const validatePassword = (value) => {
    if (!value) return "Password cannot be blank";
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (!passwordRegex.test(value)) {
      return "Password must contain uppercase, lowercase, number & special character";
    }
    return "";
  };

  /* =========================
     AUTH HANDLERS (DISABLED FOR DEMO)
  ========================= */

  const handleLogin = async () => {};
  const handleSignup = async () => {};
  const handleLogout = () => {};

  /* =========================
     FAKE NEWS VIEW (DEFAULT)
  ========================= */

  if (currentView === "fake-news") {
    return <Fakenews />;
  }

  /* =========================
     DASHBOARD (KEPT FOR LATER)
  ========================= */

  if (currentView === "dashboard") {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50">
        <nav className="border-b border-slate-800 bg-slate-950/80 sticky top-0">
          <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
            <div>
              <h1 className="text-lg font-bold text-indigo-400">FROST</h1>
              <p className="text-xs text-slate-400">
                Fake Resistance & Online Security Technology
              </p>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-6 py-10">
          <h2 className="text-3xl font-bold mb-2">Security Dashboard</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
              <ShieldCheck className="w-8 h-8 text-indigo-400 mb-3" />
              <h3 className="text-lg font-semibold">Fake News Detection</h3>
              <button
                onClick={() => setCurrentView("fake-news")}
                className="mt-4 w-full bg-indigo-500 py-2 rounded-lg"
              >
                Start Analysis
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl opacity-60">
              <Phone className="w-8 h-8 text-emerald-400 mb-3" />
              <h3 className="text-lg font-semibold">Caller ID Protection</h3>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl opacity-60">
              <ScanFace className="w-8 h-8 text-purple-400 mb-3" />
              <h3 className="text-lg font-semibold">Deepfake Detection</h3>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return null;
}

export default App;
