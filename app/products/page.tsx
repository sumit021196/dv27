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
    let result = [...items];
    if (activeCatId !== "all") {
      result = result.filter((p) => p.category_id === activeCatId);
    }
    return result;
  }, [items, activeCatId]);

  const visible = filtered.slice(0, page * pageSize);

  return (
    <main className="bg-gray-50 min-h-screen pb-16">
      <div className="sticky top-16 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="mx-auto max-w-7xl px-4">
          <div className="no-scrollbar overflow-x-auto py-4">
            <div className="flex gap-2.5">
              <button
                onClick={() => {
                  setActiveCatId("all");
                  setPage(1);
                }}
                className={`whitespace-nowrap flex-shrink-0 rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 ${activeCatId === "all"
                  ? "bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:-translate-y-0.5"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:text-gray-900 hover:bg-gray-50"
                  }`}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setActiveCatId(c.id);
                    setPage(1);
                  }}
                  className={`whitespace-nowrap flex-shrink-0 rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 ${activeCatId === c.id
                    ? "bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:-translate-y-0.5"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:text-gray-900 hover:bg-gray-50"
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
          <div className="mb-6 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 flex items-center shadow-sm">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            Showing demo data due to a database loading issue.
          </div>
        ) : null}

        <section>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm">
                  <div className="aspect-[4/5] bg-gray-100 animate-pulse" />
                  <div className="p-4 md:p-5 space-y-3">
                    <div className="h-4 bg-gray-100 rounded-md w-3/4 animate-pulse" />
                    <div className="h-4 bg-gray-100 rounded-md w-1/4 animate-pulse" />
                    <div className="h-10 bg-gray-50 rounded-xl w-full mt-4 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 fade-in-up">
                {visible.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={{ id: p.id, name: p.name, price: p.price, mediaUrl: p.media_url || undefined }}
                  />
                ))}
              </div>

              {visible.length < filtered.length ? (
                <div className="mt-10 flex justify-center">
                  <button
                    onClick={() => setPage((v) => v + 1)}
                    className="rounded-xl bg-white border border-gray-200 text-gray-700 px-6 py-3 text-sm font-semibold hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm flex items-center gap-2"
                  >
                    Load More Products
                  </button>
                </div>
              ) : null}

              {filtered.length === 0 ? (
                <div className="mt-12 text-center flex flex-col items-center justify-center p-8 bg-white rounded-2xl border border-gray-100 shadow-sm max-w-md mx-auto">
                  <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">No products found</h3>
                  <p className="mt-2 text-sm text-gray-500">We couldn't find any products in the selected category. Try searching another category.</p>
                </div>
              ) : null}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
