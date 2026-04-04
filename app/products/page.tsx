"use client";
import { useEffect, useMemo, useState } from "react";
import { productService } from "@/services/product.service";
import { Category, Product } from "@/types/product";
import ProductCard from "@/components/ProductCard";
import { type Item, fallback } from "@/utils/data";

export default function ProductList() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCatId, setActiveCatId] = useState<string>("all");

  const [page, setPage] = useState(1);
  const pageSize = 12; // Increased for a better grid

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const [productsData, categoriesData] = await Promise.all([
          productService.getProducts(),
          productService.getCategories()
        ]);
        setItems(productsData);
        setCategories(categoriesData);
      } catch (e: unknown) {
        setItems(fallback as unknown as Product[]);
        const message = e instanceof Error ? e.message : String(e);
        setLoadError(message ?? "Failed to load");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    if (activeCatId === "all") return items;
    return items.filter((p) => p.category_id === activeCatId);
  }, [items, activeCatId]);

  const visible = filtered.slice(0, page * pageSize);

  return (
    <main className="bg-background min-h-screen pb-16">
      <div className="sticky top-16 z-40 bg-background/80 backdrop-blur-md border-b border-foreground/5 shadow-sm">
        <div className="mx-auto max-w-7xl px-4">
          <div className="no-scrollbar overflow-x-auto py-4">
            <div className="flex gap-2.5">
              <button
                onClick={() => {
                  setActiveCatId("all");
                  setPage(1);
                }}
                className={`whitespace-nowrap flex-shrink-0 rounded-full px-5 py-2 text-[10px] font-black uppercase tracking-widest transition-all duration-200 ${activeCatId === "all"
                  ? "bg-foreground text-background shadow-lg shadow-foreground/10 hover:-translate-y-0.5"
                  : "bg-muted text-foreground/40 border border-foreground/5 hover:border-foreground/10 hover:text-foreground hover:bg-background"
                  }`}
              >
                All Pieces
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setActiveCatId(c.id);
                    setPage(1);
                  }}
                  className={`whitespace-nowrap flex-shrink-0 rounded-full px-5 py-2 text-[10px] font-black uppercase tracking-widest transition-all duration-200 ${activeCatId === c.id
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

      <div className="mx-auto max-w-7xl px-4 py-8">
        {loadError ? (
          <div className="mb-6 rounded-xl border border-foreground/5 bg-muted/50 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-foreground/40 flex items-center shadow-sm">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            Live synchronization unavailable. Using cached collection.
          </div>
        ) : null}

        <section>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-foreground/5 bg-background overflow-hidden shadow-sm">
                  <div className="aspect-[3/4] bg-muted animate-pulse" />
                  <div className="p-4 md:p-6 space-y-4">
                    <div className="h-4 bg-muted rounded-md w-3/4 animate-pulse" />
                    <div className="h-4 bg-muted rounded-md w-1/4 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 fade-in-up">
                {visible.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={{ id: p.id, name: p.name, price: p.price, mediaUrl: p.media_url || undefined }}
                  />
                ))}
              </div>

              {visible.length < filtered.length ? (
                <div className="mt-16 flex justify-center">
                  <button
                    onClick={() => setPage((v) => v + 1)}
                    className="rounded-2xl bg-background border border-foreground/10 text-foreground px-10 py-4 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-foreground hover:text-background transition-all shadow-sm flex items-center gap-3 active:scale-95"
                  >
                    Load More Arrivals
                    <span className="w-1.5 h-1.5 bg-brand-accent rounded-full animate-pulse" />
                  </button>
                </div>
              ) : null}

              {filtered.length === 0 ? (
                <div className="mt-20 text-center flex flex-col items-center justify-center p-12 bg-background rounded-[40px] border border-foreground/5 shadow-2xl max-w-lg mx-auto">
                  <div className="w-20 h-20 bg-muted text-foreground/20 rounded-3xl flex items-center justify-center mb-8 rotate-12">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tighter text-foreground">Collection Empty</h3>
                  <p className="mt-3 text-[11px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">We couldn't find any pieces in this category. Explore our other collections for the latest drops.</p>
                </div>
              ) : null}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
