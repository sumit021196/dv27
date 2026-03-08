"use client";
import { useEffect, useMemo, useState } from "react";
import { FALLBACK_IMG } from "@/utils/images";
import Link from "next/link";
import { useCart } from "./cart/CartContext";
import { MessageCircle } from "lucide-react";
import { fallback } from "@/utils/data";
import { productService } from "@/services/product.service";

type Product = {
  id: string | number;
  name: string;
  price: number;
  image_url?: string | null;
  media_url?: string | null;
  rating?: number | null;
  stock?: number | null;
  description?: string | null;
};

export default function ProductDetailClient({ id }: { id: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const cart = useCart();
  const [wished, setWished] = useState(false);

  useEffect(() => {
    const fetchOne = async () => {
      setLoading(true);
      try {
        const data = await productService.getProductById(id);
        if (!data) throw new Error("Not found");
        setProduct(data as unknown as Product);
      } catch {
        const fallbackItem = fallback.find((i) => String(i.id) === String(id));
        setProduct(fallbackItem ? (fallbackItem as unknown as Product) : null);
      } finally {
        setLoading(false);
      }
    };
    fetchOne();
  }, [id]);

  const src = product?.media_url || product?.image_url || "";
  const rating = product?.rating ?? 4.2;
  const stock = product?.stock ?? 12;

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-[4/5] bg-gray-100 rounded-2xl animate-pulse" />
          <div className="space-y-3">
            <div className="h-6 w-2/3 bg-gray-100 rounded animate-pulse" />
            <div className="h-4 w-1/3 bg-gray-100 rounded animate-pulse" />
            <div className="h-10 w-1/2 bg-gray-100 rounded animate-pulse" />
            <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <p className="text-sm text-gray-900">Product not found.</p>
        <Link className="mt-3 inline-block rounded-lg border px-4 py-2 text-sm" href="/products">Back to products</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="rounded-2xl border bg-white p-3">
          <Magnify src={src} alt={product.name} />
          <div className="mt-3 grid grid-cols-4 gap-2">
            {[src].filter(Boolean).map((s, i) => (
              <img key={i} src={s!} alt={`${product.name} ${i + 1}`} className="aspect-square object-cover rounded-lg border" />
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">{product.name}</h1>
            <button
              aria-label="Wishlist"
              onClick={() => setWished(v => !v)}
              className={`rounded-full border bg-white px-3 py-1 text-sm ${wished ? "text-brand-strong" : "text-gray-800"}`}
            >
              ♥
            </button>
          </div>
          <div className="mt-1 text-sm text-gray-900">{rating}★ · {stock > 0 ? "In stock" : "Out of stock"}</div>
          <div className="mt-3 text-brand-strong font-extrabold text-xl">₹{product.price}</div>

          <p className="mt-4 text-sm text-gray-900 leading-6">
            {product.description ?? "A premium personalized gift crafted with care. High-quality materials and elegant finish."}
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => cart.add({ id: product.id, name: product.name, price: product.price, image: src || undefined }, 1)}
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-brand/10 text-brand px-6 py-3.5 text-sm font-bold hover:bg-brand/20 transition-all active:scale-95"
            >
              Add to Cart
            </button>
            <a
              href={`https://wa.me/911234567890?text=${encodeURIComponent(
                `Hi, I want to buy *${product.name}* (ID: ${product.id}). Price: ₹${product.price}. Link: ${typeof window !== "undefined" ? window.location.href : ""}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] text-white px-8 py-3.5 text-sm font-bold hover:bg-[#20bd5a] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#25D366]/20"
            >
              <MessageCircle size={18} fill="currentColor" />
              Order via WhatsApp
            </a>
          </div>

          <div className="mt-8">
            <h2 className="text-sm font-semibold text-foreground">Reviews</h2>
            <div className="mt-2 space-y-3">
              <div className="rounded-lg border p-3 bg-white">
                <div className="text-sm font-medium">Aarav • 4.5★</div>
                <p className="text-sm text-gray-900">Great quality, arrived on time. Recommended.</p>
              </div>
              <div className="rounded-lg border p-3 bg-white">
                <div className="text-sm font-medium">Misha • 4★</div>
                <p className="text-sm text-gray-900">Looks classy and packaging was neat.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Magnify({ src, alt }: { src: string; alt: string }) {
  const [bgPos, setBgPos] = useState("center");
  const [hovered, setHovered] = useState(false);
  const safeSrc = src || FALLBACK_IMG;
  return (
    <div
      className="relative w-full overflow-hidden rounded-xl border"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setBgPos("center"); }}
      onMouseMove={(e) => {
        const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setBgPos(`${x}% ${y}%`);
      }}
      style={{
        backgroundImage: `url("${safeSrc}")`,
        backgroundSize: hovered ? "200%" : "cover",
        backgroundPosition: hovered ? bgPos : "center",
        aspectRatio: "4 / 5",
      }}
      aria-label={alt}
    />
  );
}
