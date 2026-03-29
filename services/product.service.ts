import { createClient } from "@/utils/supabase/client";
import { Product, Category, IProductService } from "@/types/product";
import { fallback } from "@/utils/data";

export class ProductService implements IProductService {
    private supabase = createClient();

    async getProducts(): Promise<Product[]> {
        try {
            const { data, error } = await this.supabase
                .from("products")
                .select("*, categories(name), product_variants(*)")
                .limit(64);
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
            const { data, error } = await this.supabase
                .from("products")
                .select("*, categories(name), product_variants(*)")
                .eq("id", id)
                .single();
            if (error || !data) throw error;
            return this.mapSupabaseData([data])[0];
        } catch {
            const fallbackItem = fallback.find((i) => String(i.id) === String(id));
            return fallbackItem ? this.mapFallback([fallbackItem])[0] : null;
        }
    }

    async getTrendingProducts(limit: number = 8): Promise<Product[]> {
        try {
            const { data, error } = await this.supabase
                .from("products")
                .select("*, categories(name), product_variants(*)")
                .limit(limit);
            if (error || !data) return this.mapFallback(fallback.slice(0, limit));
            return this.mapSupabaseData(data);
        } catch {
            return this.mapFallback(fallback.slice(0, limit));
        }
    }

    async getNewArrivals(limit: number = 8): Promise<Product[]> {
        try {
            const { data, error } = await this.supabase
                .from("products")
                .select("*, categories(name), product_variants(*)")
                .order("created_at", { ascending: false })
                .limit(limit);
            if (error || !data) return this.mapFallback(fallback.slice(0, limit));
            return this.mapSupabaseData(data);
        } catch {
            return this.mapFallback(fallback.slice(0, limit));
        }
    }

    async getProductsForCards(limit: number = 8): Promise<Product[]> {
        try {
            const { data, error } = await this.supabase
                .from("products")
                .select("id, name, price, media_url, created_at")
                .limit(limit);
            if (error || !data) return this.mapFallback(fallback.slice(0, limit));
            return this.mapSupabaseData(data);
        } catch {
            return this.mapFallback(fallback.slice(0, limit));
        }
    }

    async getCategories(): Promise<Category[]> {
        try {
            // Fetch categories that have at least one product
            const { data, error } = await this.supabase
                .from("categories")
                .select("id, name, slug")
                .not("id", "is", null); // Placeholder for logic "at least one product" if needed via join, but simple fetch for now

            // More accurate: categories JOIN products
            const { data: catWithProds, error: joinError } = await this.supabase
                .from("categories")
                .select("id, name, slug, products!inner(id)");

            if (joinError || !catWithProds) return [];

            // Remove duplicates (Supabase might return multiple rows if not careful with inner join)
            const uniqueCats = Array.from(new Map(catWithProds.map(c => [c.id, c])).values());

            return uniqueCats.map(c => ({
                id: c.id,
                name: c.name,
                slug: c.slug
            }));
        } catch {
            return [];
        }
    }

    async createCategory(name: string, slug: string): Promise<Category | null> {
        try {
            const { data, error } = await this.supabase
                .from("categories")
                .insert([{ name, slug }])
                .select()
                .single();
            if (error || !data) return null;
            return data as Category;
        } catch {
            return null;
        }
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
            category_id: d.category_id || undefined,
            category_name: d.categories?.name || d.category || undefined,
            description: d.description || undefined,
            variants: d.product_variants || []
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
            description: d.description,
            variants: d.variants || []
        }));
    }
}

// Singleton instance for client-side usage if needed, or instantiate per request on server.
export const productService = new ProductService();
