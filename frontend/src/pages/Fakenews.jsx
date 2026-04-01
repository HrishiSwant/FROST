import { useState } from "react";

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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: isURL ? null : text,
          url: isURL ? text : null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Investigation failed");
      }

      setResult(data);
    } catch (err) {
      setResult({ error: err.message });
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
      <div className="max-w-2xl mx-auto">
        <button onClick={goBack} className="mb-6">
          ← Back
        </button>

        <div className="glass p-10 rounded-3xl">
          <h2 className="text-3xl mb-6">Fake News Detection</h2>

          <textarea
            className="w-full p-4 mb-6 rounded-xl"
            placeholder="Enter news or URL..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <button
            onClick={checkNews}
            disabled={loading || !text}
            className="w-full py-4 bg-blue-500 rounded-xl disabled:opacity-60"
          >
            {loading ? "Checking..." : "Check"}
          </button>

          {/* ERROR */}
          {result?.error && (
            <div className="mt-6 p-4 bg-red-500/20 text-red-400 rounded-xl">
              {result.error}
            </div>
          )}

          {/* RESULT */}
          {result && !result.error && (
            <div className="mt-6 p-6 bg-white/5 rounded-xl">
              <h3 className="text-xl font-bold">{result.verdict}</h3>

              <p className="mt-2">
                Confidence: {result.confidence}%
              </p>

              <div className="mt-4 bg-gray-700 h-2 rounded">
                <div
                  className="h-2 bg-blue-400"
                  style={{ width: `${result.confidence || 0}%` }}
                />
              </div>

              {/* AI Explanation */}
              {result.signals && result.signals.length > 0 && (
                <div className="mt-4 text-sm text-yellow-400">
                  {result.signals.map((s, i) => (
                    <p key={i}>• {s}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
