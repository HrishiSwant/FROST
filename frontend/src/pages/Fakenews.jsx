// src/pages/Fakenews.jsx
import { useState } from "react";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export default function Fakenews({ goBack, API_BASE, theme }) {
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
    <div className={`min-h-screen pt-20 pb-12 px-6 transition-all duration-500
      ${theme === "dark" ? "bg-[#020617]" : "bg-slate-50"}`}>

      <div className="max-w-2xl mx-auto">
        <button 
          onClick={goBack} 
          className={`flex items-center gap-2 mb-8 transition
            ${theme === "dark" ? "text-cyan-400 hover:text-white" : "text-cyan-600 hover:text-cyan-700"}`}
        >
          <ArrowLeft size={20} /> Back to Dashboard
        </button>

        <div className="glass rounded-3xl p-12">
          <div className="flex items-center gap-4 mb-10">
            <ShieldCheck className={`w-12 h-12 ${theme === "dark" ? "text-cyan-400" : "text-cyan-600"}`} />
            <div>
              <h2 className={`text-4xl font-semibold tracking-tight ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                Fake News Investigation
              </h2>
              <p className={theme === "dark" ? "text-slate-400" : "text-slate-600"}>
                Deep semantic analysis & fact-checking
              </p>
            </div>
          </div>

          <textarea
            placeholder="Paste news text or article URL here..."
            className={`w-full h-56 border rounded-3xl px-7 py-6 text-lg resize-y focus:outline-none mb-8 transition-all
              ${theme === "dark" 
                ? "bg-slate-900 border-slate-700 focus:border-cyan-400 text-white" 
                : "bg-white border-slate-300 focus:border-cyan-600 text-slate-900"}`}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <button
            onClick={checkNews}
            disabled={!text || loading}
            className="w-full py-6 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl font-semibold text-xl text-black hover:brightness-110 transition disabled:opacity-70"
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

                  <div className={`p-8 rounded-2xl border ${theme === "dark" ? "bg-slate-900/70 border-slate-700" : "bg-white border-slate-200"}`}>
                    <div className="flex justify-between text-lg">
                      <span className={theme === "dark" ? "text-slate-400" : "text-slate-500"}>Confidence</span>
                      <span className={`font-semibold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                        {result.confidence}%
                      </span>
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
                    <div className={`text-sm p-5 rounded-2xl ${theme === "dark" ? "bg-slate-900/50" : "bg-white border border-slate-200"}`}>
                      <span className={`font-medium ${theme === "dark" ? "text-white" : "text-slate-900"}`}>Headline: </span>
                      {result.headline}
                    </div>
                  )}

                  {result.signals && result.signals.length > 0 && (
                    <div>
                      <p className={`font-medium mb-4 ${theme === "dark" ? "text-yellow-400" : "text-amber-600"}`}>
                        Investigation Signals:
                      </p>
                      <div className="space-y-3">
                        {result.signals.map((signal, i) => (
                          <div key={i} className={`flex gap-3 text-sm p-4 rounded-2xl border-l-4 border-yellow-400
                            ${theme === "dark" ? "bg-slate-900/50" : "bg-white border border-slate-200"}`}>
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
