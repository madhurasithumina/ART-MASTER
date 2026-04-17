import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";

export function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const location = useLocation() as any;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  async function submit() {
    setSubmitting(true);
    setError("");
    try {
      await login(email, password);
      const to = location.state?.from ?? "/account";
      nav(to);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-2xl font-semibold tracking-tight">Login</h2>
      <p className="mt-1 text-sm text-slate-600">Welcome back.</p>

      {error ? <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div> : null}

      <div className="mt-5 space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
            placeholder="you@example.com"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
            placeholder="••••••••"
          />
        </div>
        <button
          onClick={submit}
          disabled={!email.trim() || !password || submitting}
          className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {submitting ? "Logging in…" : "Login"}
        </button>
      </div>

      <div className="mt-4 text-center text-sm text-slate-600">
        New here?{" "}
        <Link className="font-semibold text-slate-900 hover:underline" to="/register">
          Create an account
        </Link>
      </div>
    </div>
  );
}
