import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  ScanFace,
  Phone,
  ArrowRight,
  Sparkles,
  Lock,
  Zap,
} from "lucide-react";

export default function Intro() {
  const navigate = useNavigate();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020617] text-white">

      {/* Background glow */}
      <div className="pointer-events-none absolute left-1/2 top-[-250px] h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-cyan-500/20 blur-[140px]" />

      <div className="pointer-events-none absolute bottom-[-250px] right-[-150px] h-[500px] w-[500px] rounded-full bg-purple-600/10 blur-[140px]" />

      {/* Grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(34,211,238,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Navigation */}
      <header className="relative z-20 border-b border-white/5 bg-slate-950/40 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10">
              <ShieldCheck className="h-6 w-6 text-cyan-400" />
            </div>

            <span className="text-xl font-bold tracking-wide">
              FROST
            </span>
          </div>

          <button
            type="button"
            onClick={() => navigate("/about")}
            className="rounded-lg px-4 py-2 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            About FROST
          </button>

        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-80px)] max-w-7xl items-center px-6 py-20 lg:px-8">

        <div className="grid w-full items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">

          {/* Left */}
          <div>

            {/* Badge */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-2 text-sm text-cyan-300">
              <Sparkles className="h-4 w-4" />
              AI-Powered Digital Protection
            </div>

            {/* Heading */}
            <h1 className="text-6xl font-bold leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl">

              <span className="block text-white">
                Defending
              </span>

              <span className="mt-2 block bg-gradient-to-r from-cyan-300 via-white to-purple-400 bg-clip-text text-transparent">
                Reality.
              </span>

            </h1>

            {/* Description */}
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-slate-400 sm:text-xl">
              FROST is an AI-powered cybersecurity platform designed to
              detect deepfakes, verify news, and identify suspicious phone
              numbers before they become a threat.
            </p>

            {/* Buttons */}
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">

              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="group inline-flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-500 px-7 py-4 font-semibold text-slate-950 shadow-[0_0_40px_rgba(34,211,238,0.15)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_0_50px_rgba(34,211,238,0.3)]"
              >
                Enter Security Center

                <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
              </button>

              <button
                type="button"
                onClick={() => navigate("/about")}
                className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-7 py-4 font-medium text-slate-200 backdrop-blur transition hover:border-cyan-400/30 hover:bg-white/10"
              >
                Learn More
              </button>

            </div>

            {/* Trust indicators */}
            <div className="mt-12 flex flex-wrap gap-6 text-sm text-slate-500">

              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-emerald-400" />
                Secure Analysis
              </div>

              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-cyan-400" />
                AI Powered
              </div>

              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-purple-400" />
                Reality Protection
              </div>

            </div>

          </div>

          {/* Right */}
          <div className="relative hidden lg:block">

            {/* Main card */}
            <div className="relative rounded-[2rem] border border-white/10 bg-slate-900/50 p-6 shadow-2xl backdrop-blur-xl">

              {/* Top */}
              <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-5">

                <div>
                  <p className="text-sm text-slate-500">
                    FROST SECURITY CENTER
                  </p>

                  <p className="mt-1 text-lg font-semibold">
                    Intelligence Systems
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10">
                  <ShieldCheck className="h-5 w-5 text-emerald-400" />
                </div>

              </div>

              {/* Module cards */}
              <div className="space-y-4">

                <button
                  type="button"
                  onClick={() => navigate("/deepfake")}
                  className="group flex w-full items-center gap-4 rounded-2xl border border-emerald-400/10 bg-emerald-400/5 p-5 text-left transition hover:border-emerald-400/30 hover:bg-emerald-400/10"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10">
                    <ScanFace className="h-6 w-6 text-emerald-400" />
                  </div>

                  <div className="flex-1">
                    <p className="font-semibold">
                      Deepfake Detection
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Analyze images for AI manipulation
                    </p>
                  </div>

                  <ArrowRight className="h-5 w-5 text-slate-600 transition group-hover:translate-x-1 group-hover:text-emerald-400" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="group flex w-full items-center gap-4 rounded-2xl border border-cyan-400/10 bg-cyan-400/5 p-5 text-left transition hover:border-cyan-400/30 hover:bg-cyan-400/10"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10">
                    <ShieldCheck className="h-6 w-6 text-cyan-400" />
                  </div>

                  <div className="flex-1">
                    <p className="font-semibold">
                      News Intelligence
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Verify digital information
                    </p>
                  </div>

                  <ArrowRight className="h-5 w-5 text-slate-600 transition group-hover:translate-x-1 group-hover:text-cyan-400" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="group flex w-full items-center gap-4 rounded-2xl border border-purple-400/10 bg-purple-400/5 p-5 text-left transition hover:border-purple-400/30 hover:bg-purple-400/10"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-400/10">
                    <Phone className="h-6 w-6 text-purple-400" />
                  </div>

                  <div className="flex-1">
                    <p className="font-semibold">
                      Phone Intelligence
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Identify suspicious numbers
                    </p>
                  </div>

                  <ArrowRight className="h-5 w-5 text-slate-600 transition group-hover:translate-x-1 group-hover:text-purple-400" />
                </button>

              </div>

              {/* Status */}
              <div className="mt-6 flex items-center gap-3 rounded-xl border border-emerald-400/10 bg-emerald-400/5 px-4 py-3">

                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />

                <span className="text-sm text-emerald-300">
                  Security systems operational
                </span>

              </div>

            </div>

            {/* Decorative glow */}
            <div className="absolute -inset-4 -z-10 rounded-[3rem] bg-cyan-500/5 blur-3xl" />

          </div>

        </div>

      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-6 text-center text-xs text-slate-600">
        FROST • AI-powered digital authenticity & cybersecurity
      </footer>

    </main>
  );
}
