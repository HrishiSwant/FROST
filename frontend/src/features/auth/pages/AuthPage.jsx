// src/pages/Auth.jsx
import { SignIn, SignUp } from "@clerk/clerk-react";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";

export default function Authage({ goBack, theme }) {
  const [mode, setMode] = useState("sign-in"); // "sign-in" or "sign-up"

  return (
    <div className={`min-h-screen pt-20 px-6 ${theme === "dark" ? "bg-[#020617]" : "bg-slate-50"}`}>
      <div className="max-w-md mx-auto">
        <button
          onClick={goBack}
          className="flex items-center gap-2 text-cyan-400 mb-8 hover:text-white"
        >
          <ArrowLeft size={20} /> Back
        </button>

        <div className="glass rounded-3xl p-10">
          <div className="flex justify-center gap-6 mb-8">
            <button
              onClick={() => setMode("sign-in")}
              className={`px-6 py-3 rounded-2xl font-medium transition-all ${
                mode === "sign-in"
                  ? "bg-cyan-500 text-black"
                  : "hover:bg-white/10"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode("sign-up")}
              className={`px-6 py-3 rounded-2xl font-medium transition-all ${
                mode === "sign-up"
                  ? "bg-cyan-500 text-black"
                  : "hover:bg-white/10"
              }`}
            >
              Sign Up
            </button>
          </div>

          {mode === "sign-in" ? (
            <SignIn 
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "glass shadow-none border-0 bg-transparent",
                  headerTitle: "text-2xl font-semibold",
                  formButtonPrimary: "bg-cyan-500 hover:bg-cyan-600 text-black",
                }
              }}
            />
          ) : (
            <SignUp 
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "glass shadow-none border-0 bg-transparent",
                  headerTitle: "text-2xl font-semibold",
                  formButtonPrimary: "bg-cyan-500 hover:bg-cyan-600 text-black",
                }
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
