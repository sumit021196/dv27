import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        
        // Ensure user is admin
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
        if (!profile?.is_admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const body = await req.json();
        const { name, slug, description, price, stock, category_id, media_url, is_active, is_trending } = body;

        const { data, error } = await supabase
            .from('products')
            .insert([{ 
                name, 
                slug, 
                description, 
                price: parseFloat(price), 
                stock: parseInt(stock, 10), 
                category_id: category_id || null, 
                media_url, 
                is_active, 
                is_trending 
            }])
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json({ product: data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
