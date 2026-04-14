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

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const authResult = await requireAdmin();
        if ('errorResponse' in authResult) return authResult.errorResponse;
        const { supabase } = authResult;

        const body = await req.json();
        const { data, error } = await supabase
            .from('coupons')
            .update(body)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;

        revalidatePath('/admin/coupons');
        return NextResponse.json({ coupon: data, success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const authResult = await requireAdmin();
        if ('errorResponse' in authResult) return authResult.errorResponse;
        const { supabase } = authResult;

        const { error } = await supabase.from('coupons').delete().eq('id', id);
        if (error) throw error;

        revalidatePath('/admin/coupons');
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
