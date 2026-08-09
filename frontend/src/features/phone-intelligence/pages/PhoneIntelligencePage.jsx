import { useState } from "react";
import { ArrowLeft, Phone, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_BASE = "https://frost-7sn1.onrender.com";

export default function PhoneIntelligencePage() {
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkPhone = async () => {
    if (!phone.trim() || loading) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`${API_BASE}/api/phone/check`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: phone.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setResult({
          error: data?.error || "Phone lookup failed",
        });
        return;
      }

      setResult(data);
    } catch (error) {
      setResult({
        error:
          error?.message ||
          "Failed to connect to FROST server.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#020617] px-6 py-12 text-white">
      <div className="mx-auto max-w-4xl">

        {/* Back */}
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-10 flex items-center gap-2 text-slate-400 transition hover:text-white"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="mb-10 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10">
            <Phone className="h-7 w-7 text-purple-400" />
          </div>

          <div>
            <h1 className="text-4xl font-bold">
              Caller Intelligence
            </h1>

            <p className="mt-2 text-slate-400">
              Real-time scam & fraud detection
            </p>
          </div>
        </div>

        {/* Main Card */}
        <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-8 shadow-2xl sm:p-12">

          <div className="mb-8 flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-cyan-400" />

            <div>
              <h2 className="text-xl font-semibold">
                Phone Number Analysis
              </h2>

              <p className="text-sm text-slate-500">
                Enter a phone number to analyze its risk.
              </p>
            </div>
          </div>

          {/* Input */}
          <input
            type="tel"
            placeholder="+91 98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                checkPhone();
              }
            }}
            className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-5 py-4 text-lg text-white outline-none transition placeholder:text-slate-600 focus:border-purple-400"
          />

          {/* Button */}
          <button
            onClick={checkPhone}
            disabled={!phone.trim() || loading}
            className="mt-6 w-full rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-500 py-5 text-lg font-semibold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Scanning Networks..."
              : "Initiate Trace"}
          </button>

          {/* Error */}
          {result?.error && (
            <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-center text-red-400">
              {result.error}
            </div>
          )}

          {/* Results */}
          {result && !result.error && (
            <div className="mt-10 space-y-5">

              {/* Carrier */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
                <p className="mb-2 text-sm text-slate-500">
                  Carrier
                </p>

                <p className="text-2xl font-semibold">
                  {result.carrier || "Unknown"}
                </p>
              </div>

              {/* Location */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
                <p className="mb-2 text-sm text-slate-500">
                  Location
                </p>

                <p className="text-2xl font-semibold">
                  {result.location || "Unknown"}
                </p>
              </div>

              {/* Fraud Score */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
                <p className="mb-2 text-sm text-slate-500">
                  Fraud Risk
                </p>

                <p
                  className={`text-5xl font-bold ${
                    Number(result.fraudScore) > 50
                      ? "text-red-400"
                      : "text-emerald-400"
                  }`}
                >
                  {result.fraudScore ?? 0}%
                </p>
              </div>

              {/* Verdict */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8 text-center">
                <p className="mb-3 text-sm uppercase tracking-wider text-slate-500">
                  Security Verdict
                </p>

                <span
                  className={`text-3xl font-bold ${
                    result.verdict === "HIGH RISK"
                      ? "text-red-400"
                      : "text-emerald-400"
                  }`}
                >
                  {result.verdict || "UNKNOWN"}
                </span>
              </div>

            </div>
          )}
        </div>
      </div>
    </main>
  );
}
