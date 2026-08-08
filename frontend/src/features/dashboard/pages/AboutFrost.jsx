import React from "react";
import {
  ArrowLeft,
  Shield,
  Phone,
  Image,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AboutFrost() {
  const navigate = useNavigate();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020617] px-6 py-12 text-white sm:px-8 lg:px-12">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,#0f2a3a_0%,#020617_45%,#020617_100%)]" />

      <div className="pointer-events-none fixed inset-0 opacity-10 bg-[linear-gradient(to_right,#22d3ee_1px,transparent_1px),linear-gradient(to_bottom,#22d3ee_1px,transparent_1px)] bg-[size:60px_60px]" />

      {/* Glow */}
      <div className="pointer-events-none fixed left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl">

        {/* Back Button */}
        <button
          type="button"
          onClick={() => navigate("/")}
          className="mb-10 flex items-center gap-2 text-sm font-medium text-cyan-400 transition-colors duration-200 hover:text-white"
        >
          <ArrowLeft size={20} />
          Back to Home
        </button>

        {/* Main Card */}
        <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-xl sm:p-12 md:p-16">

          {/* Header */}
          <div className="max-w-4xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-2 text-sm text-cyan-300">
              <Shield size={16} />
              Digital Reality Protection
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              What is{" "}
              <span className="bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
                FROST
              </span>
              ?
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-slate-300 sm:text-xl">
              FROST is your personal AI-powered shield against digital
              deception. It helps you detect fake news, identify scam calls,
              and verify if an image or video is real or AI-generated.
            </p>
          </div>

          {/* Modules */}
          <div className="mt-16 grid gap-6 md:grid-cols-3">

            {/* News */}
            <div className="group rounded-3xl border border-cyan-400/10 bg-slate-950/60 p-8 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-slate-950/80">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10">
                <Shield className="h-8 w-8 text-cyan-400" />
              </div>

              <h2 className="mb-3 text-2xl font-semibold">
                Fake News Detector
              </h2>

              <p className="leading-relaxed text-slate-400">
                Paste any news article or URL and instantly know if it's
                real, suspicious, or fake.
              </p>
            </div>

            {/* Phone */}
            <div className="group rounded-3xl border border-purple-400/10 bg-slate-950/60 p-8 transition-all duration-300 hover:-translate-y-1 hover:border-purple-400/30 hover:bg-slate-950/80">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-400/10">
                <Phone className="h-8 w-8 text-purple-400" />
              </div>

              <h2 className="mb-3 text-2xl font-semibold">
                Scam Call Protector
              </h2>

              <p className="leading-relaxed text-slate-400">
                Enter any phone number and check if it's safe or a potential
                scam before you answer.
              </p>
            </div>

            {/* Deepfake */}
            <button
              type="button"
              onClick={() => navigate("/deepfake")}
              className="group rounded-3xl border border-emerald-400/10 bg-slate-950/60 p-8 text-left transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/30 hover:bg-slate-950/80"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/10">
                <Image className="h-8 w-8 text-emerald-400" />
              </div>

              <h2 className="mb-3 text-2xl font-semibold">
                Deepfake Detector
              </h2>

              <p className="leading-relaxed text-slate-400">
                Upload any photo and find out if it's real or AI-manipulated
                (deepfake).
              </p>

              <div className="mt-6 flex items-center gap-2 text-sm font-medium text-emerald-400">
                Try Deepfake Detection
                <ArrowRight
                  size={16}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </div>
            </button>

          </div>

          {/* Why FROST */}
          <div className="mt-20 border-t border-white/10 pt-16">

            <div className="text-center">
              <h2 className="text-3xl font-semibold sm:text-4xl">
                Why People Use FROST
              </h2>

              <p className="mx-auto mt-4 max-w-2xl text-slate-400">
                Stay informed, protect yourself from digital deception,
                and make better decisions about the content you encounter.
              </p>
            </div>

            <div className="mx-auto mt-10 grid max-w-5xl gap-6 md:grid-cols-3">

              <div className="rounded-2xl border border-white/5 bg-slate-950/40 p-6">
                <CheckCircle className="mb-4 h-6 w-6 text-emerald-400" />

                <p className="leading-relaxed text-slate-300">
                  Protect yourself from fake news and misinformation.
                </p>
              </div>

              <div className="rounded-2xl border border-white/5 bg-slate-950/40 p-6">
                <CheckCircle className="mb-4 h-6 w-6 text-emerald-400" />

                <p className="leading-relaxed text-slate-300">
                  Avoid falling for phone scams and fraudulent calls.
                </p>
              </div>

              <div className="rounded-2xl border border-white/5 bg-slate-950/40 p-6">
                <CheckCircle className="mb-4 h-6 w-6 text-emerald-400" />

                <p className="leading-relaxed text-slate-300">
                  Verify whether images and videos are real or manipulated.
                </p>
              </div>

            </div>
          </div>

          {/* CTA */}
          <div className="mt-16 rounded-3xl border border-cyan-400/10 bg-gradient-to-r from-cyan-400/5 to-purple-500/5 p-10 text-center">

            <h2 className="text-2xl font-semibold sm:text-3xl">
              Ready to defend reality?
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-slate-400">
              Explore the FROST security center and start analyzing
              potentially deceptive digital content.
            </p>

            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="group mt-8 inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 px-8 py-4 font-semibold text-black transition-all duration-300 hover:scale-105 hover:brightness-110"
            >
              Try FROST Now

              <ArrowRight
                size={18}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </button>

          </div>

        </section>
      </div>
    </main>
  );
}
