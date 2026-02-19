import { useState } from "react";
import { ShieldCheck, Phone, ScanFace } from "lucide-react";

import Deepfake from "./pages/Deepfake";
import Fakenews from "./pages/Fakenews";

const API_BASE =
  process.env.REACT_APP_API_URL ||
  "https://frost-7sn1.onrender.com";

function App() {

  const [currentView, setCurrentView] = useState("intro");

  const [phone, setPhone] = useState("");
  const [phoneResult, setPhoneResult] = useState(null);
  const [phoneLoading, setPhoneLoading] = useState(false);

  // ---------------- INTRO PAGE ----------------

  if (currentView === "intro") {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">

        <div className="frost-card p-10 max-w-xl">

          <h1 className="text-4xl text-cyan-400 mb-4 font-bold">
            FROST Cyber Security Platform
          </h1>

          <p className="text-slate-300 mb-6">
            Detect Fake News, Verify Phone Numbers, and Identify Deepfake Images using AI-powered cybersecurity tools.
          </p>

          <button
            onClick={() => setCurrentView("dashboard")}
            className="bg-cyan-500 px-6 py-3 rounded text-black font-bold"
          >
            Get Started
          </button>

        </div>

      </div>
    );
  }

  // ---------------- PHONE PAGE ----------------

  if (currentView === "phone") {

    const checkPhone = async () => {

      setPhoneLoading(true);
      setPhoneResult(null);

      try {

        const res = await fetch(`${API_BASE}/api/phone/check`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ phone })
        });

        const data = await res.json();

        if (!res.ok)
          throw new Error(data.detail);

        setPhoneResult(data);

      } catch (err) {

        setPhoneResult({
          error: err.message
        });

      } finally {

        setPhoneLoading(false);

      }
    };

    return (

      <div className="min-h-screen flex items-center justify-center">

        <div className="frost-card p-8 w-full max-w-xl">

          <h2 className="text-cyan-400 text-xl mb-4">
            Phone Intelligence
          </h2>

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
            {phoneLoading ? "Scanning..." : "Scan Number"}
          </button>

          {phoneResult?.error &&
            <p className="mt-4 text-red-400">
              {phoneResult.error}
            </p>
          }

          {phoneResult && !phoneResult.error &&
            <div className="mt-4 space-y-1">

              <p>Country: {phoneResult.country}</p>
              <p>Carrier: {phoneResult.carrier}</p>
              <p>Type: {phoneResult.lineType}</p>
              <p>Location: {phoneResult.location}</p>

              <p className="text-cyan-300">
                Fraud Risk: {phoneResult.fraudScore}%
              </p>

              <p className="font-bold">
                Verdict: {phoneResult.verdict}
              </p>

            </div>
          }

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

// ---------------- OTHER ----------------
if (currentView === "deepfake")
  return <Deepfake goBack={() => setCurrentView("dashboard")} />;

if (currentView === "fake-news")
  return <Fakenews goBack={() => setCurrentView("dashboard")} />;
  // ---------------- DASHBOARD ----------------

  if (currentView === "dashboard") {

    return (

      <div className="min-h-screen text-slate-50">

        <nav className="border-b border-cyan-400/20 px-6 py-4 flex justify-between">

          <div className="text-cyan-400 font-bold text-xl">
            FROST
          </div>

          <button
            onClick={() => setCurrentView("intro")}
            className="text-cyan-300"
          >
            Home
          </button>

        </nav>

        <main className="max-w-6xl mx-auto p-6">

          <h2 className="text-2xl mb-6 text-cyan-300">
            Security Dashboard
          </h2>

          <div className="grid md:grid-cols-3 gap-6">

            <div
  className="frost-card p-6 cursor-pointer hover:scale-105 transition"
  onClick={() => setCurrentView("fake-news")}
>

              <ShieldCheck className="text-cyan-400" />

              <p className="mt-2 text-cyan-300">
                Fake News Detection
              </p>

            </div>

            <div
              className="frost-card p-6 cursor-pointer"
              onClick={() => setCurrentView("phone")}
            >

              <Phone className="text-cyan-400" />

              <p className="mt-2 text-cyan-300">
                Caller ID
              </p>

            </div>

            <div
  className="frost-card p-6 cursor-pointer hover:scale-105 transition"
  onClick={() => setCurrentView("deepfake")}
>

              <ScanFace className="text-cyan-400" />

              <p className="mt-2 text-cyan-300">
                Deepfake Detection
              </p>

            </div>

          </div>

        </main>

      </div>
    );
  }

  return null;
}

export default App;
