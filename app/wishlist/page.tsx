"use client";
import Link from "next/link";
import { useWishlist } from "@/components/wishlist/WishlistContext";
import { useCart } from "@/components/cart/CartContext";
import { FALLBACK_IMG } from "@/utils/images";

export default function WishlistPage() {
  const wishlist = useWishlist();
  const cart = useCart();
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-foreground">Wishlist</h1>
      {wishlist.items.length === 0 ? (
        <div className="mt-6 rounded-2xl border bg-white p-6 text-center">
          <p className="text-sm text-gray-900">No items saved yet.</p>
          <Link href="/products" className="mt-3 inline-block rounded-lg border px-4 py-2 text-sm">Continue Shopping</Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlist.items.map((w) => (
            <div key={w.id} className="rounded-2xl border bg-white overflow-hidden">
              <img src={w.image || FALLBACK_IMG} alt={w.name} className="w-full aspect-[4/5] object-cover" onError={(e)=>{const img=e.currentTarget; img.src=FALLBACK_IMG;}} />
              <div className="p-4">
                <div className="text-sm font-semibold text-foreground line-clamp-1">{w.name}</div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-strong">₹{w.price}</span>
                  <div className="flex items-center gap-3">
                    <button onClick={()=>cart.add({id:w.id,name:w.name,price:w.price,image:w.image},1)} className="text-xs underline underline-offset-4">Add to Bag</button>
                    <button onClick={()=>wishlist.remove(w.id)} className="text-xs text-gray-800 underline underline-offset-4">Remove</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
