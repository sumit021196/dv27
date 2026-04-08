"use client";

import { useState, useMemo, useEffect } from "react";
import { useCart } from "@/components/cart/CartContext";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldCheck, Loader2, AlertCircle, MapPin, Truck } from "lucide-react";
import Link from "next/link";
import Script from "next/script";
import type { ServiceabilityResponse } from "@/services/deliveryone.service";

export default function CheckoutPage() {
  const cart = useCart();
  const router = useRouter();
  
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pincode, setPincode] = useState("");
  const [address, setAddress] = useState("");
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [shippingInfo, setShippingInfo] = useState<ServiceabilityResponse | null>(null);
  const [isCheckingPincode, setIsCheckingPincode] = useState(false);
  const [pincodeError, setPincodeError] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Basic validation
  const isFormValid = name.length > 2 && phone.length >= 10 && pincode.length === 6 && address.length > 5 && shippingInfo?.serviceable;

  const total = useMemo(() => cart.items.reduce((s, i) => s + i.price * i.qty, 0), [cart.items]);
  const finalTotal = useMemo(() => Math.max(0, total - cart.discount) + (shippingInfo?.shipping_cost || 0), [total, cart.discount, shippingInfo]);

  useEffect(() => {
    if (cart.items.length === 0) {
      router.push("/cart");
    }
  }, [cart.items, router]);

  const handlePincodeChange = async (val: string) => {
    setPincode(val);
    setPincodeError("");
    if (val.length === 6) {
      setIsCheckingPincode(true);
      try {
        const response = await fetch(`/api/shipping/serviceability?pincode=${val}`);
        const res = await response.json() as ServiceabilityResponse;
        setShippingInfo(res);
        if (!res.serviceable) {
          setPincodeError(res.error || "Area not serviceable");
        }
      } catch (err) {
        setPincodeError("Failed to check serviceability");
      } finally {
        setIsCheckingPincode(false);
      }
    } else {
      setShippingInfo(null);
    }
  };

  const handlePayment = async () => {
    if (!isFormValid) {
      setError("Please fill all details correctly.");
      return;
    }
    setError("");
    setIsProcessing(true);

    try {
      // 1. Create order on our backend
      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderDetails: {
            customerName: name,
            customerPhone: phone,
            coupon: cart.coupon,
            shipping: { 
              pincode, 
              address, 
              cost: shippingInfo?.shipping_cost || 0, 
              estimated_delivery: shippingInfo?.estimated_delivery || null 
            },
            items: cart.items
          }
        })
      });
      
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error || "Failed to create order");
      }

      // 2. Options for Razorpay Modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Enter the Key ID generated from the Dashboard
        amount: data.order.amount,
        currency: data.order.currency,
        name: "The DV27",
        description: "Order Payment",
        order_id: data.order.id,
        handler: async function (response: any) {
          // 3. Verify Payment
          try {
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                orderDbId: data.orderDbId // Pass the backend DB ID so verify knows which order to mark as paid
              })
            });

            const verifyData = await verifyRes.json();
            
            if (verifyData.success) {
              cart.clear(); // Clear cart on success
              router.push(`/checkout/success?order_id=${verifyData.orderId}`); // Redirection to dedicated success page
            } else {
              setError("Payment verification failed. Please contact support.");
            }
          } catch (err) {
            console.error(err);
            setError("Error verifying payment.");
          }
        },
        prefill: {
          name: name,
          contact: phone,
        },
        theme: {
          color: "#000000",
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.on('payment.failed', function (response: any){
         setError("Payment Failed: " + response.error.description);
         setIsProcessing(false);
      });
      paymentObject.open();

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during payment setup.");
    } finally {
      setIsProcessing(false); // Enable button if modal closes/fails
    }
  };

  if (!isMounted || cart.items.length === 0) return null;

  return (
    <main className="min-h-screen bg-zinc-50/30 pb-32 pt-24 lg:pt-32">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/cart" className="p-2 -ml-2 text-zinc-400 hover:text-zinc-900 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Checkout</h1>
        </div>

        <div className="bg-white rounded-[2rem] border border-zinc-100 p-6 sm:p-10 shadow-sm mb-6">
          <h2 className="text-lg font-bold text-zinc-900 mb-6 flex items-center gap-2">
            Shipping Details
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 mb-2 ml-1">Full Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-2xl border border-zinc-100 bg-zinc-50/50 px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-zinc-900/5 outline-none transition-all"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 mb-2 ml-1">Phone Number *</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-2xl border border-zinc-100 bg-zinc-50/50 px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-zinc-900/5 outline-none transition-all"
                    placeholder="10-digit mobile number"
                  />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[150px_1fr] gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 mb-2 ml-1">Pincode *</label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => handlePincodeChange(e.target.value.replace(/\D/g, ''))}
                      className={`w-full rounded-2xl border ${pincodeError ? 'border-red-200 bg-red-50/30' : 'border-zinc-100 bg-zinc-50/50'} px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-zinc-900/5 outline-none transition-all`}
                      placeholder="110001"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      {isCheckingPincode ? (
                        <Loader2 size={16} className="animate-spin text-zinc-400" />
                      ) : shippingInfo?.serviceable ? (
                        <ShieldCheck size={16} className="text-emerald-500" />
                      ) : pincode.length === 6 ? (
                        <AlertCircle size={16} className="text-red-500" />
                      ) : (
                        <MapPin size={16} className="text-zinc-300" />
                      )}
                    </div>
                  </div>
                  {pincodeError && (
                    <p className="text-[11px] font-bold text-red-500 mt-2 ml-1 uppercase tracking-wider flex items-center gap-1">
                      <AlertCircle size={12} />
                      {pincodeError}
                    </p>
                  )}
                  {shippingInfo?.serviceable && (
                    <p className="text-[11px] font-bold text-emerald-600 mt-2 ml-1 uppercase tracking-wider flex items-center gap-1.5">
                      <Truck size={12} />
                      ~{shippingInfo.estimated_delivery}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 mb-2 ml-1">Address *</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full rounded-2xl border border-zinc-100 bg-zinc-50/50 px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-zinc-900/5 outline-none transition-all"
                    placeholder="House no., Building, Street, Area"
                  />
                </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-[2rem] border border-zinc-100 p-6 sm:p-10 shadow-sm">
          <h2 className="text-lg font-bold text-zinc-900 mb-6">Payment Summary</h2>
          
          <div className="space-y-4 mb-6">
             <div className="flex justify-between items-center text-sm font-medium text-zinc-500">
               <span>Items ({cart.items.length})</span>
               <span className="text-zinc-900 font-bold">₹{total.toLocaleString()}</span>
             </div>
             {cart.discount > 0 && (
               <div className="flex justify-between items-center text-sm font-medium text-emerald-600">
                 <span>Discount ({cart.coupon})</span>
                 <span className="font-bold">-₹{cart.discount.toLocaleString()}</span>
               </div>
             )}
             <div className="flex justify-between items-center text-sm font-medium text-zinc-500">
               <span>Shipping</span>
               {shippingInfo?.serviceable ? (
                 <span className="text-emerald-600 font-bold">₹{shippingInfo.shipping_cost}</span>
               ) : (
                 <span className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">{pincode.length === 6 ? 'N/A' : 'Enter Pincode'}</span>
               )}
             </div>
             <div className="pt-4 border-t border-zinc-50 flex justify-between items-center">
               <span className="text-lg font-bold text-zinc-900">Total</span>
               <span className="text-2xl font-black text-zinc-900 tracking-tight">₹{finalTotal.toLocaleString()}</span>
             </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 text-red-600 text-sm font-medium flex items-start gap-2 border border-red-100">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <p>{error}</p>
            </div>
          )}

          <button
            onClick={handlePayment}
            disabled={!isFormValid || isProcessing}
            className="w-full flex items-center justify-center gap-2 bg-zinc-900 text-white rounded-2xl px-6 py-4 font-bold hover:bg-zinc-800 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-zinc-200 disabled:opacity-50 disabled:pointer-events-none disabled:transform-none"
          >
            {isProcessing ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
               <>
                 <ShieldCheck size={18} />
                 Pay Securely
               </>
            )}
          </button>
          
          <p className="text-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-4 flex items-center justify-center gap-1.5">
             <ShieldCheck size={12} />
             Secured by Razorpay
          </p>
        </div>

      </div>
    </main>
  );
}
