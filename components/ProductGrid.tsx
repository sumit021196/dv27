import { Suspense } from "react";
import ProductCard from "./ProductCard";
import Skeleton from "./ui/Skeleton";

interface ProductGridProps {
    productsPromise: Promise<any[]>;
    limit?: number;
}

function ProductGridSkeleton({ count = 4 }: { count?: number }) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-8">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="flex flex-col gap-4">
                    <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-3/4 mx-auto" />
                        <Skeleton className="h-4 w-1/4 mx-auto" />
                    </div>
                </div>
            ))}
        </div>
    );
}

async function ProductGridContent({ productsPromise, limit }: ProductGridProps) {
    const products = await productsPromise;
    const finalProducts = limit ? products.slice(0, limit) : products;

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-8">
            {finalProducts.map((p) => (
                <ProductCard key={p.id} product={{ 
                    id: p.id, 
                    name: p.name, 
                    price: p.price, 
                    original_price: p.original_price, 
                    rating: p.rating,
                    mediaUrl: p.media_url 
                }} />
            ))}
        </div>
    );
}

export default function ProductGrid({ productsPromise, limit = 8 }: ProductGridProps) {
    return (
        <Suspense fallback={<ProductGridSkeleton count={Math.min(limit, 4)} />}>
            <ProductGridContent productsPromise={productsPromise} limit={limit} />
        </Suspense>
    );
}
