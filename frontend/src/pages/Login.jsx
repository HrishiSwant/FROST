import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // ---------------- EMAIL + PASSWORD LOGIN ----------------
  const handleLogin = async () => {
    setError(null);
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    // ❗ Email not verified
    if (!data.user.email_confirmed_at) {
      setError("Please verify your email before logging in.");
      return;
    }

    // ✅ Login success
    window.location.href = "/deepfake";
  };

  // ---------------- GOOGLE LOGIN ----------------
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/deepfake",
      },
    });

    if (error) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="login-card p-6 w-full max-w-sm">
        <h2 className="text-xl mb-4">Login</h2>

        {error && <p className="text-red-500 mb-3">{error}</p>}

        <input
          className="mb-3 w-full"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="mb-4 w-full"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-cyan-500 py-2 rounded mb-3"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="text-center my-2 text-gray-400">OR</div>

        <button
          onClick={handleGoogleLogin}
          className="w-full border py-2 rounded"
        >
          Continue with Google
        </button>
      </div>
    </div>
  );
}
