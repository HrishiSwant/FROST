import { useState } from "react";
import {
  ScanFace,
  Upload,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Users,
  Activity,
  Waves,
  ShieldCheck,
} from "lucide-react";

export default function Deepfake({ goBack, API_BASE, theme }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) return;

    // Maximum file size: 10MB
    if (selectedFile.size > 10 * 1024 * 1024) {
      alert("File size exceeds 10MB limit!");
      return;
    }

    // Only allow images
    if (!selectedFile.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }

    // Clean up previous preview URL
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setResult(null);
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
        setResult({
          error:
            data?.errors ||
            data?.message ||
            "Server returned an error while analyzing the image.",
        });
        return;
      }

      if (data.success) {
        setResult(data);
      } else {
        setResult({
          error:
            data?.errors ||
            data?.message ||
            "Analysis failed.",
        });
      }
    } catch (err) {
      setResult({
        error:
          err?.message ||
          "Failed to connect to the deepfake detection server.",
      });
    } finally {
      setLoading(false);
    }
  };

  /*
   * Backend response:
   *
   * result.data = {
   *   answer,
   *   verdict,
   *   confidence,
   *   facesDetected,
   *   blurScore,
   *   noiseScore,
   *   method
   * }
   */

  const analysisData = result?.data;

  const verdict = analysisData?.verdict?.toUpperCase() || "UNKNOWN";
  const confidence = Number(analysisData?.confidence ?? 0);

  const getVerdictConfig = () => {
    switch (verdict) {
      case "REAL":
        return {
          icon: CheckCircle2,
          label: "REAL",
          container:
            "bg-emerald-500/10 border-emerald-400/30",
          text: "text-emerald-400",
          iconColor: "text-emerald-400",
          bar: "bg-emerald-400",
        };

      case "SUSPICIOUS":
        return {
          icon: AlertTriangle,
          label: "SUSPICIOUS",
          container:
            "bg-amber-500/10 border-amber-400/30",
          text: "text-amber-400",
          iconColor: "text-amber-400",
          bar: "bg-amber-400",
        };

      case "FAKE":
      case "DEEPFAKE":
        return {
          icon: XCircle,
          label: verdict,
          container:
            "bg-red-500/10 border-red-400/30",
          text: "text-red-400",
          iconColor: "text-red-400",
          bar: "bg-red-400",
        };

      default:
        return {
          icon: AlertTriangle,
          label: verdict,
          container:
            "bg-slate-500/10 border-slate-400/30",
          text:
            theme === "dark"
              ? "text-slate-300"
              : "text-slate-700",
          iconColor:
            theme === "dark"
              ? "text-slate-300"
              : "text-slate-600",
          bar: "bg-slate-400",
        };
    }
  };

  const verdictConfig = getVerdictConfig();
  const VerdictIcon = verdictConfig.icon;

  return (
    <div
      className={`min-h-screen pt-20 pb-12 px-6 ${
        theme === "dark"
          ? "bg-[#020617]"
          : "bg-slate-50"
      }`}
    >
      {/* Back Button */}
      <button
        onClick={goBack}
        className={`flex items-center gap-2 mb-8 text-sm font-medium transition-colors ${
          theme === "dark"
            ? "text-slate-400 hover:text-white"
            : "text-slate-600 hover:text-slate-900"
        }`}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      <div className="max-w-3xl mx-auto">
        <div className="glass rounded-3xl p-12">

          {/* Header */}
          <div className="flex items-center gap-4 mb-10">
            <ScanFace
              className={`w-12 h-12 ${
                theme === "dark"
                  ? "text-emerald-400"
                  : "text-emerald-600"
              }`}
            />

            <div>
              <h2
                className={`text-4xl font-semibold ${
                  theme === "dark"
                    ? "text-white"
                    : "text-slate-900"
                }`}
              >
                Deepfake Detection
              </h2>

              <p
                className={
                  theme === "dark"
                    ? "text-slate-400"
                    : "text-slate-600"
                }
              >
                AI-powered authenticity verification
              </p>
            </div>
          </div>

          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer mb-8 ${
              theme === "dark"
                ? "border-slate-700 hover:border-emerald-400"
                : "border-slate-300 hover:border-emerald-500"
            }`}
            onClick={() =>
              document.getElementById("file-input")?.click()
            }
          >
            <Upload
              className={`w-16 h-16 mx-auto mb-6 ${
                theme === "dark"
                  ? "text-slate-400"
                  : "text-slate-500"
              }`}
            />

            <p
              className={`text-xl font-medium ${
                theme === "dark"
                  ? "text-white"
                  : "text-slate-900"
              }`}
            >
              Drop image here or click to upload
            </p>

            <p
              className={
                theme === "dark"
                  ? "text-slate-500"
                  : "text-slate-600"
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
              <div className="flex items-center justify-between mb-3">
                <p
                  className={`text-sm ${
                    theme === "dark"
                      ? "text-slate-400"
                      : "text-slate-500"
                  }`}
                >
                  Selected Image
                </p>

                {file && (
                  <p
                    className={`text-xs truncate max-w-[60%] ${
                      theme === "dark"
                        ? "text-slate-500"
                        : "text-slate-500"
                    }`}
                  >
                    {file.name}
                  </p>
                )}
              </div>

              <div className="rounded-2xl overflow-hidden border border-slate-700 bg-black">
                <img
                  src={preview}
                  alt="Selected image preview"
                  className="w-full max-h-96 object-contain"
                />
              </div>
            </div>
          )}

          {/* Analyze Button */}
          <button
            onClick={checkDeepfake}
            disabled={!file || loading}
            className="w-full py-6 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl font-semibold text-xl text-black hover:brightness-110 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
          >
            {loading
              ? "Analyzing with AI..."
              : "Analyze Image for Deepfake"}
          </button>

          {/* Results */}
          {result && (
            <div className="mt-10">

              {/* Error */}
              {result.error ? (
                <div className="p-6 bg-red-900/30 border border-red-400/40 rounded-2xl text-red-400 text-center">
                  <XCircle className="w-8 h-8 mx-auto mb-3" />

                  <p className="font-medium">
                    Analysis Failed
                  </p>

                  <p className="text-sm mt-2">
                    {result.error}
                  </p>
                </div>
              ) : analysisData ? (
                <div className="space-y-6">

                  {/* Result Header */}
                  <div
                    className={`rounded-3xl border p-8 text-center ${verdictConfig.container}`}
                  >
                    <VerdictIcon
                      className={`w-14 h-14 mx-auto mb-4 ${verdictConfig.iconColor}`}
                    />

                    <p
                      className={`text-sm font-medium mb-2 ${
                        theme === "dark"
                          ? "text-slate-400"
                          : "text-slate-500"
                      }`}
                    >
                      Detection Result
                    </p>

                    <div
                      className={`text-4xl font-bold ${verdictConfig.text}`}
                    >
                      {verdictConfig.label}
                    </div>
                  </div>

                  {/* Confidence */}
                  <div
                    className={`p-8 rounded-2xl ${
                      theme === "dark"
                        ? "bg-slate-900/70"
                        : "bg-white border border-slate-200"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-5">
                      <span
                        className={
                          theme === "dark"
                            ? "text-slate-400"
                            : "text-slate-500"
                        }
                      >
                        Confidence
                      </span>

                      <span
                        className={`text-4xl font-semibold ${
                          theme === "dark"
                            ? "text-white"
                            : "text-slate-900"
                        }`}
                      >
                        {confidence}%
                      </span>
                    </div>

                    <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-700 ${verdictConfig.bar}`}
                        style={{
                          width: `${Math.min(
                            Math.max(confidence, 0),
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Detection Metrics */}
                  <div>
                    <h3
                      className={`text-lg font-semibold mb-4 ${
                        theme === "dark"
                          ? "text-white"
                          : "text-slate-900"
                      }`}
                    >
                      Detection Details
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                      {/* Faces */}
                      <div
                        className={`p-6 rounded-2xl ${
                          theme === "dark"
                            ? "bg-slate-900/70"
                            : "bg-white border border-slate-200"
                        }`}
                      >
                        <Users
                          className={`w-7 h-7 mb-4 ${
                            theme === "dark"
                              ? "text-cyan-400"
                              : "text-cyan-600"
                          }`}
                        />

                        <p
                          className={`text-sm ${
                            theme === "dark"
                              ? "text-slate-400"
                              : "text-slate-500"
                          }`}
                        >
                          Faces Detected
                        </p>

                        <p
                          className={`text-3xl font-semibold mt-2 ${
                            theme === "dark"
                              ? "text-white"
                              : "text-slate-900"
                          }`}
                        >
                          {analysisData.facesDetected ?? 0}
                        </p>
                      </div>

                      {/* Blur */}
                      <div
                        className={`p-6 rounded-2xl ${
                          theme === "dark"
                            ? "bg-slate-900/70"
                            : "bg-white border border-slate-200"
                        }`}
                      >
                        <Activity
                          className={`w-7 h-7 mb-4 ${
                            theme === "dark"
                              ? "text-purple-400"
                              : "text-purple-600"
                          }`}
                        />

                        <p
                          className={`text-sm ${
                            theme === "dark"
                              ? "text-slate-400"
                              : "text-slate-500"
                          }`}
                        >
                          Blur Score
                        </p>

                        <p
                          className={`text-3xl font-semibold mt-2 ${
                            theme === "dark"
                              ? "text-white"
                              : "text-slate-900"
                          }`}
                        >
                          {analysisData.blurScore ?? "N/A"}
                        </p>
                      </div>

                      {/* Noise */}
                      <div
                        className={`p-6 rounded-2xl ${
                          theme === "dark"
                            ? "bg-slate-900/70"
                            : "bg-white border border-slate-200"
                        }`}
                      >
                        <Waves
                          className={`w-7 h-7 mb-4 ${
                            theme === "dark"
                              ? "text-orange-400"
                              : "text-orange-600"
                          }`}
                        />

                        <p
                          className={`text-sm ${
                            theme === "dark"
                              ? "text-slate-400"
                              : "text-slate-500"
                          }`}
                        >
                          Noise Score
                        </p>

                        <p
                          className={`text-3xl font-semibold mt-2 ${
                            theme === "dark"
                              ? "text-white"
                              : "text-slate-900"
                          }`}
                        >
                          {analysisData.noiseScore ?? "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Detection Method */}
                  {analysisData.method && (
                    <div
                      className={`p-6 rounded-2xl flex items-start gap-4 ${
                        theme === "dark"
                          ? "bg-slate-900/70"
                          : "bg-white border border-slate-200"
                      }`}
                    >
                      <ShieldCheck
                        className={`w-7 h-7 flex-shrink-0 ${
                          theme === "dark"
                            ? "text-emerald-400"
                            : "text-emerald-600"
                        }`}
                      />

                      <div>
                        <p
                          className={`text-sm mb-1 ${
                            theme === "dark"
                              ? "text-slate-400"
                              : "text-slate-500"
                          }`}
                        >
                          Detection Method
                        </p>

                        <p
                          className={`font-medium ${
                            theme === "dark"
                              ? "text-white"
                              : "text-slate-900"
                          }`}
                        >
                          {analysisData.method}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Analysis */}
                  {analysisData.answer && (
                    <div
                      className={`p-7 rounded-2xl ${
                        theme === "dark"
                          ? "bg-slate-900/70 text-slate-300"
                          : "bg-white border border-slate-200 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <ScanFace
                          className={`w-6 h-6 ${
                            theme === "dark"
                              ? "text-emerald-400"
                              : "text-emerald-600"
                          }`}
                        />

                        <strong
                          className={`text-lg ${
                            theme === "dark"
                              ? "text-white"
                              : "text-slate-900"
                          }`}
                        >
                          Analysis
                        </strong>
                      </div>

                      <div className="text-sm leading-relaxed whitespace-pre-line">
                        {analysisData.answer}
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-slate-900/70 text-slate-400 text-center">
                  No analysis data received.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
