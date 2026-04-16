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
  applyCoupon: (code: string, phone?: string) => Promise<{ success: boolean; message: string }>;
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
  const [userId, setUserId] = useState<string | null>(null);
  const [manuallyRemovedCodes, setManuallyRemovedCodes] = useState<string[]>([]);
  const [isAutoChecking, setIsAutoChecking] = useState(false);

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

  // Sync userId and clear on logout
  useEffect(() => {
    const supabase = createClient();
    
    // Initial user fetch
    const initUser = async () => {
        const { data } = await supabase.auth.getUser();
        if (data?.user) setUserId(data.user.id);
    };
    initUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: any, session: any) => {
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          setUserId(session?.user.id || null);
      }
      if (event === 'SIGNED_OUT') {
        setItems([]);
        setCoupon(null);
        setDiscount(0);
        setUserId(null);
        setManuallyRemovedCodes([]);
        localStorage.removeItem("cart");
        localStorage.removeItem("applied_coupon");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Persistent cart storage
  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items, isMounted]);

  // Main Auto-Apply Logic
  useEffect(() => {
    if (!isMounted || isAutoChecking) return;

    const totalQty = items.reduce((acc, i) => acc + i.qty, 0);
    const totalSubtotal = items.reduce((acc, i) => acc + (i.price * i.qty), 0);

    const runAutoApply = async () => {
        setIsAutoChecking(true);
        try {
            const supabase = createClient();
            
            // 1. Validate currently applied coupon (manual or auto)
            if (coupon) {
                const { data: currentCoupon } = await supabase
                    .from('coupons')
                    .select('*')
                    .ilike('code', coupon)
                    .eq('active', true)
                    .maybeSingle();
                
                if (!currentCoupon || 
                    totalSubtotal < (currentCoupon.min_order_value || 0) || 
                    totalQty < (currentCoupon.min_quantity || 0) ||
                    (currentCoupon.expiry_date && new Date(currentCoupon.expiry_date) < new Date())) {
                    
                    setCoupon(null);
                    setDiscount(0);
                    localStorage.removeItem("applied_coupon");
                }
            }

            // 2. Discover best auto-apply coupon if nothing is applied
            // OR if the current coupon is NOT an auto-apply one but we want to check for better ones? 
            // Usually, manual entry overrides auto-apply.
            if (!coupon && items.length > 0) {
                const { data: autoCoupons, error: fetchError } = await supabase
                    .from('coupons')
                    .select('*')
                    .eq('active', true)
                    .eq('is_auto_apply', true)
                    .order('discount_value', { ascending: false });

                console.log("[CartContext] AutoCoupons found:", autoCoupons?.length, autoCoupons, fetchError);

                if (autoCoupons && autoCoupons.length > 0) {
                    // Check usage for logged-in users
                    let usedIds: string[] = [];
                    if (userId) {
                        const { data: usages } = await supabase
                            .from('coupon_usages')
                            .select('coupon_id')
                            .eq('user_id', userId);
                        usedIds = (usages || []).map((u: any) => u.coupon_id as string);
                    }

                    const bestValid = (autoCoupons as any[]).find((c: any) => {
                        // Skip if manually removed in this session
                        if (manuallyRemovedCodes.includes(c.code.toUpperCase())) return false;
                        
                        // Skip if already used (registered user)
                        if (usedIds.includes(c.id)) return false;

                        // Check criteria
                        return totalSubtotal >= (c.min_order_value || 0) && 
                               totalQty >= (c.min_quantity || 0) &&
                               (!c.expiry_date || new Date(c.expiry_date) > new Date());
                    });

                    if (bestValid) {
                        setCoupon(bestValid.code);
                        setDiscount(bestValid.discount_value);
                        setShowConfetti(true);
                        localStorage.setItem("applied_coupon", JSON.stringify({ 
                            code: bestValid.code, 
                            discount: bestValid.discount_value 
                        }));
                    }
                }
            }
        } finally {
            setIsAutoChecking(false);
        }
    };

    runAutoApply();
  }, [items, isMounted, userId, manuallyRemovedCodes]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const applyCoupon = useCallback(async (code: string, phone?: string) => {
      if (!code) {
          if (coupon) setManuallyRemovedCodes(prev => [...prev, coupon.toUpperCase()]);
          setCoupon(null);
          setDiscount(0);
          localStorage.removeItem("applied_coupon");
          return { success: true, message: "Coupon removed" };
      }

      const totalSubtotal = items.reduce((acc: number, i: any) => acc + (i.price * i.qty), 0);
      const totalQty = items.reduce((acc: number, i: any) => acc + i.qty, 0);

      try {
          const res = await fetch('/api/coupons/validate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                  code, 
                  phone, 
                  cartTotal: totalSubtotal,
                  totalItems: totalQty
              })
          });

          const data = await res.json();

          if (data.success) {
              setCoupon(data.coupon.code);
              setDiscount(data.coupon.discount_value);
              setShowConfetti(true);
              localStorage.setItem("applied_coupon", JSON.stringify({ 
                  code: data.coupon.code, 
                  discount: data.coupon.discount_value 
              }));
              return { success: true, message: `₹${data.coupon.discount_value} Discount Applied!` };
          } else {
              return { success: false, message: data.error || "Invalid coupon code" };
          }
      } catch (err) {
          return { success: false, message: "Failed to validate coupon" };
      }
  }, [items]);

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
    add: (i: any, q: number = 1) => {
      setItems((prev: any[]) => {
        const idx = prev.findIndex((p: any) => p.id === i.id && p.variant_id === i.variant_id && p.size === i.size && p.color === i.color);
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
    remove: (uniqueId: string) => setItems((p: any[]) => p.filter((x: any) => `${x.id}-${x.variant_id || 'base'}-${x.size || 'none'}-${x.color || 'none'}` !== uniqueId)),
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
