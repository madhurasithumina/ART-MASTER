import { Link } from "react-router-dom";
import { useCart } from "../lib/cart";
import { formatPrice } from "../lib/format";

const API_URL = (import.meta as any).env?.VITE_API_URL ?? "http://localhost:4000";

export function CartPage() {
  const { items, totalCents, setQty, removeItem, clear } = useCart();

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8">
        <div className="text-sm font-semibold">Your cart is empty</div>
        <div className="mt-1 text-sm text-slate-600">Browse the gallery and add artwork you love.</div>
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

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Cart</h2>
          <p className="mt-1 text-sm text-slate-600">Review items, then checkout.</p>
        </div>
        <button onClick={clear} className="text-sm font-medium text-slate-600 hover:text-slate-900">
          Clear
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((it) => (
            <div key={it.artworkId} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="h-24 w-20 overflow-hidden rounded-xl bg-slate-100">
                {it.imagePath ? (
                  <img src={`${API_URL}${it.imagePath}`} alt={it.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-500">No image</div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{it.title}</div>
                    <div className="text-xs text-slate-600">{formatPrice(it.priceCents)}</div>
                  </div>
                  <button
                    onClick={() => removeItem(it.artworkId)}
                    className="text-xs font-medium text-slate-600 hover:text-slate-900"
                  >
                    Remove
                  </button>
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <label className="text-xs text-slate-600">Qty</label>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={it.qty}
                    onChange={(e) => setQty(it.artworkId, Number(e.target.value))}
                    className="w-20 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
                  />
                  <div className="ml-auto text-sm font-semibold">{formatPrice(it.priceCents * it.qty)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="h-fit rounded-2xl border border-slate-200 bg-white p-6">
          <div className="text-sm font-semibold">Summary</div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-slate-600">Total</span>
            <span className="font-semibold">{formatPrice(totalCents)}</span>
          </div>
          <Link
            to="/checkout"
            className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Checkout (demo)
          </Link>
          <Link
            to="/gallery"
            className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
