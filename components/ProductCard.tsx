"use client";
import Link from "next/link";
import { FALLBACK_IMG } from "@/utils/images";
import { useWishlist } from "./wishlist/WishlistContext";
import { Heart, ShoppingBag } from "lucide-react";

type Product = {
  id: string | number;
  name: string;
  price: number;
  mediaUrl?: string;
};

export default function ProductCard({ product }: { product: Product }) {
  const wishlist = useWishlist();
  const wished = wishlist.items.some((w) => w.id === product.id);

  return (
    <div className="group flex flex-col rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden fade-in-up">
      <div className="relative aspect-[4/5] w-full bg-gray-50 overflow-hidden">
        <Link href={`/product/${product.id}`}>
          <img
            src={product.mediaUrl || FALLBACK_IMG}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              const img = e.currentTarget as HTMLImageElement;
              if (img.src !== FALLBACK_IMG) img.src = FALLBACK_IMG;
            }}
          />
        </Link>
        <button
          aria-label="Wishlist"
          onClick={(e) => {
            e.preventDefault();
            wishlist.toggle({ id: product.id, name: product.name, price: product.price, image: product.mediaUrl })
          }}
          className={`absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full shadow-sm backdrop-blur-md transition-all duration-200 z-10 ${wished ? "bg-red-50 text-red-500" : "bg-white/80 text-gray-500 hover:bg-white hover:text-red-500"}`}
        >
          <Heart size={18} className={wished ? "fill-current" : ""} />
        </button>
      </div>

      <div className="p-4 md:p-5 flex flex-col flex-grow justify-between gap-3">
        <Link href={`/product/${product.id}`} className="block">
          <h3 className="text-sm md:text-base font-semibold text-gray-900 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
          <span className="mt-1 block text-lg font-bold text-gray-900">₹{product.price}</span>
        </Link>

        <Link
          href={`/product/${product.id}`}
          className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gray-50 border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors"
        >
          <ShoppingBag size={16} />
          View Item
        </Link>
      </div>
    </div>
  );
}
