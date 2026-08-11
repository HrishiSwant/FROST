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
import ChatPage from "../../features/chat/pages/ChatPage";

import Deepfake from "../../pages/Deepfake";
import Fakenews from "../../pages/Fakenews";

import PhoneIntelligencePage from "../../features/phone-intelligence/pages/PhoneIntelligencePage";

import LoginPage from "../../features/auth/pages/LoginPage";
import RegisterPage from "../../features/auth/pages/RegisterPage";
import EmailVerificationPage from "../../features/auth/pages/EmailVerificationPage";
import ProtectedRoute from "../../components/auth/ProtectedRoute";
import ForgotPasswordPage from "../../features/auth/pages/ForgotPasswordPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ================= PUBLIC ================= */}

        <Route path="/" element={<LandingPage />} />

        <Route path="/about" element={<AboutFrost />} />

        <Route path="/login" element={<LoginPage />} />

        <Route path="/register" element={<RegisterPage />} />

        <Route path="/verify-email" element={<EmailVerificationPage />} />

        <Route path="/forgot-password" element={<ForgotPasswordPage />}/>


        {/* ================= PROTECTED ================= */}

        <Route element={<ProtectedRoute />}>

          <Route
            path="/dashboard"
            element={<DashboardPage />}
          />

          <Route
            path="/deepfake"
            element={<Deepfake />}
          />

          <Route
            path="/news"
            element={<Fakenews />}
          />

          <Route
            path="/chat"
            element={<ChatPage />}
          />

          <Route
            path="/phone"
            element={<PhoneIntelligencePage />}
          />

        </Route>


        {/* ================= UNKNOWN ================= */}

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}
