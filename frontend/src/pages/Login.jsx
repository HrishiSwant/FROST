import { supabase } from "../lib/supabase";

const handleLogin = async () => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    setError(error.message);
    return;
  }

  // success
  window.location.href = "/deepfake";
};
