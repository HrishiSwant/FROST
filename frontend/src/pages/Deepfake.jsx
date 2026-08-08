import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "https://frost-7sn1.onrender.com";

export default function Deepfake() {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    if (selectedFile.size > 10 * 1024 * 1024) {
      alert("File size exceeds 10MB limit!");
      e.target.value = "";
      return;
    }

    if (!selectedFile.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      e.target.value = "";
      return;
    }

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setResult(null);

    e.target.value = "";
  };

  const checkDeepfake = async () => {
    if (!file || loading) return;

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_BASE}/api/deepfake/check`, {
        method: "POST",
        body: formData,
      });

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          `Server returned an invalid response (${response.status}).`
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.errors ||
            data?.message ||
            `Server error (${response.status}).`
        );
      }

      if (!data?.success) {
        throw new Error(
          data?.errors ||
            data?.message ||
            "Deepfake analysis failed."
        );
      }

      setResult(data);
    } catch (error) {
      console.error("Deepfake analysis error:", error);

      setResult({
        error:
          error?.message ||
          "Failed to connect to the deepfake detection server.",
      });
    } finally {
      setLoading(false);
    }
  };

  const analysisData = result?.data;

  const verdict =
    analysisData?.verdict?.toUpperCase() || "UNKNOWN";

  const confidence = Number(
    analysisData?.confidence ?? 0
  );

  const safeConfidence = Math.min(
    Math.max(confidence, 0),
    100
  );

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
          text: "text-slate-300",
          iconColor: "text-slate-300",
          bar: "bg-slate-400",
        };
    }
  };

  const verdictConfig = getVerdictConfig();
  const VerdictIcon = verdictConfig.icon;

  return (
    <div className="min-h-screen bg-[#020617] text-white pt-20 pb-16 px-6">
      <div className="max-w-4xl mx-auto">

        {/* Back Button */}
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 mb-8 text-sm font-medium text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="glass rounded-3xl p-6 md:p-12">

          {/* Header */}
          <div className="flex items-center gap-4 mb-10">
            <div className="p-3 rounded-2xl bg-emerald-500/10">
              <ScanFace className="w-10 h-10 text-emerald-400" />
            </div>

            <div>
              <h1 className="text-3xl md:text-4xl font-semibold text-white">
                Deepfake Detection
              </h1>

              <p className="text-slate-400 mt-1">
                AI-powered authenticity verification
              </p>
            </div>
          </div>

          {/* Upload Area */}
          <div
            onClick={() =>
              document.getElementById("deepfake-file-input")?.click()
            }
            className="border-2 border-dashed border-slate-700 hover:border-emerald-400 rounded-3xl p-10 md:p-12 text-center transition-all cursor-pointer mb-8"
          >
            <Upload className="w-14 h-14 mx-auto mb-5 text-slate-400" />

            <p className="text-xl font-medium text-white">
              Drop image here or click to upload
            </p>

            <p className="text-slate-500 mt-2">
              JPG, PNG, WEBP • Max 10MB
            </p>

            <input
              id="deepfake-file-input"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Selected File */}
          {file && (
            <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl bg-slate-900/70 border border-slate-800 px-5 py-4">
              <div className="min-w-0">
                <p className="text-sm text-slate-400">
                  Selected File
                </p>

                <p className="text-sm text-white truncate mt-1">
                  {file.name}
                </p>
              </div>

              <p className="text-xs text-slate-500 whitespace-nowrap">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          )}

          {/* Image Preview */}
          {preview && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-slate-400">
                  Selected Image
                </p>
              </div>

              <div className="rounded-2xl overflow-hidden border border-slate-700 bg-black">
                <img
                  src={preview}
                  alt="Selected image preview"
                  className="w-full max-h-[500px] object-contain"
                />
              </div>
            </div>
          )}

          {/* Analyze Button */}
          <button
            onClick={checkDeepfake}
            disabled={!file || loading}
            className="w-full py-5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl font-semibold text-lg text-black hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading
              ? "Analyzing with AI..."
              : "Analyze Image for Deepfake"}
          </button>

          {/* Loading */}
          {loading && (
            <div className="mt-8 p-6 rounded-2xl bg-slate-900/70 border border-slate-800 text-center">
              <div className="w-8 h-8 mx-auto mb-4 border-4 border-slate-700 border-t-emerald-400 rounded-full animate-spin" />

              <p className="text-white font-medium">
                Analyzing image...
              </p>

              <p className="text-sm text-slate-500 mt-1">
                This may take a few seconds.
              </p>
            </div>
          )}

          {/* Results */}
          {result && !loading && (
            <div className="mt-10">

              {/* Error */}
              {result.error ? (
                <div className="p-7 bg-red-500/10 border border-red-400/30 rounded-2xl text-center">
                  <XCircle className="w-10 h-10 mx-auto mb-3 text-red-400" />

                  <p className="font-semibold text-red-400 text-lg">
                    Analysis Failed
                  </p>

                  <p className="text-sm text-red-300/80 mt-2">
                    {result.error}
                  </p>
                </div>
              ) : analysisData ? (
                <div className="space-y-6">

                  {/* Verdict */}
                  <div
                    className={`rounded-3xl border p-8 text-center ${verdictConfig.container}`}
                  >
                    <VerdictIcon
                      className={`w-14 h-14 mx-auto mb-4 ${verdictConfig.iconColor}`}
                    />

                    <p className="text-sm font-medium text-slate-400 mb-2">
                      Detection Result
                    </p>

                    <div
                      className={`text-4xl md:text-5xl font-bold ${verdictConfig.text}`}
                    >
                      {verdictConfig.label}
                    </div>
                  </div>

                  {/* Confidence */}
                  <div className="p-7 rounded-2xl bg-slate-900/70 border border-slate-800">
                    <div className="flex justify-between items-center mb-5">
                      <span className="text-slate-400">
                        Confidence
                      </span>

                      <span className="text-4xl font-semibold text-white">
                        {confidence}%
                      </span>
                    </div>

                    <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-700 ${verdictConfig.bar}`}
                        style={{
                          width: `${safeConfidence}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Detection Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Detection Details
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                      {/* Faces */}
                      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800">
                        <Users className="w-7 h-7 mb-4 text-cyan-400" />

                        <p className="text-sm text-slate-400">
                          Faces Detected
                        </p>

                        <p className="text-3xl font-semibold mt-2 text-white">
                          {analysisData.facesDetected ?? 0}
                        </p>
                      </div>

                      {/* Blur */}
                      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800">
                        <Activity className="w-7 h-7 mb-4 text-purple-400" />

                        <p className="text-sm text-slate-400">
                          Blur Score
                        </p>

                        <p className="text-3xl font-semibold mt-2 text-white">
                          {analysisData.blurScore ?? "N/A"}
                        </p>
                      </div>

                      {/* Noise */}
                      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800">
                        <Waves className="w-7 h-7 mb-4 text-orange-400" />

                        <p className="text-sm text-slate-400">
                          Noise Score
                        </p>

                        <p className="text-3xl font-semibold mt-2 text-white">
                          {analysisData.noiseScore ?? "N/A"}
                        </p>
                      </div>

                    </div>
                  </div>

                  {/* Method */}
                  {analysisData.method && (
                    <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-start gap-4">
                      <ShieldCheck className="w-7 h-7 flex-shrink-0 text-emerald-400" />

                      <div>
                        <p className="text-sm text-slate-400 mb-1">
                          Detection Method
                        </p>

                        <p className="font-medium text-white">
                          {analysisData.method}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Analysis */}
                  {analysisData.answer && (
                    <div className="p-7 rounded-2xl bg-slate-900/70 border border-slate-800">
                      <div className="flex items-center gap-3 mb-4">
                        <ScanFace className="w-6 h-6 text-emerald-400" />

                        <strong className="text-lg text-white">
                          Analysis
                        </strong>
                      </div>

                      <div className="text-sm leading-relaxed text-slate-300 whitespace-pre-line">
                        {analysisData.answer}
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 text-slate-400 text-center">
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
