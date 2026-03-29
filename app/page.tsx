import Link from "next/link";
import { productService } from "@/services/product.service";
import Section from "@/components/Section";
import ProductCard from "@/components/ProductCard";
import HeroSection from "@/components/ui/HeroSection";
import { createClient } from "@/utils/supabase/server";
import Ticker from "@/components/ui/Ticker";
import InstagramReels from "@/components/ui/InstagramReels";

export const revalidate = 3600; // Cache for 1 hour

export default async function Page() {
  const supabase = await createClient();

  // Fetch all data in parallel
  const [trending, newArrivals, allProducts, { data: banners }, { data: settingsData }] = await Promise.all([
    productService.getTrendingProducts(8), // Trending can be simplified if needed, but let's keep for now or use select
    productService.getNewArrivals(8),
    productService.getProductsForCards(12),
    supabase.from('banners').select('id, image_url, title, subtitle, position, is_active, style_type, link_url, cta_text').eq('is_active', true),
    supabase.from('settings').select('key, value')
  ]);
  
  const settings = settingsData?.reduce((acc: any, curr: any) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {});

  return (
    <main className="bg-background min-h-screen text-foreground transition-colors duration-500">

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

      <InstagramReels />

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
