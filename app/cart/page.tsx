"use client";
import Link from "next/link";
import { useCart } from "@/components/cart/CartContext";
import { FALLBACK_IMG } from "@/utils/images";

export default function CartPage() {
  const cart = useCart();
  const total = cart.items.reduce((s, i) => s + i.price * i.qty, 0);
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-foreground">Your Bag</h1>
      {cart.items.length === 0 ? (
        <div className="mt-6 rounded-2xl border bg-white p-6 text-center">
          <p className="text-sm text-gray-900">Your cart is empty.</p>
          <Link href="/products" className="mt-3 inline-block rounded-lg border px-4 py-2 text-sm">Continue Shopping</Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          <section className="space-y-3">
            {cart.items.map((i) => (
              <div key={i.id} className="rounded-2xl border bg-white p-3 flex items-center gap-4">
                <img src={i.image || FALLBACK_IMG} alt={i.name} className="h-24 w-20 object-cover rounded-lg" onError={(e)=>{const img=e.currentTarget; img.src=FALLBACK_IMG;}} />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-foreground">{i.name}</div>
                  <div className="text-xs text-gray-900 mt-1">₹{i.price}</div>
                  <div className="mt-2 inline-flex items-center gap-2">
                    <button onClick={()=>cart.add({id:i.id,name:i.name,price:i.price,image:i.image}, -1)} className="rounded border px-2 text-sm">−</button>
                    <span className="text-sm">{i.qty}</span>
                    <button onClick={()=>cart.add({id:i.id,name:i.name,price:i.price,image:i.image}, 1)} className="rounded border px-2 text-sm">+</button>
                    <button onClick={()=>cart.remove(i.id)} className="ml-3 text-xs underline">Remove</button>
                  </div>
                </div>
              </div>
            ))}
            <Link href="/products" className="inline-block rounded-lg border px-4 py-2 text-sm">Continue Shopping</Link>
          </section>
          <aside className="rounded-2xl border bg-white p-4 h-max">
            <div className="text-sm font-semibold text-foreground">Order Summary</div>
            <div className="mt-2 text-sm text-gray-900">Subtotal: ₹{total.toFixed(2)}</div>
            <button className="mt-4 w-full rounded-lg bg-brand text-white px-4 py-2.5 font-semibold hover:bg-brand-strong transition">Checkout</button>
          </aside>
        </div>
      )}
    </main>
  );
}
