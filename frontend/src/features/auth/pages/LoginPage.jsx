import { useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

import {
  loginUser,
  loginWithGoogle,
} from "../../../services/auth/authService";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] = useState("");

  const redirectPath =
    location.state?.from || "/dashboard";

  /*
   * Email / Password Login
   */
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    setError("");

    if (!email.trim() || !password) {
      setError(
        "Please enter your email and password."
      );
      return;
    }

    try {
      setLoading(true);

      const user = await loginUser({
        email: email.trim(),
        password,
      });

      /*
       * Only email/password accounts
       * require email verification.
       */
      const isPasswordAccount =
        user?.providerData?.some(
          (provider) =>
            provider.providerId === "password"
        );

      if (
        isPasswordAccount &&
        !user.emailVerified
      ) {
        localStorage.setItem(
          "frost_verification_email",
          user.email || email.trim()
        );

        navigate("/verify-email", {
          replace: true,
        });

        return;
      }

      localStorage.removeItem(
        "frost_verification_email"
      );

      navigate(redirectPath, {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      switch (error?.code) {
        case "auth/invalid-credential":
        case "auth/wrong-password":
        case "auth/user-not-found":
          setError(
            "Invalid email or password."
          );
          break;

        case "auth/invalid-email":
          setError(
            "Please enter a valid email address."
          );
          break;

        case "auth/too-many-requests":
          setError(
            "Too many unsuccessful attempts. Please try again later."
          );
          break;

        case "auth/network-request-failed":
          setError(
            "Network error. Please check your internet connection."
          );
          break;

        default:
          setError(
            "Unable to sign in right now. Please try again."
          );
      }
    } finally {
      setLoading(false);
    }
  };

  /*
   * Google Login
   */
  const handleGoogleLogin = async () => {
    if (loading) return;

    try {
      setLoading(true);
      setError("");

      const user = await loginWithGoogle();

      /*
       * Google accounts are already
       * authenticated by Google.
       */
      localStorage.removeItem(
        "frost_verification_email"
      );

      console.log(
        "Google user:",
        user
      );

      navigate(redirectPath, {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Google login error:",
        error
      );

      switch (error?.code) {
        case "auth/popup-closed-by-user":
          setError(
            "Google sign-in was cancelled."
          );
          break;

        case "auth/popup-blocked":
          setError(
            "Your browser blocked the Google sign-in popup. Please allow popups for FROST and try again."
          );
          break;

        case "auth/cancelled-popup-request":
          setError(
            "Another Google sign-in request is already in progress."
          );
          break;

        case "auth/account-exists-with-different-credential":
          setError(
            "An account already exists with this email using another sign-in method."
          );
          break;

        case "auth/network-request-failed":
          setError(
            "Network error. Please check your internet connection."
          );
          break;

        default:
          setError(
            "Unable to sign in with Google. Please try again."
          );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-400/20 mb-4">
            <ShieldCheck className="w-9 h-9 text-cyan-400" />
          </div>

          <h1 className="text-3xl font-semibold">
            Welcome back
          </h1>

          <p className="text-slate-400 mt-2">
            Sign in to your FROST account
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 shadow-2xl">

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label
                htmlFor="login-email"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Email
              </label>

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />

                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/70 py-3.5 pl-12 pr-4 text-white placeholder-slate-600 outline-none transition focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="login-password"
                  className="block text-sm font-medium text-slate-300"
                >
                  Password
                </label>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/forgot-password"
                    )
                  }
                  className="text-sm text-cyan-400 hover:text-cyan-300 transition"
                >
                  Forgot password?
                </button>
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />

                <input
                  id="login-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/70 py-3.5 pl-12 pr-12 text-white placeholder-slate-600 outline-none transition focus:border-cyan-400"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (value) => !value
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Email / Password Login */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 py-3.5 font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Signing in..."
                : "Sign in"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-800" />

            <span className="text-xs uppercase tracking-wider text-slate-500">
              OR
            </span>

            <div className="h-px flex-1 bg-slate-800" />
          </div>

          {/* Google Login */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full rounded-xl border border-slate-700 bg-slate-950/50 py-3.5 font-medium text-slate-200 transition hover:border-cyan-400 hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="inline-flex items-center justify-center gap-3">
              <span className="text-lg font-semibold">
                G
              </span>

              {loading
                ? "Signing in..."
                : "Continue with Google"}
            </span>
          </button>

          {/* Register */}
          <div className="mt-7 text-center text-sm text-slate-400">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-cyan-400 hover:text-cyan-300"
            >
              Create one
            </Link>
          </div>
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
