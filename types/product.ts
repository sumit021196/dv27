export interface Category {
    id: string;
    name: string;
    slug: string;
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
    media_url?: string;
    created_at?: string;
    size?: string;
    rating?: number;
    category_id?: string;
    category_name?: string;
    description?: string;
    variants?: ProductVariant[];
    images?: string[];
    details?: Record<string, string>;
}

export interface IProductService {
    getProducts(): Promise<Product[]>;
    getProductById(id: string | number): Promise<Product | null>;
    getTrendingProducts(): Promise<Product[]>;
    getNewArrivals(): Promise<Product[]>;
    getCategories(): Promise<Category[]>;
    createCategory(name: string, slug: string): Promise<Category | null>;
}
