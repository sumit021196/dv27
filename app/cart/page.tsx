"use client";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/cart/CartContext";
import { FALLBACK_IMG } from "@/utils/images";
import { MessageCircle, ShoppingBag } from "lucide-react";

export default function CartPage() {
  const cart = useCart();
  const [customerName, setCustomerName] = useState("");
  const [address, setAddress] = useState("");
  const total = cart.items.reduce((s, i) => s + i.price * i.qty, 0);

  const generateWhatsAppLink = () => {
    const phoneNumber = "911234567890"; // Placeholder, as specified in plan
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

    let message = `*Hi, I want to place an order!*%0A%0A`;

    cart.items.forEach((item, index) => {
      message += `${index + 1}. *${item.name}* (ID: ${item.id})%0A`;
      message += `   Qty: ${item.qty} | Price: ₹${item.price}%0A`;
      message += `   Link: ${baseUrl}/product/${item.id}%0A%0A`;
    });

    message += `*Total Amount: ₹${total.toFixed(2)}*%0A%0A`;
    message += `*Customer Details:*%0A`;
    message += `- Name: ${customerName || "Not provided"}%0A`;
    message += `- Delivery Note: ${address || "Not provided"}%0A%0A`;
    message += `Please confirm my order.`;

    return `https://wa.me/${phoneNumber}?text=${message}`;
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-brand/10 rounded-xl text-brand">
          <ShoppingBag size={24} />
        </div>
        <h1 className="text-3xl font-bold text-foreground">Your Bag</h1>
      </div>

      {cart.items.length === 0 ? (
        <div className="mt-6 rounded-2xl border bg-white/50 backdrop-blur-sm p-12 text-center shadow-sm">
          <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <ShoppingBag className="text-gray-400" size={32} />
          </div>
          <p className="text-lg font-medium text-gray-900">Your cart is empty.</p>
          <p className="text-sm text-gray-500 mt-1 mb-6">Looks like you haven't added anything yet.</p>
          <Link href="/products" className="inline-block rounded-xl bg-foreground text-background px-6 py-3 font-semibold hover:bg-foreground/90 transition shadow-lg shadow-black/5">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
          <section className="space-y-4">
            {cart.items.map((i) => (
              <div key={i.id} className="group rounded-2xl border bg-white p-4 flex items-center gap-6 hover:shadow-md transition-shadow">
                <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-gray-50">
                  <img src={i.image || FALLBACK_IMG} alt={i.name} className="h-full w-full object-cover transition-transform group-hover:scale-110" onError={(e) => { const img = e.currentTarget; img.src = FALLBACK_IMG; }} />
                </div>
                <div className="flex-1 flex flex-col justify-between h-24">
                  <div>
                    <div className="text-base font-bold text-foreground line-clamp-1">{i.name}</div>
                    <div className="text-sm font-semibold text-brand mt-1">₹{i.price}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center gap-1 bg-gray-50 rounded-lg p-1 border">
                      <button onClick={() => cart.add({ id: i.id, name: i.name, price: i.price, image: i.image }, -1)} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm transition font-bold">−</button>
                      <span className="w-8 text-center text-sm font-bold">{i.qty}</span>
                      <button onClick={() => cart.add({ id: i.id, name: i.name, price: i.price, image: i.image }, 1)} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm transition font-bold">+</button>
                    </div>
                    <button onClick={() => cart.remove(i.id)} className="text-xs font-medium text-red-500 hover:text-red-600 underline underline-offset-4">Remove</button>
                  </div>
                </div>
              </div>
            ))}
            <div className="pt-2">
              <Link href="/products" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-foreground transition">
                <span>←</span> Continue Shopping
              </Link>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl border bg-white p-6 shadow-sm sticky top-8">
              <h2 className="text-lg font-bold text-foreground mb-4">Checkout Details</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5 ml-1">Your Name</label>
                  <input
                    type="text"
                    id="name"
                    placeholder="Enter your name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full rounded-xl border bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 transition"
                  />
                </div>
                <div>
                  <label htmlFor="address" className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5 ml-1">Delivery Note / Address</label>
                  <textarea
                    id="address"
                    placeholder="Locality, landmarks, etc."
                    value={address}
                    rows={2}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full rounded-xl border bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 transition resize-none"
                  />
                  <p className="text-[10px] text-gray-400 mt-1 ml-1">*More details can be shared on WhatsApp</p>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold text-foreground">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>

                <a
                  href={generateWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex items-center justify-center gap-3 w-full rounded-2xl bg-[#25D366] text-white px-6 py-4 font-bold hover:bg-[#20bd5a] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#25D366]/20"
                >
                  <MessageCircle size={20} fill="currentColor" />
                  Order via WhatsApp
                </a>
                <p className="text-[10px] text-center text-gray-400 mt-3">Clicking will open WhatsApp with your order details pre-filled.</p>
              </div>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
