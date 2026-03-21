"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

type CartItem = {
  id: string | number;
  name: string;
  price: number;
  image?: string;
  qty: number;
};

type CartCtx = {
  items: CartItem[];
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (id: string | number) => void;
  clear: () => void;
};

const Ctx = createContext<CartCtx | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const raw = localStorage.getItem("cart");
      if (raw) setItems(JSON.parse(raw));
    } catch (err) {
      console.error("Cart init error", err);
    }
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    try {
      localStorage.setItem("cart", JSON.stringify(items));
    } catch {}
  }, [items, isMounted]);

  const api = useMemo<CartCtx>(() => ({
    items,
    add: (i, q = 1) => {
      setItems((prev) => {
        const idx = prev.findIndex((p) => p.id === i.id);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = { ...copy[idx], qty: copy[idx].qty + q };
          return copy;
        }
        return [...prev, { ...i, qty: q }];
      });
    },
    remove: (id) => setItems((p) => p.filter((x) => x.id !== id)),
    clear: () => setItems([]),
  }), [items]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used within CartProvider");
  return c;
}
