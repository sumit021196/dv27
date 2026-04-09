export interface Category {
    id: string;
    name: string;
    slug: string;
    is_active: boolean;
    created_at?: string;
}

export interface ProductVariant {
    id: string;
    product_id?: string | number;
    color?: string | null;
    size?: string | null;
    stock?: number;
    sku?: string | null;
}

export interface Product {
    id: string | number;
    name: string;
    price: number;
    original_price?: number;
    description?: string;
    slug: string;
    is_active: boolean;
    is_trending: boolean;
    media_url?: string;
    video_url?: string;
    created_at?: string;
    size?: string;
    rating?: number;
    category_id?: string;
    category_name?: string;
    variants?: ProductVariant[];
    product_variants?: ProductVariant[];
    images?: string[];
    product_images?: { image_url: string }[];
    details?: Record<string, string>;
}

export interface IProductService {
    getProducts(includeInactive?: boolean, supabase?: any): Promise<Product[]>;
    getProductById(id: string | number, supabase?: any): Promise<Product | null>;
    getTrendingProducts(supabase?: any): Promise<Product[]>;
    getNewArrivals(supabase?: any): Promise<Product[]>;
    getCategories(includeInactive?: boolean, supabase?: any): Promise<Category[]>;
    createCategory(name: string, slug: string, supabase?: any): Promise<Category | null>;
}
