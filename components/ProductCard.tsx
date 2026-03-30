"use client";
import Link from "next/link";
import Image from "next/image";
import { FALLBACK_IMG, getOptimizedImageUrl } from "@/utils/images";
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
    <div className="group flex flex-col bg-background overflow-hidden fade-in-up">
      {/* Image Container */}
      <div className="relative aspect-[3/4] w-full bg-muted overflow-hidden">
        <Link href={`/product/${product.id}`} className="block h-full w-full">
          <Image
            src={getOptimizedImageUrl(product.mediaUrl)}
            alt={product.name}
            fill
            unoptimized={true}
            className="object-cover transition-all duration-1000 group-hover:scale-110 group-hover:rotate-1"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
          />
        </Link>

        {/* Brand Label/Badge (Optional WTFlex Style) */}
        <div className="absolute top-4 left-4 z-10">
            <span className="px-2 py-1 bg-foreground text-[8px] font-black uppercase tracking-widest text-background backdrop-blur-md border border-foreground/10">
                NEW DROP
            </span>
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
          className={`absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-md transition-all duration-300 z-10 border ${wished
              ? "bg-brand-accent border-brand-accent text-white scale-110 shadow-[0_0_15px_rgba(255,0,255,0.4)]"
              : "bg-background/40 border-foreground/10 text-foreground hover:bg-foreground hover:text-background hover:scale-110"
            }`}
        >
          <Heart
            size={18}
            className={wished ? "fill-current" : ""}
          />
        </button>

        {/* Hover Action Bar (Desktop) */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 z-20 hidden md:block">
             <Link 
                href={`/product/${product.id}`}
                className="flex items-center justify-center gap-3 w-full py-4 bg-foreground text-background font-black uppercase tracking-widest text-xs hover:bg-brand-accent hover:text-white transition-all"
             >
                <ShoppingBag size={16} />
                Select Options
             </Link>
        </div>
      </div>

      {/* Info Section */}
      <div className="py-4 md:py-6 flex flex-col items-center text-center gap-1.5 px-2">
        <Link href={`/product/${product.id}`} className="block w-full">
          <h3 className="text-sm font-medium text-foreground/70 line-clamp-1 group-hover:text-foreground transition-colors duration-300">
            {product.name}
          </h3>
          <div className="flex items-center justify-center gap-2 mt-1">
              <span className="text-base md:text-xl font-bold text-foreground">
                ₹{product.price.toLocaleString("en-IN")}
              </span>
              {/* Optional: Add a fake old price for the 'sale' look if desired */}
              <span className="text-[10px] font-bold text-foreground/20 line-through">
                ₹{(product.price * 1.2).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </span>
          </div>
        </Link>
        
        {/* Mobile Action (Visible only on mobile) */}
        <div className="w-full mt-2 md:hidden">
             <Link 
                href={`/product/${product.id}`}
                className="flex items-center justify-center w-full py-3 border border-foreground/10 text-[10px] font-semibold tracking-tight text-foreground active:bg-foreground active:text-background transition-all"
             >
                View
             </Link>
        </div>
      </div>
    </div>
  );
}
