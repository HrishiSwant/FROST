// src/App.js
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Phone, ScanFace, Sun, Moon, ArrowLeft, Zap } from "lucide-react";

import Navbar from "./components/Navbar";
import GlassCard from "./components/GlassCard";
import BackgroundGrid from "./components/BackgroundGrid";

import Deepfake from "./pages/Deepfake";
import Fakenews from "./pages/Fakenews";
import PhoneScanner from "./pages/PhoneScanner";

const API_BASE = process.env.REACT_APP_API_URL || "https://frost-7sn1.onrender.com";

function App() {
  const [currentView, setCurrentView] = useState("intro");
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    document.documentElement.className = theme;
    document.body.className = theme === "dark" 
      ? "bg-[#020617] text-white overflow-x-hidden" 
      : "bg-slate-50 text-slate-900 overflow-x-hidden";
  }, [theme]);

  const navigate = (view) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen relative">
      <BackgroundGrid />

      <Navbar 
        currentView={currentView} 
        setCurrentView={navigate} 
        theme={theme} 
        setTheme={setTheme} 
      />

      <AnimatePresence mode="wait">
        {currentView === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center relative z-10"
          >
            <div className="text-center px-6 max-w-4xl">
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <div className="inline-flex items-center gap-3 mb-6">
                  <div className="w-16 h-16 bg-cyan-500/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-cyan-400/30">
                    <Zap className="w-9 h-9 text-cyan-400" />
                  </div>
                  <h1 className="text-7xl md:text-8xl font-bold tracking-tighter bg-gradient-to-r from-cyan-300 via-white to-purple-300 bg-clip-text text-transparent">
                    FROST
                  </h1>
                </div>

                <p className="text-3xl md:text-5xl font-light tracking-tight mb-8 text-slate-300">
                  Defending Reality in Real Time
                </p>
                <p className="text-xl text-slate-400 max-w-xl mx-auto mb-12">
                  AI-powered detection for deepfakes, fake news, and scam calls.
                </p>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("dashboard")}
                  className="group relative px-12 py-6 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-3xl font-semibold text-xl text-black overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    Enter Command Center
                    <ArrowLeft className="rotate-180 group-hover:-translate-x-1 transition" />
                  </span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        )}

        {currentView === "dashboard" && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="pt-20 pb-24 relative z-10 max-w-7xl mx-auto px-6"
          >
            <div className="mb-16 text-center">
              <h2 className="text-5xl font-bold tracking-tighter mb-3">Security Command Center</h2>
              <p className="text-slate-400 text-xl">Choose your intelligence tool</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  id: "fake-news",
                  icon: ShieldCheck,
                  title: "Fake News Detection",
                  desc: "Analyze articles and URLs with deep semantic intelligence",
                  color: "cyan"
                },
                {
                  id: "phone",
                  icon: Phone,
                  title: "Caller Intelligence",
                  desc: "Real-time scam & fraud risk assessment",
                  color: "purple"
                },
                {
                  id: "deepfake",
                  icon: ScanFace,
                  title: "Deepfake Detection",
                  desc: "Upload images for instant authenticity verification",
                  color: "emerald"
                }
              ].map((tool, i) => (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -12, transition: { duration: 0.3 } }}
                  onClick={() => navigate(tool.id)}
                  className="cursor-pointer group"
                >
                  <GlassCard className="h-full p-10 flex flex-col items-center text-center border-cyan-400/20 hover:border-cyan-400/50">
                    <div className={`w-20 h-20 mb-8 rounded-3xl bg-gradient-to-br from-${tool.color}-500/10 to-purple-500/10 flex items-center justify-center border border-${tool.color}-400/30 group-hover:scale-110 transition-transform`}>
                      <tool.icon className={`w-12 h-12 text-${tool.color}-400`} />
                    </div>
                    <h3 className="text-3xl font-semibold mb-4 tracking-tight">{tool.title}</h3>
                    <p className="text-slate-400 leading-relaxed">{tool.desc}</p>
                    <div className="mt-auto pt-10">
                      <span className="text-sm uppercase tracking-[2px] text-cyan-400 group-hover:text-white transition-colors">
                        Launch Tool →
                      </span>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {currentView === "phone" && <PhoneScanner goBack={() => navigate("dashboard")} API_BASE={API_BASE} />}
        {currentView === "deepfake" && <Deepfake goBack={() => navigate("dashboard")} API_BASE={API_BASE} />}
        {currentView === "fake-news" && <Fakenews goBack={() => navigate("dashboard")} API_BASE={API_BASE} />}
      </AnimatePresence>
    </div>
  );
}

export default App;
