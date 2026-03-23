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

  async validateCoupon(code: string, userId?: string, cartTotal: number = 0) {
    const supabase = await createClient();
    
    // 1. Fetch coupon
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('active', true)
      .single();

    if (error || !coupon) throw new Error("Invalid or inactive coupon");

    // 2. Check min order value
    if (cartTotal < coupon.min_order_value) {
      throw new Error(`Minimum order of ₹${coupon.min_order_value} required`);
    }

    // 3. Check user usage if logged in
    if (userId) {
      const { data: usage, error: usageError } = await supabase
        .from('user_coupons')
        .select('*')
        .eq('user_id', userId)
        .eq('coupon_id', coupon.id)
        .single();

      if (usage) throw new Error("You have already used this coupon");
    }

    return coupon;
  }
};
