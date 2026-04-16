import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createClient } from '@/utils/supabase/server';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderDetails, currency = 'INR', receipt = 'receipt_' + Date.now(), paymentMethod = 'online' } = body;
    
    if (!orderDetails || !orderDetails.items) {
       return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 });
    }

    const { items, coupon } = orderDetails;

    // standard client to get user using cookies
    const supabaseUser = await createClient();
    const { data: { user } } = await supabaseUser.auth.getUser();
    
    // admin client for secure and reliable system operations like inserting orders
    const supabaseAdmin = await createClient(true);

    let computedSubtotal = 0;
    
    if (!Array.isArray(items) || items.length === 0) {
        return NextResponse.json({ success: false, error: "Cart is empty" }, { status: 400 });
    }

    const productIds = items.map((item: any) => item.id);
    const { data: dbProducts, error: productsError } = await supabaseAdmin
        .from('products')
        .select('id, price, is_active, stock')
        .in('id', productIds);

    if (productsError || !dbProducts) {
        throw new Error("Failed to verify product prices and stock.");
    }

    const dbProductMap = new Map(dbProducts.map((p) => [p.id.toString(), p]));

    for (const item of items) {
        const dbProduct = dbProductMap.get(item.id.toString());
        if (!dbProduct) {
            throw new Error(`Product ${item.id} not found in database.`);
        }
        if (!dbProduct.is_active) {
            throw new Error(`Product ${item.name} is no longer active.`);
        }
        if (dbProduct.stock < (item.qty || 1)) {
            throw new Error(`Product ${item.name} is out of stock or requested quantity is unavailable.`);
        }
        
        computedSubtotal += Number(dbProduct.price) * (item.qty || 1);
    }

    let computedDiscount = 0;
    const totalQty = items.reduce((acc: number, i: any) => acc + (i.qty || 1), 0);

    let dbCouponData = null;

    if (coupon) {
       const { data: dbCoupon } = await supabaseAdmin
         .from('coupons')
         .select('*')
         .eq('code', coupon.toUpperCase())
         .eq('active', true)
         .single();
         
       if (dbCoupon) {
           let isValid = true;

           // 1. Check Expiry
           if (dbCoupon.expiry_date && new Date(dbCoupon.expiry_date) < new Date()) {
               isValid = false;
           }

           // 2. Check Min Order Value
           if (computedSubtotal < (dbCoupon.min_order_value || 0)) {
               isValid = false;
           }

           // 3. Check Min Quantity
           if (totalQty < (dbCoupon.min_quantity || 0)) {
               isValid = false;
           }

           if (isValid) {
               dbCouponData = dbCoupon;
               computedDiscount = dbCoupon.discount_value || 0;
               
               // Check coupon usage limit
               if (user) {
                  const { count } = await supabaseAdmin
                    .from('coupon_usages')
                    .select('*', { count: 'exact', head: true })
                    .eq('coupon_id', dbCoupon.id)
                    .eq('user_id', user.id);
                    
                  if (count !== null && count >= (dbCoupon.max_uses_per_user || 1)) {
                      computedDiscount = 0; // Exceeded
                      dbCouponData = null;
                  } else if (orderDetails.customerPhone) {
                   const { count } = await supabaseAdmin
                     .from('coupon_usages')
                     .select('*', { count: 'exact', head: true })
                     .eq('coupon_id', dbCoupon.id)
                     .eq('guest_phone', orderDetails.customerPhone);

                   if (count !== null && count >= (dbCoupon.max_uses_per_user || 1)) {
                       computedDiscount = 0; // Exceeded
                       dbCouponData = null;
                   }
                }
               }
           } else {
               computedDiscount = 0;
               dbCouponData = null;
           }
       }
    }

    const shippingCost = orderDetails.shipping?.cost || 0;
    const verifiedAmount = Math.max(0, computedSubtotal - computedDiscount + shippingCost);

    // 1. Create Order securely in Backend
    const orderToInsert = {
        user_id: user ? user.id : null,
        customer_name: orderDetails.customerName || 'Guest User',
        customer_phone: orderDetails.customerPhone || null,
        total_amount: verifiedAmount,
        subtotal: computedSubtotal,
        shipping_fee: shippingCost,
        status: paymentMethod === 'cod' ? 'confirmed' : 'pending',
        payment_method: paymentMethod,
        razorpay_order_id: null,
        applied_coupon_id: dbCouponData?.id || null,
    };

    const { data: orderData, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert(orderToInsert)
      .select()
      .single();

    if (orderError || !orderData) {
        console.error("Order Insert Error:", orderError);
        throw new Error("Could not construct draft order.");
    }
    const orderDbId = orderData.id;

    // 2. Insert validated order items with Error Handling
    const itemsToInsert = items.map((item: any) => ({
      order_id: orderDbId,
      product_id: item.id,
      product_name: item.name,
      quantity: item.qty || 1,
      price: dbProductMap.get(item.id.toString())?.price || 0, // DB Trusted Price
      image_url: item.image,
    }));
    
    const { error: itemsError } = await supabaseAdmin.from('order_items').insert(itemsToInsert);
    if (itemsError) {
        // Rollback Order
        await supabaseAdmin.from('orders').delete().eq('id', orderDbId);
        throw new Error("Failed to save order items. Transaction rolled back.");
    }

    // 3. Insert Shipping with Error Handling
    const { error: shippingError } = await supabaseAdmin.from('shipping_details').insert({
      order_id: orderDbId,
      pincode: orderDetails.shipping?.pincode || '',
      address: orderDetails.shipping?.address || '',
      shipping_cost: shippingCost,
      estimated_delivery: orderDetails.shipping?.estimated_delivery || ''
    });

    if (shippingError) {
        // Rollback Order
        await supabaseAdmin.from('orders').delete().eq('id', orderDbId);
        throw new Error("Failed to save shipping details. Transaction rolled back.");
    }

    // 4. Record Coupon Usage IF COD (for Online, it happens in Verify)
    if (dbCouponData && paymentMethod === 'cod') {
        await supabaseAdmin.from('coupon_usages').insert({
            coupon_id: dbCouponData.id,
            user_id: user ? user.id : null,
            guest_phone: orderDetails.customerPhone || null,
            order_id: orderDbId,
        });
    }

    if (paymentMethod === 'cod') {
        return NextResponse.json({ 
            success: true, 
            orderDbId, 
            paymentMethod: 'cod',
            message: "Order placed successfully (Cash on Delivery)"
        });
    }

    // Create Razorpay order (for Online Payment)
    const options = {
      amount: Math.round(verifiedAmount * 100),
      currency,
      receipt: orderDbId.toString().substring(0, 40),
    };

    const rzpOrder = await razorpay.orders.create(options);

    // 5. Link Razorpay ID
    const { error: rzpLinkError } = await supabaseAdmin.from('orders')
      .update({ razorpay_order_id: rzpOrder.id })
      .eq('id', orderDbId);
      
    if (rzpLinkError) {
        await supabaseAdmin.from('orders').delete().eq('id', orderDbId);
        throw new Error("Failed to link payment gateway ID. Transaction rolled back.");
    }

    return NextResponse.json({ success: true, order: rzpOrder, verifiedAmount, orderDbId, couponId: dbCouponData?.id });
  } catch (error: any) {
    console.error("Error creating Razorpay order:", error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

