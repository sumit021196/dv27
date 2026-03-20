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
      orderDetails
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
    // Now, save the order to Supabase
    const supabase = await createClient(true); // USE ADMIN client to bypass RLS for system operations

    const { data: { user } } = await supabase.auth.getUser(); // Get current user if logged in

    // 1. Insert into orders table
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user ? user.id : null,
        customer_name: orderDetails.customerName,
        customer_phone: orderDetails.customerPhone || null,
        total_amount: orderDetails.totalAmount,
        subtotal: orderDetails.totalAmount, // Assuming no shipping fee for now based on checkout
        status: 'paid', // Update status to paid since payment is verified
        razorpay_order_id: razorpay_order_id,
        razorpay_payment_id: razorpay_payment_id,
      })
      .select()
      .single();

    if (orderError) throw new Error(`Order Creation Failed: ${orderError.message}`);

    const newOrderId = orderData.id;

    // 2. Insert into order_items table
    const itemsToInsert = orderDetails.items.map((item: any) => ({
      order_id: newOrderId,
      product_id: item.id,
      product_name: item.name,
      quantity: item.qty,
      price: item.price,
      image_url: item.image,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsToInsert);
      
    if (itemsError) throw new Error(`Order Items Creation Failed: ${itemsError.message}`);

    // 3. Insert into shipping_details table
    const { error: shippingError } = await supabase
      .from('shipping_details')
      .insert({
        order_id: newOrderId,
        pincode: orderDetails.shipping.pincode,
        address: orderDetails.shipping.address,
        shipping_cost: orderDetails.shipping.cost,
        estimated_delivery: orderDetails.shipping.estimated_delivery,
        serviceability_status: 'serviceable',
        tracking_id: razorpay_payment_id // Storing payment ID here for reference temporarily
      });

    if (shippingError) throw new Error(`Shipping Details Creation Failed: ${shippingError.message}`);

    // 4. Create Shipment in Delhivery Dashboard
    try {
      const shipmentData = {
        name: orderDetails.customerName,
        add: orderDetails.shipping.address,
        pin: orderDetails.shipping.pincode,
        phone: orderDetails.customerPhone ? orderDetails.customerPhone.replace(/\D/g, '').slice(-10) : '',
        order: newOrderId,
        payment_mode: 'Prepaid',
        total_amount: orderDetails.totalAmount,
        products_desc: orderDetails.items.map((item: any) => `${item.name} (x${item.qty})`).join(', ')
      };

      const delhiveryResponse = await delhiveryService.createShipment(shipmentData);
      console.log("Delhivery Shipment Created:", delhiveryResponse);

      // If Delhivery returns a waybill, we can update the shipping_details
      if (delhiveryResponse.packages && delhiveryResponse.packages.length > 0) {
        const waybill = delhiveryResponse.packages[0].waybill;
        await supabase
          .from('shipping_details')
          .update({ tracking_id: waybill })
          .eq('order_id', newOrderId);
      }
    } catch (shipmentErr) {
      console.error("Delhivery Shipment Creation Failed:", shipmentErr);
      // We don't throw here to avoid failing the whole request if Delhivery is down, 
      // since the order is already saved in Supabase and payment is verified.
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and order created',
      orderId: newOrderId
    });

  } catch (error: any) {
    console.error("Payment verification/Order creation error:", error);
    return NextResponse.json(
      { success: false, error: error.message || 'Verification Failed' },
      { status: 500 }
    );
  }
}
