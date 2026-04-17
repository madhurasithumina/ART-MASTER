import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";

export function RegisterPage() {
  const { register } = useAuth();
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  async function submit() {
    setSubmitting(true);
    setError("");
    try {
      await register(name, email, password);
      nav("/account");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-2xl font-semibold tracking-tight">Create account</h2>
      <p className="mt-1 text-sm text-slate-600">Buy artwork and access downloads.</p>

      {error ? <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div> : null}

      <div className="mt-5 space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
            placeholder="Your name"
          />
        </div>
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
            placeholder="At least 6 characters"
          />
        </div>
        <button
          onClick={submit}
          disabled={!name.trim() || !email.trim() || password.length < 6 || submitting}
          className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {submitting ? "Creating…" : "Create account"}
        </button>
      </div>

      <div className="mt-4 text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link className="font-semibold text-slate-900 hover:underline" to="/login">
          Login
        </Link>
      </div>
    </div>
  );
}
