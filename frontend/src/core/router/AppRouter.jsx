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

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing */}
        <Route
          path="/"
          element={<LandingPage />}
        />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={<DashboardPage />}
        />

        {/* About FROST */}
        <Route
          path="/about"
          element={<AboutFrost />}
        />

        {/* Deepfake Detection */}
        <Route
          path="/deepfake"
          element={<Deepfake />}
        />

        {/* Unknown routes */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}
