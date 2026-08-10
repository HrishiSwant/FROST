import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "https://frost-7sn1.onrender.com";

export default function Fakenews() {
  const navigate = useNavigate();

  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const checkNews = async () => {
    if (!text.trim() || loading) return;

    const userText = text.trim();
    setText("");

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userText,
      },
    ]);

    setLoading(true);

    const isURL = /^https?:\/\//i.test(userText);

    try {
      const res = await fetch(`${API_BASE}/api/news/check`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: isURL ? null : userText,
          url: isURL ? userText : null,
        }),
      });

      let data;

      try {
        data = await res.json();
      } catch {
        throw new Error(
          `Server returned an invalid response (${res.status}).`
        );
      }

      if (!res.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            data?.errors ||
            `Server error (${res.status}).`
        );
      }

      const result = data?.data;

      if (!result) {
        throw new Error("No investigation result received.");
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          result,
        },
      ]);
    } catch (error) {
      console.error("News analysis error:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          error:
            error?.message ||
            "Failed to connect to FROST server. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getVerdictIcon = (verdict = "") => {
    const value = verdict.toLowerCase();

    if (
      value.includes("false") ||
      value.includes("misleading") ||
      value.includes("suspicious")
    ) {
      return <XCircle className="w-5 h-5" />;
    }

    if (value.includes("true") || value.includes("real")) {
      return <CheckCircle2 className="w-5 h-5" />;
    }

    return <AlertTriangle className="w-5 h-5" />;
  };

  const getVerdictStyle = (verdict = "") => {
    const value = verdict.toLowerCase();

    if (
      value.includes("false") ||
      value.includes("misleading") ||
      value.includes("suspicious")
    ) {
      return "border-red-500/30 bg-red-500/10 text-red-400";
    }

    if (value.includes("true") || value.includes("real")) {
      return "border-green-500/30 bg-green-500/10 text-green-400";
    }

    return "border-yellow-500/30 bg-yellow-500/10 text-yellow-400";
  };

  return (
    <div className="min-h-screen text-white px-4 md:px-8 py-8">

      {/* Back */}
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
          <div className="p-3 rounded-2xl bg-cyan-500/10">
            <ShieldCheck className="w-10 h-10 text-cyan-400" />
          </div>

          <div>
            <h1 className="text-3xl md:text-4xl font-semibold text-white">
              Fake News Investigation
            </h1>

            <p className="text-slate-400 mt-1">
              Deep semantic analysis & fact-checking
            </p>
          </div>
        </div>

        {/* Investigation Results */}
        <div className="space-y-5 max-h-[550px] overflow-y-auto mb-8 pr-2">

          {/* Empty State */}
          {messages.length === 0 && !loading && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center">
              <ShieldCheck className="w-10 h-10 mx-auto mb-4 text-cyan-400" />

              <p className="text-slate-300">
                Paste a news article, claim, or URL below to begin an
                investigation.
              </p>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, index) => (

            <div key={index}>

              {/* User Message */}
              {msg.role === "user" && (
                <div className="flex justify-end mb-4">
                  <div className="max-w-[85%] p-4 rounded-2xl text-sm whitespace-pre-wrap bg-gradient-to-r from-cyan-500 to-purple-600 text-white">
                    {msg.content}
                  </div>
                </div>
              )}

              {/* Error */}
              {msg.role === "ai" && msg.error && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] p-4 rounded-2xl text-sm bg-slate-900 text-red-400 border border-red-500/30">
                    {msg.error}
                  </div>
                </div>
              )}

              {/* V2 Investigation Result */}
              {msg.role === "ai" && msg.result && (
                <div className="flex justify-start">

                  <div className="w-full max-w-[900px] rounded-3xl bg-slate-950 border border-slate-800 p-5 md:p-7">

                    {/* Version */}
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <p className="text-xs uppercase tracking-widest text-cyan-400 font-semibold">
                          FROST NEWS INTELLIGENCE
                        </p>

                        <p className="text-xs text-slate-500 mt-1">
                          Investigation Engine v{msg.result.version || "2"}
                        </p>
                      </div>
                    </div>

                    {/* Verdict */}
                    <div
                      className={`rounded-2xl border p-5 mb-5 ${getVerdictStyle(
                        msg.result.verdict
                      )}`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        {getVerdictIcon(msg.result.verdict)}

                        <span className="text-xs uppercase tracking-wider font-semibold">
                          Verdict
                        </span>
                      </div>

                      <h2 className="text-xl md:text-2xl font-bold">
                        {msg.result.verdict || "UNKNOWN"}
                      </h2>
                    </div>

                    {/* Confidence */}
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 mb-5">

                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-slate-400">
                          Confidence
                        </span>

                        <span className="text-xl font-bold text-white">
                          {msg.result.confidence ?? 0}%
                        </span>
                      </div>

                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full transition-all"
                          style={{
                            width: `${Math.min(
                              Math.max(
                                Number(msg.result.confidence) || 0,
                                0
                              ),
                              100
                            )}%`,
                          }}
                        />
                      </div>

                    </div>

                    {/* Reason */}
                    {msg.result.reason && (
                      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 mb-5">

                        <h3 className="text-sm font-semibold text-white mb-2">
                          Investigation Reason
                        </h3>

                        <p className="text-sm leading-6 text-slate-300">
                          {msg.result.reason}
                        </p>

                      </div>
                    )}

                    {/* Query */}
                    {msg.result.query && (
                      <div className="mb-5">

                        <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">
                          Investigated Claim
                        </p>

                        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
                          <p className="text-sm text-slate-300">
                            {msg.result.query}
                          </p>
                        </div>

                      </div>
                    )}

                    {/* Sources */}
                    {Array.isArray(msg.result.sources) &&
                      msg.result.sources.length > 0 && (
                        <div>

                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-white">
                                Fact-Check Sources
                              </h3>

                              <p className="text-xs text-slate-500 mt-1">
                                External sources used during the investigation
                              </p>
                            </div>

                            <span className="text-xs text-slate-500">
                              {msg.result.sources.length} source
                              {msg.result.sources.length !== 1
                                ? "s"
                                : ""}
                            </span>
                          </div>

                          <div className="space-y-3">

                            {msg.result.sources.map((source, sourceIndex) => (
                              <div
                                key={sourceIndex}
                                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5"
                              >

                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">

                                  <div className="flex-1">

                                    <p className="text-xs uppercase tracking-wider text-cyan-400 font-semibold mb-1">
                                      {source.publisher ||
                                        "Fact-Check Publisher"}
                                    </p>

                                    <h4 className="text-sm md:text-base font-semibold text-white mb-2">
                                      {source.title ||
                                        "Fact-check source"}
                                    </h4>

                                    {source.rating && (
                                      <p className="text-sm text-slate-400 leading-6">
                                        {source.rating}
                                      </p>
                                    )}

                                    {source.reviewDate && (
                                      <p className="text-xs text-slate-500 mt-3">
                                        Reviewed:{" "}
                                        {source.reviewDate}
                                      </p>
                                    )}

                                  </div>

                                  {source.url && (
                                    <a
                                      href={source.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-sm font-medium hover:bg-cyan-500/20 transition-colors shrink-0"
                                    >
                                      View Source
                                      <ExternalLink className="w-4 h-4" />
                                    </a>
                                  )}

                                </div>

                              </div>
                            ))}

                          </div>

                        </div>
                      )}

                    {/* No Sources */}
                    {(!Array.isArray(msg.result.sources) ||
                      msg.result.sources.length === 0) && (
                      <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-4">
                        <p className="text-sm text-yellow-400">
                          No external fact-check sources were returned for
                          this investigation.
                        </p>
                      </div>
                    )}

                  </div>

                </div>
              )}

            </div>

          ))}

          {/* Loading */}
          {loading && (
            <div className="flex justify-start">
              <div className="p-4 rounded-2xl bg-slate-900 text-slate-400 border border-slate-800">
                FROST is investigating fact-check sources...
              </div>
            </div>
          )}

        </div>

        {/* Input */}
        <textarea
          placeholder="Paste news text or article URL here..."
          className="w-full h-32 p-5 rounded-3xl text-lg resize-y focus:outline-none mb-6 bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:border-cyan-400 transition-all"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              checkNews();
            }
          }}
        />

        {/* Button */}
        <button
          onClick={checkNews}
          disabled={!text.trim() || loading}
          className="w-full py-5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl font-semibold text-lg text-white hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading
            ? "Investigating Sources..."
            : "Investigate News"}
        </button>

      </div>
    </div>
  );
}
