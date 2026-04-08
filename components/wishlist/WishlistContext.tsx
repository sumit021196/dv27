"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";

type Wish = {
  id: string | number;
  name: string;
  price: number;
  image?: string;
};

type Ctx = {
  items: Wish[];
  toggle: (w: Wish) => Promise<void>;
  remove: (id: string | number) => Promise<void>;
  loading: boolean;
};

const C = createContext<Ctx | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // Load from local storage initially
  useEffect(() => {
    try {
      const raw = localStorage.getItem("wishlist");
      if (raw) {
        setItems(JSON.parse(raw));
      }
    } catch (e) {
      console.error("Local wishlist load failed:", e);
    }
  }, []);

  // Fetch from database if user is logged in
  useEffect(() => {
    const syncWithDb = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        try {
          const res = await fetch('/api/wishlist');
          const data = await res.json();
          if (data.items) {
            setItems(data.items);
            // Also update local storage to keep them in sync
            localStorage.setItem("wishlist", JSON.stringify(data.items));
          }
        } catch (e) {
          console.error("Database wishlist fetch failed:", e);
        }
      }
      setLoading(false);
    };

    syncWithDb();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      syncWithDb();
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const api = useMemo<Ctx>(() => ({
    items,
    loading,
    toggle: async (w) => {
      // Optimistic UI update
      const exists = items.some((p) => p.id === w.id);
      const next = exists ? items.filter((p) => p.id !== w.id) : [...items, w];
      setItems(next);
      localStorage.setItem("wishlist", JSON.stringify(next));

      // Sync with DB if logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        try {
          await fetch('/api/wishlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: w.id }),
          });
        } catch (e) {
          console.error("Failed to sync wishlist toggle:", e);
          // In a real app, we might want to rollback the UI here
        }
      }
    },
    remove: async (id) => {
      const next = items.filter((p) => p.id !== id);
      setItems(next);
      localStorage.setItem("wishlist", JSON.stringify(next));

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        try {
          await fetch('/api/wishlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: id }),
          });
        } catch (e) {
          console.error("Failed to sync wishlist removal:", e);
        }
      }
    },
  }), [items, loading, supabase]);

  return <C.Provider value={api}>{children}</C.Provider>;
}

export function useWishlist() {
  const c = useContext(C);
  if (!c) throw new Error("useWishlist must be used within WishlistProvider");
  return c;
}
