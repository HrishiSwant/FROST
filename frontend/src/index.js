import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import FrostBackground from "./FrostBackground";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    {/* 3D Cyber Background */}
    <FrostBackground />

    {/* Dark overlay for readability */}
    <div className="frost-overlay"></div>

    {/* Your entire FROST app */}
    <App />
  </React.StrictMode>
);

// Performance monitoring (unchanged)
reportWebVitals();
