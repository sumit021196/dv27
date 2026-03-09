"use client";
import Link from "next/link";
import { FALLBACK_IMG } from "@/utils/images";
import { useWishlist } from "./wishlist/WishlistContext";
import { Heart, Eye } from "lucide-react";

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
      {/* Image */}
      <div className="relative aspect-[4/5] w-full bg-gray-50 overflow-hidden">
        <Link href={`/product/${product.id}`} className="block h-full w-full">
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

        {/* Hover overlay - desktop quick view */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 hidden sm:block" />

        {/* Quick view badge - desktop hover */}
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hidden sm:block">
          <Link
            href={`/product/${product.id}`}
            className="flex items-center justify-center gap-2 w-full h-10 bg-white/95 backdrop-blur-sm rounded-xl text-sm font-semibold text-gray-900 shadow-md hover:bg-white transition-colors"
          >
            <Eye size={15} strokeWidth={2} />
            Quick View
          </Link>
        </div>

        {/* Wishlist button */}
        <button
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          onClick={(e) => {
            e.preventDefault();
            wishlist.toggle({
              id: product.id,
              name: product.name,
              price: product.price,
              image: product.mediaUrl,
            });
          }}
          className={`absolute top-3 right-3 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full shadow-sm backdrop-blur-md transition-all duration-200 z-10 ${wished
              ? "bg-red-50 text-red-500 scale-110"
              : "bg-white/80 text-gray-400 hover:bg-white hover:text-red-500 hover:scale-110"
            }`}
        >
          <Heart
            size={16}
            strokeWidth={2}
            className={wished ? "fill-current" : ""}
          />
        </button>
      </div>

      {/* Info */}
      <div className="p-3.5 sm:p-4 flex flex-col gap-2">
        <Link href={`/product/${product.id}`} className="block">
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight group-hover:text-stone-700 transition-colors">
            {product.name}
          </h3>
          <span className="mt-1.5 block text-base font-bold text-gray-900">
            ₹{product.price.toLocaleString("en-IN")}
          </span>
        </Link>

        {/* Mobile-visible CTA */}
        <Link
          href={`/product/${product.id}`}
          className="sm:hidden mt-1 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-stone-800 active:bg-stone-950 transition-colors"
        >
          View Item
        </Link>
      </div>
    </div>
  );
}
