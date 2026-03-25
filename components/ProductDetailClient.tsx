"use client";
import { useEffect, useMemo, useState } from "react";
import { FALLBACK_IMG } from "@/utils/images";
import Link from "next/link";
import { useCart } from "./cart/CartContext";
import { X } from "lucide-react";
import { fallback } from "@/utils/data";
import { productService } from "@/services/product.service";

type Product = {
  id: string | number;
  name: string;
  price: number;
  image_url?: string | null;
  media_url?: string | null;
  rating?: number | null;
  stock?: number | null;
  description?: string | null;
  variants?: Array<{
    id: string;
    color?: string | null;
    size?: string | null;
    stock?: number;
    sku?: string | null;
  }>;
};

export default function ProductDetailClient({ id }: { id: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const cart = useCart();
  const [wished, setWished] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [isAdded, setIsAdded] = useState(false);

  const availableColors = useMemo(() => {
    if (!product?.variants) return [];
    const colors = product.variants.map(v => v.color).filter((c): c is string => !!c);
    return Array.from(new Set(colors));
  }, [product?.variants]);

  const availableSizes = useMemo(() => {
    if (!product?.variants) return [];
    const sizes = product.variants.map(v => v.size).filter((s): s is string => !!s);
    return Array.from(new Set(sizes));
  }, [product?.variants]);

  const virtualSizes = useMemo(() => {
    if (availableSizes.length > 0) return availableSizes;
    const lowerName = product?.name.toLowerCase() || "";
    const isClothing = lowerName.includes("hoodie") || lowerName.includes("tee") || lowerName.includes("pants") || lowerName.includes("shirt") || lowerName.includes("cargo") || lowerName.includes("vest");
    if (isClothing) return ["S", "M", "L", "XL"];
    return [];
  }, [availableSizes, product?.name]);

  useEffect(() => {
    const fetchOne = async () => {
      setLoading(true);
      try {
        const data = await productService.getProductById(id);
        if (!data) throw new Error("Not found");
        setProduct(data as unknown as Product);
      } catch {
        const fallbackItem = fallback.find((i) => String(i.id) === String(id));
        setProduct(fallbackItem ? (fallbackItem as unknown as Product) : null);
      } finally {
        setLoading(false);
      }
    };
    fetchOne();
  }, [id]);

  const src = product?.media_url || product?.image_url || "";
  const rating = product?.rating ?? 4.2;
  const stock = product?.stock ?? 12;

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-[3/4] bg-muted rounded-3xl animate-pulse" />
          <div className="space-y-6">
            <div className="h-10 w-2/3 bg-muted rounded-xl animate-pulse" />
            <div className="h-4 w-1/3 bg-muted rounded-lg animate-pulse" />
            <div className="h-12 w-1/2 bg-muted rounded-2xl animate-pulse" />
            <div className="space-y-3 pt-4">
              <div className="h-4 w-full bg-muted rounded-lg animate-pulse" />
              <div className="h-4 w-5/6 bg-muted rounded-lg animate-pulse" />
              <div className="h-4 w-4/6 bg-muted rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-24 text-center">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
          <X className="text-muted-foreground/30" size={32} />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tighter text-foreground">Piece Not Found</h2>
        <p className="mt-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">The item you're looking for might have been moved or archived.</p>
        <Link className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-foreground text-background px-8 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-brand-accent hover:text-white transition-all shadow-lg" href="/products">
          Browse Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-4">
          <div className="rounded-[40px] border border-foreground/5 bg-background p-4 shadow-2xl overflow-hidden group">
            <Magnify src={src} alt={product.name} />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[src].filter(Boolean).map((s, i) => (
              <div key={i} className="aspect-square rounded-2xl border border-foreground/5 overflow-hidden bg-muted group cursor-pointer hover:border-foreground/20 transition-colors">
                <img src={s!} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex items-start justify-between">
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-foreground leading-none">{product.name}</h1>
            <button
              aria-label="Wishlist"
              onClick={() => setWished(v => !v)}
              className={`w-12 h-12 flex items-center justify-center rounded-2xl border transition-all ${wished ? "bg-brand-red text-white border-brand-red shadow-lg shadow-brand-red/20" : "bg-background text-foreground/20 border-foreground/5 hover:border-foreground/20 hover:text-foreground"}`}
            >
              <span className={`text-xl transition-transform ${wished ? "scale-110" : ""}`}>♥</span>
            </button>
          </div>
          <div className="mt-4 flex items-center gap-3">
             <div className="bg-foreground text-background px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full">{rating} ★</div>
             <span className="w-1 h-1 bg-foreground/10 rounded-full" />
             <div className={`text-[10px] font-black uppercase tracking-widest ${stock > 0 ? "text-emerald-500" : "text-brand-red"}`}>
               {stock > 0 ? `In Stock (${stock} Pieces)` : "Archived / Out of Stock"}
             </div>
          </div>

          <div className="mt-10 text-4xl font-black text-foreground flex items-baseline gap-2 italic">
            <span className="text-xl non-italic text-muted-foreground mr-1">₹</span>
            {product.price.toLocaleString()}
          </div>

          <p className="mt-8 text-sm font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
            {product.description ?? "An elevated essential designed for permanence. Meticulously crafted using sustainable textiles with a progressive silhouette for the modern wardrobe."}
          </p>

          {/* Variants Selector */}
          {(availableColors.length > 0 || virtualSizes.length > 0) && (
            <div className="mt-8 space-y-6">
              {availableColors.length > 0 && (
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/50 mb-3">Color</h3>
                  <div className="flex flex-wrap gap-3">
                    {availableColors.map(color => (
                        <button 
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`px-4 py-2 border rounded-xl text-xs font-bold uppercase transition-all ${selectedColor === color ? "border-foreground bg-foreground text-background" : "border-foreground/10 text-foreground hover:border-foreground/30"}`}
                        >
                          {color}
                        </button>
                    ))}
                  </div>
                </div>
              )}
              {virtualSizes.length > 0 && (
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/50 mb-3">Size</h3>
                  <div className="flex flex-wrap gap-3">
                    {virtualSizes.map(size => (
                        <button 
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`px-4 py-2 border rounded-xl text-xs font-bold uppercase transition-all ${selectedSize === size ? "border-foreground bg-foreground text-background" : "border-foreground/10 text-foreground hover:border-foreground/30"}`}
                        >
                          {size}
                        </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-12 flex flex-col gap-4">
            <button
               onClick={() => {
                const needsColor = availableColors.length > 0;
                const needsSize = virtualSizes.length > 0;
                
                if ((needsColor && !selectedColor) || (needsSize && !selectedSize)) {
                    alert("Please select " + [needsColor && !selectedColor ? "Color" : "", needsSize && !selectedSize ? "Size" : ""].filter(Boolean).join(" and "));
                    return;
                }

                const selectedVariant = product.variants?.find(v => 
                    (needsColor ? v.color === selectedColor : true) && 
                    (needsSize ? v.size === selectedSize : true)
                );

                cart.add({ 
                    id: product.id, 
                    name: product.name, 
                    price: product.price, 
                    image: src || undefined,
                    variant_id: selectedVariant?.id,
                    size: selectedSize || undefined,
                    color: selectedColor || undefined
                }, 1);

                // Show success feedback
                setIsAdded(true);
                setTimeout(() => setIsAdded(false), 2000);
              }}
              disabled={isAdded}
              className={`w-full flex h-16 items-center justify-center rounded-3xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-2xl active:scale-95 ${
                isAdded ? "bg-emerald-500 text-white" : "bg-foreground text-background hover:bg-brand-accent hover:text-white"
              }`}
            >
              {isAdded ? "Added to Bag" : "Drop Into Bag"}
            </button>

          </div>

          <div className="mt-16 space-y-6">
            <div className="flex items-center justify-between border-b border-foreground/5 pb-2">
               <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40">Verified Feedback</h2>
               <div className="flex gap-1">
                 {[1,2,3,4,5].map(i => <div key={i} className="w-1 h-1 bg-foreground/10 rounded-full" />)}
               </div>
            </div>
            <div className="space-y-4">
              <div className="group">
                <div className="flex items-center gap-2 mb-1">
                  <div className="text-[10px] font-black uppercase text-foreground">Aarav</div>
                  <div className="text-[10px] text-brand-accent font-black">4.5★</div>
                </div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">Exceptional structure and fabric weight. A definitive staple.</p>
              </div>
              <div className="group">
                <div className="flex items-center gap-2 mb-1">
                  <div className="text-[10px] font-black uppercase text-foreground">Misha</div>
                  <div className="text-[10px] text-brand-accent font-black">5.0★</div>
                </div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">Perfectly oversized. The off-white shade is exactly what I wanted.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Magnify({ src, alt }: { src: string; alt: string }) {
  const [bgPos, setBgPos] = useState("center");
  const [hovered, setHovered] = useState(false);
  const safeSrc = src || FALLBACK_IMG;
  return (
    <div
      className="relative w-full overflow-hidden rounded-xl border"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setBgPos("center"); }}
      onMouseMove={(e) => {
        const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setBgPos(`${x}% ${y}%`);
      }}
      style={{
        backgroundImage: `url("${safeSrc}")`,
        backgroundSize: hovered ? "200%" : "cover",
        backgroundPosition: hovered ? bgPos : "center",
        aspectRatio: "4 / 5",
      }}
      aria-label={alt}
    />
  );
}
