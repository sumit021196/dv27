export type Item = {
    id: string | number;
    name: string;
    slug?: string;
    price: number;
    media_url?: string;
    created_at?: string;
    size?: string;
    rating?: number;
};
export const fallback: (Item & { category?: string; description?: string })[] = [
    { id: 1, name: "Premium Linen Blazer", slug: "premium-linen-blazer", price: 4999, media_url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1200&auto=format&fit=crop", size: "L", rating: 4.8, category: "Outerwear", description: "Tailored linen blazer for a sophisticated look. Breathable and timeless." },
    { id: 2, name: "Oversized Cotton Tee", slug: "oversized-cotton-tee", price: 1299, media_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1200&auto=format&fit=crop", size: "M", rating: 4.6, category: "Tops", description: "Premium heavyweight cotton tee with a relaxed fit. Everyday essential." },
    { id: 3, name: "Vegan Leather Handbag", slug: "vegan-leather-handbag", price: 3499, media_url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1200&auto=format&fit=crop", size: "M", rating: 4.7, category: "Accessories", description: "Minimalist vegan leather handbag with gold-tone hardware." },
    { id: 4, name: "Silk Wrap Dress", slug: "silk-wrap-dress", price: 5999, media_url: "https://images.unsplash.com/photo-1539008835279-43468093d223?q=80&w=1200&auto=format&fit=crop", size: "S", rating: 4.9, category: "Dresses", description: "Elegant 100% silk wrap dress with a subtle floral print." },
    { id: 5, name: "Straight Leg Denims", slug: "straight-leg-denims", price: 2999, media_url: "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=1200&auto=format&fit=crop", size: "32", rating: 4.5, category: "Bottoms", description: "Classic mid-wash denim with a contemporay straight-leg cut." },
    { id: 6, name: "Cashmere Turtleneck", slug: "cashmere-turtleneck", price: 6999, media_url: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1200&auto=format&fit=crop", size: "M", rating: 4.9, category: "Knitwear", description: "Ultra-soft premium cashmere turtleneck for ultimate comfort." },
    { id: 7, name: "Minimalist Watch", slug: "minimalist-watch", price: 8999, media_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop", size: "One Size", rating: 4.4, category: "Accessories", description: "Sleek matte black watch with a genuine leather strap." },
    { id: 8, name: "Linen Lounge Trousers", slug: "linen-lounge-trousers", price: 2499, media_url: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=1200&auto=format&fit=crop", size: "M", rating: 4.3, category: "Bottoms", description: "Relaxed linen trousers for a laid-back summer aesthetic." },
    { id: 9, name: "Chelsea Boots", slug: "chelsea-boots", price: 7499, media_url: "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?q=80&w=1200&auto=format&fit=crop", size: "42", rating: 4.7, category: "Footwear", description: "Handcrafted suede chelsea boots with a durable rubber sole." },
    { id: 10, name: "Wool Overcoat", slug: "wool-overcoat", price: 12999, media_url: "https://images.unsplash.com/photo-1539533377285-a92141974615?q=80&w=1200&auto=format&fit=crop", size: "L", rating: 4.9, category: "Outerwear", description: "Premium wool blend overcoat. A staple for the colder months." },
];

