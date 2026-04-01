import { useState } from "react";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export default function Fakenews({ goBack, API_BASE, theme }) {
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]); // Chat history
  const [loading, setLoading] = useState(false);

  const checkNews = async () => {
    if (!text.trim()) return;

    const userText = text.trim();
    setText(""); // Clear input

    // Add user message to chat
    setMessages((prev) => [
      ...prev,
      { role: "user", content: userText },
    ]);

    setLoading(true);

    const isURL = userText.startsWith("http");

    try {
      const res = await fetch(`${API_BASE}/api/news/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: isURL ? null : userText,
          url: isURL ? userText : null,
        }),
      });

      const data = await res.json();

      // Add AI response to chat
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: data?.data?.answer || data?.error || "No response from server",
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { 
          role: "ai", 
          content: "Failed to connect to FROST server. Please try again." 
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen pt-20 pb-12 px-6 ${theme === "dark" ? "bg-[#020617]" : "bg-slate-50"}`}>
      {/* Back Button */}
      <button
        onClick={goBack}
        className={`flex items-center gap-2 mb-8 text-sm font-medium ${
          theme === "dark" ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"
        }`}
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Dashboard
      </button>

      <div className="max-w-3xl mx-auto">
        <div className="glass rounded-3xl p-12">
          {/* Header */}
          <div className="flex items-center gap-4 mb-10">
            <ShieldCheck 
              className={`w-12 h-12 ${theme === "dark" ? "text-cyan-400" : "text-cyan-600"}`} 
            />
            <div>
              <h2 className={`text-4xl font-semibold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                Fake News Investigation
              </h2>
              <p className={theme === "dark" ? "text-slate-400" : "text-slate-600"}>
                Deep semantic analysis & fact-checking
              </p>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="space-y-4 max-h-96 overflow-y-auto mb-8 pr-2 custom-scrollbar">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-2xl text-sm whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-cyan-500 to-purple-600 text-white"
                      : theme === "dark"
                      ? "bg-slate-900 text-white border border-slate-700"
                      : "bg-white border border-slate-200 text-slate-900"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className={`p-4 rounded-2xl text-sm ${
                  theme === "dark" ? "bg-slate-900 text-slate-400" : "bg-white text-slate-500"
                }`}>
                  FROST is analyzing...
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <textarea
            placeholder="Paste news text or article URL here..."
            className={`w-full h-32 p-5 rounded-3xl text-lg resize-y focus:outline-none mb-6 transition-all
              ${theme === "dark" 
                ? "bg-slate-900 border border-slate-700 text-white placeholder-slate-500" 
                : "bg-white border border-slate-300 text-slate-900 placeholder-slate-400"
              }`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                checkNews();
              }
            }}
          />

          {/* Analyze Button */}
          <button
            onClick={checkNews}
            disabled={!text.trim() || loading}
            className="w-full py-5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl font-semibold text-lg text-white hover:brightness-110 disabled:opacity-70 transition-all duration-200"
          >
            {loading ? "Investigating Sources..." : "Investigate News"}
          </button>
        </div>
      </div>
    </div>
  );
}
