"use server";

import { createClient } from "@/utils/supabase/server";

export async function getActiveCouponByCode(code: string) {
  const supabase = await createClient(true);
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('active', true)
    .single();

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true, data };
}

export async function getAutoApplyCoupons() {
  const supabase = await createClient(true);
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('active', true)
    .eq('is_auto_apply', true)
    .order('discount_value', { ascending: false });

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true, data };
}
