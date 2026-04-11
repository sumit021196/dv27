import Link from "next/link";
import Image from "next/image";
import { getStaticClient } from "@/utils/supabase/static";

export default async function CategoryGrid() {
  const supabase = getStaticClient();
  
  // Fetch top-level categories (parent_id is null)
  const { data: categories, error } = await supabase
    .from('categories')
    .select('id, name, slug, image_url')
    .eq('is_active', true);

  if (error || !categories || categories.length === 0) {
    return null;
  }

  return (
    <section className="py-8 md:py-20 bg-background">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row items-center md:items-end justify-center md:justify-between text-center md:text-left gap-4 mb-8 md:mb-12">
          <div className="flex flex-col items-center md:items-start">
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-black tracking-tighter uppercase text-foreground leading-none">
              discover the latest
            </h2>
            <p className="mt-3 text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-foreground/40">
              Curated categories for Every occasion
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4 md:gap-6">
          {categories.map((category) => (
            <Link 
              key={category.id} 
              href={`/products?category=${category.slug}`}
              className="group relative aspect-square overflow-hidden rounded-lg bg-muted border border-foreground/5 shadow-sm"
            >
              <Image
                src={category.image_url || "/placeholder-category.png"}
                alt={category.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Bottom Label Overlay */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-2 pt-6">
                <h3 className="text-white text-[9px] sm:text-xs font-black uppercase tracking-[0.1em] leading-none drop-shadow-md">
                  {category.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
