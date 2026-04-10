"use client";

import { useRef } from "react";
import Link from "next/link";
import { Play, User, ShoppingBag, ArrowRight } from "lucide-react";
import { cn } from "@/utils/cn";

interface VideoReviewsProps {
    reviews: any[];
}

export default function VideoReviews({ reviews }: VideoReviewsProps) {
    if (!reviews || reviews.length === 0) return null;

    return (
        <section className="py-16 overflow-hidden bg-background">
            <div className="px-6 mb-8 flex items-end justify-between">
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter leading-none">Shared by You</h2>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] mt-2">Our community in action</p>
                </div>
                <Link href="/products" className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 group text-brand-accent">
                    Shop Now <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            <div className="flex gap-4 overflow-x-auto no-scrollbar px-6 snap-x snap-mandatory">
                {reviews.map((review) => (
                    <VideoCard key={review.id} review={review} />
                ))}
            </div>
        </section>
    );
}

function VideoCard({ review }: { review: any }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const videoData = review.review_media.find((m: any) => m.media_type === 'video');

    if (!videoData) return null;

    return (
        <div className="flex-none w-[280px] aspect-[9/16] rounded-[32px] overflow-hidden relative snap-center group bg-muted border border-foreground/5 shadow-2xl">
            <video
                ref={videoRef}
                src={videoData.media_url}
                className="w-full h-full object-cover"
                loop
                muted
                playsInline
                autoPlay
                onClick={(e) => {
                    const video = e.currentTarget;
                    if (video.paused) video.play(); else video.pause();
                }}
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none flex flex-col justify-end p-6">
                <div className="space-y-4">
                    <div className="flex flex-col gap-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/60 flex items-center gap-2">
                            <User size={12} className="text-brand-accent" /> {review.profiles?.full_name || review.guest_name || "Anonymous"}
                        </p>
                        <h3 className="text-white text-sm font-bold leading-tight line-clamp-3 italic-font">
                            &quot;{review.comment}&quot;
                        </h3>
                    </div>
                    
                    <div className="pointer-events-auto">
                        <Link 
                            href={`/product/${review.product_id}`}
                            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all active:scale-95"
                        >
                            <ShoppingBag size={12} />
                            {review.products?.name || "View Piece"}
                        </Link>
                    </div>
                </div>
            </div>

            {/* Floating Play Icon */}
            <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white/80 border border-white/10">
                <Play size={16} className="fill-white" />
            </div>
            
            {/* Progress Bar (Visual Only) */}
            <div className="absolute bottom-0 left-0 h-1 bg-brand-accent w-full origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-1000" />
        </div>
    );
}
