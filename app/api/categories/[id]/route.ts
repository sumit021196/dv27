import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        const { data: category, error } = await supabase
            .from('categories')
            .select('*')
            .eq('id', id)
            .maybeSingle();

        if (error) throw error;
        if (!category) return NextResponse.json({ error: "Category not found" }, { status: 404 });

        return NextResponse.json({ category });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        
        // Ensure user is admin
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).maybeSingle();
        if (!profile?.is_admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const body = await req.json();
        const { data, error } = await supabase
            .from('categories')
            .update(body)
            .eq('id', id)
            .select()
            .maybeSingle();

        if (error) throw error;

        revalidatePath('/');
        revalidatePath('/products');
        revalidatePath('/admin/categories');

        return NextResponse.json({ category: data, success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        
        // Ensure user is admin
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).maybeSingle();
        if (!profile?.is_admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const body = await req.json();
        const { name, slug, image_url, is_active } = body;

        const { data, error } = await supabase
            .from('categories')
            .update({ name, slug, image_url, is_active })
            .eq('id', id)
            .select()
            .maybeSingle();

        if (error) throw error;
        return NextResponse.json({ category: data, success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
