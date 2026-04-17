import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "./env";

export type AuthUser = {
  id: number;
  email: string;
  name: string;
  role: "user" | "admin";
};

const TOKEN_TTL = "7d";

export async function hashPassword(plain: string) {
  const saltRounds = 10;
  return bcrypt.hash(plain, saltRounds);
}

export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

export function signAccessToken(user: AuthUser) {
  return jwt.sign({ sub: user.id, role: user.role }, env.JWT_SECRET, {
    expiresIn: TOKEN_TTL,
  });
}

export function verifyAccessToken(token: string): { userId: number; role: AuthUser["role"] } {
  const payload = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload;
  const userIdRaw = payload.sub;
  const roleRaw = payload.role;

  if (typeof userIdRaw !== "string" && typeof userIdRaw !== "number") {
    throw new Error("Invalid token subject");
  }

  const userId = typeof userIdRaw === "string" ? Number(userIdRaw) : userIdRaw;
  if (!Number.isFinite(userId)) throw new Error("Invalid token subject");

  if (roleRaw !== "user" && roleRaw !== "admin") throw new Error("Invalid token role");

  return { userId, role: roleRaw };
}
