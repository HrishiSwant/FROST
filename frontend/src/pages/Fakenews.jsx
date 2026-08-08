import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, ArrowLeft } from "lucide-react";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "https://frost-7sn1.onrender.com";

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
      { role: "user", content: userText },
    ]);

    setLoading(true);

    const isURL = userText.startsWith("http");

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
          data?.error ||
            data?.message ||
            data?.errors ||
            `Server error (${res.status}).`
        );
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content:
            data?.data?.answer ||
            data?.answer ||
            data?.error ||
            "No response from server.",
        },
      ]);
    } catch (error) {
      console.error("News analysis error:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content:
            error?.message ||
            "Failed to connect to FROST server. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white pt-20 pb-16 px-6">
      <div className="max-w-4xl mx-auto">

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

          {/* Chat */}
          <div className="space-y-4 max-h-[450px] overflow-y-auto mb-8 pr-2">
            {messages.length === 0 && !loading && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center">
                <ShieldCheck className="w-10 h-10 mx-auto mb-4 text-cyan-400" />

                <p className="text-slate-300">
                  Paste a news article, claim, or URL below to begin an
                  investigation.
                </p>
              </div>
            )}

            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] p-4 rounded-2xl text-sm whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-cyan-500 to-purple-600 text-white"
                      : "bg-slate-900 text-slate-200 border border-slate-700"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="p-4 rounded-2xl bg-slate-900 text-slate-400 border border-slate-800">
                  FROST is analyzing...
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
    </div>
  );
}
