import Link from "next/link";
import Section from "@/components/Section";
import ProductCard from "@/components/ProductCard";
import HeroSection from "@/components/ui/HeroSection";

import { productService } from "@/services/product.service";

export default async function Page() {
  const trending = await productService.getTrendingProducts();
  const newArrivals = await productService.getNewArrivals();
  const allProducts = await productService.getProducts();

  return (
    <main className="bg-gray-50 min-h-screen">

      <HeroSection />

      <Section
        title="New Arrivals"
        subtitle="Freshly added wardrobe staples"
        ctaHref="/products"
        ctaLabel="Shop all"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {newArrivals.map((p) => (
            <ProductCard key={p.id} product={{ id: p.id, name: p.name, price: p.price, mediaUrl: p.media_url }} />
          ))}
        </div>
      </Section>

      <Section
        title="Trending Now"
        subtitle="Pieces our community is loving"
        ctaHref="/products"
        ctaLabel="Browse more"
      >
        <div id="trending" className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {trending.map((p) => (
            <ProductCard key={p.id} product={{ id: p.id, name: p.name, price: p.price, mediaUrl: p.media_url }} />
          ))}
        </div>
      </Section>

      <Section
        title="All Products"
        subtitle="The full edit"
        ctaHref="/products"
        ctaLabel="See catalog"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {allProducts.slice(0, 8).map((p) => (
            <ProductCard key={p.id} product={{ id: p.id, name: p.name, price: p.price, mediaUrl: p.media_url }} />
          ))}
        </div>
      </Section>

      <footer className="border-t border-gray-200 bg-white mt-12">
        <div className="mx-auto max-w-6xl px-4 py-8 flex flex-col items-center justify-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} DV27. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
