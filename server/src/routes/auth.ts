import { Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { env } from "../env";
import { hashPassword, signAccessToken, verifyPassword } from "../auth";
import { requireAuth } from "../middleware/requireAuth";

export const authRouter = Router();

const RegisterSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(80),
  password: z.string().min(6).max(200),
});

authRouter.post("/register", async (req, res) => {
  const parsed = RegisterSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body" });

  const { email, name, password } = parsed.data;
  const passwordHash = await hashPassword(password);
  const role: "user" | "admin" = email.toLowerCase() === env.ADMIN_EMAIL.toLowerCase() ? "admin" : "user";

  try {
    const insert = db
      .prepare("INSERT INTO users (email, name, password_hash, role) VALUES (?, ?, ?, ?)")
      .run(email.toLowerCase(), name, passwordHash, role);

    const userId = Number(insert.lastInsertRowid);
    const user = db
      .prepare("SELECT id, email, name, role FROM users WHERE id = ?")
      .get(userId) as { id: number; email: string; name: string; role: "user" | "admin" };

    const token = signAccessToken(user);
    return res.status(201).json({ token, user });
  } catch {
    return res.status(409).json({ error: "Email already in use" });
  }
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRouter.post("/login", async (req, res) => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body" });

  const { email, password } = parsed.data;

  const row = db
    .prepare("SELECT id, email, name, role, password_hash FROM users WHERE email = ?")
    .get(email.toLowerCase()) as
    | { id: number; email: string; name: string; role: "user" | "admin"; password_hash: string }
    | undefined;

  if (!row) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await verifyPassword(password, row.password_hash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const user = { id: row.id, email: row.email, name: row.name, role: row.role };
  const token = signAccessToken(user);
  return res.json({ token, user });
});

authRouter.get("/me", requireAuth, (req, res) => {
  const userId = req.user!.id;
  const user = db
    .prepare("SELECT id, email, name, role, created_at FROM users WHERE id = ?")
    .get(userId) as { id: number; email: string; name: string; role: string; created_at: string } | undefined;

  if (!user) return res.status(404).json({ error: "User not found" });
  return res.json({ user });
});
