import { productService } from "@/services/product.service";
import { Package } from "lucide-react";
import { ProductsManagement } from "@/components/admin/ProductsManagement";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
    const supabase = await createClient();
    const products = await productService.getProducts(true, supabase);
    
    // Initial sort
    const sortedProducts = products.sort((a, b) => 
        new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    );

    return (
        <div className="flex flex-col min-h-0">
            <div className="mb-8">
                <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl lg:text-3xl flex items-center gap-3">
                    <Package className="text-blue-600 h-6 w-6 lg:h-8 lg:w-8" />
                    Product Catalog
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-gray-500">
                    Manage your items, pricing, and visibility.
                </p>
            </div>

            <ProductsManagement initialProducts={sortedProducts} />
        </div>
    );
}
