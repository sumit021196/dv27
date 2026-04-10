import Link from "next/link";
import { productService } from "@/services/product.service";
import Section from "@/components/Section";
import ProductCard from "@/components/ProductCard";
import HeroSection from "@/components/ui/HeroSection";
import { getStaticClient } from "@/utils/supabase/static";
import Ticker from "@/components/ui/Ticker";
// import InstagramReels from "@/components/ui/InstagramReels";
import ProductGrid from "@/components/ProductGrid";
import CategoryGrid from "@/components/CategoryGrid";
import VideoReviews from "@/components/VideoReviews";
import TrustBar from "@/components/TrustBar";
import PromoGrid from "@/components/PromoGrid";

export const revalidate = 3600; // Cache for 1 hour

export default async function Page() {
  const supabase = getStaticClient();
  
  // Start fetches but don't await yet for sections we want to stream
  const trendingPromise = productService.getTrendingProducts(4, supabase);
  const newArrivalsPromise = productService.getNewArrivals(4, supabase);
  const videoReviewsPromise = productService.getVideoReviews(6, supabase);
  
  // Critical data for initial render (Banner, Settings) - still await these
  const [res, { data: settingsData }] = await Promise.all([
    supabase.from('banners').select('id, image_url, title, subtitle, position, is_active, style_type, link_url, cta_text').eq('is_active', true),
    supabase.from('settings').select('key, value')
  ]);
  
  const banners = res.data;
  const settings = settingsData?.reduce((acc: any, curr: any) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {}) || {};
  
  return (
    <main className="bg-background min-h-screen text-foreground transition-colors duration-500">
      <HeroSection banners={banners || []} />
      <TrustBar />
      <CategoryGrid />

      <Section
        title={settings.section_new_drops_title || "New Drops"}
        subtitle={settings.section_new_drops_subtitle || "Exclusive styles for the contemporary soul"}
        ctaHref="/products"
        ctaLabel="Shop the drop"
      >
        <ProductGrid productsPromise={newArrivalsPromise} limit={4} />
      </Section>

      <PromoGrid banners={banners || []} />

      <VideoReviews reviews={await videoReviewsPromise} />

      <Section
        title={settings.section_trending_title || "Trending"}
        subtitle={settings.section_trending_subtitle || "Pieces our community is loving"}
        ctaHref="/products"
        ctaLabel="View all"
      >
        <div id="trending">
            <ProductGrid productsPromise={trendingPromise} limit={4} />
        </div>
      </Section>

      <Ticker className="my-12" />

    </main>
  );
}
