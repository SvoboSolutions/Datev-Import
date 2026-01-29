import { useState } from "react";
import { login } from "../api/auth";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

export function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { refreshAuth } = useAuth();
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      await login(username, password);
      await refreshAuth();
      navigate("/", { replace: true });
    } catch {
      setError("Login fehlgeschlagen");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <form className="bg-surface border border-border rounded-xl shadow-lg p-6 w-full max-w-sm" onSubmit={onSubmit}>
        <h1 className="text-xl font-semibold mb-4">Login</h1>

        {error && (
          <div className="mb-3 text-sm text-error">{error}</div>
        )}

        <input
          className="w-full border border-border rounded px-3 py-2 mb-3"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          className="w-full border border-border rounded px-3 py-2 mb-4"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full bg-accent text-white py-2 rounded-lg hover:bg-accent-hover transition">
          Login
        </button>
      </form>
    </div>
  );
}
