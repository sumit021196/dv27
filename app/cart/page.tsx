"use client";
import Link from "next/link";
import { useState, useMemo } from "react";
import { useCart } from "@/components/cart/CartContext";
import { FALLBACK_IMG } from "@/utils/images";
import { MessageCircle, ShoppingBag, Trash2, Plus, Minus, ArrowLeft, ShieldCheck, MapPin, Truck, AlertCircle, Loader2 } from "lucide-react";
import type { ServiceabilityResponse } from "@/services/deliveryone.service";


export default function CartPage() {
  const cart = useCart();
  const [pincode, setPincode] = useState("");
  const [shippingInfo, setShippingInfo] = useState<ServiceabilityResponse | null>(null);
  const [isCheckingPincode, setIsCheckingPincode] = useState(false);
  const [pincodeError, setPincodeError] = useState("");

  const total = useMemo(() => cart.items.reduce((s, i) => s + i.price * i.qty, 0), [cart.items]);

  const generateWhatsAppLink = () => {
    const phoneNumber = "911234567890"; // Placeholder
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    let message = `*Hi, I want to place an order!*%0A%0A`;
    cart.items.forEach((item, index) => {
      message += `${index + 1}. *${item.name}* (ID: ${item.id})%0A`;
      message += `   Qty: ${item.qty} | Price: ₹${item.price}%0A`;
      message += `   Link: ${baseUrl}/product/${item.id}%0A%0A`;
    });
    message += `*Total Amount: ₹${(total + (shippingInfo?.shipping_cost || 0)).toFixed(2)}*%0A`;
    message += `(Items: ₹${total.toFixed(2)} | Shipping: ₹${(shippingInfo?.shipping_cost || 0)})%0A%0A`;
    message += `*Delivery Details:*%0A`;
    message += `- Pincode: ${pincode || "Not provided"}%0A`;
    if (shippingInfo?.estimated_delivery) {
      message += `- Est. Delivery: ${shippingInfo.estimated_delivery}%0A`;
    }
    message += `%0A`;

    message += `Please confirm my order.`;
    return `https://wa.me/${phoneNumber}?text=${message}`;
  };

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


  if (cart.items.length === 0) {
    return (
      <main className="min-h-[80vh] flex flex-col items-center justify-center px-6">
        <div className="w-20 h-20 bg-zinc-50 rounded-[2.5rem] flex items-center justify-center mb-6 border border-zinc-100 shadow-sm">
          <ShoppingBag className="text-zinc-300" size={32} />
        </div>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Your bag is empty</h1>
        <p className="text-zinc-500 mt-2 text-center text-sm max-w-[280px]">
          Looks like you haven't added anything yet. Start exploring our collections.
        </p>
        <Link
          href="/products"
          className="mt-8 px-8 py-4 bg-zinc-900 text-white text-sm font-bold rounded-2xl hover:bg-zinc-800 transition active:scale-[0.98] shadow-xl shadow-zinc-200"
        >
          Check New Arrivals
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50/30 pb-32 lg:pb-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-8 px-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Your Bag</h1>
            <span className="bg-zinc-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">
              {cart.items.length} Items
            </span>
          </div>
          <Link href="/products" className="text-xs font-bold text-zinc-400 hover:text-zinc-900 transition flex items-center gap-1.5">
            <ArrowLeft size={14} />
            <span className="hidden sm:inline">Continue Shopping</span>
            <span className="sm:hidden">Back</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">

          {/* ── Cart Items ── */}
          <section className="space-y-3">
            {cart.items.map((i) => (
              <div key={i.id} className="group relative bg-white rounded-3xl p-3 flex gap-4 border border-zinc-100 hover:shadow-xl hover:shadow-zinc-200/50 transition-all duration-500">
                <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-2xl bg-zinc-50 border border-zinc-50">
                  <img
                    src={i.image || FALLBACK_IMG}
                    alt={i.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }}
                  />
                </div>

                <div className="flex-1 flex flex-col py-0.5">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3 className="text-[15px] font-bold text-zinc-900 leading-tight line-clamp-1">{i.name}</h3>
                      <p className="text-[13px] font-bold text-zinc-400 mt-0.5 tracking-tight flex items-center gap-1.5">
                        <span className="text-zinc-800">₹{i.price.toLocaleString()}</span>
                        <span className="w-1 h-1 rounded-full bg-zinc-200" />
                        <span className="text-[11px] uppercase tracking-wider">In Stock</span>
                      </p>
                    </div>
                    <button
                      onClick={() => cart.remove(i.id)}
                      className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      aria-label="Remove item"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center bg-zinc-50 rounded-xl p-1 border border-zinc-100">
                      <button
                        onClick={() => cart.add({ id: i.id, name: i.name, price: i.price, image: i.image }, -1)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white transition active:scale-90"
                      >
                        <Minus size={14} className="text-zinc-600" />
                      </button>
                      <span className="w-8 text-center text-sm font-black text-zinc-900">{i.qty}</span>
                      <button
                        onClick={() => cart.add({ id: i.id, name: i.name, price: i.price, image: i.image }, 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white transition active:scale-90"
                      >
                        <Plus size={14} className="text-zinc-600" />
                      </button>
                    </div>
                    <p className="text-sm font-black text-zinc-900">₹{(i.price * i.qty).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </section>

          {/* ── Checkout Sidebar ── */}
          <aside className="lg:sticky lg:top-24 space-y-4">
            <div className="bg-white rounded-[2.5rem] border border-zinc-100 p-8 shadow-sm">
              <h2 className="text-lg font-bold text-zinc-900 mb-6 flex items-center gap-2">
                Shipping & Service
                <Truck size={18} className="text-zinc-300" />
              </h2>

              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 mb-2 ml-1">Pin Code</label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="6-digit Pincode"
                      value={pincode}
                      onChange={(e) => handlePincodeChange(e.target.value.replace(/\D/g, ''))}
                      className={`w-full rounded-2xl border ${pincodeError ? 'border-red-200 bg-red-50/30' : 'border-zinc-100 bg-zinc-50/50'} px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-zinc-900/5 focus:bg-white focus:border-zinc-900 outline-none transition-all`}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      {isCheckingPincode ? (
                        <Loader2 size={18} className="animate-spin text-zinc-400" />
                      ) : shippingInfo?.serviceable ? (
                        <ShieldCheck size={18} className="text-emerald-500" />
                      ) : pincode.length === 6 ? (
                        <AlertCircle size={18} className="text-red-500" />
                      ) : (
                        <MapPin size={18} className="text-zinc-300" />
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
                      Delivery to your area in ~{shippingInfo.estimated_delivery}
                    </p>
                  )}
                </div>

              </div>

              <div className="space-y-3 pt-6 border-t border-zinc-50">
                <div className="flex justify-between items-center text-sm font-medium text-zinc-400">
                  <span>Subtotal</span>
                  <span className="text-zinc-900 font-bold">₹{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium text-zinc-400">
                  <span>Shipping</span>
                  {shippingInfo?.serviceable ? (
                     <span className="text-emerald-600 font-bold">₹{shippingInfo.shipping_cost}</span>
                  ) : (
                    <span className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">{pincode.length === 6 ? 'N/A' : 'Enter Pincode'}</span>
                  )}
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-lg font-bold text-zinc-900">Total</span>
                  <span className="text-xl font-black text-zinc-900 tracking-tight">₹{(total + (shippingInfo?.shipping_cost || 0)).toLocaleString()}</span>
                </div>


                <Link
                  href="/checkout"
                  className="mt-6 flex items-center justify-center gap-3 w-full rounded-2xl bg-zinc-900 text-white px-6 py-4 font-bold hover:bg-zinc-800 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-zinc-200"
                >
                  <ShieldCheck size={20} fill="currentColor" className="text-zinc-900 bg-white rounded-full p-0.5" />
                  Proceed to Checkout
                </Link>
                
                <a
                  href={generateWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex items-center justify-center gap-3 w-full rounded-2xl bg-emerald-50 text-emerald-600 px-6 py-4 font-bold hover:bg-emerald-100 transition-all active:scale-[0.98]"
                >
                  <MessageCircle size={20} fill="currentColor" />
                  Order via WhatsApp
                </a>
              </div>
            </div>

            <div className="px-4 py-4 bg-zinc-50 border border-zinc-100 rounded-3xl flex items-center gap-3">
              <div className="w-8 h-8 bg-zinc-100 rounded-full flex items-center justify-center">
                <ShieldCheck size={16} className="text-zinc-500" />
              </div>
              <p className="text-[11px] font-bold text-zinc-400 leading-tight uppercase tracking-wider">
                100% Secure Payments <br /> Powered by Razorpay
              </p>
            </div>

          </aside>
        </div>
      </div>

      {/* ── Mobile Sticky Button ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-2xl border-t border-zinc-100 p-4 lg:hidden z-50">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-1">Total</span>
            <span className="text-lg font-black text-zinc-900 leading-none tracking-tight">₹{(total + (shippingInfo?.shipping_cost || 0)).toLocaleString()}</span>

          </div>
          <Link
            href="/checkout"
            className="flex-1 flex items-center justify-center gap-2 bg-zinc-900 text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-zinc-200 active:scale-[0.98] transition-transform"
          >
            Proceed to Checkout
          </Link>

        </div>
      </div>
    </main>
  );
}
