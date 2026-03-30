import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/server";

export default async function CategoryGrid() {
  const supabase = await createClient();
  
  // Fetch top-level categories (parent_id is null)
  const { data: categories, error } = await supabase
    .from('categories')
    .select('id, name, slug, image_url')
    .is('parent_id', null)
    .eq('is_active', true);

  console.log('Categories fetched:', categories?.length, 'Error:', error);

  if (!categories || categories.length === 0) {
    console.log('No categories found or error occurred');
    return null;
  }

  return (
    <section className="py-20 bg-background overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-foreground leading-none">
              Shop by <span className="text-brand-accent">Category</span>
            </h2>
            <p className="mt-4 text-muted-foreground font-medium uppercase tracking-[0.3em] text-[10px]">
              Explore our curated seasonal collections
            </p>
          </div>
          <Link 
            href="/products" 
            className="text-[10px] font-black uppercase tracking-[0.2em] border-b border-foreground/20 pb-1 hover:border-brand-accent transition-all"
          >
            Explore All
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {categories.map((category) => (
            <Link 
              key={category.id} 
              href={`/products?category=${category.slug}`}
              className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted"
            >
              <Image
                src={category.image_url || "/placeholder-category.png"}
                alt={category.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[30%] group-hover:grayscale-0"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                <h3 className="text-white text-lg sm:text-xl font-black uppercase tracking-tighter leading-tight drop-shadow-xl transform group-hover:translate-y-[-5px] transition-transform duration-500">
                  {category.name}
                </h3>
                <span className="mt-2 text-[8px] font-black text-white/60 uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                  Shop Now
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
