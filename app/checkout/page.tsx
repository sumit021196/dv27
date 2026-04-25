"use client";

import { useState, useMemo, useEffect } from "react";
import { useCart } from "@/components/cart/CartContext";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldCheck, Loader2, AlertCircle, MapPin, Truck } from "lucide-react";
import Link from "next/link";
import Script from "next/script";
import type { ServiceabilityResponse } from "@/services/deliveryone.service";
import * as fp from "@/utils/fpixel";

export default function CheckoutPage() {
  const cart = useCart();
  const router = useRouter();
  
  const [step, setStep] = useState(0); // 0: Identity, 1: Shipping, 2: Review
  
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pincode, setPincode] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('online');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [shippingInfo, setShippingInfo] = useState<ServiceabilityResponse | null>(null);
  const [isCheckingPincode, setIsCheckingPincode] = useState(false);
  const [pincodeError, setPincodeError] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const canGoToShipping = name.length > 2 && phone.length >= 10;
  const canGoToReview = pincode.length === 6 && address.length > 5 && shippingInfo?.serviceable;
  const isFormValid = canGoToShipping && canGoToReview;

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
      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          paymentMethod,
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

      if (paymentMethod === 'cod') {
        // Meta Pixel Tracking Preparation
        sessionStorage.setItem('last_order_total', finalTotal.toString());
        
        cart.clear();
        router.push(`/checkout/success?order_id=${data.orderDbId}`);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "The DV27",
        description: "Order Payment",
        order_id: data.order.id,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                orderDbId: data.orderDbId
              })
            });

            const verifyData = await verifyRes.json();
            
            if (verifyData.success) {
              // Meta Pixel Tracking Preparation
              sessionStorage.setItem('last_order_total', finalTotal.toString());

              cart.clear();
              router.push(`/checkout/success?order_id=${verifyData.orderId}`);
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
      setIsProcessing(false);
    }
  };

  if (!isMounted || cart.items.length === 0) return null;

  return (
    <main className="min-h-screen bg-white pb-32 pt-20">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      <div className="mx-auto max-w-md px-4">
        
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8 px-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${step >= i ? 'bg-zinc-900 text-white shadow-lg' : 'bg-zinc-100 text-zinc-400'}`}>
                {step > i ? <ShieldCheck size={16} /> : i + 1}
              </div>
              {i < 2 && (
                <div className={`flex-1 h-[2px] mx-2 transition-all ${step > i ? 'bg-zinc-900' : 'bg-zinc-100'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="relative min-h-[400px]">
          {/* Step 0: Identity */}
          {step === 0 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h1 className="text-2xl font-black text-zinc-900 tracking-tight mb-2">Who are you?</h1>
              <p className="text-sm font-medium text-zinc-400 mb-8">Let's start with the basics for your order.</p>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 mb-2 ml-1">Your Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-2xl border border-zinc-100 bg-zinc-50/50 px-4 py-4 text-sm font-medium focus:ring-2 focus:ring-zinc-900/5 outline-none transition-all"
                    placeholder="e.g. Rahul Sharma"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 mb-2 ml-1">Mobile Number</label>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full rounded-2xl border border-zinc-100 bg-zinc-50/50 px-4 py-4 text-sm font-medium focus:ring-2 focus:ring-zinc-900/5 outline-none transition-all"
                    placeholder="10-digit number"
                  />
                </div>
              </div>

              <button
                onClick={() => setStep(1)}
                disabled={!canGoToShipping}
                className="w-full mt-10 bg-zinc-900 text-white rounded-2xl py-4 font-bold shadow-xl shadow-zinc-200 disabled:opacity-30 transition-all hover:scale-[1.01] active:scale-[0.98]"
              >
                Delivery Details
              </button>
            </div>
          )}

          {/* Step 1: Shipping */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-3 mb-2">
                <button onClick={() => setStep(0)} className="p-2 -ml-2 text-zinc-400"><ArrowLeft size={18} /></button>
                <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Shipping</h1>
              </div>
              <p className="text-sm font-medium text-zinc-400 mb-8 ml-9">Where should we deliver your luxury?</p>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 mb-2 ml-1">Pincode</label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => handlePincodeChange(e.target.value.replace(/\D/g, ''))}
                      className={`w-full rounded-2xl border ${pincodeError ? 'border-red-200 bg-red-50/30' : 'border-zinc-100 bg-zinc-50/50'} px-4 py-4 text-sm font-medium focus:ring-2 focus:ring-zinc-900/5 outline-none transition-all`}
                      placeholder="e.g. 110001"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      {isCheckingPincode ? <Loader2 size={16} className="animate-spin text-zinc-400" /> : 
                       shippingInfo?.serviceable ? <ShieldCheck size={16} className="text-emerald-500" /> : 
                       pincode.length === 6 ? <AlertCircle size={16} className="text-red-500" /> : null}
                    </div>
                  </div>
                  {pincodeError && <p className="text-[10px] font-bold text-red-500 mt-2 ml-1 uppercase">{pincodeError}</p>}
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 mb-2 ml-1">Full Address</label>
                  <textarea
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full rounded-2xl border border-zinc-100 bg-zinc-50/50 px-4 py-4 text-sm font-medium focus:ring-2 focus:ring-zinc-900/5 outline-none transition-all resize-none"
                    placeholder="House no., Building, Area..."
                  />
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!canGoToReview}
                className="w-full mt-10 bg-zinc-900 text-white rounded-2xl py-4 font-bold shadow-xl shadow-zinc-200 disabled:opacity-30 transition-all hover:scale-[1.01] active:scale-[0.98]"
              >
                Review Order
              </button>
            </div>
          )}

          {/* Step 2: Review */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-3 mb-2">
                <button onClick={() => setStep(1)} className="p-2 -ml-2 text-zinc-400"><ArrowLeft size={18} /></button>
                <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Review</h1>
              </div>
              <p className="text-sm font-medium text-zinc-400 mb-8 ml-9">One last look before payment.</p>

              <div className="bg-zinc-50/50 rounded-3xl p-6 border border-zinc-100 mb-8 space-y-4">
                {/* Coupon Input in Review */}
                {!cart.coupon ? (
                  <div className="relative mb-6">
                    <input
                      type="text"
                      id="coupon_input_wizard"
                      placeholder="Coupon Code"
                      className="w-full h-12 bg-white border border-zinc-100 rounded-xl px-4 text-xs font-bold uppercase tracking-widest outline-none focus:border-zinc-900 focus:bg-white transition-all pr-24"
                    />
                    <button 
                      onClick={async () => {
                        const input = document.getElementById('coupon_input_wizard') as HTMLInputElement;
                        if (!input.value) return;
                        // For guests, we can pass the phone number for precise validation
                        const res = await cart.applyCoupon(input.value, phone);
                        if (!res.success) alert(res.message);
                      }}
                      className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-zinc-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95"
                    >
                      Apply
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-emerald-100/30 border border-emerald-100 p-3 rounded-xl mb-6">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={14} className="text-emerald-600" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">{cart.coupon} Applied</span>
                    </div>
                    <button 
                      onClick={() => cart.applyCoupon('')}
                      className="text-[10px] font-bold text-emerald-700/50 hover:text-emerald-700 uppercase"
                    >
                      Remove
                    </button>
                  </div>
                )}

                <div className="flex justify-between items-center text-sm font-medium text-zinc-500">
                  <span>Bag Total</span>
                  <span className="text-zinc-900 font-bold">₹{total.toLocaleString()}</span>
                </div>
                {cart.discount > 0 && (
                  <div className="flex justify-between items-center text-sm font-medium text-emerald-600">
                    <span className="flex items-center gap-1.5"><ShieldCheck size={14} /> Coupon {cart.coupon}</span>
                    <span className="font-bold">-₹{cart.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm font-medium text-zinc-500">
                  <span>Shipping</span>
                  <span className="text-emerald-600 font-bold">{shippingInfo?.shipping_cost === 0 ? 'FREE' : `₹${shippingInfo?.shipping_cost}`}</span>
                </div>
                <div className="pt-4 border-t border-zinc-100 flex justify-between items-center">
                  <span className="text-lg font-black text-zinc-900">Total</span>
                  <span className="text-2xl font-black text-zinc-900 tracking-tight">₹{finalTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="mb-8">
                <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 mb-4 ml-1">Payment Method</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setPaymentMethod('online')}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${paymentMethod === 'online' ? 'border-zinc-900 bg-zinc-900 text-white shadow-lg' : 'border-zinc-100 bg-white text-zinc-400 hover:border-zinc-200'}`}
                  >
                    <ShieldCheck size={20} className={paymentMethod === 'online' ? 'mb-2' : 'mb-2 opacity-30'} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Online</span>
                    <span className="text-[8px] font-bold mt-1 opacity-60">UPI / Cards</span>
                  </button>
                  <button 
                    onClick={() => setPaymentMethod('cod')}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${paymentMethod === 'cod' ? 'border-emerald-600 bg-emerald-600 text-white shadow-lg' : 'border-zinc-100 bg-white text-zinc-400 hover:border-zinc-200'}`}
                  >
                    <Truck size={20} className={paymentMethod === 'cod' ? 'mb-2' : 'mb-2 opacity-30'} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Cash</span>
                    <span className="text-[8px] font-bold mt-1 opacity-60">On Delivery</span>
                  </button>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 rounded-2xl bg-red-50 text-red-600 text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 border border-red-100">
                    <AlertCircle size={16} />
                    {error}
                </div>
              )}

              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className={`w-full flex items-center justify-center gap-2 rounded-2xl py-4 font-bold shadow-xl transition-all hover:scale-[1.01] active:scale-[0.98] ${paymentMethod === 'cod' ? 'bg-emerald-600 text-white shadow-emerald-100 hover:bg-emerald-700' : 'bg-zinc-900 text-white shadow-zinc-200 hover:bg-black'}`}
              >
                {isProcessing ? <Loader2 size={20} className="animate-spin" /> : 
                 paymentMethod === 'cod' ? <>Place COD Order ₹{finalTotal.toLocaleString()}</> : 
                 <>Pay Securely ₹{finalTotal.toLocaleString()}</>}
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-[10px] font-bold text-zinc-300 uppercase tracking-[0.2em] mt-8 flex items-center justify-center gap-2">
           <ShieldCheck size={12} />
           100% Encrypted Payment
        </p>

      </div>
    </main>
  );
}
