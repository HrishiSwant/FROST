import { useState } from "react";
import Fakenews from "./pages/Fakenews";
import Deepfake from "./pages/Deepfake";
import { LogOut, ShieldCheck, Phone, ScanFace } from "lucide-react";

const API_BASE = "https://frost-7sn1.onrender.com";

function App() {
  const [currentView, setCurrentView] = useState("login");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loggedInUser, setLoggedInUser] = useState(null);

  // 📞 Phone Intelligence
  const [phone, setPhone] = useState("");
  const [phoneResult, setPhoneResult] = useState(null);

  /* =========================
     VALIDATION
  ========================= */

  const validateEmail = (value) => {
    if (!value.trim()) return "Email cannot be blank";
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(value)) return "Enter valid email";
    return "";
  };

  const validatePassword = (value) => {
    if (!value) return "Password cannot be blank";
    if (value.length < 6) return "Password too short";
    return "";
  };

  /* =========================
     AUTH API
  ========================= */

  const handleLogin = async () => {
    setError("");
    setEmailError("");

    const emailMsg = validateEmail(email);
    if (emailMsg) return setEmailError(emailMsg);

    const passwordMsg = validatePassword(password);
    if (passwordMsg) return setError(passwordMsg);

    try {
      const response = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await response.json();
      if (!response.ok) return setError(data.detail || "Login failed");

      localStorage.setItem("token", data.token);
      setLoggedInUser(data.user);
      setCurrentView("dashboard");
      setEmail("");
      setPassword("");
    } catch {
      setError("Server unreachable");
    }
  };

  const handleSignup = async () => {
    setError("");
    setEmailError("");

    const emailMsg = validateEmail(email);
    if (emailMsg) return setEmailError(emailMsg);

    const passwordMsg = validatePassword(password);
    if (passwordMsg) return setError(passwordMsg);

    try {
      const response = await fetch(`${API_BASE}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      if (!response.ok) return setError(data.detail || "Signup failed");

      localStorage.setItem("token", data.token);
      setLoggedInUser(data.user);
      setCurrentView("dashboard");
      setName("");
      setEmail("");
      setPassword("");
    } catch {
      setError("Server unreachable");
    }
  };

  /* =========================
     PHONE CHECK
  ========================= */

  const checkPhone = async () => {
    const res = await fetch(`${API_BASE}/api/phone/check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });

    const data = await res.json();
    setPhoneResult(data);
  };

  /* =========================
     PHONE PAGE
  ========================= */

  if (currentView === "phone") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="frost-card p-8 w-full max-w-xl">
          <h2 className="text-cyan-400 text-xl mb-4">Phone Intelligence</h2>

          <input
            placeholder="Enter phone number"
            className="w-full p-2 bg-slate-800 rounded mb-4"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <button
            onClick={checkPhone}
            className="w-full bg-cyan-500 py-2 rounded text-black font-bold"
          >
            Scan Number
          </button>

          {phoneResult && (
            <div className="mt-4 text-sm space-y-1">
              <p>Country: {phoneResult.country}</p>
              <p>Carrier: {phoneResult.carrier}</p>
              <p>Type: {phoneResult.type}</p>
              <p>Location: {phoneResult.location}</p>
              <p className="text-cyan-300">
                Fraud Risk: {phoneResult.fraudScore}%
              </p>
              <p className="font-bold">Verdict: {phoneResult.verdict}</p>
            </div>
          )}

          <button
            className="mt-4 text-cyan-300"
            onClick={() => setCurrentView("dashboard")}
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  /* =========================
     FAKE NEWS PAGE
  ========================= */

  if (currentView === "fake-news") {
    return <Fakenews />;
  }

  /* =========================
     DASHBOARD
  ========================= */

  if (currentView === "dashboard") {
    return (
      <div className="min-h-screen text-slate-50">
        <nav className="border-b border-cyan-400/30 px-6 py-4 flex justify-between">
          <div className="text-cyan-400 font-bold text-xl">FROST</div>
          <button className="bg-red-500 px-4 py-2 rounded">
            <LogOut className="inline w-4 h-4" /> Logout
          </button>
        </nav>

        <main className="max-w-6xl mx-auto p-6">
          <h2 className="text-2xl mb-6 text-cyan-300">Security Dashboard</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="frost-card p-6">
              <ShieldCheck className="text-cyan-400" />
              <button
                onClick={() => setCurrentView("fake-news")}
                className="w-full mt-4 bg-cyan-500 py-2 rounded text-black font-bold"
              >
                Fake News
              </button>
            </div>

            <div
              className="frost-card p-6 cursor-pointer hover:scale-105 transition"
              onClick={() => setCurrentView("phone")}
            >
              <Phone className="text-cyan-400" />
              <p className="mt-2 text-cyan-300">Caller ID</p>
            </div>

            <div className="frost-card p-6 opacity-50">
              <ScanFace />
              <p>Deepfake (soon)</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* =========================
     LOGIN
  ========================= */

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="frost-card p-8 w-full max-w-md">
        <h2 className="text-cyan-400 text-xl mb-4 font-bold">
          {currentView === "login" ? "Login" : "Sign Up"}
        </h2>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        {currentView === "signup" && (
          <input
            placeholder="Name"
            className="w-full p-2 mb-2 bg-slate-800 rounded"
            onChange={(e) => setName(e.target.value)}
          />
        )}

        <input
          placeholder="Email"
          className="w-full p-2 mb-2 bg-slate-800 rounded"
          onChange={(e) => {
            setEmail(e.target.value);
            setEmailError(validateEmail(e.target.value));
          }}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 mb-4 bg-slate-800 rounded"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={currentView === "login" ? handleLogin : handleSignup}
          className="w-full bg-cyan-500 py-2 rounded text-black font-bold"
        >
          {currentView === "login" ? "Login" : "Sign Up"}
        </button>
      </div>
    </div>
  );
}

export default App;
