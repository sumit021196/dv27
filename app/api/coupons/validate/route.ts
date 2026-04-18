import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { couponService } from '@/services/coupon.service';

export async function POST(req: Request) {
  try {
    const { code, phone, cartTotal, totalItems } = await req.json();

    if (!code) {
      return NextResponse.json({ success: false, error: "Coupon code is required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    try {
      console.log("[Validate API] Validating", { code, phone, cartTotal, totalItems, userId: user?.id });
      const coupon = await couponService.validateCoupon(
        code,
        user?.id,
        cartTotal,
        totalItems,
        phone
      );

      return NextResponse.json({ 
        success: true, 
        coupon: {
          code: coupon.code,
          discount_value: coupon.discount_value,
          discount_type: coupon.discount_type,
          id: coupon.id
        } 
      });
    } catch (err: any) {
      console.error("[Validate API] Validation Failed:", err.message);
      return NextResponse.json({ success: false, error: err.message }, { status: 400 });
    }

  } catch (error: any) {
    console.error("Coupon validation error:", error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
