import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        const supabaseAdmin = await createClient(true);

        // 1. Fetch order details
        const { data: order, error: fetchError } = await supabaseAdmin
            .from('orders')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // 2. Check if the order is already shipped, delivered or cancelled
        const status = order.status?.toLowerCase();
        if (status === 'cancelled') {
            return NextResponse.json({ error: 'Order is already cancelled' }, { status: 400 });
        }
        if (status === 'shipped' || status === 'delivered') {
            return NextResponse.json({ error: `Order cannot be cancelled as it is already ${status}` }, { status: 400 });
        }

        // 3. Security: If the order belongs to a registered user, ensure they are the owner
        if (order.user_id) {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user || user.id !== order.user_id) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
        }

        // 4. Perform cancellation
        const { error: updateError } = await supabaseAdmin
            .from('orders')
            .update({ 
                status: 'cancelled', 
                updated_at: new Date().toISOString() 
            })
            .eq('id', id);

        if (updateError) throw updateError;

        // 5. Replenish inventory stock atomically using RPC
        console.log(`[Inventory] Replenishing stock for cancelled order: ${id}`);
        await supabaseAdmin.rpc('manage_order_stock', {
            p_order_id: id,
            p_action: 'increment'
        });

        return NextResponse.json({ success: true, message: 'Order cancelled successfully' });
    } catch (error: any) {
        console.error("Cancel Order API Error:", error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
