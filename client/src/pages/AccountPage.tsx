import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch, getToken } from "../lib/api";
import { useAuth } from "../lib/auth";
import { formatPrice } from "../lib/format";

type OrderItem = {
  artworkId: number;
  title: string;
  qty: number;
  unitPriceCents: number;
  imagePath?: string | null;
  hasDownload: boolean;
};

type Order = {
  id: number;
  total_cents: number;
  status: string;
  shipping_name: string | null;
  shipping_address1: string | null;
  shipping_city: string | null;
  shipping_country: string | null;
  created_at: string;
  items: OrderItem[];
};

const API_URL = (import.meta as any).env?.VITE_API_URL ?? "http://localhost:4000";

export function AccountPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await apiFetch<{ orders: Order[] }>("/api/orders");
        if (!cancelled) setOrders(res.orders);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load orders");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function download(artworkId: number, title: string) {
    const token = getToken();
    const res = await fetch(`${API_URL}/api/downloads/${artworkId}`, {
      headers: { authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const msg = (await res.json().catch(() => null))?.error ?? "Download failed";
      throw new Error(msg);
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = title.replace(/[^a-z0-9-_ ]/gi, "").trim() || "download";
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8">
        <div className="text-sm font-semibold">Login required</div>
        <div className="mt-1 text-sm text-slate-600">Login to view your orders and downloads.</div>
        <div className="mt-4">
          <Link
            to="/login"
            className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Account</h2>
        <p className="mt-1 text-sm text-slate-600">
          Signed in as <span className="font-medium text-slate-900">{user.email}</span>
        </p>
      </div>

      {loading ? <div className="text-sm text-slate-600">Loading…</div> : null}
      {error ? <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div> : null}

      {(!loading && !error && orders.length === 0) ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8">
          <div className="text-sm font-semibold">No orders yet</div>
          <div className="mt-1 text-sm text-slate-600">Checkout from your cart to create your first order.</div>
          <div className="mt-4">
            <Link
              to="/gallery"
              className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Browse Gallery
            </Link>
          </div>
        </div>
      ) : null}

      <div className="space-y-4">
        {orders.map((o) => (
          <div key={o.id} className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold">Order #{o.id}</div>
                <div className="mt-1 text-xs text-slate-600">{new Date(o.created_at).toLocaleString()}</div>
                {o.shipping_name ? (
                  <div className="mt-2 text-xs text-slate-600">
                    Ship to: {o.shipping_name} — {o.shipping_address1}, {o.shipping_city}, {o.shipping_country}
                  </div>
                ) : null}
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-600">Status</div>
                <div className="text-sm font-semibold">{o.status}</div>
                <div className="mt-2 text-sm font-semibold">{formatPrice(o.total_cents)}</div>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {o.items.map((it) => (
                <div key={`${o.id}-${it.artworkId}`} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{it.title}</div>
                    <div className="text-xs text-slate-600">
                      Qty {it.qty} • {formatPrice(it.unitPriceCents)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {it.hasDownload ? (
                      <button
                        onClick={async () => {
                          try {
                            await download(it.artworkId, it.title);
                          } catch (e) {
                            alert(e instanceof Error ? e.message : "Download failed");
                          }
                        }}
                        className="inline-flex items-center rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                      >
                        Download
                      </button>
                    ) : (
                      <div className="text-xs text-slate-600">No download</div>
                    )}
                    <Link
                      to={`/artworks/${it.artworkId}`}
                      className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
