export type Item = {
    id: string | number;
    name: string;
    price: number;
    media_url?: string;
    created_at?: string;
    size?: string;
    rating?: number;
};

export const fallback: (Item & { category?: string; description?: string })[] = [
    { id: 1, name: "Personalized Photo Mug", price: 399, media_url: "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=1200&auto=format&fit=crop", size: "M", rating: 4.2, category: "Mugs", description: "A beautiful personalized photo mug to start your day right." },
    { id: 2, name: "Custom Cushion", price: 699, media_url: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=1200&auto=format&fit=crop", size: "L", rating: 4.6, category: "Cushions", description: "Soft and comfortable custom cushion with your favorite memories." },
    { id: 3, name: "Engraved Keychain", price: 249, media_url: "https://images.unsplash.com/photo-1519241047957-be31d7379a5d?q=80&w=1200&auto=format&fit=crop", size: "S", rating: 4.0, category: "Accessories", description: "Durable engraved keychain, perfect for personal use or gifting." },
    { id: 4, name: "Couple Frame", price: 899, media_url: "https://images.unsplash.com/photo-1458400411386-5ae465c4e57e?q=80&w=1200&auto=format&fit=crop", size: "L", rating: 4.7, category: "Frames", description: "Elegant couple frame to hold your most precious moments together." },
    { id: 5, name: "Birthday Hamper", price: 1499, media_url: "https://images.unsplash.com/photo-1520975898319-53b3b5f3a031?q=80&w=1200&auto=format&fit=crop", size: "L", rating: 4.3, category: "Hampers", description: "A delightful birthday hamper full of surprises for your loved ones." },
    { id: 6, name: "LED Bottle Lamp", price: 799, media_url: "https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?q=80&w=1200&auto=format&fit=crop", size: "M", rating: 4.1, category: "Lamps", description: "Warm and cozy LED bottle lamp to light up your space." },
    { id: 7, name: "Custom Notebook", price: 349, media_url: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?q=80&w=1200&auto=format&fit=crop", size: "S", rating: 3.9, category: "Stationery", description: "High-quality custom notebook for all your thoughts and ideas." },
    { id: 8, name: "Name Pendant", price: 599, media_url: "https://images.unsplash.com/photo-1520975968319-29ae5b5f3a01?q=80&w=1200&auto=format&fit=crop", size: "S", rating: 4.4, category: "Jewelry", description: "Beautifully crafted name pendant, a perfect personalized gift." },
    { id: 9, name: "Mini Photo Book", price: 499, media_url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop", size: "M", rating: 4.2, category: "Books", description: "Compact mini photo book to carry your memories wherever you go." },
    { id: 10, name: "Travel Sipper", price: 449, media_url: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1200&auto=format&fit=crop", size: "M", rating: 4.0, category: "Accessories", description: "Durable travel sipper to keep you hydrated on the go." },
];
