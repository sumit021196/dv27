import { createClient } from "@/utils/supabase/client";
import { Product, Category, IProductService } from "@/types/product";
import { fallback } from "@/utils/data";

export class ProductService implements IProductService {
    private getClient(supabase?: any) {
        if (supabase) return supabase;
        return createClient();
    }

    async getProducts(includeInactive = false, supabase?: any): Promise<Product[]> {
        const client = this.getClient(supabase);
        try {
            let query = client
                .from("products")
                .select("*, categories!inner(name, id, is_active), product_variants(*), product_images(*)");
            
            if (!includeInactive) {
                query = query
                    .eq("is_active", true)
                    .eq("categories.is_active", true);
            }
            
            const { data, error } = await query.limit(100);
            
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
                .select("*, categories!inner(name, is_active), product_variants(*), product_images(*) ")
                .eq("id", id)
                .eq("is_active", true)
                .eq("categories.is_active", true)
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
                .select("id, name, price, original_price, media_url, rating, created_at, category_id, categories!inner(is_active)")
                .eq("is_active", true)
                .eq("is_trending", true)
                .eq("categories.is_active", true)
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
                .select("id, name, price, original_price, media_url, rating, created_at, category_id, categories!inner(is_active)")
                .eq("is_active", true)
                .eq("categories.is_active", true)
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
                .select("id, name, price, original_price, media_url, rating, created_at, category_id, categories!inner(is_active)")
                .eq("is_active", true)
                .eq("categories.is_active", true)
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

    async getCategories(includeInactive = false, supabase?: any): Promise<Category[]> {
        const client = this.getClient(supabase);
        try {
            let query = client
                .from("categories")
                .select("id, name, slug, is_active");
            
            if (!includeInactive) {
                query = query.eq("is_active", true);
            }

            const { data: catWithProds, error: joinError } = await query;

            if (joinError || !catWithProds) return [];

            return catWithProds.map((c: any) => ({
                id: c.id,
                name: c.name,
                slug: c.slug,
                is_active: c.is_active
            }));
        } catch {
            return [];
        }
    }

    async getReviewsByProductId(productId: string | number, supabase?: any): Promise<any[]> {
        const client = this.getClient(supabase);
        try {
            const { data, error } = await client
                .from("reviews")
                .select("*, review_images(image_url)")
                .eq("product_id", productId)
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error("Error fetching reviews:", error);
            return [];
        }
    }

    async getFilteredProducts(options: { 
        category?: string; 
        search?: string; 
        limit?: number; 
        offset?: number 
    }, supabase?: any): Promise<Product[]> {
        const client = this.getClient(supabase);
        try {
            let query = client
                .from("products")
                .select("*, categories!inner(name, slug, is_active), product_variants(*), product_images(*)")
                .eq("is_active", true)
                .eq("categories.is_active", true);

            if (options.category && options.category !== 'all') {
                query = query.eq("categories.slug", options.category);
            }

            if (options.search) {
                query = query.ilike('name', `%${options.search}%`);
            }

            const limit = options.limit || 12;
            const offset = options.offset || 0;
            
            query = query
                .order("created_at", { ascending: false })
                .range(offset, offset + limit - 1);

            const { data, error } = await query;
            if (error || !data) return [];
            return this.mapSupabaseData(data);
        } catch (err) {
            console.error("Filter error:", err);
            return [];
        }
    }

    async getCategoryBySlug(slug: string, supabase?: any): Promise<Category | null> {
        const client = this.getClient(supabase);
        try {
            const { data, error } = await client
                .from("categories")
                .select("*")
                .eq("slug", slug)
                .single();
            if (error || !data) return null;
            return data as Category;
        } catch {
            return null;
        }
    }

    async submitReview(formData: FormData): Promise<{ success: boolean; error?: string }> {
        try {
            const response = await fetch('/api/reviews', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to submit review');
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
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
            original_price: d.original_price,
            media_url: d.media_url || d.image_url || undefined,
            video_url: d.video_url || undefined,
            created_at: d.created_at || undefined,
            size: d.size || undefined,
            rating: d.rating || 4,
            slug: d.slug || d.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || `p-${d.id}`,
            is_active: d.is_active ?? true,
            is_trending: d.is_trending ?? false,
            category_id: d.category_id || undefined,
            category_name: d.categories?.name || d.category || undefined,
            description: d.description || undefined,
            details: d.details || undefined,
            variants: d.product_variants || [],
            product_variants: d.product_variants || [],
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
            slug: d.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            is_active: true,
            is_trending: false,
            rating: d.rating,
            category_name: d.category,
            description: d.description,
            variants: d.variants || []
        }));
    }
}

export const productService = new ProductService();
