import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";

function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const error = useAuthStore((s) => s.error);
  const status = useAuthStore((s) => s.status);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch {
      // error is already surfaced via the store's `error` field
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 bg-slate-900 border border-slate-800 rounded-xl p-6"
      >
        <h1 className="text-xl font-semibold">Log in</h1>

        {error && (
          <p className="text-sm text-red-400 bg-red-950/50 border border-red-900 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        <div className="space-y-1">
          <label className="text-sm text-slate-400">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm outline-none focus:border-slate-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-slate-400">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm outline-none focus:border-slate-500"
          />
        </div>

        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-md py-2 text-sm font-medium transition"
        >
          {status === "loading" ? "Logging in..." : "Log in"}
        </button>

        <p className="text-sm text-slate-400 text-center">
          No account?{" "}
          <Link to="/register" className="text-indigo-400 hover:underline">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}

export default LoginPage;
