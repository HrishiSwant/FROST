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
     AUTH HANDLERS
  ========================= */

  const handleLogin = async () => {
    setError("");

    const emailMsg = validateEmail(email);
    if (emailMsg) return setEmailError(emailMsg);

    const passwordMsg = validatePassword(password);
    if (passwordMsg) return setError(passwordMsg);

    try {
      const response = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        setLoggedInUser(data.user);
        setCurrentView("dashboard");
        setEmail("");
        setPassword("");
      } else {
        setError(data.error || "Login failed");
      }
    } catch {
      setError("Cannot connect to server.");
    }
  };

  const handleSignup = async () => {
    setError("");

    const nameMsg = validateName(name);
    if (nameMsg) return setError(nameMsg);

    const emailMsg = validateEmail(email);
    if (emailMsg) return setEmailError(emailMsg);

    const passwordMsg = validatePassword(password);
    if (passwordMsg) return setError(passwordMsg);

    try {
      const response = await fetch(`${API_BASE}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        setLoggedInUser(data.user);
        setCurrentView("dashboard");
        setName("");
        setEmail("");
        setPassword("");
      } else {
        setError(data.error || "Signup failed");
      }
    } catch {
      setError("Cannot connect to server.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setLoggedInUser(null);
    setCurrentView("login");
  };

  /* =========================
     FAKE NEWS VIEW
  ========================= */

  if (currentView === "fake-news") {
    return <Fakenews />;
  }

  /* =========================
     DASHBOARD
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

            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-300">
                {loggedInUser?.name}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-500 px-4 py-2 rounded-lg text-sm"
              >
                <LogOut className="inline w-4 h-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-6 py-10">
          <h2 className="text-3xl font-bold mb-2">Security Dashboard</h2>
          <p className="text-slate-400 mb-8">
            Detect fake news, identify scam callers, and analyze deepfake media.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
              <ShieldCheck className="w-8 h-8 text-indigo-400 mb-3" />
              <h3 className="text-lg font-semibold">Fake News Detection</h3>
              <p className="text-sm text-slate-400 mt-2">
                Analyze news text or URLs for authenticity.
              </p>
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
              <button disabled className="mt-4 w-full bg-slate-700 py-2 rounded-lg">
                Coming Soon
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl opacity-60">
              <ScanFace className="w-8 h-8 text-purple-400 mb-3" />
              <h3 className="text-lg font-semibold">Deepfake Detection</h3>
              <button disabled className="mt-4 w-full bg-slate-700 py-2 rounded-lg">
                Coming Soon
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* =========================
     LOGIN / SIGNUP
  ========================= */

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-900 p-8 rounded-2xl shadow-xl">
        <h2 className="text-2xl text-center text-white mb-6">
          {currentView === "login" ? "Welcome Back" : "Create Account"}
        </h2>

        {error && <div className="mb-4 text-xs text-red-400">{error}</div>}

        {currentView === "signup" && (
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full Name"
            className="w-full p-2 mb-4 rounded bg-slate-800 text-white"
          />
        )}

        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setEmailError(validateEmail(e.target.value));
          }}
          placeholder="Email"
          className="w-full p-2 mb-1 rounded bg-slate-800 text-white"
        />
        {emailError && (
          <p className="text-xs text-red-400 mb-3">{emailError}</p>
        )}

        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onPaste={handlePasswordPaste}
            autoComplete="new-password"
            placeholder="Password"
            className="w-full p-2 rounded bg-slate-800 text-white"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-2 text-xs text-indigo-300"
          >
            {showPassword ? "Hide" : "View"}
          </button>
        </div>

        <button
          onClick={currentView === "login" ? handleLogin : handleSignup}
          className="w-full bg-indigo-500 py-2 rounded text-white"
        >
          {currentView === "login" ? "Sign In" : "Create Account"}
        </button>

        <p
          className="mt-4 text-xs text-indigo-300 text-center cursor-pointer"
          onClick={() =>
            setCurrentView(currentView === "login" ? "signup" : "login")
          }
        >
          {currentView === "login"
            ? "Don't have an account? Sign up"
            : "Already have an account? Sign in"}
        </p>
      </div>
    </div>
  );
}

export default App;
