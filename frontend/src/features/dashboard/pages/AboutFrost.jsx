import React from "react";
import {
  ArrowLeft,
  Shield,
  Phone,
  Image,
  CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AboutFrost() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-[#020617] px-6 pb-16 pt-20 text-white">

      <div className="mx-auto max-w-7xl">

        {/* Back */}
        <button
          onClick={() => navigate("/")}
          className="mb-10 flex items-center gap-2 text-cyan-400 transition hover:text-white"
        >
          <ArrowLeft size={20} />
          Back to Home
        </button>

        {/* Main Card */}
        <section className="glass rounded-3xl p-8 sm:p-12 md:p-16">

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            What is FROST?
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-slate-300 sm:text-xl">
            FROST is your personal AI-powered shield against digital
            deception. It helps you detect fake news, identify scam calls,
            and verify if an image or video is real or AI-generated.
          </p>

          {/* Modules */}
          <div className="mt-16 grid gap-8 md:grid-cols-3">

            <div className="rounded-3xl border border-cyan-400/10 bg-slate-900/70 p-8">
              <Shield className="mb-6 h-12 w-12 text-cyan-400" />

              <h2 className="mb-3 text-2xl font-semibold">
                Fake News Detector
              </h2>

              <p className="text-slate-400">
                Paste any news article or URL and instantly know if it's
                real, suspicious, or fake.
              </p>
            </div>

            <div className="rounded-3xl border border-purple-400/10 bg-slate-900/70 p-8">
              <Phone className="mb-6 h-12 w-12 text-purple-400" />

              <h2 className="mb-3 text-2xl font-semibold">
                Scam Call Protector
              </h2>

              <p className="text-slate-400">
                Enter any phone number and check if it's safe or a potential
                scam before you answer.
              </p>
            </div>

            <div className="rounded-3xl border border-emerald-400/10 bg-slate-900/70 p-8">
              <Image className="mb-6 h-12 w-12 text-emerald-400" />

              <h2 className="mb-3 text-2xl font-semibold">
                Deepfake Detector
              </h2>

              <p className="text-slate-400">
                Upload any photo and find out if it's real or AI-manipulated
                (deepfake).
              </p>
            </div>

          </div>

          {/* Why FROST */}
          <div className="mt-20">

            <h2 className="text-center text-3xl font-semibold">
              Why People Use FROST
            </h2>

            <div className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-3">

              <div className="flex gap-3">
                <CheckCircle className="mt-1 h-6 w-6 shrink-0 text-emerald-400" />

                <p className="text-slate-300">
                  Protect yourself from fake news and misinformation.
                </p>
              </div>

              <div className="flex gap-3">
                <CheckCircle className="mt-1 h-6 w-6 shrink-0 text-emerald-400" />

                <p className="text-slate-300">
                  Avoid falling for phone scams and fraud calls.
                </p>
              </div>

              <div className="flex gap-3">
                <CheckCircle className="mt-1 h-6 w-6 shrink-0 text-emerald-400" />

                <p className="text-slate-300">
                  Verify if images and videos are real or manipulated.
                </p>
              </div>

            </div>
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">

            <button
              onClick={() => navigate("/dashboard")}
              className="rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 px-10 py-5 text-lg font-semibold text-black transition hover:scale-105 hover:brightness-110"
            >
              Try FROST Now
            </button>

          </div>

        </section>
      </div>
    </main>
  );
}