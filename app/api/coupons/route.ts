import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

async function requireAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { errorResponse: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
    }
    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).maybeSingle();
    if (!profile?.is_admin) {
        return { errorResponse: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
    }
    return { supabase };
}

export async function GET() {
    try {
        const authResult = await requireAdmin();
        if ('errorResponse' in authResult) return authResult.errorResponse;
        const { supabase } = authResult;

        const { data, error } = await supabase
            .from('coupons')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return NextResponse.json({ coupons: data ?? [] });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const authResult = await requireAdmin();
        if ('errorResponse' in authResult) return authResult.errorResponse;
        const { supabase } = authResult;

        const body = await req.json();
        const { data, error } = await supabase.from('coupons').insert(body).select().single();
        if (error) throw error;

        revalidatePath('/admin/coupons');
        return NextResponse.json({ coupon: data, success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
