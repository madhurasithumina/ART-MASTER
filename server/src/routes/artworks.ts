import { Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { requireAuth } from "../middleware/requireAuth";
import { requireAdmin } from "../middleware/requireAdmin";

export const artworksRouter = Router();

artworksRouter.get("/", (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";

  if (q) {
    const rows = db
      .prepare(
        "SELECT id, title, description, artist_name, price_cents, image_path, created_at FROM artworks WHERE title LIKE ? OR artist_name LIKE ? ORDER BY created_at DESC"
      )
      .all(`%${q}%`, `%${q}%`);
    return res.json({ artworks: rows });
  }

  const rows = db
    .prepare(
      "SELECT id, title, description, artist_name, price_cents, image_path, created_at FROM artworks ORDER BY created_at DESC"
    )
    .all();

  return res.json({ artworks: rows });
});

artworksRouter.get("/artists", (_req, res) => {
  const rows = db.prepare("SELECT DISTINCT artist_name AS name FROM artworks ORDER BY artist_name ASC").all();
  return res.json({ artists: rows });
});

artworksRouter.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });

  const artwork = db
    .prepare(
      "SELECT id, title, description, artist_name, price_cents, image_path, digital_file_path, created_at FROM artworks WHERE id = ?"
    )
    .get(id);

  if (!artwork) return res.status(404).json({ error: "Not found" });
  return res.json({ artwork });
});

const ArtworkUpsertSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(5000),
  artistName: z.string().min(1).max(120),
  priceCents: z.number().int().min(0),
  imagePath: z.string().optional().nullable(),
  digitalFilePath: z.string().optional().nullable(),
});

artworksRouter.post("/", requireAuth, requireAdmin, (req, res) => {
  const parsed = ArtworkUpsertSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body" });

  const { title, description, artistName, priceCents, imagePath, digitalFilePath } = parsed.data;

  const insert = db
    .prepare(
      "INSERT INTO artworks (title, description, artist_name, price_cents, image_path, digital_file_path) VALUES (?, ?, ?, ?, ?, ?)"
    )
    .run(title, description, artistName, priceCents, imagePath ?? null, digitalFilePath ?? null);

  const id = Number(insert.lastInsertRowid);
  return res.status(201).json({ id });
});

artworksRouter.put("/:id", requireAuth, requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });

  const parsed = ArtworkUpsertSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body" });

  const { title, description, artistName, priceCents, imagePath, digitalFilePath } = parsed.data;

  const result = db
    .prepare(
      "UPDATE artworks SET title=?, description=?, artist_name=?, price_cents=?, image_path=?, digital_file_path=? WHERE id=?"
    )
    .run(title, description, artistName, priceCents, imagePath ?? null, digitalFilePath ?? null, id);

  if (result.changes === 0) return res.status(404).json({ error: "Not found" });
  return res.json({ ok: true });
});

artworksRouter.delete("/:id", requireAuth, requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });

  const result = db.prepare("DELETE FROM artworks WHERE id = ?").run(id);
  if (result.changes === 0) return res.status(404).json({ error: "Not found" });

  return res.json({ ok: true });
});
