import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/utils/supabase/server';

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
