import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { getOptimizedImageUrl } from "@/utils/images";

export default function PromoGrid({ banners = [] }: { banners: any[] }) {
  // Filter for promo banners
  const promoBanners = banners.filter(b => b.position?.startsWith('promo')).sort((a,b) => a.position.localeCompare(b.position));

  if (promoBanners.length === 0) return null;

  return (
    <section className="py-12 bg-background">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
          {promoBanners.map((banner, idx) => (
            <Link 
              key={banner.id || idx}
              href={banner.link_url || "/products"}
              className="group relative overflow-hidden rounded-[2.5rem] bg-muted aspect-[16/9] md:aspect-[21/9] border border-foreground/5 shadow-2xl"
            >
              {banner.style_type === 'video' || banner.image_url?.match(/\.(mp4|webm|ogg|mov)$|^https:\/\/res\.cloudinary\.com\/.*\/video\/upload\//) ? (
                <video 
                  src={banner.image_url} 
                  autoPlay 
                  muted 
                  loop 
                  playsInline
                  className="object-cover w-full h-full transition-transform duration-1000 group-hover:scale-110"
                />
              ) : (
                <Image
                  src={getOptimizedImageUrl(banner.image_url)}
                  alt={banner.title || "Promotion"}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                />
              )}
              {/* Glass Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-8 md:p-12 flex flex-col justify-end">
                <div className="transform transition-transform duration-500 group-hover:-translate-y-2">
                  <h3 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none mb-3">
                    {banner.title}
                  </h3>
                  <p className="text-sm md:text-lg text-white/70 font-bold uppercase tracking-widest flex items-center gap-3">
                    {banner.subtitle || "Shop the latest arrivals"}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </p>
                </div>
              </div>
              
              {/* Animated Corner accent */}
              <div className="absolute top-0 right-0 p-8">
                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <ArrowRight className="text-white" size={20} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
