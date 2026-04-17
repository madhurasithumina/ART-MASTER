import { Router } from "express";
import multer from "multer";
import path from "node:path";
import crypto from "node:crypto";
import { requireAuth } from "../middleware/requireAuth";
import { requireAdmin } from "../middleware/requireAdmin";

export const uploadsRouter = Router();

function safeExt(originalName: string) {
  const ext = path.extname(originalName).toLowerCase();
  if (ext.length > 10) return "";
  return ext;
}

function randomName(originalName: string) {
  return `${crypto.randomBytes(16).toString("hex")}${safeExt(originalName)}`;
}

const imageUpload = multer({
  storage: multer.diskStorage({
    destination: path.resolve(process.cwd(), "storage/uploads"),
    filename: (_req, file, cb) => cb(null, randomName(file.originalname)),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const digitalUpload = multer({
  storage: multer.diskStorage({
    destination: path.resolve(process.cwd(), "storage/downloads"),
    filename: (_req, file, cb) => cb(null, randomName(file.originalname)),
  }),
  limits: { fileSize: 50 * 1024 * 1024 },
});

uploadsRouter.post("/image", requireAuth, requireAdmin, imageUpload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Missing file" });
  return res.status(201).json({ imageUrl: `/uploads/${req.file.filename}` });
});

uploadsRouter.post(
  "/digital",
  requireAuth,
  requireAdmin,
  digitalUpload.single("file"),
  (req, res) => {
    if (!req.file) return res.status(400).json({ error: "Missing file" });
    return res.status(201).json({ digitalFilePath: `storage/downloads/${req.file.filename}` });
  }
);
