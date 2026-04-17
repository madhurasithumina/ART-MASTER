import { useEffect, useMemo, useState } from "react";
import { apiFetch, uploadFile } from "../lib/api";
import { formatPrice } from "../lib/format";

type ArtworkRow = {
  id: number;
  title: string;
  description: string;
  artist_name: string;
  price_cents: number;
  image_path?: string | null;
  created_at: string;
};

type ArtworkDetail = ArtworkRow & {
  digital_file_path?: string | null;
};

type FormState = {
  id?: number;
  title: string;
  description: string;
  artistName: string;
  priceCents: number;
  imagePath?: string | null;
  digitalFilePath?: string | null;
};

const emptyForm: FormState = {
  title: "",
  description: "",
  artistName: "",
  priceCents: 0,
  imagePath: null,
  digitalFilePath: null,
};

export function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [artworks, setArtworks] = useState<ArtworkRow[]>([]);

  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const editingId = form.id;

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch<{ artworks: ArtworkRow[] }>("/api/artworks");
      setArtworks(res.artworks);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const selected = useMemo(() => artworks.find((a) => a.id === editingId) ?? null, [artworks, editingId]);

  async function edit(id: number) {
    setError("");
    try {
      const res = await apiFetch<{ artwork: ArtworkDetail }>(`/api/artworks/${id}`);
      const a = res.artwork;
      setForm({
        id: a.id,
        title: a.title,
        description: a.description,
        artistName: a.artist_name,
        priceCents: a.price_cents,
        imagePath: a.image_path ?? null,
        digitalFilePath: a.digital_file_path ?? null,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load artwork");
    }
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      const body = {
        title: form.title,
        description: form.description,
        artistName: form.artistName,
        priceCents: Number(form.priceCents),
        imagePath: form.imagePath ?? null,
        digitalFilePath: form.digitalFilePath ?? null,
      };

      if (form.id) {
        await apiFetch(`/api/artworks/${form.id}`, { method: "PUT", body: JSON.stringify(body) });
      } else {
        await apiFetch(`/api/artworks`, { method: "POST", body: JSON.stringify(body) });
      }

      setForm(emptyForm);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    if (!confirm("Delete this artwork?")) return;
    setError("");
    try {
      await apiFetch(`/api/artworks/${id}`, { method: "DELETE" });
      if (form.id === id) setForm(emptyForm);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Admin</h2>
        <p className="mt-1 text-sm text-slate-600">Add and manage artwork listings.</p>
      </div>

      {error ? <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div> : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Artworks</div>
            <button
              onClick={() => setForm(emptyForm)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50"
            >
              New
            </button>
          </div>

          {loading ? <div className="text-sm text-slate-600">Loading…</div> : null}

          <div className="space-y-2">
            {artworks.map((a) => (
              <div
                key={a.id}
                className={`flex items-start justify-between gap-3 rounded-xl border p-3 ${
                  editingId === a.id ? "border-slate-400 bg-slate-50" : "border-slate-200 bg-white"
                }`}
              >
                <button onClick={() => edit(a.id)} className="min-w-0 text-left">
                  <div className="truncate text-sm font-medium">{a.title}</div>
                  <div className="text-xs text-slate-600">{a.artist_name} • {formatPrice(a.price_cents)}</div>
                </button>
                <button
                  onClick={() => remove(a.id)}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-semibold">{form.id ? `Edit #${form.id}` : "New artwork"}</div>
              {selected ? <div className="mt-1 text-xs text-slate-600">Editing: {selected.title}</div> : null}
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-medium text-slate-700">Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Artist name</label>
              <input
                value={form.artistName}
                onChange={(e) => setForm((s) => ({ ...s, artistName: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Price (cents)</label>
              <input
                type="number"
                min={0}
                value={form.priceCents}
                onChange={(e) => setForm((s) => ({ ...s, priceCents: Number(e.target.value) }))}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-medium text-slate-700">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
                rows={6}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
              />
            </div>

            <div className="space-y-2">
              <div className="text-xs font-medium text-slate-700">Image upload</div>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const res = await uploadFile("image", file);
                    if (res.imageUrl) setForm((s) => ({ ...s, imagePath: res.imageUrl }));
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "Upload failed");
                  } finally {
                    e.target.value = "";
                  }
                }}
                className="block w-full text-sm"
              />
              <div className="text-xs text-slate-600">Current: {form.imagePath || "(none)"}</div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-medium text-slate-700">Digital file upload (optional)</div>
              <input
                type="file"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const res = await uploadFile("digital", file);
                    if (res.digitalFilePath) setForm((s) => ({ ...s, digitalFilePath: res.digitalFilePath }));
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "Upload failed");
                  } finally {
                    e.target.value = "";
                  }
                }}
                className="block w-full text-sm"
              />
              <div className="text-xs text-slate-600">Current: {form.digitalFilePath || "(none)"}</div>
            </div>
          </div>

          <button
            onClick={save}
            disabled={saving || !form.title.trim() || !form.description.trim() || !form.artistName.trim()}
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {saving ? "Saving…" : "Save artwork"}
          </button>

          <div className="mt-3 text-xs text-slate-500">
            Uploads require an admin account. Register using the server `ADMIN_EMAIL` to become admin.
          </div>
        </div>
      </div>
    </div>
  );
}
