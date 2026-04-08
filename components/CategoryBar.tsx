"use client";
import { Category } from "@/types/product";
import { useRouter, useSearchParams } from "next/navigation";

export default function CategoryBar({ categories }: { categories: Category[] }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeCat = searchParams.get("category") || "all";

    const setCategory = (slug: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (slug === 'all') {
            params.delete('category');
        } else {
            params.set('category', slug);
            params.set('page', '1'); // Reset pagination on category change
        }
        router.push(`/products?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="sticky top-16 z-40 bg-background/80 backdrop-blur-md border-b border-foreground/5 shadow-sm">
            <div className="mx-auto max-w-7xl px-4">
                <div className="no-scrollbar overflow-x-auto py-4">
                    <div className="flex gap-2.5">
                        <button
                            onClick={() => setCategory("all")}
                            className={`whitespace-nowrap flex-shrink-0 rounded-full px-5 py-2 text-[10px] font-black uppercase tracking-widest transition-all duration-200 ${activeCat === "all"
                                ? "bg-foreground text-background shadow-lg shadow-foreground/10 hover:-translate-y-0.5"
                                : "bg-muted text-foreground/40 border border-foreground/5 hover:border-foreground/10 hover:text-foreground hover:bg-background"
                                }`}
                        >
                            All Pieces
                        </button>
                        {categories.map((c) => (
                            <button
                                key={c.id}
                                onClick={() => setCategory(c.slug)}
                                className={`whitespace-nowrap flex-shrink-0 rounded-full px-5 py-2 text-[10px] font-black uppercase tracking-widest transition-all duration-200 ${activeCat === c.slug
                                    ? "bg-foreground text-background shadow-lg shadow-foreground/10 hover:-translate-y-0.5"
                                    : "bg-muted text-foreground/40 border border-foreground/5 hover:border-foreground/10 hover:text-foreground hover:bg-background"
                                    }`}
                            >
                                {c.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
