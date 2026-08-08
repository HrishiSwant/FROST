import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  ScanFace,
  Phone,
  ArrowRight,
} from "lucide-react";

export default function Intro() {
  const navigate = useNavigate();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020617] text-white">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#0f2a3a_0%,#020617_45%,#020617_100%)]" />

      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#22d3ee_1px,transparent_1px),linear-gradient(to_bottom,#22d3ee_1px,transparent_1px)] bg-[size:60px_60px]" />

      {/* Glow */}
      <div className="absolute left-1/2 top-1/4 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-16">
        <div className="w-full max-w-5xl text-center">

          {/* Logo */}
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/10 shadow-[0_0_60px_rgba(34,211,238,0.15)]">
            <ShieldCheck className="h-12 w-12 text-cyan-400" />
          </div>

          {/* Brand */}
          <h1 className="bg-gradient-to-r from-cyan-300 via-white to-purple-300 bg-clip-text text-6xl font-bold tracking-tight text-transparent sm:text-7xl md:text-8xl">
            FROST
          </h1>

          <p className="mt-4 text-3xl font-light tracking-tight text-slate-300 sm:text-4xl md:text-5xl">
            Defending Reality
          </p>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
            An AI-powered cybersecurity platform designed to detect
            deepfakes, verify news, and identify suspicious phone numbers.
          </p>

          {/* Modules Preview */}
          <div className="mx-auto mt-12 grid max-w-3xl gap-4 sm:grid-cols-3">

            {/* Deepfake */}
            <button
              type="button"
              onClick={() => navigate("/deepfake")}
              className="group rounded-2xl border border-cyan-400/10 bg-slate-900/60 p-5 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/40 hover:bg-slate-900/90"
            >
              <ScanFace className="mx-auto mb-3 h-8 w-8 text-emerald-400 transition-transform duration-300 group-hover:scale-110" />

              <p className="font-medium text-slate-200">
                Deepfake Detection
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Analyze images for manipulation
              </p>
            </button>

            {/* News */}
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="group rounded-2xl border border-cyan-400/10 bg-slate-900/60 p-5 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/40 hover:bg-slate-900/90"
            >
              <ShieldCheck className="mx-auto mb-3 h-8 w-8 text-cyan-400 transition-transform duration-300 group-hover:scale-110" />

              <p className="font-medium text-slate-200">
                News Intelligence
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Verify news authenticity
              </p>
            </button>

            {/* Phone */}
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="group rounded-2xl border border-cyan-400/10 bg-slate-900/60 p-5 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-purple-400/40 hover:bg-slate-900/90"
            >
              <Phone className="mx-auto mb-3 h-8 w-8 text-purple-400 transition-transform duration-300 group-hover:scale-110" />

              <p className="font-medium text-slate-200">
                Phone Intelligence
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Check suspicious numbers
              </p>
            </button>

          </div>

          {/* Actions */}
          <div className="mt-12 flex flex-col items-center gap-5 sm:flex-row sm:justify-center">

            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="group inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 px-10 py-5 text-lg font-semibold text-black shadow-[0_15px_50px_rgba(34,211,238,0.15)] transition-all duration-300 hover:scale-105 hover:brightness-110"
            >
              Get Started

              <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </button>

            <button
              type="button"
              onClick={() => navigate("/about")}
              className="text-sm text-slate-500 transition hover:text-cyan-400"
            >
              Learn more about FROST
            </button>

          </div>

          {/* Footer text */}
          <p className="mt-12 text-xs tracking-wide text-slate-600">
            AI-powered digital authenticity & cybersecurity
          </p>

        </div>
      </div>
    </main>
  );
}
