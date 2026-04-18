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
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    expiry_date TIMESTAMPTZ,
                    min_quantity INT DEFAULT 0
                );

                -- Migration: add columns if they don't exist
                DO $$ 
                BEGIN 
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='coupons' AND column_name='expiry_date') THEN
                        ALTER TABLE coupons ADD COLUMN expiry_date TIMESTAMPTZ;
                    END IF;
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='coupons' AND column_name='min_quantity') THEN
                        ALTER TABLE coupons ADD COLUMN min_quantity INT DEFAULT 0;
                    END IF;
                END $$;

                CREATE TABLE IF NOT EXISTS coupon_usages (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
                    guest_phone TEXT,
                    coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
                    used_at TIMESTAMPTZ DEFAULT NOW(),
                    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
                    UNIQUE(user_id, coupon_id)
                );

                -- Migration: add guest_phone to coupon_usages
                DO $$ 
                BEGIN 
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='coupon_usages' AND column_name='guest_phone') THEN
                        ALTER TABLE coupon_usages ADD COLUMN guest_phone TEXT;
                    END IF;
                END $$;

                CREATE UNIQUE INDEX IF NOT EXISTS idx_coupon_usages_phone_coupon ON coupon_usages (guest_phone, coupon_id) WHERE guest_phone IS NOT NULL;

                -- Migration: add applied_coupon_id to orders
                DO $$ 
                BEGIN 
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='applied_coupon_id') THEN
                        ALTER TABLE orders ADD COLUMN applied_coupon_id UUID REFERENCES coupons(id) ON DELETE SET NULL;
                    END IF;
                END $$;

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
