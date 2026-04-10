"use client";
import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";

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

type Coupon = {
  id: string | number;
  code: string;
  discount_value: number;
  min_order_value?: number;
  min_quantity?: number;
  expiry_date?: string;
  active: boolean;
  is_auto_apply: boolean;
  discount_type?: 'percentage' | 'fixed';
};


type CartCtx = {
  items: CartItem[];
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (uniqueId: string) => void;
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

  // Clear cart on logout
  useEffect(() => {
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: any, session: any) => {
      if (event === 'SIGNED_OUT') {
        setItems([]);
        setCoupon(null);
        setDiscount(0);
        localStorage.removeItem("cart");
        localStorage.removeItem("applied_coupon");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    try {
      localStorage.setItem("cart", JSON.stringify(items));

      // Dynamic Auto-apply Logic
      const totalQty = items.reduce((acc, i) => acc + i.qty, 0);
      const totalSubtotal = items.reduce((acc, i) => acc + (i.price * i.qty), 0);
      
      const checkCoupons = async () => {
        const supabase = createClient();
        
        // 1. If we have a coupon applied, validate it
        if (coupon) {
            const { data: currentCoupon } = await supabase
                .from('coupons')
                .select('*')
                .eq('code', coupon)
                .eq('active', true)
                .single();
            
            if (!currentCoupon || 
                totalSubtotal < (currentCoupon.min_order_value || 0) || 
                totalQty < (currentCoupon.min_quantity || 0) ||
                (currentCoupon.expiry_date && new Date(currentCoupon.expiry_date) < new Date())) {
                
                // Conditions no longer met, clear it
                setCoupon(null);
                setDiscount(0);
                localStorage.removeItem("applied_coupon");
            }
        }

        // 2. If no coupon is applied, look for an auto-apply one
        if (!coupon) {
            const { data: autoCoupons } = await supabase
                .from('coupons')
                .select('*')
                .eq('active', true)
                .eq('is_auto_apply', true)
                .order('discount_value', { ascending: false }); // Prioritize higher discount

            if (autoCoupons && (autoCoupons as Coupon[]).length > 0) {
                // Find the first one whose conditions are met
                const validAuto = (autoCoupons as Coupon[]).find(c => 
                    totalSubtotal >= (c.min_order_value || 0) && 
                    totalQty >= (c.min_quantity || 0) &&
                    (!c.expiry_date || new Date(c.expiry_date) > new Date())
                );


                if (validAuto) {
                    setCoupon(validAuto.code);
                    setDiscount(validAuto.discount_value);
                    setShowConfetti(true);
                    localStorage.setItem("applied_coupon", JSON.stringify({ 
                        code: validAuto.code, 
                        discount: validAuto.discount_value,
                        isAuto: true 
                    }));
                }
            }
        }
      };

      checkCoupons();
    } catch (err) {
      console.error("Auto coupon error", err);
    }
  }, [items, isMounted, coupon]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const applyCoupon = useCallback(async (code: string) => {
      const supabase = createClient();
      const { data, error } = await supabase
          .from('coupons')
          .select('*')
          .eq('code', code.toUpperCase())
          .eq('active', true)
          .single();

      if (data) {
          setCoupon(data.code);
          setDiscount(data.discount_value);
          setShowConfetti(true);
          localStorage.setItem("applied_coupon", JSON.stringify({ code: data.code, discount: data.discount_value }));
          return { success: true, message: `₹${data.discount_value} Discount Applied!` };
      }
      return { success: false, message: "Invalid or inactive coupon code" };
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
      }
    },
    remove: (uniqueId) => setItems((p) => p.filter((x) => `${x.id}-${x.variant_id || 'base'}-${x.size || 'none'}-${x.color || 'none'}` !== uniqueId)),
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
