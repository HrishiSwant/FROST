// src/pages/ProjectInfo.jsx
import React from "react";
import { ArrowLeft, Shield, Phone, Image, CheckCircle } from "lucide-react";

export default function AboutFrost({ goBack, theme }) {
  return (
    <div className={`min-h-screen pt-20 pb-16 px-6 ${theme === "dark" ? "bg-[#020617]" : "bg-slate-50"}`}>
      <div className="max-w-4xl mx-auto">
        
        <button 
          onClick={goBack} 
          className="flex items-center gap-2 text-cyan-400 hover:text-white mb-10 transition"
        >
          <ArrowLeft size={20} /> Back to Home
        </button>

        <div className="glass rounded-3xl p-12 md:p-16">
          <h1 className={`text-5xl md:text-6xl font-bold tracking-tight mb-6 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
            What is FROST?
          </h1>
          
          <p className={`text-xl leading-relaxed max-w-2xl ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>
            FROST is your personal AI-powered shield against digital deception. 
            It helps you detect fake news, identify scam calls, and verify if an image or video is real or AI-generated.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            {/* Card 1 */}
            <div className={`p-8 rounded-3xl ${theme === "dark" ? "bg-slate-900/70" : "bg-white border"}`}>
              <Shield className="w-12 h-12 text-cyan-400 mb-6" />
              <h3 className="text-2xl font-semibold mb-3">Fake News Detector</h3>
              <p className={theme === "dark" ? "text-slate-400" : "text-slate-600"}>
                Paste any news article or URL and instantly know if it's real, suspicious, or fake.
              </p>
            </div>

            {/* Card 2 */}
            <div className={`p-8 rounded-3xl ${theme === "dark" ? "bg-slate-900/70" : "bg-white border"}`}>
              <Phone className="w-12 h-12 text-purple-400 mb-6" />
              <h3 className="text-2xl font-semibold mb-3">Scam Call Protector</h3>
              <p className={theme === "dark" ? "text-slate-400" : "text-slate-600"}>
                Enter any phone number and check if it's safe or a potential scam before you answer.
              </p>
            </div>

            {/* Card 3 */}
            <div className={`p-8 rounded-3xl ${theme === "dark" ? "bg-slate-900/70" : "bg-white border"}`}>
              <Image className="w-12 h-12 text-emerald-400 mb-6" />
              <h3 className="text-2xl font-semibold mb-3">Deepfake Detector</h3>
              <p className={theme === "dark" ? "text-slate-400" : "text-slate-600"}>
                Upload any photo and find out if it's real or AI-manipulated (deepfake).
              </p>
            </div>
          </div>

          <div className="mt-20 text-center">
            <h2 className={`text-3xl font-semibold mb-6 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
              Why People Use FROST
            </h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="flex gap-4">
                <CheckCircle className="text-emerald-400 mt-1" />
                <p className={theme === "dark" ? "text-slate-300" : "text-slate-700"}>Protect yourself from fake news and misinformation</p>
              </div>
              <div className="flex gap-4">
                <CheckCircle className="text-emerald-400 mt-1" />
                <p className={theme === "dark" ? "text-slate-300" : "text-slate-700"}>Avoid falling for phone scams and fraud calls</p>
              </div>
              <div className="flex gap-4">
                <CheckCircle className="text-emerald-400 mt-1" />
                <p className={theme === "dark" ? "text-slate-300" : "text-slate-700"}>Verify if images and videos are real or manipulated</p>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <button
              onClick={goBack}
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
