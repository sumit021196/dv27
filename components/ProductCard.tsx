"use client";
import { motion, AnimatePresence } from "framer-motion";
import TapScale from "./ui/TapScale";
import Link from "next/link";
import Image from "next/image";
import { FALLBACK_IMG, getOptimizedImageUrl } from "@/utils/images";
import { useWishlist } from "./wishlist/WishlistContext";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { cn } from "@/utils/cn";

type Product = {
  id: string | number;
  name: string;
  price: number;
  original_price?: number;
  mediaUrl?: string;
  rating?: number;
  slug?: string;
};

// Simple Star Rating Component
const RatingStars = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  return (
    <div className="flex items-center gap-0.5 mt-1">
      {[...Array(5)].map((_, i) => (
        <Star 
          key={i} 
          size={10} 
          className={cn(
            "transition-colors duration-300",
            i < fullStars ? "fill-brand-red text-brand-red" : "fill-foreground/10 text-foreground/10"
          )} 
        />
      ))}
      <span className="text-[10px] font-bold text-foreground/40 ml-1">{Number(rating).toFixed(1)}</span>
    </div>
  );
};

export default function ProductCard({ product }: { product: Product }) {
  const wishlist = useWishlist();
  const wished = wishlist.items.some((w) => w.id === product.id);

  // Use original_price if it exists and is greater than current price
  const showOriginalPrice = product.original_price && product.original_price > product.price;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="group flex flex-col bg-background overflow-hidden"
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] w-full bg-muted overflow-hidden">
        <Link href={`/product/${product.slug || product.id}`} className="block h-full w-full">
          <Image
            src={getOptimizedImageUrl(product.mediaUrl)}
            alt={product.name}
            fill
            className="object-cover transition-all duration-1000 group-hover:scale-110 group-hover:rotate-1"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
          />
        </Link>

        {/* Brand Label/Badge (Optional WTFlex Style) */}
        {(product.name.toLowerCase().includes('cap') || product.name.toLowerCase().includes('v1')) && (
          <div className="absolute top-4 left-4 z-10">
              <span className="px-2 py-1 bg-foreground text-[8px] font-black uppercase tracking-widest text-background backdrop-blur-md border border-foreground/10">
                  NEW DROP
              </span>
          </div>
        )}

        {/* Wishlist button */}
        <TapScale className="absolute top-4 right-4 z-10">
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
            className={`flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-md transition-all duration-300 border ${wished
                ? "bg-white border-brand-red text-brand-red shadow-[0_0_15px_rgba(255,45,85,0.4)]"
                : "bg-background/40 border-foreground/10 text-foreground hover:bg-foreground hover:text-background"
              }`}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={wished ? "wished" : "not-wished"}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
              >
                <Heart
                  size={18}
                  className={wished ? "fill-current" : ""}
                />
              </motion.div>
            </AnimatePresence>
          </button>
        </TapScale>

        {/* Hover Action Bar (Desktop) */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 z-20 hidden md:block">
             <Link 
                href={`/product/${product.slug || product.id}`}
                className="flex items-center justify-center gap-3 w-full py-4 bg-foreground text-background font-black uppercase tracking-widest text-xs hover:bg-brand-accent hover:text-white transition-all"
             >
                <ShoppingBag size={16} />
                Select Options
             </Link>
        </div>
      </div>

      {/* Info Section */}
      <div className="py-4 md:py-6 flex flex-col items-center text-center gap-1.5 px-2">
        <Link href={`/product/${product.slug || product.id}`} className="block w-full">
          <h3 className="text-sm font-medium text-foreground/70 line-clamp-1 group-hover:text-foreground transition-colors duration-300">
            {product.name}
          </h3>
          {product.rating !== undefined && <RatingStars rating={product.rating} />}
          <div className="flex items-center justify-center gap-2 mt-1">
              <span className="text-base md:text-xl font-bold text-foreground">
                ₹{product.price.toLocaleString("en-IN")}
              </span>
              {showOriginalPrice && (
                <span className="text-[10px] font-bold text-foreground/20 line-through">
                  ₹{product.original_price?.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </span>
              )}
          </div>
        </Link>
        
        {/* Mobile Action (Visible only on mobile) */}
        <div className="w-full mt-2 md:hidden">
            <TapScale>
             <Link 
                href={`/product/${product.slug || product.id}`}
                className="flex items-center justify-center w-full py-3 border border-foreground/10 text-[10px] font-semibold tracking-tight text-foreground transition-all"
             >
                View
             </Link>
            </TapScale>
        </div>
      </div>
    </motion.div>

  );
}
