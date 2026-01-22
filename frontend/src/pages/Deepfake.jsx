import { useState } from "react";
import { supabase } from "../supabaseClient"; // ✅ make sure this exists

const API_BASE = "https://frost-7sn1.onrender.com";

export default function Deepfake() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const scanImage = async () => {
    if (!file) return;

    setLoading(true);
    setResult(null);

    // 🔐 Get logged-in session
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session) {
      alert("Please login again");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_BASE}/api/deepfake/check`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`, // ✅ REQUIRED
      },
      body: formData,
    });

    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="frost-card p-8 w-full max-w-md">
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
          onClick={scanImage}
          disabled={loading}
          className="w-full bg-cyan-500 py-2 rounded text-black font-bold"
        >
          {loading ? "Scanning..." : "Scan Image"}
        </button>

        {result && (
          <div className="mt-4 text-sm">
            <p>
              <b>Verdict:</b> {result.verdict}
            </p>
            <p>
              <b>Confidence:</b> {result.confidence}%
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
