import { useState } from "react";

export default function PhoneIntelligencePage({
  goBack,
  API_BASE,
  theme,
}) {
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
      setResult(data);
    } catch {
      setResult({
        error: "Lookup failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen pt-20 px-6 ${
        theme === "dark" ? "bg-[#020617]" : "bg-slate-50"
      }`}
    >
      <div className="max-w-xl mx-auto">
        <button
          onClick={goBack}
          className="mb-8 flex items-center gap-2 text-cyan-400"
        >
          ← Back to Dashboard
        </button>

        <div className="glass rounded-3xl p-12">
          <h2
            className={`text-4xl font-semibold mb-2 ${
              theme === "dark" ? "text-white" : "text-slate-900"
            }`}
          >
            Caller Intelligence
          </h2>

          <p className="text-slate-400 mb-10">
            Real-time scam & fraud detection
          </p>

          <input
            placeholder="+91 98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={`w-full p-5 rounded-2xl text-lg mb-8 focus:outline-none ${
              theme === "dark"
                ? "bg-slate-900 border border-slate-700"
                : "bg-white border border-slate-300"
            }`}
          />

          <button
            onClick={checkPhone}
            disabled={loading}
            className="w-full py-6 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-2xl font-semibold text-xl text-black hover:brightness-110 disabled:opacity-70"
          >
            {loading ? "Scanning Networks..." : "Initiate Trace"}
          </button>

          {result && !result.error && (
            <div className="mt-10 space-y-6">
              <div
                className={`p-6 rounded-2xl ${
                  theme === "dark"
                    ? "bg-slate-900/70"
                    : "bg-white border"
                }`}
              >
                <p className="text-sm text-slate-400">Carrier</p>
                <p className="text-2xl font-medium">
                  {result.carrier || "Unknown"}
                </p>
              </div>

              <div
                className={`p-6 rounded-2xl ${
                  theme === "dark"
                    ? "bg-slate-900/70"
                    : "bg-white border"
                }`}
              >
                <p className="text-sm text-slate-400">Location</p>
                <p className="text-2xl font-medium">
                  {result.location || "Unknown"}
                </p>
              </div>

              <div
                className={`p-6 rounded-2xl ${
                  theme === "dark"
                    ? "bg-slate-900/70"
                    : "bg-white border"
                }`}
              >
                <p className="text-sm text-slate-400">Fraud Risk</p>

                <p
                  className={`text-4xl font-bold ${
                    result.fraudScore > 50
                      ? "text-red-400"
                      : "text-emerald-400"
                  }`}
                >
                  {result.fraudScore}%
                </p>
              </div>

              <div className="text-center">
                <span
                  className={`text-3xl font-bold ${
                    result.verdict === "HIGH RISK"
                      ? "text-red-400"
                      : "text-emerald-400"
                  }`}
                >
                  {result.verdict}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
