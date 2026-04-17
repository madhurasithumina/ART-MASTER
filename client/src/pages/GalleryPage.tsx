import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { formatPrice } from "../lib/format";

type ArtworkListItem = {
  id: number;
  title: string;
  description: string;
  artist_name: string;
  price_cents: number;
  image_path?: string | null;
  created_at: string;
};

export function GalleryPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [artworks, setArtworks] = useState<ArtworkListItem[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await apiFetch<{ artworks: ArtworkListItem[] }>(`/api/artworks${q ? `?q=${encodeURIComponent(q)}` : ""}`);
        if (!cancelled) setArtworks(res.artworks);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [q]);

  const empty = useMemo(() => !loading && !error && artworks.length === 0, [loading, error, artworks.length]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Gallery</h2>
          <p className="mt-1 text-sm text-slate-600">Browse drawings and add favorites to your cart.</p>
        </div>

        <form
          className="flex w-full max-w-md gap-2"
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <input
            value={q}
            onChange={(e) => setParams((prev) => {
              const next = new URLSearchParams(prev);
              const val = e.target.value;
              if (val) next.set("q", val);
              else next.delete("q");
              return next;
            })}
            placeholder="Search title or artist"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
          />
          <Link
            to="/gallery"
            className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
          >
            Clear
          </Link>
        </form>
      </div>

      {loading ? <div className="text-sm text-slate-600">Loading…</div> : null}
      {error ? <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div> : null}

      {empty ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8">
          <div className="text-sm font-semibold">No artworks yet</div>
          <div className="mt-1 text-sm text-slate-600">Go to Admin to add your first artwork.</div>
          <div className="mt-4">
            <Link
              to="/admin"
              className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Open Admin
            </Link>
          </div>
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {artworks.map((a) => (
          <Link
            key={a.id}
            to={`/artworks/${a.id}`}
            className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-slate-300"
          >
            <div className="aspect-[4/5] w-full bg-slate-100">
              {a.image_path ? (
                <img
                  src={`${(import.meta as any).env?.VITE_API_URL ?? "http://localhost:4000"}${a.image_path}`}
                  alt={a.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-slate-500">
                  No image
                </div>
              )}
            </div>
            <div className="space-y-1 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-slate-900 group-hover:underline">{a.title}</div>
                  <div className="truncate text-xs text-slate-600">{a.artist_name}</div>
                </div>
                <div className="shrink-0 text-sm font-semibold text-slate-900">{formatPrice(a.price_cents)}</div>
              </div>
              <div className="text-xs text-slate-600">
                {a.description.length > 100 ? `${a.description.slice(0, 100)}…` : a.description}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
