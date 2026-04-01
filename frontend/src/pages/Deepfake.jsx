import { useState } from "react";
import { Upload } from "lucide-react";

export default function Deepfake({ goBack, API_BASE, theme }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
    }
  };

  const checkDeepfake = async () => {
    if (!file) return;

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE}/api/deepfake/check`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Analysis failed");
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
        <button
          onClick={goBack}
          className="mb-6 hover:scale-105 transition-all duration-200"
        >
          ← Back
        </button>

        <div className="glass p-10 rounded-3xl">
          <h2 className="text-3xl mb-6">Deepfake Detection</h2>

          {/* Upload */}
          <div
            className="border-2 border-dashed p-10 text-center mb-6 cursor-pointer hover:scale-105 transition-all duration-200"
            onClick={() => document.getElementById("file-input").click()}
          >
            <Upload className="mx-auto mb-4" />
            <p>Upload Image</p>
            <input
              id="file-input"
              type="file"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Preview */}
          {preview && (
            <img
              src={preview}
              alt="preview"
              className="mb-6 rounded-xl border"
            />
          )}

          <button
            onClick={checkDeepfake}
            disabled={!file || loading}
            className="w-full py-4 bg-green-500 rounded-xl hover:scale-105 transition-all duration-200 disabled:opacity-60"
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>

          {/* LOADING */}
          {loading && (
            <p className="text-center mt-4 text-emerald-400">
              AI is scanning image...
            </p>
          )}

          {/* ERROR */}
          {result?.error && (
            <div className="mt-6 p-4 bg-red-500/20 text-red-400 rounded-xl">
              {result.error}
            </div>
          )}

          {/* RESULT */}
          {result && !result.error && (
            <div className="mt-6 p-6 bg-white/5 rounded-xl">
              <h3 className="text-xl font-bold mb-2">
                {result.verdict}
              </h3>

              <p>Confidence: {result.confidence}%</p>

              <div className="mt-4 bg-gray-700 h-2 rounded">
                <div
                  className="h-2 bg-green-400"
                  style={{ width: `${result.confidence || 0}%` }}
                />
              </div>

              {/* AI Explanation */}
              <div className="mt-4 text-sm text-gray-400">
                AI detected inconsistencies in facial patterns and noise levels.
              </div>

              {/* TRUST SCORE (future ready) */}
              {result.trust && (
                <div className="mt-6 p-4 bg-white/10 rounded-xl">
                  <p className="font-bold mb-2">Trust Score</p>

                  <p
                    className={`${
                      result.trust.risk === "HIGH"
                        ? "text-red-400"
                        : result.trust.risk === "MEDIUM"
                        ? "text-yellow-400"
                        : "text-green-400"
                    }`}
                  >
                    {result.trust.risk}
                  </p>

                  <div className="mt-2 bg-gray-700 h-2 rounded">
                    <div
                      className="h-2 bg-gradient-to-r from-red-500 to-green-400"
                      style={{ width: `${result.trust.score}%` }}
                    />
                  </div>

                  <p className="text-sm mt-1">
                    Score: {result.trust.score}/100
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
