import { useState } from "react";

const API_BASE = "https://frost-7sn1.onrender.com";

export default function Deepfake() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const scanImage = async () => {
    if (!file) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_BASE}/api/deepfake/check`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="frost-card p-8 w-full max-w-md">
        <h2 className="text-cyan-400 text-xl mb-4">Deepfake Detection</h2>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          className="mb-4"
        />

        <button
          onClick={scanImage}
          className="w-full bg-cyan-500 py-2 rounded text-black font-bold"
        >
          {loading ? "Scanning..." : "Scan Image"}
        </button>

        {result && (
          <div className="mt-4">
            <p>Verdict: {result.verdict}</p>
            <p>Confidence: {result.confidence}%</p>
          </div>
        )}
      </div>
    </div>
  );
}

