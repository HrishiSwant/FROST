import { useState } from "react";

function FakeNews() {
  const [newsText, setNewsText] = useState("");
  const [newsUrl, setNewsUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheck = async () => {
    setError("");
    setResult(null);

    // Validation
    if (!newsText.trim() && !newsUrl.trim()) {
      setError("Please enter news text or a news URL.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        text: newsText.trim() || null,
        url: newsUrl.trim() || null,
      };

      console.log("Sending payload:", payload);

      const response = await fetch(
        "http://localhost:8000/api/fake-news/check",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      console.log("API response:", data);

      if (!response.ok) {
        setError(data?.explanation || "Analysis failed");
      } else {
        setResult(data);
      }
    } catch (err) {
      console.error(err);
      setError("Cannot connect to backend server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl bg-slate-900 p-8 rounded-2xl shadow-xl">
        <h1 className="text-2xl font-bold text-white text-center mb-6">
          Fake News Detection
        </h1>

        <p className="text-sm text-slate-400 text-center mb-6">
          Paste news text or a news URL to check authenticity
        </p>

        {/* News Text */}
        <div className="mb-4">
          <label className="block text-xs text-slate-300 mb-1">
            News Text
          </label>
          <textarea
            rows="4"
            value={newsText}
            onChange={(e) => setNewsText(e.target.value)}
            placeholder="Paste news content here..."
            className="w-full p-3 rounded bg-slate-800 text-white resize-none"
          />
        </div>

        {/* OR */}
        <p className="text-center text-slate-400 text-xs my-3">OR</p>

        {/* News URL */}
        <div className="mb-4">
          <label className="block text-xs text-slate-300 mb-1">
            News URL
          </label>
          <input
            type="url"
            value={newsUrl}
            onChange={(e) => setNewsUrl(e.target.value)}
            placeholder="https://example.com/news"
            className="w-full p-3 rounded bg-slate-800 text-white"
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-400 text-xs mb-3 text-center">
            {error}
          </p>
        )}

        {/* Button */}
        <button
          onClick={handleCheck}
          disabled={loading}
          className="w-full bg-indigo-500 hover:bg-indigo-400 text-white py-2 rounded-lg font-semibold disabled:opacity-60"
        >
          {loading ? "Checking..." : "Check Authenticity"}
        </button>

        {/* Result */}
        {result && (
          <div className="mt-6 p-4 rounded-lg bg-slate-800 text-center">
            <p
              className={`text-xl font-bold ${
                result.verdict === "REAL"
                  ? "text-green-400"
                  : result.verdict === "FAKE"
                  ? "text-red-400"
                  : "text-yellow-400"
              }`}
            >
              Verdict: {result.verdict}
            </p>

            <p className="mt-2 text-indigo-400">
              Confidence: {result.confidence}%
            </p>

            {result.source_credibility && (
              <p className="mt-2 text-sm text-slate-300">
                Source credibility:{" "}
                <span className="font-semibold">
                  {result.source_credibility}
                </span>
              </p>
            )}

            <p className="mt-2 text-slate-400 text-sm">
              {result.explanation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default FakeNews;
