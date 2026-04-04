"use client";

import { useSettings } from "@/components/SettingsContext";
import { Instagram, ArrowRight, Loader2, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState, useRef } from "react";

interface Reel {
    id: string;
    url: string;
    permalink: string;
    caption?: string;
    thumbnail?: string;
}

export default function InstagramReels() {
    const { settings } = useSettings();
    const [reels, setReels] = useState<Reel[]>([]);
    const [loading, setLoading] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        async function fetchReels() {
            try {
                const res = await fetch("/api/instagram/reels");
                const data = await res.json();
                if (data.reels && data.reels.length > 0) {
                    setReels(data.reels);
                }
            } catch (err) {
                console.error("Failed to fetch reels:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchReels();
    }, []);

    const scroll = (direction: 'left' | 'right') => {
        if (containerRef.current) {
            const { scrollLeft, clientWidth } = containerRef.current;
            const scrollTo = direction === 'left' 
                ? scrollLeft - clientWidth / 2 
                : scrollLeft + clientWidth / 2;
            containerRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        if (loading || reels.length === 0) return;

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.6 // Trigger when 60% of the video is visible
        };

        const handleIntersection = (entries: IntersectionObserverEntry[]) => {
            entries.forEach(entry => {
                const video = entry.target as HTMLVideoElement;
                if (entry.isIntersecting) {
                    video.play().catch(err => {
                        // Handle browsers blocking autoplay
                        console.log("Autoplay prevented:", err);
                    });
                } else {
                    video.pause();
                }
            });
        };

        const observer = new IntersectionObserver(handleIntersection, observerOptions);
        const videos = document.querySelectorAll('.reel-video');
        videos.forEach(video => observer.observe(video));

        return () => observer.disconnect();
    }, [loading, reels]);

    // Fallback to settings if API returns nothing
    const displayReels = reels.length > 0 ? reels : (settings.instagram_reels || []).map((url: string, i: number) => ({
        id: `manual-${i}`,
        url: url,
        permalink: url,
    }));

    if (loading) {
        return (
            <div className="py-24 bg-background flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-brand-accent mb-4" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/30">Loading Reels...</p>
            </div>
        );
    }

    if (displayReels.length === 0) {
        return (
            <div className="py-12 md:py-24 bg-muted/30 border-y border-foreground/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-black opacity-10" />
                <div className="max-w-[1440px] mx-auto px-6 lg:px-12 relative z-10 text-center">
                    <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-foreground mb-6">
                        Join the Movement
                    </h3>
                    <p className="text-brand-accent text-sm font-black uppercase tracking-[0.4em] mb-10">
                        Follow us for the latest drops
                    </p>
                    <a
                        href={settings.social_links?.instagram || "https://instagram.com/thedv27"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-12 py-4 bg-foreground text-background font-black uppercase tracking-widest text-sm hover:bg-brand-accent hover:text-white transition-all"
                    >
                        <Instagram size={18} /> @{settings.social_links?.instagram?.split('/').filter(Boolean).pop() || "thedv27"}
                    </a>
                </div>
            </div>
        );
    }

    return (
        <section className="py-20 bg-background overflow-hidden font-inter">
            <div className="max-w-[1440px] mx-auto px-6 lg:px-12 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-foreground leading-none">
                        The {settings.site_name || "DV27"} <span className="text-brand-accent">Flex</span>
                    </h2>
                    <p className="mt-4 text-muted-foreground font-medium flex items-center gap-2">
                        <Instagram size={16} /> @{settings.social_links?.instagram?.split('/').filter(Boolean).pop() || "thedv27"} • Our FlexFam is now 150k strong
                    </p>
                </div>
                <a
                    href={settings.social_links?.instagram || "https://instagram.com/thedv27"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 font-black uppercase tracking-widest text-sm text-foreground hover:text-brand-accent transition-colors"
                >
                    View All Reels <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                </a>
            </div>

            <div className="relative group">
                {/* Horizontal Scroll Buttons */}
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 md:w-10 md:h-10 rounded-full bg-background/80 md:bg-background/20 backdrop-blur-md flex items-center justify-center text-foreground border border-foreground/10 hover:bg-brand-accent hover:text-white transition-all shadow-lg md:opacity-0 md:group-hover:opacity-100"
                    aria-label="Scroll left"
                >
                    <ChevronLeft size={18} className="md:w-5 md:h-5" />
                </button>
                <button
                    onClick={() => scroll('right')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 md:w-10 md:h-10 rounded-full bg-background/80 md:bg-background/20 backdrop-blur-md flex items-center justify-center text-foreground border border-foreground/10 hover:bg-brand-accent hover:text-white transition-all shadow-lg md:opacity-0 md:group-hover:opacity-100"
                    aria-label="Scroll right"
                >
                    <ChevronRight size={18} className="md:w-5 md:h-5" />
                </button>

                <div 
                    ref={containerRef}
                    className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory px-6 lg:px-12 pb-8 scroll-smooth"
                >
                    {displayReels.map((reel: any, index: number) => {
                        return (
                            <div
                                key={reel.id}
                                className="flex-none w-[calc(50%-0.5rem)] md:w-[320px] aspect-[9/16] bg-muted/20 rounded-3xl overflow-hidden snap-center relative group/reel shadow-xl cursor-pointer"
                                onClick={() => window.open(reel.permalink, "_blank")}
                            >
                                {reel.url.includes('.mp4') || reel.url.includes('cdninstagram.com') || reel.url.includes('scontent') ? (
                                    <div className="relative w-full h-full">
                                        <video
                                            src={reel.url}
                                            className="reel-video w-full h-full object-cover"
                                            playsInline
                                            muted
                                            loop
                                            poster={reel.thumbnail}
                                        />
                                        {/* Play Icon Overlay (Dynamic based on play state) */}
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover/reel:bg-transparent transition-colors">
                                            <div className="w-12 h-12 rounded-full border border-white/50 flex items-center justify-center backdrop-blur-sm group-hover/reel:scale-125 group-hover/reel:opacity-0 transition-all duration-300">
                                                <Play className="text-white fill-white translate-x-0.5" size={20} />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <img
                                        src={reel.thumbnail || reel.url}
                                        alt={reel.caption || "Instagram Reel"}
                                        className="w-full h-full object-cover"
                                    />
                                )}
                                
                                {reel.caption && (
                                    <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover/reel:opacity-100 transition-opacity duration-300">
                                        <p className="text-[10px] text-white line-clamp-2 leading-relaxed">
                                            {reel.caption}
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Visual Indicators */}
                <div className="flex justify-center gap-2 mt-4">
                    {displayReels.map((_: any, index: number) => (
                        <div key={index} className="h-1 w-8 bg-foreground/10 rounded-full overflow-hidden">
                            <div className="h-full w-0 bg-brand-accent group-hover:w-full transition-all duration-[5000ms]" style={{ transitionDelay: `${index * 100}ms` }} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
