import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabase = await createClient(true); // Admin client

        // Create coupons table
        const { error: couponsError } = await supabase.rpc('exec_sql', {
            query: `
                CREATE TABLE IF NOT EXISTS coupons (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    code TEXT UNIQUE NOT NULL,
                    discount_value NUMERIC NOT NULL,
                    discount_type TEXT NOT NULL CHECK (discount_type IN ('fixed', 'percent')),
                    min_order_value NUMERIC DEFAULT 0,
                    active BOOLEAN DEFAULT TRUE,
                    max_uses_per_user INT DEFAULT 1,
                    created_at TIMESTAMPTZ DEFAULT NOW()
                );

                CREATE TABLE IF NOT EXISTS coupon_usages (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
                    coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
                    used_at TIMESTAMPTZ DEFAULT NOW(),
                    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
                    UNIQUE(user_id, coupon_id)
                );

                -- Insert initial BDAY500 coupon
                INSERT INTO coupons (code, discount_value, discount_type, min_order_value)
                VALUES ('BDAY500', 500, 'fixed', 1000)
                ON CONFLICT (code) DO NOTHING;
            `
        });

        if (couponsError) {
            // If RPC doesn't exist, we might need another way.
            // Let's try raw SQL via a different method or just return the SQL for the user.
            return NextResponse.json({ error: couponsError.message, sql_fallback: true });
        }

        return NextResponse.json({ success: true, message: "Tables created" });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
