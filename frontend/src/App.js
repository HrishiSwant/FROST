import { useState, useEffect } from "react";
import Fakenews from "./pages/Fakenews";
import Deepfake from "./pages/Deepfake";
import { ShieldCheck, Phone, ScanFace } from "lucide-react";

// ✅ Use environment variable with fallback
const API_BASE = process.env.REACT_APP_API_URL || "https://frost-7sn1.onrender.com";

console.log("API_BASE:", API_BASE); // Debug log

function App() {
  const [currentView, setCurrentView] = useState("login");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [phone, setPhone] = useState("");
  const [phoneResult, setPhoneResult] = useState(null);
  const [phoneLoading, setPhoneLoading] = useState(false);

  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "cyber"
  );
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // ✅ Check backend health on mount
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch(`${API_BASE}/health`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        
        if (response.ok) {
          console.log("✅ Backend is reachable");
        } else {
          console.warn("⚠️ Backend returned non-200 status");
        }
      } catch (err) {
        console.error("❌ Backend unreachable:", err.message);
        setError("Cannot connect to server. Please try again later.");
      }
    };
    
    checkBackend();
  }, []);

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

  const handleLogin = async () => {
    setError("");
    setEmailError("");
    setLoading(true);

    const emailMsg = validateEmail(email);
    if (emailMsg) {
      setEmailError(emailMsg);
      setLoading(false);
      return;
    }

    const passwordMsg = validatePassword(password);
    if (passwordMsg) {
      setError(passwordMsg);
      setLoading(false);
      return;
    }

    try {
      console.log("Attempting login to:", `${API_BASE}/api/login`);
      
      const res = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        setError(data.detail || "Login failed");
        setLoading(false);
        return;
      }

      console.log("✅ Login successful");
      
      // Store token if needed
      if (data.access_token) {
        localStorage.setItem("auth_token", data.access_token);
      }

      setCurrentView("dashboard");
      setEmail("");
      setPassword("");
      
    } catch (err) {
      console.error("Login error:", err);
      setError("Server unreachable. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    setError("");
    setEmailError("");
    setLoading(true);

    const emailMsg = validateEmail(email);
    if (emailMsg) {
      setEmailError(emailMsg);
      setLoading(false);
      return;
    }

    const passwordMsg = validatePassword(password);
    if (passwordMsg) {
      setError(passwordMsg);
      setLoading(false);
      return;
    }

    if (!name.trim()) {
      setError("Name is required");
      setLoading(false);
      return;
    }

    try {
      console.log("Attempting signup to:", `${API_BASE}/api/signup`);
      
      const res = await fetch(`${API_BASE}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        setError(data.detail || "Signup failed");
        setLoading(false);
        return;
      }

      console.log("✅ Signup successful");
      alert("Verification email sent! Please check your inbox.");
      
      setCurrentView("login");
      setName("");
      setEmail("");
      setPassword("");
      
    } catch (err) {
      console.error("Signup error:", err);
      setError("Server unreachable. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    setCurrentView("login");
    setPhone("");
    setPhoneResult(null);
    setMenuOpen(false);
  };

  const checkPhone = async () => {
    setPhoneLoading(true);
    setPhoneResult(null);

    const token = localStorage.getItem("auth_token");
    if (!token) {
      setPhoneResult({ error: "Please login again" });
      setPhoneLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/phone/check`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
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

  if (currentView === "fake-news") return <Fakenews />;
  if (currentView === "deepfake") return <Deepfake />;

  if (currentView === "dashboard") {
    return (
      <div className="min-h-screen text-slate-50">
        <nav className="border-b border-cyan-400/20 px-6 py-4 flex justify-between items-center">
          <div className="text-cyan-400 font-bold text-xl">FROST</div>

          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-2xl text-cyan-300"
            >
              ⋮
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 frost-card p-3 z-50">
                <p className="text-sm mb-2 text-cyan-300">{email || "User"}</p>

                <button
                  onClick={() => setTheme("cyber")}
                  className="block w-full text-left py-1 hover:text-cyan-400"
                >
                  Cyber Theme
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className="block w-full text-left py-1 hover:text-cyan-400"
                >
                  Dark Theme
                </button>
                <button
                  onClick={() => setTheme("light")}
                  className="block w-full text-left py-1 hover:text-cyan-400"
                >
                  Light Theme
                </button>

                <hr className="my-2 opacity-20" />

                <button
                  onClick={handleLogout}
                  className="w-full text-left text-red-400 hover:text-red-500"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
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

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="frost-card p-8 w-full max-w-md">
        <h2 className="text-cyan-400 text-xl mb-4 font-bold">
          {currentView === "login" ? "Login" : "Sign Up"}
        </h2>

        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

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
          <p className="text-red-400 text-sm mb-2">{emailError}</p>
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
          disabled={loading}
          className="w-full bg-cyan-500 py-2 rounded text-black font-bold disabled:opacity-50"
        >
          {loading 
            ? "Please wait..." 
            : currentView === "login" 
            ? "Login" 
            : "Sign Up"}
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
