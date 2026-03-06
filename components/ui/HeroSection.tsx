import Link from "next/link";

export default function HeroSection() {
    return (
        <section className="px-4 mt-2">
            <div className="mx-auto max-w-7xl py-6 md:py-12">
                <div className="relative overflow-hidden rounded-[2rem] bg-white p-6 md:p-12 border border-gray-100 shadow-sm">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10 md:gap-14 relative z-10">

                        {/* Text Content */}
                        <div className="max-w-xl space-y-6 fade-in-up">
                            <div className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-600">
                                <span className="flex h-2 w-2 rounded-full bg-blue-500 mr-2 animate-pulse" />
                                New Collection Arrivals
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.1]">
                                Thoughtful Gifts, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Made Personal</span>.
                            </h1>

                            <p className="text-gray-500 text-base md:text-lg leading-relaxed">
                                Discover curated, high-quality personalized gifts for every occasion.
                                Crafted with care. Delivered with love.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                                <Link
                                    href="/products"
                                    className="w-full sm:w-auto inline-flex h-12 md:h-14 items-center justify-center rounded-xl bg-blue-600 text-white px-8 text-base font-semibold hover:bg-blue-700 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                                >
                                    Explore Products
                                </Link>
                                <a
                                    href="#trending"
                                    className="w-full sm:w-auto inline-flex h-12 md:h-14 items-center justify-center rounded-xl border border-gray-200 bg-white px-8 text-base font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-300"
                                >
                                    View Trending
                                </a>
                            </div>
                        </div>

                        {/* Image Grid */}
                        <div className="grid grid-cols-2 gap-3 w-full lg:w-[500px] fade-in-up" style={{ animationDelay: '150ms' }}>
                            <div className="space-y-3">
                                <img className="rounded-2xl object-cover w-full aspect-[4/5] hover:scale-[1.02] transition-transform duration-500 shadow-sm" src="https://images.unsplash.com/photo-1520975898319-53b3b5f3a031?q=80&w=800&auto=format&fit=crop" alt="Gift 1" loading="lazy" />
                                <img className="rounded-2xl object-cover w-full aspect-square hover:scale-[1.02] transition-transform duration-500 shadow-sm" src="https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?q=80&w=800&auto=format&fit=crop" alt="Gift 2" loading="lazy" />
                            </div>
                            <div className="space-y-3 pt-8">
                                <img className="rounded-2xl object-cover w-full aspect-square hover:scale-[1.02] transition-transform duration-500 shadow-sm" src="https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=800&auto=format&fit=crop" alt="Gift 3" loading="lazy" />
                                <img className="rounded-2xl object-cover w-full aspect-[4/5] hover:scale-[1.02] transition-transform duration-500 shadow-sm" src="https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=800&auto=format&fit=crop" alt="Gift 4" loading="lazy" />
                            </div>
                        </div>
                    </div>

                    {/* Abstract background blobs for aesthetic */}
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-60" />
                    <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-60 animate-pulse" />
                </div>
            </div>
        </section>
    );
}
