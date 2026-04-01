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

        <div
          className={`p-10 rounded-3xl ${
            theme === "dark"
              ? "glass bg-white/5"
              : "bg-white/70 backdrop-blur shadow-lg"
          }`}
        >
          <h2 className="text-3xl mb-6">Fake News Detection</h2>

          <textarea
            className={`w-full p-4 mb-6 rounded-xl ${
              theme === "dark"
                ? "bg-black/30 text-white"
                : "bg-white text-slate-900"
            }`}
            placeholder="Enter news or URL..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <button
            onClick={checkNews}
            className="w-full py-4 bg-blue-500 rounded-xl"
          >
            {loading ? "Checking..." : "Check"}
          </button>

          {loading && (
            <p className="text-center mt-4 text-cyan-400">
              Analyzing with AI...
            </p>
          )}

          {/* RESULT */}
          {result && !result.error && (
            <div className="mt-6 p-6 bg-slate-100 rounded-xl">
              <p className="text-lg font-semibold">
                {result.verdict === "FAKE"
                  ? "This content appears misleading."
                  : "This content appears reliable."}
              </p>

              <p className="text-sm mt-2">
                {result.explanation}
              </p>

              <p className="mt-4 text-sm">
                Confidence: {result.confidence}%
              </p>

              <div className="mt-3 bg-gray-300 h-2 rounded">
                <div
                  className={
                    result.verdict === "FAKE"
                      ? "bg-red-500 h-2"
                      : "bg-green-500 h-2"
                  }
                  style={{ width: `${result.confidence}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
