import { useState } from "react";

const API_BASE =
  process.env.REACT_APP_API_URL ||
  "https://frost-7sn1.onrender.com";

export default function Fakenews({ goBack }) {

  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkNews = async () => {

    if (!text) return;

    setLoading(true);
    setResult(null);

    const isURL = text.startsWith("http");

    try {

      const res = await fetch(
        `${API_BASE}/api/news/check`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            text: isURL ? null : text,
            url: isURL ? text : null
          })
        }
      );

      const data = await res.json();

      if (!res.ok)
        throw new Error(data.detail);

      setResult(data);

    } catch (err) {

      setResult({ error: err.message });

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="min-h-screen flex items-center justify-center">

      <div className="frost-card p-8 w-full max-w-xl">

        <h2 className="text-cyan-400 text-xl mb-4">
          Fake News Detection
        </h2>

        <textarea
          placeholder="Paste news text OR article URL..."
          className="w-full p-3 bg-slate-800 rounded mb-4"
          rows="6"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <button
          onClick={checkNews}
          className="w-full bg-cyan-500 py-2 rounded text-black font-bold"
        >
          {loading ? "Analyzing..." : "Check News"}
        </button>

        {result?.error &&
          <p className="mt-4 text-red-400">
            {result.error}
          </p>
        }

        {result && !result.error && (

          <div className="mt-4 space-y-2">

            <p className="text-lg">

              Verdict:

              <span className={
                result.verdict === "FAKE"
                ? "text-red-400"
                : "text-green-400"
              }>
                {" "}{result.verdict}
              </span>

            </p>

            <p>Confidence: {result.confidence}%</p>

            {result.headline &&
              <p className="text-sm text-slate-400">
                Headline: {result.headline}
              </p>
            }

            {result.source &&
              <p className="text-sm text-slate-400">
                Fact Checked By: {result.source}
              </p>
            }

          </div>

        )}

        <button
          onClick={goBack}
          className="mt-4 text-cyan-300"
        >
          ← Back
        </button>

      </div>

    </div>
  );
}
