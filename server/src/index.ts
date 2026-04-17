import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "node:path";
import { env } from "./env";
import { initDb } from "./db";
import { healthRouter } from "./routes/health";
import { authRouter } from "./routes/auth";
import { artworksRouter } from "./routes/artworks";
import { uploadsRouter } from "./routes/uploads";
import { ordersRouter } from "./routes/orders";
import { downloadsRouter } from "./routes/downloads";

initDb();

const app = express();
app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    credentials: false,
  })
);

app.use(express.json({ limit: "2mb" }));

app.use("/uploads", express.static(path.resolve(process.cwd(), "storage/uploads")));

app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/artworks", artworksRouter);
app.use("/api/uploads", uploadsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/downloads", downloadsRouter);

app.use((req, res) => {
  return res.status(404).json({ error: "Not found" });
});

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  return res.status(500).json({ error: "Server error" });
});

app.listen(env.PORT, () => {
  console.log(`Server listening on http://localhost:${env.PORT}`);
});
