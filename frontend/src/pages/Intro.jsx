import React from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, ScanFace, Phone, ArrowRight } from "lucide-react";

export default function Intro() {
  const navigate = useNavigate();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020617] text-white">

      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#0f2a3a_0%,#020617_45%,#020617_100%)]" />

      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#22d3ee_1px,transparent_1px),linear-gradient(to_bottom,#22d3ee_1px,transparent_1px)] bg-[size:60px_60px]" />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-6">

        <div className="w-full max-w-5xl text-center">

          {/* Logo */}
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/10 shadow-[0_0_60px_rgba(34,211,238,0.15)]">
            <ShieldCheck className="h-12 w-12 text-cyan-400" />
          </div>

          {/* Heading */}
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

            <div className="rounded-2xl border border-cyan-400/10 bg-slate-900/60 p-5 backdrop-blur">
              <ScanFace className="mx-auto mb-3 h-8 w-8 text-emerald-400" />

              <p className="font-medium text-slate-200">
                Deepfake Detection
              </p>
            </div>

            <div className="rounded-2xl border border-cyan-400/10 bg-slate-900/60 p-5 backdrop-blur">
              <ShieldCheck className="mx-auto mb-3 h-8 w-8 text-cyan-400" />

              <p className="font-medium text-slate-200">
                News Intelligence
              </p>
            </div>

            <div className="rounded-2xl border border-cyan-400/10 bg-slate-900/60 p-5 backdrop-blur">
              <Phone className="mx-auto mb-3 h-8 w-8 text-purple-400" />

              <p className="font-medium text-slate-200">
                Phone Intelligence
              </p>
            </div>

          </div>

          {/* Get Started */}
          <button
            onClick={() => navigate("/dashboard")}
            className="group mt-12 inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 px-10 py-5 text-lg font-semibold text-black shadow-[0_15px_50px_rgba(34,211,238,0.15)] transition-all duration-300 hover:scale-105 hover:brightness-110"
          >
            Get Started

            <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
          </button>

          {/* About */}
          <button
            onClick={() => navigate("/about")}
            className="mt-5 block mx-auto text-sm text-slate-500 transition hover:text-cyan-400"
          >
            Learn more about FROST
          </button>

        </div>
      </div>
    </main>
  );
}