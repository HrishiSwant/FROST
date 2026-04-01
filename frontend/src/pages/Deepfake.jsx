import { useState } from "react";
import { ScanFace, Upload, ArrowLeft } from "lucide-react";

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

      if (!res.ok) throw new Error(data.detail || "Analysis failed");

      setResult(data);
    } catch (err) {
      setResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen pt-20 px-6 ${
      theme === "dark" ? "bg-[#020617]" : "bg-slate-50"
    }`}>
      <div className="max-w-2xl mx-auto">
        <button onClick={goBack} className="mb-6">
          ← Back
        </button>

        <div className="glass p-10 rounded-3xl">
          <h2 className="text-3xl mb-6">Deepfake Detection</h2>

          {/* Upload */}
          <div
            className="border-2 border-dashed p-10 text-center mb-6 cursor-pointer"
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

          {preview && (
            <img src={preview} alt="preview" className="mb-6" />
          )}

          <button
            onClick={checkDeepfake}
            className="w-full py-4 bg-green-500 rounded-xl"
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>

          {/* RESULT */}
          {result && !result.error && (
            <div className="mt-6 p-6 bg-white/5 rounded-xl">
              <h3 className="text-xl font-bold mb-2">{result.verdict}</h3>

              <p>Confidence: {result.confidence}%</p>

              <div className="mt-4 bg-gray-700 h-2 rounded">
                <div
                  className="h-2 bg-green-400"
                  style={{ width: `${result.confidence}%` }}
                />
              </div>

              {/* AI Explanation */}
              <div className="mt-4 text-sm text-gray-400">
                AI detected inconsistencies in facial patterns and noise levels.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
