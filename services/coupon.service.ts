import { createClient } from '@/utils/supabase/server';

export const couponService = {
  async getAllCoupons() {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async createCoupon(coupon: any) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('coupons')
      .insert(coupon)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateCoupon(id: string, updates: any) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('coupons')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteCoupon(id: string) {
    const supabase = await createClient();
    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  },

  async validateCoupon(code: string, userId?: string, cartTotal: number = 0, totalItems: number = 0, phone?: string) {
    const supabase = await createClient();
    
    // 1. Fetch coupon
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .ilike('code', code)
      .eq('active', true)
      .maybeSingle(); // maybeSingle is safer then .single() to avoid 406/404 errors throwing before we can handle them

    if (error || !coupon) throw new Error("Invalid or inactive coupon");

    // 2. Check Expiry
    if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
      throw new Error("This coupon has expired");
    }

    // 3. Check min order value
    if (cartTotal < coupon.min_order_value) {
      throw new Error(`Minimum order of ₹${coupon.min_order_value} required`);
    }

    // 4. Check min quantity
    if (totalItems < (coupon.min_quantity || 0)) {
      throw new Error(`Minimum ${coupon.min_quantity} items required for this coupon`);
    }

    // 5. Check user usage if logged in
    if (userId) {
      const { data: usage } = await supabase
        .from('coupon_usages')
        .select('*')
        .eq('user_id', userId)
        .eq('coupon_id', coupon.id)
        .maybeSingle();

      if (usage) throw new Error("You have already used this coupon");
    }

    // 6. Check guest usage if phone provided
    if (phone && !userId) {
      const { data: guestUsage } = await supabase
        .from('coupon_usages')
        .select('*')
        .eq('guest_phone', phone)
        .eq('coupon_id', coupon.id)
        .maybeSingle();

      if (guestUsage) throw new Error("This mobile number has already used this coupon");
    }

    return coupon;
  }
};
