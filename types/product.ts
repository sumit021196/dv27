export interface Product {
    id: string | number;
    name: string;
    price: number;
    media_url?: string;
    created_at?: string;
    size?: string;
    rating?: number;
    category?: string;
    description?: string;
}

export interface IProductService {
    getProducts(): Promise<Product[]>;
    getProductById(id: string | number): Promise<Product | null>;
    getTrendingProducts(): Promise<Product[]>;
    getNewArrivals(): Promise<Product[]>;
}
