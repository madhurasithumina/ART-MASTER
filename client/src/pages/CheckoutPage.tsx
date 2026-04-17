import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { useAuth } from "../lib/auth";
import { useCart } from "../lib/cart";
import { formatPrice } from "../lib/format";

export function CheckoutPage() {
  const nav = useNavigate();
  const { user } = useAuth();
  const { items, totalCents, clear } = useCart();

  const [name, setName] = useState("");
  const [address1, setAddress1] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  const canSubmit = useMemo(() => {
    if (!user) return false;
    if (items.length === 0) return false;
    return name.trim() && address1.trim() && city.trim() && country.trim();
  }, [user, items.length, name, address1, city, country]);

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8">
        <div className="text-sm font-semibold">Nothing to checkout</div>
        <div className="mt-1 text-sm text-slate-600">Add artwork to your cart first.</div>
        <div className="mt-4">
          <Link
            to="/gallery"
            className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Browse Gallery
          </Link>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8">
        <div className="text-sm font-semibold">Login required</div>
        <div className="mt-1 text-sm text-slate-600">Create an account or login to place an order.</div>
        <div className="mt-4 flex gap-3">
          <Link
            to="/login"
            className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
          >
            Register
          </Link>
        </div>
      </div>
    );
  }

  async function submit() {
    setSubmitting(true);
    setError("");

    try {
      await apiFetch<{ orderId: number }>("/api/orders", {
        method: "POST",
        body: JSON.stringify({
          items: items.map((i) => ({ artworkId: i.artworkId, qty: i.qty })),
          shipping: { name, address1, city, country },
        }),
      });

      clear();
      nav("/account");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Checkout</h2>
          <p className="mt-1 text-sm text-slate-600">Demo checkout — creates a paid order in the backend.</p>
        </div>

        {error ? <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div> : null}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-medium text-slate-700">Full name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
              placeholder="Your name"
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-medium text-slate-700">Address</label>
            <input
              value={address1}
              onChange={(e) => setAddress1(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
              placeholder="Street address"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">City</label>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
              placeholder="City"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Country</label>
            <input
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
              placeholder="Country"
            />
          </div>
        </div>

        <button
          onClick={submit}
          disabled={!canSubmit || submitting}
          className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {submitting ? "Placing order…" : `Place order (${formatPrice(totalCents)})`}
        </button>
      </div>

      <div className="h-fit rounded-2xl border border-slate-200 bg-white p-6">
        <div className="text-sm font-semibold">Items</div>
        <div className="mt-3 space-y-3">
          {items.map((it) => (
            <div key={it.artworkId} className="flex items-start justify-between gap-4 text-sm">
              <div className="min-w-0">
                <div className="truncate font-medium">{it.title}</div>
                <div className="text-xs text-slate-600">Qty {it.qty}</div>
              </div>
              <div className="shrink-0 font-semibold">{formatPrice(it.priceCents * it.qty)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
