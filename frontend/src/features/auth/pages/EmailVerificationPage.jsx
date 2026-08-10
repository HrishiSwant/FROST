import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MailCheck, RefreshCw, LogOut } from "lucide-react";

import {
  logoutUser,
  resendVerificationEmail,
  refreshCurrentUser,
} from "../../../services/auth/authService";

export default function EmailVerificationPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const userEmail = localStorage.getItem(
    "frost_verification_email"
  );

  useEffect(() => {
    if (!userEmail) {
      navigate("/login", { replace: true });
    }
  }, [navigate, userEmail]);

  const checkVerification = async () => {
    try {
      setChecking(true);
      setError("");
      setMessage("");

      const user = await refreshCurrentUser();

      if (!user) {
        navigate("/login", { replace: true });
        return;
      }

      if (user.emailVerified) {
        localStorage.removeItem(
          "frost_verification_email"
        );

        navigate("/dashboard", { replace: true });
        return;
      }

      setError(
        "Your email is not verified yet. Please check your inbox and click the verification link."
      );
    } catch (error) {
      console.error(
        "Verification check failed:",
        error
      );

      setError(
        "Unable to check verification status. Please try again."
      );
    } finally {
      setChecking(false);
    }
  };

  const resendEmail = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      await resendVerificationEmail();

      setMessage(
        "A new verification email has been sent. Please check your inbox."
      );
    } catch (error) {
      console.error(
        "Verification email error:",
        error
      );

      if (
        error?.code ===
        "auth/too-many-requests"
      ) {
        setError(
          "Too many requests. Please wait a little before requesting another email."
        );
      } else {
        setError(
          "Unable to send the verification email. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();

      localStorage.removeItem(
        "frost_verification_email"
      );

      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        {/* Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-400/20 mb-4">
            <MailCheck className="w-9 h-9 text-cyan-400" />
          </div>

          <h1 className="text-3xl font-semibold">
            Verify your email
          </h1>

          <p className="text-slate-400 mt-3 leading-relaxed">
            We've sent a verification link to
          </p>

          {userEmail && (
            <p className="text-cyan-400 font-medium mt-1 break-all">
              {userEmail}
            </p>
          )}
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 shadow-2xl">

          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            Open the email from FROST and click the
            verification link. Once you've verified your
            email, return here and click the button below.
          </p>

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300 mb-4">
              {error}
            </div>
          )}

          {/* Success */}
          {message && (
            <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-300 mb-4">
              {message}
            </div>
          )}

          {/* Check */}
          <button
            type="button"
            onClick={checkVerification}
            disabled={checking}
            className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 py-3.5 font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {checking
              ? "Checking..."
              : "I've verified my email"}
          </button>

          {/* Resend */}
          <button
            type="button"
            onClick={resendEmail}
            disabled={loading}
            className="w-full mt-3 rounded-xl border border-slate-700 bg-slate-950/50 py-3.5 font-medium text-slate-300 transition hover:border-cyan-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="inline-flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" />
              {loading
                ? "Sending..."
                : "Resend verification email"}
            </span>
          </button>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full mt-5 flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>

        {/* Back */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-sm text-slate-500 hover:text-slate-300 transition"
          >
            ← Back to FROST
          </Link>
        </div>

      </div>
    </div>
  );
}
