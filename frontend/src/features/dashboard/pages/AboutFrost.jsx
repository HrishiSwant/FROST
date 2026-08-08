import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Shield,
  Phone,
  Image,
  CheckCircle,
} from "lucide-react";

export default function AboutFrost() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#020617] text-white pt-20 pb-16 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-cyan-400 hover:text-white mb-10 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Home
        </button>

        {/* Main Card */}
        <div className="glass rounded-3xl p-8 md:p-12 lg:p-16">

          {/* Header */}
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 text-white">
              What is FROST?
            </h1>

            <p className="text-xl leading-relaxed text-slate-300">
              FROST is your personal AI-powered shield against digital
              deception. It helps you detect fake news, identify scam calls,
              and verify if an image or video is real or AI-generated.
            </p>
          </div>

          {/* Modules */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">

            {/* Fake News */}
            <div className="p-8 rounded-3xl bg-slate-900/70 border border-slate-800">
              <Shield className="w-12 h-12 text-cyan-400 mb-6" />

              <h3 className="text-2xl font-semibold mb-3 text-white">
                Fake News Detector
              </h3>

              <p className="text-slate-400 leading-relaxed">
                Paste any news article or URL and instantly know if it's real,
                suspicious, or fake.
              </p>
            </div>

            {/* Scam Call */}
            <div className="p-8 rounded-3xl bg-slate-900/70 border border-slate-800">
              <Phone className="w-12 h-12 text-purple-400 mb-6" />

              <h3 className="text-2xl font-semibold mb-3 text-white">
                Scam Call Protector
              </h3>

              <p className="text-slate-400 leading-relaxed">
                Enter any phone number and check if it's safe or a potential
                scam before you answer.
              </p>
            </div>

            {/* Deepfake */}
            <div className="p-8 rounded-3xl bg-slate-900/70 border border-slate-800">
              <Image className="w-12 h-12 text-emerald-400 mb-6" />

              <h3 className="text-2xl font-semibold mb-3 text-white">
                Deepfake Detector
              </h3>

              <p className="text-slate-400 leading-relaxed">
                Upload any photo and find out if it's real or AI-manipulated
                (deepfake).
              </p>
            </div>
          </div>

          {/* Why FROST */}
          <div className="mt-20 text-center">

            <h2 className="text-3xl font-semibold mb-10 text-white">
              Why People Use FROST
            </h2>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">

              <div className="flex gap-4 text-left">
                <CheckCircle className="text-emerald-400 mt-1 flex-shrink-0" />

                <p className="text-slate-300">
                  Protect yourself from fake news and misinformation
                </p>
              </div>

              <div className="flex gap-4 text-left">
                <CheckCircle className="text-emerald-400 mt-1 flex-shrink-0" />

                <p className="text-slate-300">
                  Avoid falling for phone scams and fraud calls
                </p>
              </div>

              <div className="flex gap-4 text-left">
                <CheckCircle className="text-emerald-400 mt-1 flex-shrink-0" />

                <p className="text-slate-300">
                  Verify if images and videos are real or manipulated
                </p>
              </div>

            </div>
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">

            <button
              onClick={() => navigate("/dashboard")}
              className="px-10 py-5 bg-gradient-to-r from-cyan-500 to-purple-600 text-black font-semibold text-xl rounded-3xl hover:scale-105 transition-all"
            >
              Try FROST Now
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}
