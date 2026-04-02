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
      // Basic file size check (10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        alert("File size exceeds 10MB limit!");
        return;
      }

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

      if (data.success) {
        setResult(data);
      } else {
        setResult({ error: data.error || "Analysis failed" });
      }
    } catch (err) {
      setResult({ error: err.message || "Failed to connect to server" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen pt-20 pb-12 px-6 ${
        theme === "dark" ? "bg-[#020617]" : "bg-slate-50"
      }`}
    >
      {/* Back Button */}
      <button
        onClick={goBack}
        className={`flex items-center gap-2 mb-8 text-sm font-medium ${
          theme === "dark"
            ? "text-slate-400 hover:text-white"
            : "text-slate-600 hover:text-slate-900"
        }`}
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Dashboard
      </button>

      <div className="max-w-3xl mx-auto">
        <div className="glass rounded-3xl p-12">
          {/* Header */}
          <div className="flex items-center gap-4 mb-10">
            <ScanFace
              className={`w-12 h-12 ${
                theme === "dark" ? "text-emerald-400" : "text-emerald-600"
              }`}
            />
            <div>
              <h2
                className={`text-4xl font-semibold ${
                  theme === "dark" ? "text-white" : "text-slate-900"
                }`}
              >
                Deepfake Detection
              </h2>
              <p
                className={
                  theme === "dark" ? "text-slate-400" : "text-slate-600"
                }
              >
                AI-powered authenticity verification
              </p>
            </div>
          </div>

          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer mb-8
              ${
                theme === "dark"
                  ? "border-slate-700 hover:border-emerald-400"
                  : "border-slate-300 hover:border-emerald-500"
              }`}
            onClick={() => document.getElementById("file-input").click()}
          >
            <Upload
              className={`w-16 h-16 mx-auto mb-6 ${
                theme === "dark" ? "text-slate-400" : "text-slate-500"
              }`}
            />
            <p
              className={`text-xl font-medium ${
                theme === "dark" ? "text-white" : "text-slate-900"
              }`}
            >
              Drop image here or click to upload
            </p>
            <p
              className={
                theme === "dark" ? "text-slate-500" : "text-slate-600"
              }
            >
              JPG, PNG • Max 10MB
            </p>
            <input
              id="file-input"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Image Preview */}
          {preview && (
            <div className="mb-8">
              <p
                className={`text-sm mb-3 ${
                  theme === "dark" ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Selected Image
              </p>
              <img
                src={preview}
                alt="preview"
                className="w-full max-h-96 object-contain rounded-2xl border border-slate-700 bg-black"
              />
            </div>
          )}

          {/* Analyze Button */}
          <button
            onClick={checkDeepfake}
            disabled={!file || loading}
            className="w-full py-6 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl font-semibold text-xl text-black hover:brightness-110 disabled:opacity-70 transition-all"
          >
            {loading ? "Analyzing with AI..." : "Analyze Image for Deepfake"}
          </button>

          {/* Results Section */}
          {result && (
            <div className="mt-10">
              {result.error ? (
                <div className="p-6 bg-red-900/30 border border-red-400 rounded-2xl text-red-400 text-center">
                  {result.error}
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Verdict */}
                  <div className="text-center">
                    <div
                      className={`inline-block px-10 py-4 rounded-3xl text-4xl font-bold ${
                        result.data?.verdict === "REAL"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {result.data?.verdict || "UNKNOWN"}
                    </div>
                  </div>

                  {/* Confidence Bar */}
                  <div
                    className={`p-8 rounded-2xl ${
                      theme === "dark" ? "bg-slate-900/70" : "bg-white border"
                    }`}
                  >
                    <div className="flex justify-between mb-6">
                      <span
                        className={
                          theme === "dark" ? "text-slate-400" : "text-slate-500"
                        }
                      >
                        Confidence
                      </span>
                      <span
                        className={`text-4xl font-semibold ${
                          theme === "dark" ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {result.data?.confidence || 0}%
                      </span>
                    </div>
                    <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          result.data?.verdict === "REAL"
                            ? "bg-emerald-400"
                            : "bg-red-400"
                        }`}
                        style={{ width: `${result.data?.confidence || 0}%` }}
                      />
                    </div>
                  </div>

                  {/* AI Analysis */}
                  {result.data?.ai_analysis && (
                    <div
                      className={`p-6 rounded-2xl text-sm leading-relaxed ${
                        theme === "dark"
                          ? "bg-slate-900/70 text-slate-300"
                          : "bg-white border text-slate-700"
                      }`}
                    >
                      <strong className="block mb-2 text-emerald-400">
                        AI Analysis:
                      </strong>
                      {result.data.ai_analysis}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
