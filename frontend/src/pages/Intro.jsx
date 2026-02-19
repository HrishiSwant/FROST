import React from "react";
import { useNavigate } from "react-router-dom";
import "./Intro.css";

export default function Intro() {
  const navigate = useNavigate();

  return (
    <div className="intro-container">
      <h1>FROST Cyber Security Platform</h1>

      <p>
        Detect fake news, deepfake images, and suspicious phone numbers
        using advanced AI and cybersecurity tools.
      </p>

      <button
        className="start-btn"
        onClick={() => navigate("")}
      >
        Get Started
      </button>
    </div>
  );
}
