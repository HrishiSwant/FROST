// src/pages/ProjectInfo.jsx
import { ArrowLeft } from "lucide-react";

export default function ProjectInfo({ goBack, theme }) {
  return (
    <div className={`min-h-screen pt-20 pb-12 px-6 ${theme === "dark" ? "bg-[#020617]" : "bg-slate-50"}`}>
      <div className="max-w-4xl mx-auto">
        <button onClick={goBack} className="flex items-center gap-2 text-cyan-400 mb-8 hover:text-white">
          <ArrowLeft size={20} /> Back to Home
        </button>

        <div className="glass rounded-3xl p-12">
          <h1 className={`text-5xl font-bold mb-8 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>About FROST</h1>
          
          <div className="prose max-w-none">
            <h2 className="text-3xl font-semibold mt-12 mb-4">Abstract</h2>
            <p className={theme === "dark" ? "text-slate-300" : "text-slate-700"}>
              In the age of rapid digital communication, misinformation, fraudulent activities, and synthetic media pose significant threats to societal trust and security. FROST is an integrated AI-powered system designed to detect fake news, identify fraudulent calls, and recognize deepfake content.
            </p>

            <h2 className="text-3xl font-semibold mt-12 mb-4">Objectives</h2>
            <ul className="list-disc pl-6 space-y-3 text-lg">
              <li>Detect fake news using NLP and Machine Learning</li>
              <li>Identify scam calls through caller metadata analysis</li>
              <li>Detect deepfakes using computer vision techniques</li>
              <li>Provide a unified, user-friendly cybersecurity platform</li>
            </ul>

            <h2 className="text-3xl font-semibold mt-12 mb-4">Technologies Used</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
              {["React.js", "Tailwind CSS", "FastAPI", "Python", "Scikit-learn", "OpenCV", "Phonenumbers", "BeautifulSoup"].map((tech) => (
                <div key={tech} className={`p-4 rounded-2xl text-center ${theme === "dark" ? "bg-slate-900" : "bg-white border"}`}>
                  {tech}
                </div>
              ))}
            </div>

            <h2 className="text-3xl font-semibold mt-16 mb-6">Project Report</h2>
            <p className="text-slate-400">Full academic project documentation is available in the attached PDF.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
