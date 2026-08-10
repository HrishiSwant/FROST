import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute() {
  const {
    user,
    authLoading,
  } = useAuth();

  const location = useLocation();

  if (authLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--color-background)",
          color: "white",
          fontSize: "16px",
        }}
      >
        Loading FROST...
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  const isPasswordAccount =
    user.providerData?.some(
      (provider) =>
        provider.providerId === "password"
    );

  if (
    isPasswordAccount &&
    !user.emailVerified
  ) {
    localStorage.setItem(
      "frost_verification_email",
      user.email || ""
    );

    return (
      <Navigate
        to="/verify-email"
        replace
      />
    );
  }

  return <Outlet />;
}
