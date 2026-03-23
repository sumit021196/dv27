"use client";
import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";

type CartItem = {
  id: string | number;
  name: string;
  price: number;
  image?: string;
  qty: number;
  variant_id?: string;
  size?: string;
  color?: string;
};

type CartCtx = {
  items: CartItem[];
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (id: string | number) => void;
  clear: () => void;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  coupon: string | null;
  discount: number;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  showConfetti: boolean;
  setShowConfetti: (show: boolean) => void;
};

const Ctx = createContext<CartCtx | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [coupon, setCoupon] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const raw = localStorage.getItem("cart");
      if (raw) setItems(JSON.parse(raw));
      
      const savedCoupon = localStorage.getItem("applied_coupon");
      if (savedCoupon) {
          const parsed = JSON.parse(savedCoupon);
          setCoupon(parsed.code);
          setDiscount(parsed.discount);
      }
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

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const applyCoupon = useCallback(async (code: string) => {
      // For now, hardcode BDAY500 logic, but scalable for backend
      if (code.toUpperCase() === 'BDAY500') {
          const used = localStorage.getItem('used_BDAY500');
          if (used) return { success: false, message: "Coupon already used" };
          
          setCoupon('BDAY500');
          setDiscount(500);
          setShowConfetti(true);
          localStorage.setItem("applied_coupon", JSON.stringify({ code: 'BDAY500', discount: 500 }));
          return { success: true, message: "₹500 Discount Applied!" };
      }
      return { success: false, message: "Invalid coupon code" };
  }, []);

  const api = useMemo<CartCtx>(() => ({
    items,
    isOpen,
    openCart,
    closeCart,
    coupon,
    discount,
    applyCoupon,
    showConfetti,
    setShowConfetti,
    add: (i, q = 1) => {
      setItems((prev) => {
        const idx = prev.findIndex((p) => p.id === i.id && p.variant_id === i.variant_id && p.size === i.size && p.color === i.color);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = { ...copy[idx], qty: copy[idx].qty + q };
          return copy;
        }
        return [...prev, { ...i, qty: q }];
      });
      if (q > 0) {
          openCart();
          // Auto-apply BDAY500 if first time and not already set
          if (!coupon) {
              const used = localStorage.getItem('used_BDAY500');
              if (!used) {
                  setCoupon('BDAY500');
                  setDiscount(500);
                  setShowConfetti(true);
                  localStorage.setItem("applied_coupon", JSON.stringify({ code: 'BDAY500', discount: 500 }));
              }
          }
      }
    },
    remove: (id) => setItems((p) => p.filter((x) => x.id !== id)),
    clear: () => {
        setItems([]);
        setCoupon(null);
        setDiscount(0);
        localStorage.removeItem("applied_coupon");
    },
  }), [items, isOpen, openCart, closeCart, coupon, discount, applyCoupon, showConfetti]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used within CartProvider");
  return c;
}
