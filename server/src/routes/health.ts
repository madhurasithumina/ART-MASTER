import { Router } from "express";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  return res.json({ ok: true });
});
