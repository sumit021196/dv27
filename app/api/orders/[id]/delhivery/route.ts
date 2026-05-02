import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { delhiveryService } from '@/services/delhivery.service';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const supabase = await createClient();

        // Ensure admin
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
        if (!profile?.is_admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const body = await req.json();
        const { action, payload } = body;

        const { data: order } = await supabase.from('orders').select('*').eq('id', id).single();
        const { data: shipping } = await supabase.from('shipping_details').select('*').eq('order_id', id).single();
        const { data: items } = await supabase.from('order_items').select('*').eq('order_id', id);

        if (!order || !shipping || !items) {
             return NextResponse.json({ error: "Order details incomplete" }, { status: 400 });
        }

        if (action === 'generate_awb') {
             const shipmentData = {
                name: order.customer_name,
                add: shipping.address,
                pin: shipping.pincode,
                phone: order.customer_phone ? order.customer_phone.replace(/\D/g, '').slice(-10) : '',
                order: order.id,
                payment_mode: order.payment_method === 'cod' ? 'COD' : 'Prepaid',
                cod_amount: order.payment_method === 'cod' ? order.total_amount : 0,
                total_amount: order.total_amount,
                products_desc: items.map((item: any) => `${item.product_name} (x${item.quantity})`).join(', ')
            };

            const delhiveryResponse = await delhiveryService.createShipment(shipmentData);

            if (delhiveryResponse.packages && delhiveryResponse.packages.length > 0) {
                const waybill = delhiveryResponse.packages[0].waybill;
                await supabase
                    .from('shipping_details')
                    .update({
                        tracking_id: waybill,
                        shipping_partner: 'delhivery',
                        updated_at: new Date().toISOString()
                    })
                    .eq('order_id', id);
                return NextResponse.json({ success: true, waybill });
            }
            throw new Error("No waybill returned");
        }

        else if (action === 'request_pickup') {
            const result = await delhiveryService.requestPickup({
                waybill: shipping.tracking_id,
                pickup_time: new Date().toISOString()
            });
            return NextResponse.json({ success: true, pickup_id: result.pickup_id });
        }

        else if (action === 'generate_manifest') {
             const url = await delhiveryService.generateManifest(shipping.tracking_id!);
             return NextResponse.json({ success: true, manifest_url: url });
        }

        else if (action === 'edit_shipping') {
            await supabase.from('shipping_details').update({
                address: payload.address,
                pincode: payload.pincode,
                updated_at: new Date().toISOString()
            }).eq('order_id', id);

            if (shipping.tracking_id) {
               await delhiveryService.editShipment(shipping.tracking_id, payload);
            }
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
