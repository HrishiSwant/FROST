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
      setResult(data.data);
    } catch (err) {
      setResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen pt-20 px-6 ${
        theme === "dark"
          ? "bg-[#020617] text-white"
          : "bg-[#f1f5f9] text-slate-900"
      }`}
    >
      <div className="max-w-2xl mx-auto">
        <button onClick={goBack} className="mb-6">
          ← Back
        </button>

        {/* CLEAN CONTAINER */}
        <div className="p-6">
          <h2 className="text-3xl mb-6">Fake News Detection</h2>

          {/* INPUT */}
          <textarea
            className={`w-full p-5 mb-6 rounded-2xl border ${
              theme === "dark"
                ? "bg-black/30 text-white border-gray-700"
                : "bg-white text-slate-900 border-gray-300"
            }`}
            placeholder="Ask anything..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          {/* BUTTON */}
          <button
            onClick={checkNews}
            className="w-full py-4 bg-blue-500 rounded-2xl"
          >
            {loading ? "Thinking..." : "Ask"}
          </button>

          {/* LOADING */}
          {loading && (
            <p className="mt-6 text-sm opacity-70">
              Generating answer...
            </p>
          )}

          {/* RESULT (AI STYLE) */}
          {result && !result.error && (
            <div className="mt-8">
              <p className="text-lg leading-relaxed whitespace-pre-line">
                {result.answer}
              </p>
            </div>
          )}

          {/* ERROR */}
          {result?.error && (
            <p className="mt-6 text-red-400">{result.error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
