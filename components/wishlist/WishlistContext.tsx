"use client";
import { createContext, useContext, useMemo, useState } from "react";

type Wish = {
  id: string | number;
  name: string;
  price: number;
  image?: string;
};

type Ctx = {
  items: Wish[];
  toggle: (w: Wish) => void;
  remove: (id: string | number) => void;
};

const C = createContext<Ctx | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Wish[]>(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("wishlist") : null;
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const api = useMemo<Ctx>(() => ({
    items,
    toggle: (w) => {
      setItems((prev) => {
        const exists = prev.some((p) => p.id === w.id);
        const next = exists ? prev.filter((p) => p.id !== w.id) : [...prev, w];
        try { localStorage.setItem("wishlist", JSON.stringify(next)); } catch {}
        return next;
      });
    },
    remove: (id) => {
      setItems((prev) => {
        const next = prev.filter((p) => p.id !== id);
        try { localStorage.setItem("wishlist", JSON.stringify(next)); } catch {}
        return next;
      });
    },
  }), [items]);
  return <C.Provider value={api}>{children}</C.Provider>;
}

export function useWishlist() {
  const c = useContext(C);
  if (!c) throw new Error("useWishlist must be used within WishlistProvider");
  return c;
}
