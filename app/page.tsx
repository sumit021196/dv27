import Link from "next/link";
import { productService } from "@/services/product.service";
import Section from "@/components/Section";
import ProductCard from "@/components/ProductCard";
import HeroSection from "@/components/ui/HeroSection";
import { createStaticClient } from "@/utils/supabase/server";
import Ticker from "@/components/ui/Ticker";
import InstagramReels from "@/components/ui/InstagramReels";
import ProductGrid from "@/components/ProductGrid";
import CategoryGrid from "@/components/CategoryGrid";

export const revalidate = 3600; // Cache for 1 hour

export default async function Page() {
  const supabase = createStaticClient();
  
  // Start fetches but don't await yet for sections we want to stream
  const trendingPromise = productService.getTrendingProducts(8, supabase);
  const newArrivalsPromise = productService.getNewArrivals(8, supabase);
  const allProductsPromise = productService.getProductsForCards(12, supabase);
  
  // Critical data for initial render (Banner, Settings) - still await these
  const [res, { data: settingsData }] = await Promise.all([
    supabase.from('banners').select('id, image_url, title, subtitle, position, is_active, style_type, link_url, cta_text'),
    supabase.from('settings').select('key, value')
  ]);
  
  const banners = res.data;
  const settings = settingsData?.reduce((acc: any, curr: any) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {});
  
  return (
    <main className="bg-background min-h-screen text-foreground transition-colors duration-500">
      <HeroSection banners={banners || []} />
      <CategoryGrid />

      <Section
        title="New Drops"
        subtitle="Exclusive styles for the contemporary soul"
        ctaHref="/products"
        ctaLabel="Shop the drop"
      >
        <ProductGrid productsPromise={newArrivalsPromise} limit={8} />
      </Section>

      <InstagramReels />

      <Section
        title="Trending"
        subtitle="Pieces our community is loving"
        ctaHref="/products"
        ctaLabel="View all"
      >
        <div id="trending">
            <ProductGrid productsPromise={trendingPromise} limit={8} />
        </div>
      </Section>

      <Ticker className="my-12" />

      <Section
        title="Full Edit"
        subtitle="Explore the complete collection"
        ctaHref="/products"
        ctaLabel="See all"
      >
        <ProductGrid productsPromise={allProductsPromise} limit={8} />
      </Section>

    </main>
  );
}
