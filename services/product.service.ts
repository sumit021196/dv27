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
                .select(`
                    *,
                    categories(name, id, is_active),
                    product_categories(categories(name, id, is_active)),
                    product_images(*),
                    product_variants(*)
                `);
            
            if (!includeInactive) {
                query = query.eq("is_active", true);
            }
            
            const { data, error } = await query.limit(100);
            
            if (error) {
                console.error("Supabase getProducts Error:", error.message, error.details);
                return this.mapFallback(fallback);
            }

            if (!data || data.length === 0) return [];
            return this.mapSupabaseData(data);
        } catch (err) {
            console.error("getProducts Exception:", err);
            return this.mapFallback(fallback);
        }
    }

    async getProductById(idOrSlug: string | number, supabase?: any): Promise<Product | null> {
        const client = this.getClient(supabase);
        try {
            const isNumeric = !isNaN(Number(idOrSlug)) && typeof idOrSlug !== 'string' || (typeof idOrSlug === 'string' && /^\d+$/.test(idOrSlug));
            
            let query = client
                .from("products")
                .select(`
                    *,
                    categories(name, id, is_active),
                    product_categories(categories(name, id, is_active)),
                    product_images(*),
                    product_variants(*)
                `);
            
            if (isNumeric) {
                query = query.eq("id", idOrSlug);
            } else {
                query = query.eq("slug", idOrSlug);
            }

            const { data, error } = await query
                .eq("is_active", true)
                .single();

            if (error || !data) throw error;
            return this.mapSupabaseData([data])[0];
        } catch (err) {
            console.error("getProductById Error:", err);
            const fallbackItem = fallback.find((i) => String(i.id) === String(idOrSlug) || String(i.slug) === String(idOrSlug));
            return fallbackItem ? this.mapFallback([fallbackItem])[0] : null;
        }
    }

    async getTrendingProducts(limit: number = 8, supabase?: any): Promise<Product[]> {
        const client = this.getClient(supabase);
        try {
            const { data, error } = await client
                .from("products")
                .select("id, name, price, original_price, media_url, rating, created_at, category_id, categories(name, id), product_categories(categories(name, id))")
                .eq("is_active", true)
                .eq("is_trending", true)
                .limit(limit);
            if (error || !data) return this.mapFallback(fallback.slice(0, limit));
            return this.mapSupabaseData(data);
        } catch (err) {
            console.error("getTrendingProducts Error:", err);
            return this.mapFallback(fallback.slice(0, limit));
        }
    }

    async getNewArrivals(limit: number = 8, supabase?: any): Promise<Product[]> {
        const client = this.getClient(supabase);
        try {
            const { data, error } = await client
                .from("products")
                .select("id, name, price, original_price, media_url, rating, created_at, category_id, categories(name, id), product_categories(categories(name, id))")
                .eq("is_active", true)
                .order("created_at", { ascending: false })
                .limit(limit);
            if (error || !data) return this.mapFallback(fallback.slice(0, limit));
            return this.mapSupabaseData(data);
        } catch (err) {
            console.error("getNewArrivals Error:", err);
            return this.mapFallback(fallback.slice(0, limit));
        }
    }

    async getProductsForCards(limit: number = 8, supabase?: any): Promise<Product[]> {
        const client = this.getClient(supabase);
        try {
            const { data, error } = await client
                .from("products")
                .select("id, name, price, original_price, media_url, rating, created_at, category_id, categories(name, id), product_categories(categories(name, id))")
                .eq("is_active", true)
                .limit(limit);
            if (error || !data) return this.mapFallback(fallback.slice(0, limit));
            return this.mapSupabaseData(data);
        } catch (err) {
            console.error("getProductsForCards Error:", err);
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
        } catch (err) {
            console.error("getMinimalProducts Error:", err);
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

            const { data, error } = await query;

            if (error) {
                console.error("Supabase Error fetching categories:", error.message);
                throw error;
            }

            if (!data) return [];

            return data.map((c: any) => ({
                id: c.id,
                name: c.name,
                slug: c.slug,
                is_active: c.is_active
            }));
        } catch (error) {
            console.error("Failed to fetch categories:", error);
            throw error;
        }
    }

    async getReviewsByProductId(productId: string | number, supabase?: any): Promise<any[]> {
        const client = this.getClient(supabase);
        try {
            const { data, error } = await client
                .from("reviews")
                .select("*, review_media(media_url, media_type)")
                .eq("product_id", productId)
                .eq("status", "approved")
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error("Error fetching reviews:", error);
            return [];
        }
    }

    async getVideoReviews(limit: number = 6, supabase?: any): Promise<any[]> {
        const client = this.getClient(supabase);
        try {
            const { data, error } = await client
                .from("reviews")
                .select(`
                    *,
                    products ( name, id ),
                    profiles ( full_name ),
                    review_media!inner ( media_url, media_type )
                `)
                .eq("status", "approved")
                .eq("review_media.media_type", "video")
                .order("created_at", { ascending: false })
                .limit(limit);
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error("Error fetching video reviews:", error);
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
            let query;
            if (options.category && options.category !== 'all') {
                query = client
                    .from("products")
                    .select("*, product_categories!inner(categories!inner(name, slug, is_active)), product_images(*), product_variants(*)")
                    .eq("is_active", true)
                    .eq("product_categories.categories.slug", options.category)
                    .eq("product_categories.categories.is_active", true);
            } else {
                query = client
                    .from("products")
                    .select("*, categories(name, id, is_active), product_categories(categories(name, id, is_active)), product_images(*), product_variants(*)")
                    .eq("is_active", true);
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
            if (error) {
                console.error("getFilteredProducts Query Error:", error.message);
                return [];
            }
            if (!data) return [];
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
        } catch (err) {
            console.error("getCategoryBySlug Error:", err);
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
        } catch (err) {
            console.error("createCategory Error:", err);
            return null;
        }
    }

    private mapSupabaseData(data: any[]): Product[] {
        return data.map(d => {
            const junctionCategories = d.product_categories?.map((pc: any) => pc.categories).filter(Boolean) || [];
            const primaryCategoryName = d.categories?.name || (junctionCategories.length > 0 ? junctionCategories[0].name : d.category);

            return {
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
                category_name: primaryCategoryName || undefined,
                description: d.description || undefined,
                details: d.details || undefined,
                variants: d.product_variants || [],
                product_variants: d.product_variants || [],
                images: d.product_images
                    ? d.product_images
                        .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
                        .map((img: any) => img.image_url)
                    : []
            };
        });
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
