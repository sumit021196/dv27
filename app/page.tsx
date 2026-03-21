import Link from "next/link";
import { productService } from "@/services/product.service";
import Section from "@/components/Section";
import ProductCard from "@/components/ProductCard";
import HeroSection from "@/components/ui/HeroSection";
import { createClient } from "@/utils/supabase/server";
import Ticker from "@/components/ui/Ticker";

export default async function Page() {
  const trending = await productService.getTrendingProducts();
  const newArrivals = await productService.getNewArrivals();
  const allProducts = await productService.getProducts();

  const supabase = await createClient();
  const { data: banners } = await supabase.from('banners').select('*').eq('is_active', true);
  const { data: settingsData } = await supabase.from('settings').select('*');
  
  const settings = settingsData?.reduce((acc: any, curr: any) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {});

  return (
    <main className="bg-black min-h-screen">

      <HeroSection banners={banners || []} />

      <Section
        title="New Drops"
        subtitle="Exclusive styles for the contemporary soul"
        ctaHref="/products"
        ctaLabel="Shop the drop"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-8">
          {newArrivals.map((p) => (
            <ProductCard key={p.id} product={{ id: p.id, name: p.name, price: p.price, mediaUrl: p.media_url }} />
          ))}
        </div>
      </Section>

      <div className="py-12 md:py-24 bg-zinc-900/40 border-y border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white opacity-20" />
          <div className="max-w-[1440px] mx-auto px-6 lg:px-12 relative z-10">
               <h2 className="text-5xl md:text-8xl lg:text-[140px] font-black italic uppercase tracking-tighter text-white/5 leading-none absolute -top-10 left-0 w-full text-center select-none">
                   THE DV27 FLEX
               </h2>
               <div className="text-center relative py-12">
                   <h3 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white mb-6">
                       Our FlexFam is now 150k strong
                   </h3>
                   <p className="text-brand-accent text-sm font-black uppercase tracking-[0.4em] italic mb-10">
                       JOIN THE MOVEMENT
                   </p>
                   <button className="px-12 py-4 bg-white text-black font-black uppercase tracking-widest text-sm hover:bg-brand-accent hover:text-white transition-all">
                       Follow on Instagram
                   </button>
               </div>
          </div>
      </div>

      <Section
        title="Trending"
        subtitle="Pieces our community is loving"
        ctaHref="/products"
        ctaLabel="View all"
      >
        <div id="trending" className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-8">
          {trending.map((p) => (
            <ProductCard key={p.id} product={{ id: p.id, name: p.name, price: p.price, mediaUrl: p.media_url }} />
          ))}
        </div>
      </Section>

      <Ticker className="my-12" />

      <Section
        title="Full Edit"
        subtitle="Explore the complete collection"
        ctaHref="/products"
        ctaLabel="See all"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-8">
          {allProducts.slice(0, 8).map((p) => (
            <ProductCard key={p.id} product={{ id: p.id, name: p.name, price: p.price, mediaUrl: p.media_url }} />
          ))}
        </div>
      </Section>

    </main>
  );
}
