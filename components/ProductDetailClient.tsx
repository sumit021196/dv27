"use client";
import { useEffect, useMemo, useState, useRef } from "react";
import { FALLBACK_IMG, getOptimizedImageUrl } from "@/utils/images";
import { useCart } from "./cart/CartContext";
import { X, ChevronRight, ChevronLeft, Minus, Plus, Heart, Share2, ShieldCheck, Truck, RefreshCw, Star, Ruler } from "lucide-react";
import { fallback } from "@/utils/data";
import { productService } from "@/services/product.service";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/cn";
import SizingChartModal from "./ui/SizingChartModal";
import { couponClientService } from "@/services/coupon.client";
import ReviewForm from "./ReviewForm";

type Product = {
  id: string | number;
  name: string;
  price: number;
  original_price?: number;
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
  images?: string[];
  details?: Record<string, string>;
};

export default function ProductDetailClient({ id }: { id: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const cart = useCart();
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>("M"); // Default for demo
  const [isAdded, setIsAdded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const mainCtaRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("description");
  const [isSizingModalOpen, setIsSizingModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);

  const images = useMemo(() => {
    if (!product) return [FALLBACK_IMG];
    if (product.images && product.images.length > 0) return product.images;
    const mainImg = product.media_url || product.image_url;
    return [mainImg].filter((s): s is string => !!s) || [FALLBACK_IMG];
  }, [product]);

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
    if (product?.name.toLowerCase().includes("cap")) return ["ADJUSTABLE (ONE SIZE)"];
    if (availableSizes.length > 0) return availableSizes;
    return ["XS", "S", "M", "L", "XL", "XXL"];
  }, [availableSizes, product?.name]);

  const fetchReviews = async () => {
    const data = await productService.getReviewsByProductId(id);
    setReviews(data);
  };

  useEffect(() => {
    const fetchOne = async () => {
      setLoading(true);
      try {
        const data = await productService.getProductById(id);
        if (!data) throw new Error("Not found");
        const prod = data as unknown as Product;
        setProduct(prod);
        
        if (prod.variants) {
          const colors = prod.variants.map(v => v.color).filter((c): c is string => !!c);
          if (colors.length > 0) {
            setSelectedColor(Array.from(new Set(colors))[0]);
          }
        }
        fetchReviews();
      } catch {
        const fallbackItem = fallback.find((i) => String(i.id) === String(id));
        setProduct(fallbackItem ? (fallbackItem as unknown as Product) : null);
      } finally {
        setLoading(false);
      }
    };
    fetchOne();
  }, [id]);

  useEffect(() => {
    const handleScroll = () => {
      if (mainCtaRef.current) {
        const rect = mainCtaRef.current.getBoundingClientRect();
        setShowStickyBar(rect.top < 0);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const allCoupons = await couponClientService.getAllCoupons();
        setCoupons(allCoupons.filter((c: any) => c.active));
      } catch (err) {
        console.error("Failed to fetch coupons:", err);
      }
    };
    fetchCoupons();
  }, []);

  const handleAddToCart = () => {
    if (!product) return;
    cart.add({ 
        id: product.id, 
        name: product.name, 
        price: product.price, 
        image: product.media_url || product.image_url || undefined,
        size: selectedSize || undefined,
        color: selectedColor || undefined
    }, quantity);

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };


  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 text-center">
        <p className="text-[10px] font-black uppercase tracking-widest animate-pulse">Loading Piece...</p>
      </div>
    );
  }

  if (!product) return null;

  const oldPrice = product.original_price || Math.round(product.price * 1.3);
  const discount = oldPrice > product.price ? Math.round(((oldPrice - product.price) / oldPrice) * 100) : 0;

  return (
    <div className="bg-background min-h-screen pb-24 md:pb-0">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-16">
          
          <div className="lg:col-span-7 space-y-6">
             <div className="relative aspect-[3/4] rounded-[32px] overflow-hidden bg-muted/30 border border-foreground/5 shadow-2xl">
                <AnimatePresence mode="wait">
                  <motion.img 
                    key={currentImageIndex}
                    src={getOptimizedImageUrl(images[currentImageIndex])} 
                    alt={product.name} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>
                
                <div className="absolute inset-0 flex items-center justify-between p-4 pointer-events-none">
                    <button 
                      onClick={() => setCurrentImageIndex(prev => (prev > 0 ? prev - 1 : images.length - 1))}
                      className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center pointer-events-auto shadow-lg"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button 
                      onClick={() => setCurrentImageIndex(prev => (prev < images.length - 1 ? prev + 1 : 0))}
                      className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center pointer-events-auto shadow-lg"
                    >
                      <ChevronRight size={20} />
                    </button>
                </div>

                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 px-3 py-1.5 bg-black/10 backdrop-blur-md rounded-full">
                  {images.map((_, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "h-1 rounded-full transition-all duration-300",
                        currentImageIndex === i ? "w-6 bg-white" : "w-1 bg-white/30"
                      )}
                    />
                  ))}
                </div>
             </div>
          </div>

          <div className="lg:col-span-5 flex flex-col pt-2 lg:pt-0">
            <div className="space-y-2 text-center lg:text-left">
              <h1 className="text-2xl lg:text-3xl font-black uppercase tracking-tighter leading-none">
                {product.name}
              </h1>
              
              <div className="flex items-center justify-center lg:justify-start gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-foreground">₹{product.price.toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground line-through decoration-brand-red/30">₹{oldPrice.toLocaleString()}</span>
                </div>
                {product.rating && (
                  <div className="flex items-center gap-1 bg-foreground/5 px-2 py-1 rounded-full border border-foreground/5">
                    <Star size={10} className="fill-brand-red text-brand-red" />
                    <span className="text-[10px] font-black">{Number(product.rating).toFixed(1)}</span>
                    <span className="text-[10px] text-muted-foreground ml-1">({reviews.length})</span>
                  </div>
                )}
                {discount > 0 && <span className="bg-brand-red text-white px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest shadow-lg">SAVE {discount}%</span>}
              </div>
            </div>

            {/* Available Offers */}
            {coupons.length > 0 && (
              <div className="mt-6 border-t border-foreground/5 pt-4">
                 <h3 className="text-[9px] font-black uppercase tracking-widest text-foreground/30 mb-2 px-2">Available Offers</h3>
                 <div className="flex gap-3 overflow-x-auto no-scrollbar pb-3 px-2">
                    {coupons.map((offer, i) => (
                      <div key={i} className="flex-none w-[170px] p-2.5 rounded-xl border border-foreground/10 bg-white shadow-sm">
                         <span className="text-sm font-black uppercase tracking-tighter block mb-0.5">₹{offer.discount_value} OFF</span>
                         <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-2">Prepaid above ₹{offer.min_order_value}</p>
                         <div className="flex items-center justify-between pt-2 border-t border-foreground/5">
                            <span className="text-[9px] font-bold text-foreground/20 uppercase tracking-tighter">{offer.code}</span>
                            <span className="text-[7px] font-black uppercase text-emerald-600 flex items-center gap-1">
                               <Plus size={8} strokeWidth={4} /> AUTO APPLIED
                            </span>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
            )}

            <div className="mt-4 space-y-2.5">
                <button 
                  onClick={() => setIsSizingModalOpen(true)}
                  className="w-full flex items-center gap-3 py-3 px-2 border-y border-foreground/5 group hover:bg-muted/30 transition-all text-left"
                >
                  <Ruler size={16} className="text-foreground transition-transform" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em]">Sizing chart</span>
                </button>
                {product.details?.["Model Info"] && (
                  <div className="px-2">
                    <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-[0.1em] leading-none">
                      {product.details["Model Info"]}
                    </p>
                  </div>
                )}
            </div>

            {availableColors.length > 0 && (
              <div className="mt-6 space-y-3 px-2">
                <h3 className="text-[9px] font-black uppercase tracking-[0.2em]">Select Color — <span className="text-brand-accent">{selectedColor}</span></h3>
                <div className="flex flex-wrap gap-2">
                    {availableColors.map(color => (
                        <button 
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={cn(
                            "min-w-[80px] px-4 h-9 flex items-center justify-center rounded-full text-[8px] font-black uppercase tracking-widest transition-all border",
                            selectedColor === color ? "bg-foreground text-background border-foreground" : "bg-transparent text-foreground border-foreground/10"
                          )}
                        >
                          {color}
                        </button>
                    ))}
                </div>
              </div>
            )}

            <div className="mt-6 space-y-3 px-2">
               <h3 className="text-[9px] font-black uppercase tracking-[0.2em]">Select Size — <span className="text-brand-accent">{selectedSize}</span></h3>
               <div className="flex flex-wrap gap-2">
                  {virtualSizes.map(size => (
                    <button 
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={cn(
                        "min-w-[55px] h-9 flex items-center justify-center rounded-full text-[8px] font-black uppercase tracking-widest transition-all border",
                        selectedSize === size ? "bg-foreground text-background border-foreground" : "bg-transparent text-foreground border-foreground/10"
                      )}
                    >
                      {size}
                    </button>
                  ))}
               </div>
            </div>

            <div className="mt-6 px-2" ref={mainCtaRef}>
               <button
                  onClick={handleAddToCart}
                  disabled={isAdded}
                  className={cn(
                    "w-full h-13 min-h-[52px] rounded-xl font-black uppercase tracking-[0.3em] text-[10px] transition-all relative overflow-hidden group mb-4",
                    isAdded ? "bg-emerald-500 text-white" : "bg-foreground text-background"
                  )}
               >
                  <span className="relative z-10">{isAdded ? "Secured In Bag" : "Add to Bag"}</span>
                  {!isAdded && <div className="absolute inset-0 bg-brand-accent/20 translate-x-full group-hover:translate-x-0 transition-transform duration-500" />}
               </button>
            </div>

            <div className="mt-8 border-t border-foreground/5">
                <div className="flex border-b border-foreground/5">
                   {["description", "details", "reviews", "return policy"].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                          "flex-1 py-3 text-[8px] font-black uppercase tracking-[0.15em] transition-all relative",
                          activeTab === tab ? "text-foreground" : "text-foreground/30"
                        )}
                      >
                        {tab}
                        {activeTab === tab && (
                          <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
                        )}
                      </button>
                   ))}
                </div>
                
                <div className="py-6 px-3 min-h-[140px]">
                   <AnimatePresence mode="wait">
                      <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 5 }} transition={{ duration: 0.15 }}
                        className="text-[9px] font-bold text-muted-foreground uppercase leading-[1.6] tracking-widest"
                      >
                         {activeTab === "description" && (
                            <div className="space-y-4">
                               <p className="text-foreground/80">{product.description || "No description available for this piece."}</p>
                            </div>
                         )}
                         {activeTab === "details" && (
                            <div className="grid grid-cols-2 gap-y-4 gap-x-3">
                               {product.details && Object.entries(product.details).length > 0 ? (
                                  Object.entries(product.details).map(([label, value]) => (
                                     <div key={label}>
                                        <span className="text-foreground block mb-0.5 font-black">{label}:</span>
                                        <p className="normal-case">{value}</p>
                                     </div>
                                  ))
                               ) : (
                                  <div className="col-span-2 py-4 opacity-50 italic">
                                     <p>No specific details available for this piece.</p>
                                  </div>
                               )}
                            </div>
                         )}
                         {activeTab === "reviews" && (
                            <div className="space-y-6">
                               <div className="px-1 mb-8">
                                  <button 
                                    onClick={() => setIsReviewModalOpen(true)}
                                    className="w-full py-4 border-2 border-dashed border-foreground/10 rounded-2xl flex items-center justify-center gap-2 hover:bg-muted/30 transition-all group"
                                  >
                                     <Plus size={16} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                                     <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground group-hover:text-foreground transition-colors">Write a Review</span>
                                  </button>
                               </div>

                               {reviews.length > 0 ? (
                                  reviews.map((review, i) => (
                                     <div key={review.id || i} className="border-b border-foreground/5 pb-6 last:border-0">
                                        <div className="flex items-center justify-between mb-3">
                                           <div className="flex gap-0.5">
                                              {[...Array(5)].map((_, starIdx) => (
                                                 <Star key={starIdx} size={10} className={cn(starIdx < review.rating ? "fill-brand-red text-brand-red" : "fill-foreground/10 text-foreground/10")} />
                                              ))}
                                           </div>
                                           <span className="text-[8px] font-bold opacity-30 tracking-widest uppercase">{new Date(review.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-foreground/80 normal-case italic leading-relaxed text-[10px]">&quot;{review.comment}&quot;</p>
                                        
                                        {/* Review Media */}
                                        {review.review_media && review.review_media.length > 0 && (
                                          <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar pb-1">
                                            {review.review_media.map((media: any, mediaIdx: number) => (
                                              <div key={mediaIdx} className="w-20 h-20 rounded-xl overflow-hidden flex-none bg-muted border border-foreground/5 relative">
                                                {media.media_type === 'image' ? (
                                                  <img src={media.media_url} alt="Review" className="w-full h-full object-cover" />
                                                ) : (
                                                  <video 
                                                    src={media.media_url} 
                                                    className="w-full h-full object-cover" 
                                                    onClick={(e) => {
                                                        const el = e.currentTarget;
                                                        if (el.paused) el.play(); else el.pause();
                                                    }}
                                                  />
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        )}

                                        <p className="mt-4 text-[7px] font-black tracking-[0.2em] text-brand-accent uppercase">
                                            — {review.profiles?.full_name || review.guest_name || "Anonymous User"}
                                            <span className="opacity-40 ml-2">VERIFIED BUYER</span>
                                        </p>
                                     </div>
                                  ))
                               ) : (
                                  <div className="text-center py-12 opacity-30 p-6 bg-muted/20 rounded-[32px] border border-dashed border-foreground/5">
                                     <p className="text-[9px] font-black uppercase tracking-widest">No reviews yet for this piece.</p>
                                  </div>
                               )}
                            </div>
                         )}
                         {activeTab === "return policy" && (
                            <div className="space-y-4">
                               <p className="bg-muted/40 p-2.5 rounded-lg text-foreground/50 border border-foreground/5">Returns within 48 hours for defects or damage. Mandatory unboxing video required.</p>
                            </div>
                         )}
                      </motion.div>
                   </AnimatePresence>
                </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showStickyBar && (
          <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-2xl border-t border-foreground/10 z-[60] p-3 lg:hidden flex items-center justify-between gap-4 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
             <div className="flex items-center gap-3">
                <div className="w-10 h-13 rounded-lg overflow-hidden bg-muted">
                   <img src={getOptimizedImageUrl(images[0])} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col">
                   <span className="text-[9px] font-black uppercase truncate max-w-[150px]">{product.name}</span>
                   <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-foreground">₹{product.price.toLocaleString()}</span>
                   </div>
                </div>
             </div>
             <button onClick={handleAddToCart} className="bg-foreground text-background h-11 px-6 rounded-xl font-black uppercase text-[9px] tracking-widest active:scale-95 transition-transform">
                {isAdded ? "Added" : "Drop In Bag"}
             </button>
          </motion.div>
        )}
      </AnimatePresence>

      <SizingChartModal isOpen={isSizingModalOpen} onClose={() => setIsSizingModalOpen(false)} productName={product.name} />
      
      <ReviewForm 
        isOpen={isReviewModalOpen} 
        onClose={() => setIsReviewModalOpen(false)} 
        productId={id}
        productName={product.name}
        onSuccess={fetchReviews}
      />
    </div>
  );
}
