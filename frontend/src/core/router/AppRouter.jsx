import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import LandingPage from "../../features/dashboard/pages/LandingPage";
import DashboardPage from "../../features/dashboard/pages/DashboardPage";
import AboutFrost from "../../features/dashboard/pages/AboutFrost";

import Deepfake from "../../pages/Deepfake";
import Fakenews from "../../pages/Fakenews";

import PhoneIntelligencePage from "../../features/phone-intelligence/pages/PhoneIntelligencePage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing */}
        <Route path="/" element={<LandingPage />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* About */}
        <Route path="/about" element={<AboutFrost />} />

        {/* Intelligence Modules */}
        <Route path="/deepfake" element={<Deepfake />} />

        <Route path="/news" element={<Fakenews />} />

        <Route
          path="/phone"
          element={<PhoneIntelligencePage />}
        />

        {/* Unknown route */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}
