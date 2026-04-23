import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/utils/supabase/server';
import { delhiveryService } from '@/services/delhivery.service';
import { sendOrderConfirmationEmail } from '@/utils/email/send';

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!secret || !signature) {
      console.error("Webhook Error: Secret or signature missing");
      return NextResponse.json({ error: 'Webhook configuration error' }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.error("Webhook Error: Invalid signature");
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);
    const { payload } = event;

    // Handle order.paid or payment.captured
    if (event.event === 'order.paid' || event.event === 'payment.captured') {
      const orderId = payload.order?.entity?.id || payload.payment?.entity?.order_id;
      const paymentId = payload.payment?.entity?.id;

      if (!orderId || !paymentId) {
        return NextResponse.json({ error: 'Missing IDs' }, { status: 400 });
      }

      const supabase = await createClient(true);

      // 1. Find the order in our DB by razorpay_order_id
      const { data: orderData, error: fetchErr } = await supabase
        .from('orders')
        .select('id, status, customer_name, customer_phone, customer_email, total_amount')
        .eq('razorpay_order_id', orderId)
        .single();

      if (fetchErr || !orderData) {
        console.error("Webhook Error: Order not found in DB", orderId);
        return NextResponse.json({ error: 'Order not found' }, { status: 200 }); // 200 to stop retries
      }

      // 2. If already paid, just return success
      if (orderData.status === 'paid') {
        return NextResponse.json({ success: true, message: 'Already processed' });
      }

      // 3. Run atomic update (Stock decrement + Status update)
      const { error: rpcError } = await supabase.rpc('handle_payment_success', {
        p_order_id: orderData.id,
        p_payment_id: paymentId
      });

      if (rpcError) {
        console.error("Webhook Error: handle_payment_success RPC Failed", rpcError);
        return NextResponse.json({ error: 'RPC failed' }, { status: 500 });
      }

      if (orderData.customer_email) {
          await sendOrderConfirmationEmail(orderData.customer_email, {
              id: orderData.id,
              total_amount: orderData.total_amount,
              payment_method: 'Prepaid'
          });
      }

      // 4. Trigger Delhivery shipment creation
      const { data: shipping } = await supabase.from('shipping_details').select('*').eq('order_id', orderData.id).single();
      const { data: items } = await supabase.from('order_items').select('*').eq('order_id', orderData.id);

      if (shipping && items) {
        try {
          const shipmentData = {
            name: orderData.customer_name,
            add: shipping.address,
            pin: shipping.pincode,
            phone: orderData.customer_phone ? orderData.customer_phone.replace(/\D/g, '').slice(-10) : '',
            order: orderData.id,
            payment_mode: 'Prepaid',
            total_amount: orderData.total_amount,
            products_desc: items.map((item: any) => `${item.product_name} (x${item.quantity})`).join(', ')
          };
          
          console.log(`[Webhook] Attempting Delhivery shipment for Order: ${orderData.id}`);
          const delhiveryResponse = await delhiveryService.createShipment(shipmentData);
          
          if (delhiveryResponse.packages && delhiveryResponse.packages.length > 0) {
            const waybill = delhiveryResponse.packages[0].waybill;
            console.log(`[Webhook] Delhivery Success. Waybill: ${waybill}`);
            await supabase
              .from('shipping_details')
              .update({ 
                tracking_id: waybill, 
                shipping_partner: 'delhivery',
                updated_at: new Date().toISOString()
              })
              .eq('order_id', orderData.id);
          } else {
            console.warn("[Webhook] Delhivery responded but no waybill found", delhiveryResponse);
          }
        } catch (e: any) {
          console.error("[Webhook] Delhivery shipment creation failed. Admin attention required.", {
            error: e.message,
            orderId: orderData.id,
            stack: e.stack
          });
          // Note: We don't return 500 here because the payment IS successful. 
          // We just failed the optional shipping automation.
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Webhook handler error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
