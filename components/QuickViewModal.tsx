"use client";

type Product = {
  id: string | number;
  name: string;
  price: number;
  image_url?: string;
  media_url?: string;
  mediaUrl?: string;
  rating?: number;
  size?: string;
};

export default function QuickViewModal({
  open,
  onClose,
  product,
}: {
  open: boolean;
  onClose: () => void;
  product: Product | null;
}) {
  if (!open || !product) return null;
  const media = product.media_url || product.image_url || product.mediaUrl || "";
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />
      <div className="absolute inset-x-0 top-10 mx-auto w-[92%] max-w-xl rounded-2xl bg-white shadow-2xl border overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="bg-gray-100">
            {media.endsWith(".mp4") ? (
              <video src={media} controls className="w-full h-full object-cover" />
            ) : (
              <img src={media} alt={product.name} className="w-full h-full object-cover" />
            )}
          </div>
          <div className="p-5">
            <h3 className="text-lg font-bold text-foreground">{product.name}</h3>
            <p className="mt-1 text-brand-strong font-semibold">₹{product.price}</p>
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-900">
              {product.size ? <span>Size: {product.size}</span> : null}
              {product.rating ? <span>• {product.rating}★</span> : null}
            </div>
            <div className="mt-5 flex gap-3">
              <button className="flex-1 rounded-lg bg-brand text-white px-4 py-2.5 font-semibold hover:bg-brand-strong transition">
                Add to cart
              </button>
              <button
                onClick={onClose}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
