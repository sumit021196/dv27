"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import { getOptimizedImageUrl } from "@/utils/images";

export default function HeroSection({ banners = [] }: { banners?: any[] }) {
    const [mounted, setMounted] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

    
    const activeBanners = (banners || []).filter((b: any) => b.position === 'hero');

    // Ensure video plays on mount/change for iOS
    useEffect(() => {
        setMounted(true);
        if (activeBanners.length > 1) {
            const timer = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
            }, 6000);
            return () => clearInterval(timer);
        }
    }, [activeBanners.length]);

    // Ensure video plays on mount/change for iOS
    useEffect(() => {
        if (mounted && videoRefs.current[currentIndex]) {
            const video = videoRefs.current[currentIndex];
            if (video) {
                video.muted = true; // Extra insurance for Safari
                video.play().catch(err => {
                    // This might happen if user hasn't interacted or Low Power Mode is on
                    console.log("Hero video autoplay protected:", err);
                });
            }
        }
    }, [currentIndex, mounted, activeBanners]);


    // Prevent hydration mismatch by returning a consistent placeholder or skeleton
    if (!mounted) {
        return (
            <section className="h-[65vh] lg:h-[95vh] w-full bg-background flex items-center justify-center">
                <div className="animate-pulse space-y-4">
                    <div className="h-12 w-64 bg-foreground/5 rounded" />
                </div>
            </section>
        );
    }

    if (activeBanners.length === 0) {
        // Fallback if no banners defined
        return (
            <section className="h-[65vh] lg:h-[95vh] flex items-center justify-center bg-background border-b border-foreground/5">
                <div className="text-center space-y-8 px-6 w-full h-full flex flex-col justify-end pb-16 sm:justify-center sm:pb-0">
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter text-foreground leading-none animate-in fade-in zoom-in duration-1000">
                        THE DROP
                    </h1>
                    <Link 
                        href="/products" 
                        className="inline-flex items-center justify-center gap-3 px-12 py-5 bg-foreground text-background font-black uppercase tracking-widest text-sm hover:bg-brand-accent transition-all animate-in slide-in-from-bottom-4 duration-1000 delay-300 rounded-full mx-auto"
                    >
                        <ShoppingBag size={20} />
                        Shop the Collection
                    </Link>
                </div>
            </section>
        );
    }

    return (
        <section className="relative h-[65vh] lg:h-[95vh] w-full overflow-hidden bg-background">
            {activeBanners.map((b, idx) => (
                <div 
                    key={b.id || idx} 
                    className={`absolute inset-0 transition-opacity duration-1000 ${idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                >
                    {/* Background Overlay */}
                    <div className="absolute inset-0 z-10 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
                    
                    <div className="relative h-full w-full overflow-hidden">
                        {b.style_type === 'video' || b.image_url?.match(/\.(mp4|webm|ogg|mov)$|^https:\/\/res\.cloudinary\.com\/.*\/video\/upload\//) ? (
                            <video 
                                ref={el => { videoRefs.current[idx] = el; }}
                                src={b.image_url} 
                                autoPlay 
                                muted 
                                loop 
                                playsInline
                                preload="auto"
                                className={`object-cover w-full h-full transition-transform duration-[10000ms] ease-out ${idx === currentIndex ? 'scale-110' : 'scale-100'}`}
                            />
                        ) : (
                            <Image 
                                src={getOptimizedImageUrl(b.image_url)} 
                                alt={b.title || 'Hero'} 
                                fill
                                priority={idx === 0}
                                className={`object-cover transition-transform duration-[10000ms] ease-out ${idx === currentIndex ? 'scale-110' : 'scale-100'}`}
                                sizes="100vw"
                            />
                        )}
                    </div>

                    {/* Content Overlay */}
                    <div className="absolute inset-0 z-20 flex items-end sm:items-center justify-center pb-16 sm:pb-0 px-6 lg:px-12">
                        <div className="max-w-[1440px] w-full text-center">
                            <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-12 duration-1000">
                                <h1 className="text-4xl md:text-6xl lg:text-8xl font-black uppercase tracking-tight text-foreground leading-[0.85] filter drop-shadow-2xl">
                                    {b.title}
                                </h1>
                                <p className="text-sm md:text-lg font-bold uppercase tracking-[0.25em] text-foreground/70 max-w-2xl mx-auto drop-shadow-lg">
                                    {b.subtitle}
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 pt-8 justify-center items-center">
                                    <Link
                                        href={b.link_url || '/products'}
                                        className="inline-flex items-center justify-center gap-3 px-12 py-5 bg-foreground text-background font-black uppercase tracking-widest text-xs sm:text-sm hover:bg-brand-accent hover:text-white transition-all transform hover:-translate-y-1 active:scale-95 shadow-2xl rounded-full"
                                    >
                                        <ShoppingBag size={20} />
                                        {b.cta_text || 'Shop the Drop'}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Pagination Line Indicators */}
            {activeBanners.length > 1 && (
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 flex gap-4">
                    {activeBanners.map((_, idx) => (
                        <button 
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className="group relative py-4"
                        >
                            <div className={`h-[2px] transition-all duration-500 rounded-full ${idx === currentIndex ? 'w-16 bg-foreground' : 'w-6 bg-foreground/20 group-hover:bg-foreground/40'}`} />
                        </button>
                    ))}
                </div>
            )}
        </section>
    );
}

// Add animation to globals or here via style tag if needed
// @keyframes zoom-out { from { transform: scale(1.1); } to { transform: scale(1); } }
