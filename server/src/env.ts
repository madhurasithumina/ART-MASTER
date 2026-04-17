import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).optional().default("development"),
  PORT: z.coerce.number().int().positive().optional().default(4000),
  CLIENT_ORIGIN: z.string().optional().default("http://localhost:5173"),
  DATABASE_PATH: z.string().optional().default("./storage/db.sqlite"),
  JWT_SECRET: z.string().min(16).optional().default("dev-secret-change-me-please"),
  ADMIN_EMAIL: z.string().email().optional().default("admin@example.com"),
});

export type Env = z.infer<typeof EnvSchema>;

export const env: Env = EnvSchema.parse(process.env);
