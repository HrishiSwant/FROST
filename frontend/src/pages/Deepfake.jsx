import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const API_BASE = "https://frost-7sn1.onrender.com";

export default function Deepfake() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState(null);

  // 🔐 Get session once on load
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };
    getSession();
  }, []);

  const scanImage = async () => {
    if (!file) {
      alert("Please select an image");
      return;
    }

    if (!session) {
      alert("Please login again");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_BASE}/api/deepfake/check`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Scan failed");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      alert("Error scanning image");
      console.error(err);
    } finally {
      setLoading(false);
    }
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
          className="w-full bg-cyan-500 py-2 rounded text-black font-bold disabled:opacity-60"
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
