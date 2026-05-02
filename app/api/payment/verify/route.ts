import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/utils/supabase/server';
import { delhiveryService } from '@/services/delhivery.service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderDbId
    } = body;

    const secret = process.env.RAZORPAY_KEY_SECRET!;

    // Create signature to verify
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return NextResponse.json(
        { success: false, error: 'Invalid Payment Signature' },
        { status: 400 }
      );
    }

    // Payment is verified
    const supabase = await createClient(true); // USE ADMIN client to bypass RLS for system operations

    // 1. Fetch genuine order from DB
    const { data: orderData, error: fetchErr } = await supabase
       .from('orders')
       .select('*')
       .eq('id', orderDbId)
       .single();

    if (fetchErr || !orderData) {
        throw new Error("Linked order not found");
    }

    // 2. Call Atomic RPC for order update and stock decrement
    const { error: rpcError } = await supabase.rpc('handle_payment_success', {
       p_order_id: orderDbId,
       p_payment_id: razorpay_payment_id
    });
    
    if (rpcError) {
        console.error("CRITICAL: Failed to run handle_payment_success RPC", rpcError);
        throw new Error("Failed to finalize order in database");
    }

    // 2b. If coupon was applied, record usage
    if (orderData.applied_coupon_id) {
        await supabase.from('coupon_usages').insert({
            order_id: orderDbId,
            coupon_id: orderData.applied_coupon_id,
            user_id: orderData.user_id,
            guest_phone: orderData.customer_phone,
            used_at: new Date().toISOString()
        });
    }

    // 3. Fetch related data for Delhivery Tracking (now that it's paid)
    const { data: shipping } = await supabase.from('shipping_details').select('*').eq('order_id', orderDbId).single();
    const { data: items } = await supabase.from('order_items').select('*').eq('order_id', orderDbId);

    if (shipping && items) {
        // Create Shipment in Delhivery Dashboard
        try {
          const shipmentData = {
            name: orderData.customer_name,
            add: shipping.address,
            pin: shipping.pincode,
            phone: orderData.customer_phone ? orderData.customer_phone.replace(/\D/g, '').slice(-10) : '',
            order: orderDbId,
            payment_mode: 'Prepaid',
            total_amount: orderData.total_amount,
            products_desc: items.map((item: any) => {
              let desc = `${item.product_name}`;
              const variants = [];
              if (item.size) variants.push(`Size: ${item.size}`);
              if (item.color) variants.push(`Color: ${item.color}`);
              if (variants.length > 0) desc += ` (${variants.join(', ')})`;
              desc += ` (x${item.quantity})`;
              return desc;
            }).join(', ')
          };

          console.log(`[Verify] Attempting Delhivery shipment for Order: ${orderDbId}`);
          const delhiveryResponse = await delhiveryService.createShipment(shipmentData);

          // If Delhivery returns a waybill, update the shipping_details
          if (delhiveryResponse.packages && delhiveryResponse.packages.length > 0) {
            const waybill = delhiveryResponse.packages[0].waybill;
            console.log(`[Verify] Delhivery Success. Waybill: ${waybill}`);
            await supabase
              .from('shipping_details')
              .update({ 
                tracking_id: waybill, 
                shipping_partner: 'delhivery',
                updated_at: new Date().toISOString()
              })
              .eq('order_id', orderDbId);
          } else {
            console.warn("[Verify] Delhivery responded but no waybill found", delhiveryResponse);
          }
        } catch (shipmentErr: any) {
          console.error("[Verify] Delhivery shipment creation failed. Admin attention required.", {
            error: shipmentErr.message,
            orderId: orderDbId
          });
          // Not throwing here, as payment verification succeeded
        }
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and order finalized',
      orderId: orderDbId
    });

  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { success: false, error: error.message || 'Verification Failed' },
      { status: 500 }
    );
  }
}
