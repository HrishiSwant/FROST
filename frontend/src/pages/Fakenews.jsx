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
          url: isURL ? text : null,
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen pt-20 pb-12 px-6 ${theme === "dark" ? "bg-[#020617]" : "bg-slate-50"}`}>
      <div className="max-w-2xl mx-auto">
        <button onClick={goBack} className="flex items-center gap-2 text-cyan-400 mb-8 hover:text-white">
          <ArrowLeft size={20} /> Back to Dashboard
        </button>

        <div className="glass rounded-3xl p-12">
          <div className="flex items-center gap-4 mb-10">
            <ShieldCheck className={`w-12 h-12 ${theme === "dark" ? "text-cyan-400" : "text-cyan-600"}`} />
            <div>
              <h2 className={`text-4xl font-semibold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>Fake News Investigation</h2>
              <p className={theme === "dark" ? "text-slate-400" : "text-slate-600"}>Deep semantic analysis & fact-checking</p>
            </div>
          </div>

          <textarea
            placeholder="Paste news text or article URL here..."
            className={`w-full h-56 p-7 rounded-3xl text-lg resize-y focus:outline-none mb-8
              ${theme === "dark" ? "bg-slate-900 border border-slate-700 text-white" : "bg-white border border-slate-300 text-slate-900"}`}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <button
            onClick={checkNews}
            disabled={!text || loading}
            className="w-full py-6 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl font-semibold text-xl text-black hover:brightness-110 disabled:opacity-70"
          >
            {loading ? "Investigating Sources..." : "Investigate News"}
          </button>

          {result && (
            <div className="mt-10">
              {result.error ? (
                <div className="p-6 bg-red-900/30 border border-red-400 rounded-2xl text-red-400">{result.error}</div>
              ) : (
                <div className="space-y-8">
                  <div className="text-center">
                    <div className={`inline-block px-10 py-4 rounded-3xl text-4xl font-bold tracking-wider
                      ${result.verdict === "REAL" ? "bg-emerald-500/20 text-emerald-400" :
                        result.verdict === "FAKE" ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                      {result.verdict}
                    </div>
                  </div>

                  <div className={`p-8 rounded-2xl ${theme === "dark" ? "bg-slate-900/70" : "bg-white border"}`}>
                    <div className="flex justify-between text-lg">
                      <span className={theme === "dark" ? "text-slate-400" : "text-slate-500"}>Confidence</span>
                      <span className={`font-semibold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>{result.confidence}%</span>
                    </div>
                    <div className="h-2.5 bg-slate-800 rounded-full mt-4 overflow-hidden">
                      <div className={`h-full transition-all rounded-full ${result.verdict === "REAL" ? "bg-emerald-400" : result.verdict === "FAKE" ? "bg-red-400" : "bg-yellow-400"}`} style={{ width: `${result.confidence || 50}%` }} />
                    </div>
                  </div>

                  {result.signals && result.signals.length > 0 && (
                    <div>
                      <p className={`font-medium mb-4 ${theme === "dark" ? "text-yellow-400" : "text-amber-600"}`}>Investigation Signals:</p>
                      {result.signals.map((s, i) => (
                        <div key={i} className={`p-4 rounded-2xl mb-3 border-l-4 border-yellow-400 ${theme === "dark" ? "bg-slate-900/50" : "bg-white border"}`}>
                          • {s}
                        </div>
                      ))}
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
