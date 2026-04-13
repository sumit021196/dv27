import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
        if (!profile?.is_admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const supabaseAdmin = await createClient(true);
        const { data, error } = await supabaseAdmin.from('coupons').select('*').order('created_at', { ascending: false });

        if (error) throw error;
        return NextResponse.json({ coupons: data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
        if (!profile?.is_admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const body = await req.json();
        const supabaseAdmin = await createClient(true);
        const { data, error } = await supabaseAdmin.from('coupons').insert(body).select().single();

        if (error) throw error;
        return NextResponse.json({ coupon: data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
