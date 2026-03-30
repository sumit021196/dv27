"use client";

import { useSettings } from "@/components/SettingsContext";
import { Instagram, ArrowRight, Play } from "lucide-react";

export default function InstagramReels() {
    const { settings } = useSettings();
    const reels = settings.instagram_reels || [];

    if (reels.length === 0) {
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
                        href="https://instagram.com/thedv_27"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-12 py-4 bg-foreground text-background font-black uppercase tracking-widest text-sm hover:bg-brand-accent hover:text-white transition-all"
                    >
                        <Instagram size={18} /> @thedv27
                    </a>
                </div>
            </div>
        );
    }

    return (
        <section className="py-20 bg-background overflow-hidden">
            <div className="max-w-[1440px] mx-auto px-6 lg:px-12 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-foreground leading-none">
                        The DV27 <span className="text-brand-accent">Flex</span>
                    </h2>
                    <p className="mt-4 text-muted-foreground font-medium flex items-center gap-2">
                        <Instagram size={16} /> @thedv27 • Our FlexFam is now 150k strong
                    </p>
                </div>
                <a
                    href="https://instagram.com/thedv27"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 font-black uppercase tracking-widest text-sm text-foreground hover:text-brand-accent transition-colors"
                >
                    View All Reels <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                </a>
            </div>

            <div className="relative group">
                <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory px-6 lg:px-12 pb-8">
                    {reels.map((url: string, index: number) => {
                        // Extract reel ID from URL if possible to create embed link
                        let embedUrl = url;
                        try {
                            const urlObj = new URL(url);
                            if (urlObj.hostname.includes('instagram.com')) {
                                const parts = urlObj.pathname.split('/').filter(Boolean);
                                const reelId = parts[1]; // reels/ID/
                                embedUrl = `https://www.instagram.com/reels/${reelId}/embed`;
                            }
                        } catch (e) { }

                        return (
                            <div
                                key={index}
                                className="flex-none w-[280px] md:w-[320px] aspect-[9/16] bg-muted/50 rounded-3xl overflow-hidden snap-start relative group/reel shadow-xl"
                            >
                                <iframe
                                    src={embedUrl}
                                    className="w-full h-full border-0"
                                    allowFullScreen
                                    scrolling="no"
                                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                                ></iframe>

                                {/* Overlay to prevent direct interaction and scroll issues on mobile if needed, 
                                    but here we want them to play. Instagram embed handles its own interaction. */}
                            </div>
                        );
                    })}
                </div>

                {/* Visual Indicators */}
                <div className="flex justify-center gap-2 mt-4">
                    {reels.map((_: any, index: number) => (
                        <div key={index} className="h-1 w-8 bg-foreground/10 rounded-full overflow-hidden">
                            <div className="h-full w-0 bg-brand-accent group-hover:w-full transition-all duration-[5000ms]" style={{ transitionDelay: `${index * 100}ms` }} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
