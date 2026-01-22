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
  const [phoneLoading, setPhoneLoading] = useState(false);

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
     AUTH
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

      setLoggedInUser(data.user);
      setCurrentView("dashboard");
      setName("");
      setEmail("");
      setPassword("");
    } catch {
      setError("Server unreachable");
    }
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    setCurrentView("login");
    setPhoneResult(null);
    setPhone("");
  };

  /* =========================
     PHONE CHECK
  ========================= */

  const checkPhone = async () => {
    setPhoneLoading(true);
    setPhoneResult(null);

    try {
      const res = await fetch(`${API_BASE}/api/phone/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Phone check failed");

      setPhoneResult(data);
    } catch (err) {
      setPhoneResult({ error: err.message });
    } finally {
      setPhoneLoading(false);
    }
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
            disabled={phoneLoading}
            className="w-full bg-cyan-500 py-2 rounded text-black font-bold"
          >
            {phoneLoading ? "Scanning..." : "Scan Number"}
          </button>

          {phoneResult?.error && (
            <p className="mt-4 text-red-400">{phoneResult.error}</p>
          )}

          {phoneResult && !phoneResult.error && (
            <div className="mt-4 text-sm space-y-1">
              <p>Country: {phoneResult.country}</p>
              <p>Carrier: {phoneResult.carrier}</p>
              <p>Type: {phoneResult.lineType}</p>
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
     FAKE NEWS
  ========================= */

  if (currentView === "fake-news") {
    return <Fakenews />;
  }

  /* =========================
     DEEPFAKE
  ========================= */

  if (currentView === "deepfake") {
    return <Deepfake />;
  }

  /* =========================
     DASHBOARD
  ========================= */

  if (currentView === "dashboard") {
    return (
      <div className="min-h-screen text-slate-50">
        <nav className="border-b border-cyan-400/30 px-6 py-4 flex justify-between">
          <div className="text-cyan-400 font-bold text-xl">FROST</div>
          <button
            onClick={handleLogout}
            className="bg-red-500 px-4 py-2 rounded"
          >
            <LogOut className="inline w-4 h-4" /> Logout
          </button>
        </nav>

        <main className="max-w-6xl mx-auto p-6">
          <h2 className="text-2xl mb-6 text-cyan-300">
            Security Dashboard
          </h2>

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

            <div
              className="frost-card p-6 cursor-pointer hover:scale-105 transition"
              onClick={() => setCurrentView("deepfake")}
            >
              <ScanFace className="text-cyan-400" />
              <p className="mt-2 text-cyan-300">Deepfake Detection</p>
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
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}

        <input
          placeholder="Email"
          className="w-full p-2 mb-2 bg-slate-800 rounded"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setEmailError(validateEmail(e.target.value));
          }}
        />
        {emailError && (
          <p className="text-red-400 text-sm">{emailError}</p>
        )}

        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 mb-4 bg-slate-800 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={currentView === "login" ? handleLogin : handleSignup}
          className="w-full bg-cyan-500 py-2 rounded text-black font-bold"
        >
          {currentView === "login" ? "Login" : "Sign Up"}
        </button>

        <p
          className="mt-4 text-cyan-300 text-sm cursor-pointer"
          onClick={() =>
            setCurrentView(currentView === "login" ? "signup" : "login")
          }
        >
          {currentView === "login"
            ? "Create an account"
            : "Already have an account?"}
        </p>
      </div>
    </div>
  );
}

export default App;
