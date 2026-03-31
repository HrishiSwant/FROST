// src/pages/Deepfake.jsx
import { useState } from "react";
import { ScanFace, Upload, ArrowLeft } from "lucide-react";

export default function Deepfake({ goBack, API_BASE }) {
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
        body: formData
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
    <div className="min-h-screen bg-[#020617] pt-20 pb-12 px-6">
      <div className="max-w-2xl mx-auto">
        <button 
          onClick={goBack} 
          className="flex items-center gap-2 text-cyan-400 mb-8 hover:text-white transition"
        >
          <ArrowLeft size={20} /> Back to Dashboard
        </button>

        <div className="glass rounded-3xl p-12">
          <div className="flex items-center gap-4 mb-10">
            <ScanFace className="w-12 h-12 text-emerald-400" />
            <div>
              <h2 className="text-4xl font-semibold tracking-tight">Deepfake Detection</h2>
              <p className="text-slate-400">AI-powered authenticity verification</p>
            </div>
          </div>

          {/* Upload Area */}
          <div 
            className="border-2 border-dashed border-slate-700 hover:border-emerald-400/50 rounded-3xl p-12 text-center transition-all duration-300 mb-8 cursor-pointer"
            onClick={() => document.getElementById('file-input').click()}
          >
            <Upload className="w-16 h-16 mx-auto mb-6 text-slate-400" />
            <p className="text-xl font-medium mb-2">Drop image here or click to upload</p>
            <p className="text-slate-500">Supports JPG, PNG • Max 10MB</p>
            <input
              id="file-input"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Preview */}
          {preview && (
            <div className="mb-8">
              <p className="text-sm text-slate-400 mb-3">Selected Image</p>
              <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-black">
                <img 
                  src={preview} 
                  alt="preview" 
                  className="w-full max-h-96 object-contain" 
                />
              </div>
            </div>
          )}

          <button
            onClick={checkDeepfake}
            disabled={!file || loading}
            className="w-full py-6 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl font-semibold text-xl hover:brightness-110 transition disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Analyzing with AI..." : "Analyze Image for Deepfake"}
          </button>

          {/* Results */}
          {result && (
            <div className="mt-10">
              {result.error ? (
                <div className="bg-red-900/30 border border-red-400/30 p-6 rounded-2xl text-red-400 text-center">
                  {result.error}
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="text-center">
                    <div className={`inline-block px-8 py-3 rounded-3xl text-3xl font-bold tracking-wider
                      ${result.verdict === "REAL" || result.verdict === "AUTHENTIC" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                      {result.verdict || "UNKNOWN"}
                    </div>
                  </div>

                  <div className="bg-slate-900/70 p-8 rounded-2xl border border-slate-700">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-slate-400">Confidence Level</span>
                      <span className="text-4xl font-semibold text-white">{result.confidence}%</span>
                    </div>
                    <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000
                          ${result.verdict === "REAL" || result.verdict === "AUTHENTIC" ? "bg-emerald-400" : "bg-red-400"}`}
                        style={{ width: `${result.confidence || 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
