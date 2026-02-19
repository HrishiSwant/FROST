
import { useState } from "react";

const API_BASE =
  process.env.REACT_APP_API_URL ||
  "https://frost-7sn1.onrender.com";

export default function Deepfake({ goBack }) {

  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkDeepfake = async () => {

    if (!file) return;

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {

      const res = await fetch(
        `${API_BASE}/api/deepfake/check`,
        {
          method: "POST",
          body: formData
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
          Deepfake Detection
        </h2>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          className="mb-4"
        />

        <button
          onClick={checkDeepfake}
          className="w-full bg-cyan-500 py-2 rounded text-black font-bold"
        >
          {loading ? "Analyzing..." : "Analyze Image"}
        </button>

        {result?.error &&
          <p className="mt-4 text-red-400">
            {result.error}
          </p>
        }

        {result && !result.error &&
          <div className="mt-4">

            <p>
              Verdict: <b>{result.verdict}</b>
            </p>

            <p>
              Confidence: {result.confidence}%
            </p>

          </div>
        }

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
