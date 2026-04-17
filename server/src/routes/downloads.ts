import { Router } from "express";
import path from "node:path";
import fs from "node:fs";
import { db } from "../db";
import { requireAuth } from "../middleware/requireAuth";

export const downloadsRouter = Router();

downloadsRouter.use(requireAuth);

downloadsRouter.get("/:artworkId", (req, res) => {
  const artworkId = Number(req.params.artworkId);
  if (!Number.isFinite(artworkId)) return res.status(400).json({ error: "Invalid artworkId" });

  const userId = req.user!.id;

  const row = db
    .prepare(
      "SELECT a.digital_file_path AS digitalFilePath FROM order_items oi JOIN orders o ON o.id = oi.order_id JOIN artworks a ON a.id = oi.artwork_id WHERE o.user_id = ? AND oi.artwork_id = ? LIMIT 1"
    )
    .get(userId, artworkId) as { digitalFilePath: string | null } | undefined;

  if (!row) return res.status(403).json({ error: "You do not own this artwork" });
  if (!row.digitalFilePath) return res.status(404).json({ error: "No digital download for this artwork" });

  const storedPath = row.digitalFilePath;
  if (!storedPath.startsWith("storage/downloads/")) {
    return res.status(500).json({ error: "Invalid download path" });
  }

  const abs = path.resolve(process.cwd(), storedPath);
  const downloadsDir = path.resolve(process.cwd(), "storage/downloads");
  if (!abs.startsWith(downloadsDir)) return res.status(500).json({ error: "Invalid download path" });

  if (!fs.existsSync(abs)) return res.status(404).json({ error: "File missing" });

  return res.download(abs);
});
