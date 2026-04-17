import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { useCart } from "../lib/cart";
import { formatPrice } from "../lib/format";

type Artwork = {
  id: number;
  title: string;
  description: string;
  artist_name: string;
  price_cents: number;
  image_path?: string | null;
  digital_file_path?: string | null;
  created_at: string;
};

const API_URL = (import.meta as any).env?.VITE_API_URL ?? "http://localhost:4000";

export function ArtworkPage() {
  const { id } = useParams();
  const artworkId = Number(id);
  const { addItem } = useCart();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [artwork, setArtwork] = useState<Artwork | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await apiFetch<{ artwork: Artwork }>(`/api/artworks/${artworkId}`);
        if (!cancelled) setArtwork(res.artwork);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (Number.isFinite(artworkId)) load();
    else {
      setError("Invalid artwork");
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [artworkId]);

  if (loading) return <div className="text-sm text-slate-600">Loading…</div>;
  if (error) return <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>;
  if (!artwork) return <div className="text-sm text-slate-600">Not found</div>;

  return (
    <div className="space-y-6">
      <div className="text-sm text-slate-600">
        <Link to="/gallery" className="hover:underline">
          ← Back to Gallery
        </Link>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
          <div className="aspect-[4/5] w-full bg-slate-100">
            {artwork.image_path ? (
              <img src={`${API_URL}${artwork.image_path}`} alt={artwork.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-slate-500">No image</div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">{artwork.title}</h2>
            <div className="mt-1 text-sm text-slate-600">By {artwork.artist_name}</div>
          </div>

          <div className="text-xl font-semibold">{formatPrice(artwork.price_cents)}</div>

          <p className="text-sm leading-6 text-slate-700">{artwork.description}</p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() =>
                addItem({
                  artworkId: artwork.id,
                  title: artwork.title,
                  priceCents: artwork.price_cents,
                  imagePath: artwork.image_path ?? null,
                })
              }
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Add to Cart
            </button>
            <Link
              to="/cart"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
            >
              View Cart
            </Link>
          </div>

          {artwork.digital_file_path ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
              Includes a digital download after purchase.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
