import Link from "next/link";
import { ShoppingBag, BookOpen, ArrowRight, Sparkles } from "lucide-react";

export default function HeroSection() {
    return (
        <section className="px-4 mt-2">
            <div className="mx-auto max-w-7xl py-6 md:py-12">
                <div className="relative overflow-hidden rounded-[2rem] bg-white p-6 md:p-12 border border-stone-100 shadow-sm">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10 md:gap-14 relative z-10">

                        {/* Text Content */}
                        <div className="max-w-xl space-y-6 fade-in-up">
                            {/* Badge */}
                            <div className="inline-flex items-center rounded-full border border-stone-100 bg-stone-50 px-3 py-1.5 text-sm font-medium text-stone-600 gap-2">
                                <Sparkles size={13} className="text-stone-500" />
                                SS25 Collection Live
                                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-stone-900 leading-[1.1]">
                                Redefining{" "}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-stone-900 to-stone-600">
                                    Modern Elegance
                                </span>
                                .
                            </h1>

                            <p className="text-stone-500 text-base md:text-lg leading-relaxed">
                                Discover curated wardrobe essentials for the contemporary soul.
                                Timeless silhouettes. Crafted with precision.
                            </p>

                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                                <Link
                                    href="/products"
                                    className="group w-full sm:w-auto inline-flex h-12 md:h-14 items-center justify-center gap-2.5 rounded-xl bg-stone-900 text-white px-7 text-sm md:text-base font-semibold hover:bg-stone-800 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                                >
                                    <ShoppingBag size={18} strokeWidth={2} />
                                    Shop Collection
                                    <ArrowRight
                                        size={16}
                                        strokeWidth={2.5}
                                        className="group-hover:translate-x-0.5 transition-transform duration-200"
                                    />
                                </Link>

                                <a
                                    href="#trending"
                                    className="w-full sm:w-auto inline-flex h-12 md:h-14 items-center justify-center gap-2.5 rounded-xl border border-stone-200 bg-white px-7 text-sm md:text-base font-semibold text-stone-700 hover:bg-stone-50 hover:border-stone-300 transition-all duration-300"
                                >
                                    <BookOpen size={18} strokeWidth={2} />
                                    View Lookbook
                                </a>
                            </div>

                            {/* Trust badges - mobile friendly */}
                            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1">
                                {[
                                    "Free Shipping ₹999+",
                                    "Easy Returns",
                                    "100% Authentic",
                                ].map((badge) => (
                                    <span
                                        key={badge}
                                        className="flex items-center gap-1.5 text-xs font-medium text-stone-500"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                        {badge}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Image Grid */}
                        <div
                            className="grid grid-cols-2 gap-3 w-full lg:w-[480px] fade-in-up"
                            style={{ animationDelay: "150ms" }}
                        >
                            <div className="space-y-3">
                                <img
                                    className="rounded-2xl object-cover w-full aspect-[4/5] hover:scale-[1.02] transition-transform duration-500 shadow-sm"
                                    src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop"
                                    alt="Fashion 1"
                                    loading="lazy"
                                />
                                <img
                                    className="rounded-2xl object-cover w-full aspect-square hover:scale-[1.02] transition-transform duration-500 shadow-sm"
                                    src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop"
                                    alt="Fashion 2"
                                    loading="lazy"
                                />
                            </div>
                            <div className="space-y-3 pt-8">
                                <img
                                    className="rounded-2xl object-cover w-full aspect-square hover:scale-[1.02] transition-transform duration-500 shadow-sm"
                                    src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop"
                                    alt="Fashion 3"
                                    loading="lazy"
                                />
                                <img
                                    className="rounded-2xl object-cover w-full aspect-[4/5] hover:scale-[1.02] transition-transform duration-500 shadow-sm"
                                    src="https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=1200&auto=format&fit=crop"
                                    alt="Fashion 4"
                                    loading="lazy"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Background blobs */}
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-stone-50 rounded-full blur-3xl opacity-60" />
                    <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-stone-100 rounded-full blur-3xl opacity-60 animate-pulse" />
                </div>
            </div>
        </section>
    );
}
