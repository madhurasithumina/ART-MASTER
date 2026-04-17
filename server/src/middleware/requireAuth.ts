import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../auth";

export type RequestUser = {
  id: number;
  role: "user" | "admin";
};

declare global {
  namespace Express {
    interface Request {
      user?: RequestUser;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.header("authorization") ?? "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Missing Bearer token" });
  }

  try {
    const { userId, role } = verifyAccessToken(token);
    req.user = { id: userId, role };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}
