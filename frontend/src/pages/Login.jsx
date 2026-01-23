import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      // ✅ Login success
      console.log("Logged in:", data.user);
      window.location.href = "/deepfake";
    }

    setLoading(false);
  };

  return (
    <div>
      <h2>Login</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />

      <button onClick={handleLogin} disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>
    </div>
  );
}

