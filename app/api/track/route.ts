import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { delhiveryService } from '@/services/delhivery.service';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id')?.trim();

    if (!id) {
      return NextResponse.json({ error: 'Tracking ID or Order ID is required' }, { status: 400 });
    }

    const supabase = await createClient(true); // Admin to bypass RLS for lookups

    let orderData = null;
    let shippingData = null;

    // 1. Try finding by Order UUID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    
    if (isUuid) {
      const { data: order } = await supabase
        .from('orders')
        .select('*, shipping_details(*), order_items(*)')
        .eq('id', id)
        .single();
      
      if (order) {
        orderData = order;
        shippingData = order.shipping_details?.[0];
      }
    }

    // 2. If not found, try finding by Tracking ID / AWB
    if (!orderData) {
      const { data: shipping } = await supabase
        .from('shipping_details')
        .select('*, orders(*, order_items(*))')
        .eq('tracking_id', id)
        .single();
      
      if (shipping) {
        shippingData = shipping;
        orderData = shipping.orders;
      }
    }

    if (!orderData) {
      return NextResponse.json({ error: 'No order found with the provided ID' }, { status: 404 });
    }

    // 3. Fetch live status from Delhivery if tracking ID exists
    let liveStatus = null;
    if (shippingData?.tracking_id) {
      try {
        const trackingResponse = await delhiveryService.trackShipment(shippingData.tracking_id);
        liveStatus = trackingResponse;
      } catch (e) {
        console.error("Delhivery Live Track Error:", e);
      }
    }

    return NextResponse.json({
      success: true,
      order: {
        id: orderData.id,
        status: orderData.status,
        customer_name: orderData.customer_name,
        total_amount: orderData.total_amount,
        created_at: orderData.created_at,
        items: orderData.order_items
      },
      shipping: {
        tracking_id: shippingData?.tracking_id,
        partner: shippingData?.shipping_partner,
        address: shippingData?.address,
        estimated_delivery: shippingData?.estimated_delivery
      },
      liveStatus
    });

  } catch (error: any) {
    console.error("Track API Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
