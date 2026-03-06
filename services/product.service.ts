import { createClient } from "@/utils/supabase/client";
import { Product, IProductService } from "@/types/product";
import { fallback } from "@/utils/data";

export class ProductService implements IProductService {
    private supabase = createClient();

    async getProducts(): Promise<Product[]> {
        try {
            const { data, error } = await this.supabase.from("products").select("*").limit(64);
            if (error || !data || data.length === 0) {
                return this.mapFallback(fallback);
            }
            return this.mapSupabaseData(data);
        } catch {
            return this.mapFallback(fallback);
        }
    }

    async getProductById(id: string | number): Promise<Product | null> {
        try {
            const { data, error } = await this.supabase.from("products").select("*").eq("id", id).single();
            if (error || !data) throw error;
            return this.mapSupabaseData([data])[0];
        } catch {
            const fallbackItem = fallback.find((i) => String(i.id) === String(id));
            return fallbackItem ? this.mapFallback([fallbackItem])[0] : null;
        }
    }

    async getTrendingProducts(): Promise<Product[]> {
        const products = await this.getProducts();
        // Simulate trending logic safely using mock/fallback for now if needed.
        // Assuming fallback data has trending items (mock logic)
        return products.slice(0, 8); // Simplification for UI focus
    }

    async getNewArrivals(): Promise<Product[]> {
        const products = await this.getProducts();
        return [...products]
            .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
            .slice(0, 8);
    }

    private mapSupabaseData(data: any[]): Product[] {
        return data.map(d => ({
            id: d.id,
            name: d.name,
            price: d.price,
            media_url: d.media_url || d.image_url || undefined,
            created_at: d.created_at || undefined,
            size: d.size || undefined,
            rating: d.rating || 4,
            category: d.category || undefined,
            description: d.description || undefined
        }));
    }

    private mapFallback(data: any[]): Product[] {
        return data.map(d => ({
            id: d.id,
            name: d.name,
            price: d.price,
            media_url: d.media_url,
            created_at: d.created_at,
            size: d.size,
            rating: d.rating,
            category: d.category,
            description: d.description
        }));
    }
}

// Singleton instance for client-side usage if needed, or instantiate per request on server.
export const productService = new ProductService();
