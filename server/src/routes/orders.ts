import { Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { requireAuth } from "../middleware/requireAuth";

export const ordersRouter = Router();

ordersRouter.use(requireAuth);

const CreateOrderSchema = z.object({
  items: z
    .array(
      z.object({
        artworkId: z.number().int().positive(),
        qty: z.number().int().min(1).max(99),
      })
    )
    .min(1),
  shipping: z
    .object({
      name: z.string().min(1).max(120),
      address1: z.string().min(1).max(200),
      city: z.string().min(1).max(120),
      country: z.string().min(1).max(120),
    })
    .optional(),
});

ordersRouter.post("/", (req, res) => {
  const parsed = CreateOrderSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body" });

  const userId = req.user!.id;
  const { items, shipping } = parsed.data;

  const createTx = db.transaction(() => {
    let totalCents = 0;
    const resolved = items.map((i) => {
      const artwork = db
        .prepare("SELECT id, title, price_cents FROM artworks WHERE id = ?")
        .get(i.artworkId) as { id: number; title: string; price_cents: number } | undefined;
      if (!artwork) throw new Error("ARTWORK_NOT_FOUND");
      totalCents += artwork.price_cents * i.qty;
      return { artworkId: artwork.id, unitPriceCents: artwork.price_cents, qty: i.qty, title: artwork.title };
    });

    const orderInsert = db
      .prepare(
        "INSERT INTO orders (user_id, total_cents, status, shipping_name, shipping_address1, shipping_city, shipping_country) VALUES (?, ?, 'paid', ?, ?, ?, ?)"
      )
      .run(
        userId,
        totalCents,
        shipping?.name ?? null,
        shipping?.address1 ?? null,
        shipping?.city ?? null,
        shipping?.country ?? null
      );

    const orderId = Number(orderInsert.lastInsertRowid);

    const insertItem = db.prepare(
      "INSERT INTO order_items (order_id, artwork_id, unit_price_cents, qty) VALUES (?, ?, ?, ?)"
    );

    for (const it of resolved) {
      insertItem.run(orderId, it.artworkId, it.unitPriceCents, it.qty);
    }

    return { orderId, totalCents };
  });

  try {
    const result = createTx();
    return res.status(201).json(result);
  } catch (e) {
    if (e instanceof Error && e.message === "ARTWORK_NOT_FOUND") {
      return res.status(404).json({ error: "Artwork not found" });
    }
    return res.status(500).json({ error: "Failed to create order" });
  }
});

ordersRouter.get("/", (req, res) => {
  const userId = req.user!.id;

  const orders = db
    .prepare(
      "SELECT id, total_cents, status, shipping_name, shipping_address1, shipping_city, shipping_country, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC"
    )
    .all(userId) as Array<{
    id: number;
    total_cents: number;
    status: string;
    shipping_name: string | null;
    shipping_address1: string | null;
    shipping_city: string | null;
    shipping_country: string | null;
    created_at: string;
  }>;

  const itemsByOrder = new Map<number, any[]>();
  const items = db
    .prepare(
      "SELECT oi.order_id, oi.artwork_id, oi.qty, oi.unit_price_cents, a.title, a.image_path, a.digital_file_path FROM order_items oi JOIN artworks a ON a.id = oi.artwork_id JOIN orders o ON o.id = oi.order_id WHERE o.user_id = ? ORDER BY oi.order_id DESC"
    )
    .all(userId) as Array<any>;

  for (const it of items) {
    const list = itemsByOrder.get(it.order_id) ?? [];
    list.push({
      artworkId: it.artwork_id,
      title: it.title,
      qty: it.qty,
      unitPriceCents: it.unit_price_cents,
      imagePath: it.image_path,
      hasDownload: !!it.digital_file_path,
    });
    itemsByOrder.set(it.order_id, list);
  }

  const enriched = orders.map((o) => ({
    ...o,
    items: itemsByOrder.get(o.id) ?? [],
  }));

  return res.json({ orders: enriched });
});
