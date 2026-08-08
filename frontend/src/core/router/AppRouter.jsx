import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import LandingPage from "../../features/dashboard/pages/LandingPage";
import DashboardPage from "../../features/dashboard/pages/DashboardPage";

import Deepfake from "../../pages/Deepfake";
import Fakenews from "../../pages/Fakenews";
import AdminDashboard from "../../pages/AdminDashboard";
import AboutFrost from "../../features/dashboard/pages/AboutFrost";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Landing / Intro */}
        <Route path="/" element={<LandingPage />} />

        {/* Main Dashboard */}
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Security Modules */}
        <Route path="/dashboard/deepfake" element={<Deepfake />} />

        <Route path="/dashboard/fake-news" element={<Fakenews />} />

        {/* Information */}
        <Route path="/about" element={<AboutFrost />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Unknown route */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}
