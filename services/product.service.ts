import { createClient } from "@/utils/supabase/client";
import { Product, Category, IProductService } from "@/types/product";
import { fallback } from "@/utils/data";

export class ProductService implements IProductService {
    private getClient(supabase?: any) {
        if (supabase) return supabase;
        return createClient();
    }

    async getProducts(supabase?: any): Promise<Product[]> {
        const client = this.getClient(supabase);
        try {
            const { data, error } = await client
                .from("products")
                .select("*, categories(name), product_variants(*), product_images(*)")
                .limit(64);
            if (error || !data || data.length === 0) {
                return this.mapFallback(fallback);
            }
            return this.mapSupabaseData(data);
        } catch {
            return this.mapFallback(fallback);
        }
    }

    async getProductById(id: string | number, supabase?: any): Promise<Product | null> {
        const client = this.getClient(supabase);
        try {
            const { data, error } = await client
                .from("products")
                .select("*, categories(name), product_variants(*), product_images(*) ")
                .eq("id", id)
                .single();
            if (error || !data) throw error;
            return this.mapSupabaseData([data])[0];
        } catch {
            const fallbackItem = fallback.find((i) => String(i.id) === String(id));
            return fallbackItem ? this.mapFallback([fallbackItem])[0] : null;
        }
    }

    async getTrendingProducts(limit: number = 8, supabase?: any): Promise<Product[]> {
        const client = this.getClient(supabase);
        try {
            const { data, error } = await client
                .from("products")
                .select("id, name, price, media_url, rating, created_at, category_id")
                .eq("is_trending", true)
                .limit(limit);
            if (error || !data) return this.mapFallback(fallback.slice(0, limit));
            return this.mapSupabaseData(data);
        } catch {
            return this.mapFallback(fallback.slice(0, limit));
        }
    }

    async getNewArrivals(limit: number = 8, supabase?: any): Promise<Product[]> {
        const client = this.getClient(supabase);
        try {
            const { data, error } = await client
                .from("products")
                .select("id, name, price, media_url, rating, created_at, category_id")
                .order("created_at", { ascending: false })
                .limit(limit);
            if (error || !data) return this.mapFallback(fallback.slice(0, limit));
            return this.mapSupabaseData(data);
        } catch {
            return this.mapFallback(fallback.slice(0, limit));
        }
    }

    async getProductsForCards(limit: number = 8, supabase?: any): Promise<Product[]> {
        const client = this.getClient(supabase);
        try {
            const { data, error } = await client
                .from("products")
                .select("id, name, price, media_url, rating, created_at, category_id")
                .limit(limit);
            if (error || !data) return this.mapFallback(fallback.slice(0, limit));
            return this.mapSupabaseData(data);
        } catch {
            return this.mapFallback(fallback.slice(0, limit));
        }
    }

    async getMinimalProducts(ids: (string | number)[], supabase?: any): Promise<Product[]> {
        const client = this.getClient(supabase);
        try {
            const { data, error } = await client
                .from("products")
                .select("id, name, price, media_url")
                .in("id", ids);
            if (error || !data) return [];
            return this.mapSupabaseData(data);
        } catch {
            return [];
        }
    }

    async getCategories(supabase?: any): Promise<Category[]> {
        const client = this.getClient(supabase);
        try {
            const { data: catWithProds, error: joinError } = await client
                .from("categories")
                .select("id, name, slug");

            if (joinError || !catWithProds) return [];

            return catWithProds.map((c: any) => ({
                id: c.id,
                name: c.name,
                slug: c.slug
            }));
        } catch {
            return [];
        }
    }
    async createCategory(name: string, slug: string, supabase?: any): Promise<Category | null> {
        const client = this.getClient(supabase);
        try {
            const { data, error } = await client
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
            variants: d.product_variants || [],
            images: d.product_images
                ? d.product_images
                    .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
                    .map((img: any) => img.image_url)
                : []
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

export const productService = new ProductService();
