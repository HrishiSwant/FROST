import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Phone,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  MapPin,
  Radio,
  Globe2,
  ShieldCheck,
  Activity,
  Info,
} from "lucide-react";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "https://frost-7sn1.onrender.com";

export default function PhoneIntelligencePage() {
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const normalizePhone = (value) => {
    let normalized = value.replace(/[^\d+]/g, "");

    if (normalized.includes("+")) {
      normalized =
        "+" + normalized.replace(/\+/g, "");
    }

    return normalized;
  };

  const checkPhone = async () => {
    const normalizedPhone = normalizePhone(phone);

    if (!normalizedPhone) {
      setResult({
        error: "Please enter a phone number.",
      });
      return;
    }

    if (!/^\+?[0-9]{10,15}$/.test(normalizedPhone)) {
      setResult({
        error:
          "Please enter a valid phone number with 10–15 digits.",
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(
        `${API_BASE}/api/phone/check`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone: normalizedPhone,
          }),
        }
      );

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
          data?.message ||
            data?.error ||
            "Phone analysis failed."
        );
      }

      if (!data?.success || !data?.data) {
        throw new Error(
          data?.message ||
            data?.error ||
            "No phone analysis result was returned."
        );
      }

      setResult({
        data: data.data,
      });
    } catch (error) {
      console.error(
        "Phone intelligence error:",
        error
      );

      setResult({
        error:
          error?.message ||
          "Failed to connect to the Phone Intelligence server.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!loading) {
      checkPhone();
    }
  };

  const getRiskConfig = (riskLevel) => {
    switch (riskLevel?.toUpperCase()) {
      case "HIGH":
        return {
          icon: XCircle,
          label: "HIGH RISK",
          container:
            "border-red-500/30 bg-red-500/10",
          text: "text-red-400",
          bar: "bg-red-400",
        };

      case "MEDIUM":
        return {
          icon: AlertTriangle,
          label: "MEDIUM RISK",
          container:
            "border-amber-500/30 bg-amber-500/10",
          text: "text-amber-400",
          bar: "bg-amber-400",
        };

      default:
        return {
          icon: CheckCircle2,
          label: "LOW RISK",
          container:
            "border-emerald-500/30 bg-emerald-500/10",
          text: "text-emerald-400",
          bar: "bg-emerald-400",
        };
    }
  };

  const analysis = result?.data;

  const riskConfig = getRiskConfig(
    analysis?.risk_level
  );

  const RiskIcon = riskConfig.icon;

  return (
    <div className="min-h-full bg-slate-950 text-white px-4 py-6 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-5xl">

        {/* Back */}
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="mb-8 flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-purple-400/20 bg-purple-500/10">
            <Phone className="h-8 w-8 text-purple-400" />
          </div>

          <div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Phone Intelligence
            </h1>

            <p className="mt-2 text-slate-400">
              Analyze phone-number, carrier, line-type and
              risk signals.
            </p>
          </div>
        </div>

        {/* Input Card */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl sm:p-7">

          <div className="mb-5">
            <h2 className="text-lg font-medium text-white">
              Analyze a phone number
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Enter an international number, preferably with
              its country code.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <div className="relative flex-1">
              <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

              <input
                type="tel"
                value={phone}
                onChange={(event) =>
                  setPhone(event.target.value)
                }
                placeholder="+91 98765 43210"
                autoComplete="tel"
                disabled={loading}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 py-4 pl-12 pr-4 text-white outline-none transition placeholder:text-slate-600 focus:border-purple-400 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex min-h-[56px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-500 px-7 font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Search className="h-5 w-5" />

              {loading
                ? "Analyzing..."
                : "Analyze Number"}
            </button>
          </form>

          <div className="mt-4 flex items-start gap-2 text-xs text-slate-500">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />

            <span>
              Phone Intelligence reports technical and
              risk signals. A result does not prove that
              the owner of a number is trustworthy or
              fraudulent.
            </span>
          </div>
        </div>

        {/* Error */}
        {result?.error && (
          <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-red-300">
            <div className="flex items-center gap-3">
              <XCircle className="h-5 w-5 shrink-0" />

              <p>{result.error}</p>
            </div>
          </div>
        )}

        {/* Results */}
        {analysis && (
          <div className="mt-8 space-y-6">

            {/* Risk */}
            <div
              className={`rounded-3xl border p-6 ${riskConfig.container}`}
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-center gap-4">
                  <RiskIcon
                    className={`h-8 w-8 ${riskConfig.text}`}
                  />

                  <div>
                    <p className="text-xs font-medium uppercase tracking-widest text-slate-400">
                      Risk Assessment
                    </p>

                    <h2
                      className={`mt-1 text-2xl font-semibold ${riskConfig.text}`}
                    >
                      {riskConfig.label}
                    </h2>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-xs uppercase tracking-widest text-slate-500">
                    Risk Score
                  </p>

                  <p
                    className={`mt-1 text-3xl font-bold ${riskConfig.text}`}
                  >
                    {Number(
                      analysis.fraud_score ?? 0
                    )}
                    %
                  </p>
                </div>
              </div>

              <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${riskConfig.bar}`}
                  style={{
                    width: `${Math.min(
                      Number(
                        analysis.fraud_score ?? 0
                      ),
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* Number Status */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">

              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-500">
                    Analyzed Number
                  </p>

                  <h2 className="mt-1 break-all text-xl font-medium text-white">
                    {analysis.phone}
                  </h2>
                </div>

                <div
                  className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${
                    analysis.valid
                      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-400"
                      : "border-red-400/20 bg-red-400/10 text-red-400"
                  }`}
                >
                  {analysis.valid ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}

                  {analysis.valid
                    ? "Valid"
                    : "Invalid"}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">

                <InfoCard
                  icon={Globe2}
                  label="Country"
                  value={analysis.country}
                />

                <InfoCard
                  icon={MapPin}
                  label="Region"
                  value={
                    analysis.region ||
                    analysis.location
                  }
                />

                <InfoCard
                  icon={Radio}
                  label="Carrier"
                  value={analysis.carrier}
                />

                <InfoCard
                  icon={Activity}
                  label="Line Type"
                  value={analysis.line_type}
                />

              </div>
            </div>

            {/* Signals */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">

              <div className="mb-5 flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-purple-400" />

                <div>
                  <h2 className="text-xl font-semibold">
                    Risk Indicators
                  </h2>

                  <p className="text-sm text-slate-500">
                    Signals detected during analysis
                  </p>
                </div>
              </div>

              {analysis.reasons?.length > 0 ? (
                <div className="space-y-3">
                  {analysis.reasons.map(
                    (reason, index) => (
                      <div
                        key={`${reason}-${index}`}
                        className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-950/50 p-4"
                      >
                        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />

                        <span className="text-sm text-slate-300">
                          {reason}
                        </span>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="flex items-start gap-3 rounded-2xl border border-emerald-400/10 bg-emerald-400/5 p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />

                  <div>
                    <p className="font-medium text-emerald-400">
                      No risk indicators detected
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      No suspicious signals were identified
                      by the current analysis.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Source */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/50 px-5 py-4">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-xs uppercase tracking-widest text-slate-600">
                  Analysis Source
                </span>

                <span className="text-sm text-slate-400">
                  {analysis.source ||
                    "Phone-number analysis"}
                </span>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-purple-400" />

        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wider text-slate-600">
            {label}
          </p>

          <p className="mt-1 truncate text-sm font-medium text-slate-200">
            {value || "Unknown"}
          </p>
        </div>
      </div>
    </div>
  );
}
