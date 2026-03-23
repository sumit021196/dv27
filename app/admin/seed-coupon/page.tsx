import { createClient } from '@/utils/supabase/server';

export default async function Page() {
    const supabase = await createClient();
    
    const { data: existing } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', 'BDAY500')
        .single();

    if (!existing) {
        await supabase.from('coupons').insert({
            code: 'BDAY500',
            discount_value: 500,
            discount_type: 'fixed',
            min_order_value: 0,
            active: true,
            max_uses_per_user: 1
        });
        return <div>Coupon BDAY500 created successfully!</div>;
    }

    return <div>Coupon BDAY500 already exists.</div>;
}
