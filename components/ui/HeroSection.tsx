"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { FALLBACK_IMG } from "@/utils/images";

export default function HeroSection({ banners = [] }: { banners?: any[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const activeBanners = banners.filter((b: any) => b.is_active && b.position === 'hero');

    useEffect(() => {
        if (activeBanners.length > 1) {
            const timer = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
            }, 6000);
            return () => clearInterval(timer);
        }
    }, [activeBanners.length]);

    if (activeBanners.length === 0) {
        // Fallback if no banners defined
        return (
            <section className="h-[80vh] flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                    <h1 className="text-5xl md:text-9xl font-bold uppercase tracking-wide text-foreground">THE DROP</h1>
                    <button className="px-8 py-3 bg-foreground text-background font-bold uppercase tracking-widest text-sm">Shop Now</button>
                </div>
            </section>
        );
    }

    const banner = activeBanners[currentIndex];

    return (
        <section className="relative h-[85vh] lg:h-[95vh] w-full overflow-hidden bg-background">
            {activeBanners.map((b, idx) => (
                <div 
                    key={b.id} 
                    className={`absolute inset-0 transition-opacity duration-1000 ${idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                >
                    {/* Background Overlay - subtly darker for text readability */}
                    <div className="absolute inset-0 z-10 bg-gradient-to-t from-background via-transparent to-transparent" />
                    
                    <img 
                        src={b.image_url || FALLBACK_IMG}
                        alt={b.title || 'Hero'} 
                        onError={(e) => {
                            const img = e.currentTarget as HTMLImageElement;
                            if (img.src !== FALLBACK_IMG) {
                                img.src = FALLBACK_IMG;
                            }
                        }}
                        className="h-full w-full object-cover transition-transform duration-[10000ms] ease-out scale-100 animate-[zoom-out_10s_ease-out_forwards]"
                    />

                    {/* Content Overlay */}
                    <div className="absolute inset-0 z-20 flex items-center justify-center px-6 lg:px-12">
                        <div className={`max-w-[1440px] w-full ${b.style_type === 'split' ? 'grid grid-cols-1 lg:grid-cols-2' : 'text-center'}`}>
                            <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                                {b.style_type === 'wtflex_bold' ? (
                                    <>
                                        <h1 className="text-4xl md:text-8xl lg:text-[120px] font-bold uppercase tracking-wide text-foreground leading-tight filter drop-shadow-2xl">
                                            {b.title}
                                        </h1>
                                        <p className="text-xs md:text-base font-semibold uppercase tracking-[0.2em] text-brand-accent animate-pulse-subtle">
                                            {b.subtitle}
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <h1 className="text-4xl md:text-7xl lg:text-8xl font-bold uppercase tracking-wide text-foreground leading-tight">
                                            {b.title}
                                        </h1>
                                        <p className="text-sm md:text-lg font-medium text-foreground/80 max-w-2xl mx-auto">
                                            {b.subtitle}
                                        </p>
                                    </>
                                )}

                                <div className={`flex flex-col sm:flex-row gap-4 pt-6 ${b.style_type === 'split' ? 'justify-start' : 'justify-center'}`}>
                                    <Link
                                        href={b.link_url || '/products'}
                                        className="inline-flex items-center justify-center gap-3 px-12 py-5 bg-foreground text-background font-black uppercase tracking-widest text-sm hover:bg-brand-accent hover:text-white transition-all transform hover:-translate-y-1 active:scale-95 shadow-2xl"
                                    >
                                        <ShoppingBag size={20} />
                                        {b.cta_text || 'Shop Collection'}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Pagination Tabs */}
            {activeBanners.length > 1 && (
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 flex gap-3">
                    {activeBanners.map((_, idx) => (
                        <button 
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`h-1 transition-all duration-300 ${idx === currentIndex ? 'w-12 bg-foreground' : 'w-4 bg-foreground/30'}`}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}

// Add animation to globals or here via style tag if needed
// @keyframes zoom-out { from { transform: scale(1.1); } to { transform: scale(1); } }
