import React, { createContext, useContext, useMemo, useState } from "react";

export type CartItem = {
  artworkId: number;
  title: string;
  priceCents: number;
  imagePath?: string | null;
  qty: number;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void;
  removeItem: (artworkId: number) => void;
  setQty: (artworkId: number, qty: number) => void;
  clear: () => void;
  totalCents: number;
  count: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const raw = localStorage.getItem("cart");
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  });

  function persist(next: CartItem[]) {
    setItems(next);
    localStorage.setItem("cart", JSON.stringify(next));
  }

  const value = useMemo<CartContextValue>(() => {
    const totalCents = items.reduce((sum, it) => sum + it.priceCents * it.qty, 0);
    const count = items.reduce((sum, it) => sum + it.qty, 0);

    return {
      items,
      totalCents,
      count,
      addItem(item, qty = 1) {
        const existing = items.find((x) => x.artworkId === item.artworkId);
        if (existing) {
          persist(
            items.map((x) =>
              x.artworkId === item.artworkId ? { ...x, qty: x.qty + qty } : x
            )
          );
          return;
        }
        persist([...items, { ...item, qty }]);
      },
      removeItem(artworkId) {
        persist(items.filter((x) => x.artworkId !== artworkId));
      },
      setQty(artworkId, qty) {
        const nextQty = Math.max(1, Math.min(99, Math.floor(qty)));
        persist(items.map((x) => (x.artworkId === artworkId ? { ...x, qty: nextQty } : x)));
      },
      clear() {
        persist([]);
      },
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
