import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { API_BASE } from "../../../config";

export default function ChatPage() {
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    const text = input.trim();

    if (!text || loading) return;

    const userMessage = {
      role: "user",
      content: text,
    };

    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data?.error || "FROST AI could not process your request"
        );
      }

      const aiMessage = {
        role: "assistant",
        content: data.data.answer,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            error.message ||
            "Unable to connect to FROST AI. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-5xl items-center justify-between px-6">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10">
              <ShieldCheck className="h-5 w-5 text-cyan-400" />
            </div>

            <div>
              <p className="font-semibold">FROST AI</p>
              <p className="text-xs text-slate-500">
                Security Assistant
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 text-xs text-emerald-400 sm:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Online
          </div>
        </div>
      </header>

      {/* Chat area */}
      <main className="mx-auto flex min-h-[calc(100vh-80px)] max-w-5xl flex-col px-4 py-6 sm:px-6">
        <div className="flex flex-1 flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-950/60 shadow-2xl backdrop-blur-xl">

          {/* Intro when empty */}
          {messages.length === 0 && (
            <div className="flex flex-1 items-center justify-center px-6 py-16">
              <div className="max-w-xl text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-cyan-400/20 bg-cyan-400/10 shadow-[0_0_50px_rgba(34,211,238,0.12)]">
                  <Sparkles className="h-9 w-9 text-cyan-400" />
                </div>

                <h1 className="text-4xl font-bold sm:text-5xl">
                  How can FROST AI help?
                </h1>

                <p className="mx-auto mt-5 max-w-lg text-slate-400">
                  Ask questions about cybersecurity, digital safety,
                  deepfakes, online scams, privacy, misinformation,
                  technology, and more.
                </p>

                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  {[
                    "How can I spot a phishing scam?",
                    "How do deepfakes work?",
                    "How can I protect my privacy?",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setInput(suggestion)}
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300 transition hover:border-cyan-400/30 hover:bg-cyan-400/5 hover:text-white"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.length > 0 && (
            <div className="flex-1 space-y-6 overflow-y-auto p-5 sm:p-8">
              {messages.map((message, index) => {
                const isUser = message.role === "user";

                return (
                  <div
                    key={index}
                    className={`flex ${
                      isUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-5 py-4 text-sm leading-relaxed whitespace-pre-wrap sm:max-w-[75%] ${
                        isUser
                          ? "bg-gradient-to-r from-cyan-500 to-purple-600 text-white"
                          : "border border-white/10 bg-slate-900 text-slate-200"
                      }`}
                    >
                      {!isUser && (
                        <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-cyan-400">
                          <ShieldCheck size={14} />
                          FROST AI
                        </div>
                      )}

                      {message.content}
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl border border-white/10 bg-slate-900 px-5 py-4 text-sm text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
                      FROST AI is thinking...
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Input */}
          <div className="border-t border-white/10 bg-slate-950/80 p-4 sm:p-5">
            <div className="flex items-end gap-3 rounded-2xl border border-white/10 bg-slate-900/80 p-2 focus-within:border-cyan-400/30">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask FROST AI anything..."
                rows={1}
                disabled={loading}
                className="max-h-32 min-h-[48px] flex-1 resize-none bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-slate-600"
              />

              <button
                type="button"
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Send message"
              >
                <Send size={19} />
              </button>
            </div>

            <p className="mt-2 text-center text-xs text-slate-600">
              FROST AI can make mistakes. Verify important information.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
