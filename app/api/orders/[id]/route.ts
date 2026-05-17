import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        
        // Ensure admin
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
        if (!profile?.is_admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const { data: order, error } = await supabase
            .from('orders')
            .select(`
                *,
                order_items (*),
                shipping_details (*)
            `)
            .eq('id', id)
            .single();

        if (error) throw error;
        return NextResponse.json({ order });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        
        // Ensure admin
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
        if (!profile?.is_admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const body = await req.json();
        const { status } = body;

        // 1. Get current status to detect change to cancelled
        const { data: currentOrder } = await supabase
            .from('orders')
            .select('status')
            .eq('id', id)
            .single();

        // 2. Update order status
        const { data, error } = await supabase
            .from('orders')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        // 3. Robust Inventory: If status changed to 'cancelled', replenish stock
        if (status === 'cancelled' && currentOrder?.status !== 'cancelled') {
            console.log(`[Inventory] Replenishing stock for cancelled order: ${id}`);
            await supabase.rpc('manage_order_stock', {
                p_order_id: id,
                p_action: 'increment'
            });
        }

        return NextResponse.json({ order: data, success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
