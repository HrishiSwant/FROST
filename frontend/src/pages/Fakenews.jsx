// src/pages/Fakenews.jsx
import { useState } from "react";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export default function Fakenews({ goBack, API_BASE }) {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkNews = async () => {
    if (!text) return;

    setLoading(true);
    setResult(null);

    const isURL = text.startsWith("http");

    try {
      const res = await fetch(`${API_BASE}/api/news/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: isURL ? null : text,
          url: isURL ? text : null
        })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.detail || "Investigation failed");

      setResult(data);
    } catch (err) {
      setResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] pt-20 pb-12 px-6">
      <div className="max-w-2xl mx-auto">
        <button 
          onClick={goBack} 
          className="flex items-center gap-2 text-cyan-400 mb-8 hover:text-white transition"
        >
          <ArrowLeft size={20} /> Back to Dashboard
        </button>

        <div className="glass rounded-3xl p-12">
          <div className="flex items-center gap-4 mb-10">
            <ShieldCheck className="w-12 h-12 text-cyan-400" />
            <div>
              <h2 className="text-4xl font-semibold tracking-tight">Fake News Investigation</h2>
              <p className="text-slate-400">Deep semantic analysis & fact-checking</p>
            </div>
          </div>

          <textarea
            placeholder="Paste news text or article URL here..."
            className="w-full h-56 bg-slate-900 border border-slate-700 rounded-3xl px-7 py-6 text-lg resize-y focus:outline-none focus:border-cyan-400 mb-8"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <button
            onClick={checkNews}
            disabled={!text || loading}
            className="w-full py-6 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl font-semibold text-xl hover:brightness-110 transition disabled:opacity-70"
          >
            {loading ? "Investigating Sources..." : "Investigate News"}
          </button>

          {result && (
            <div className="mt-10">
              {result.error ? (
                <div className="bg-red-900/30 border border-red-400/30 p-6 rounded-2xl text-red-400 text-center">
                  {result.error}
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="text-center">
                    <div className={`inline-block px-10 py-4 rounded-3xl text-4xl font-bold tracking-wider
                      ${result.verdict === "REAL" ? "bg-emerald-500/20 text-emerald-400" :
                        result.verdict === "FAKE" ? "bg-red-500/20 text-red-400" :
                        "bg-yellow-500/20 text-yellow-400"}`}>
                      {result.verdict}
                    </div>
                  </div>

                  <div className="bg-slate-900/70 p-8 rounded-2xl border border-slate-700">
                    <div className="flex justify-between text-lg">
                      <span className="text-slate-400">Confidence</span>
                      <span className="font-semibold">{result.confidence}%</span>
                    </div>
                    <div className="h-2.5 bg-slate-800 rounded-full mt-4 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 rounded-full
                          ${result.verdict === "REAL" ? "bg-emerald-400" : 
                            result.verdict === "FAKE" ? "bg-red-400" : "bg-yellow-400"}`}
                        style={{ width: `${result.confidence || 50}%` }}
                      />
                    </div>
                  </div>

                  {result.headline && (
                    <div className="text-sm bg-slate-900/50 p-5 rounded-2xl">
                      <span className="font-medium text-white">Headline: </span>
                      {result.headline}
                    </div>
                  )}

                  {result.signals && result.signals.length > 0 && (
                    <div className="mt-6">
                      <p className="font-medium text-yellow-400 mb-4">Investigation Signals:</p>
                      <div className="space-y-3">
                        {result.signals.map((signal, i) => (
                          <div key={i} className="flex gap-3 text-sm bg-slate-900/50 p-4 rounded-2xl border-l-4 border-yellow-400">
                            • {signal}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
