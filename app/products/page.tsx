import { productService } from "@/services/product.service";
import ProductCard from "@/components/ProductCard";
import CategoryBar from "@/components/CategoryBar";
import { getStaticClient } from "@/utils/supabase/static";
import Link from "next/link";
import { Search, PackageOpen } from "lucide-react";

export const revalidate = 600; // Cache for 10 minutes

interface PageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function ProductList({ searchParams }: PageProps) {
  const params = await searchParams;
  const category = params.category || "all";
  const search = params.search || "";
  const page = parseInt(params.page || "1");
  const pageSize = 12;

  const supabase = getStaticClient();
  
  // 1. Fetch categories for the bar
  const categories = await productService.getCategories(false, supabase);

  // 2. Fetch filtered products (fetching up to current page size)
  const products = await productService.getFilteredProducts({
    category,
    search,
    limit: page * pageSize,
    offset: 0
  }, supabase);

  // 3. Create active category display name
  const activeCategory = category === 'all' 
    ? 'All Pieces' 
    : categories.find(c => c.slug === category)?.name || 'Filtered Collection';

  return (
    <main className="bg-background min-h-screen pb-16">
      {/* Client-side interative CategoryBar */}
      <CategoryBar categories={categories} />

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Collection Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 border-b border-foreground/5 pb-8">
            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-accent mb-2">Collection</p>
                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-foreground">{activeCategory}</h1>
            </div>
            {search && (
                 <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full">
                    <Search size={14} className="text-foreground/40" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/60">Results for: {search}</span>
                 </div>
            )}
        </div>

        <section>
          {products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 fade-in-up">
                {products.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={{ 
                        id: p.id, 
                        name: p.name, 
                        price: p.price, 
                        original_price: p.original_price, 
                        mediaUrl: p.media_url,
                        rating: p.rating
                    }}
                  />
                ))}
              </div>

              {/* Incremental loading via URL update */}
              {products.length >= page * pageSize && (
                <div className="mt-24 flex justify-center">
                  <Link
                    href={`/products?${new URLSearchParams({ ...params, page: (page + 1).toString() }).toString()}`}
                    scroll={false}
                    className="group relative overflow-hidden rounded-2xl bg-foreground text-background px-12 py-5 text-[11px] font-black uppercase tracking-[0.3em] transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-foreground/20"
                  >
                    <span className="relative z-10 flex items-center gap-3">
                        Load More Arrivals
                        <span className="w-1.5 h-1.5 bg-brand-accent rounded-full animate-pulse" />
                    </span>
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="mt-20 text-center flex flex-col items-center justify-center p-12 bg-background rounded-[40px] border border-foreground/5 shadow-2xl max-w-lg mx-auto">
                <div className="w-20 h-20 bg-muted text-foreground/20 rounded-3xl flex items-center justify-center mb-8 rotate-12">
                    <PackageOpen size={40} />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tighter text-foreground">Collection Empty</h3>
                <p className="mt-3 text-[11px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed text-center">
                    We couldn't find any pieces matching your current selection. Explore our other collections for the latest drops.
                </p>
                <Link 
                    href="/products"
                    className="mt-8 text-[10px] font-black uppercase tracking-widest text-brand-accent hover:underline"
                >
                    Clear all filters
                </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
