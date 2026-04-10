"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createProductAction(formData: {
    name: string;
    price: number;
    original_price?: number;
    description?: string | null;
    category?: string | null;
    category_id?: string | null;
    imageUrls?: string[];
    videoUrl?: string | null;
    variants?: string | null; // JSON string of { size, color, stock, sku }
    details?: string | null; // JSON string of dynamic key-value pairs
}) {
    try {
        console.log("--- createProductAction Start ---");
        console.log("FormData Name:", formData.name);
        console.log("Images count:", formData.imageUrls?.length || 0);
        console.log("Video present:", !!formData.videoUrl);

        const supabase = await createClient(true); // Create admin client

        const finalImageUrls = formData.imageUrls || [];
        const finalVideoUrl = formData.videoUrl || null;

        // 3. Insert into Database
        const mainMediaUrl = finalImageUrls.length > 0 ? finalImageUrls[0] : null;

        console.log("Inserting into products table...");
        const { data: productData, error: dbError } = await supabase
            .from('products')
            .insert([{
                name: formData.name,
                slug: formData.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Math.random().toString(36).substring(7),
                price: formData.price,
                original_price: formData.original_price || null,
                description: formData.description || null,
                category_id: formData.category_id || null,
                media_url: mainMediaUrl,
                video_url: finalVideoUrl,
                stock: 10,
                is_active: true,
                rating: 4.5,
                details: formData.details ? JSON.parse(formData.details) : {}
            }])
            .select()
            .single();

        if (dbError) {
            console.error("Database Insert Error (Products):", dbError);
            throw dbError;
        }
        
        const productId = productData.id;
        console.log("Product Inserted with ID:", productId);

        // 4. Insert extra images into product_images
        if (finalImageUrls.length > 0) {
            const imageInserts = finalImageUrls.map((url, idx) => ({
                product_id: productId,
                image_url: url,
                display_order: idx
            }));
            const { error: imgError } = await supabase.from('product_images').insert(imageInserts);
            if (imgError) console.error("Error inserting multiple images (Logged and continuing):", imgError);
        }

        // 5. Insert Variants
        if (formData.variants) {
            try {
                const parsedVariants = JSON.parse(formData.variants);
                if (Array.isArray(parsedVariants) && parsedVariants.length > 0) {
                    const variantInserts = parsedVariants.map((v: any) => ({
                        product_id: productId,
                        color: v.color || null,
                        size: v.size || null,
                        stock: Number(v.stock) || 0,
                        sku: v.sku || null
                    }));
                    const { error: varError } = await supabase.from('product_variants').insert(variantInserts);
                    if (varError) console.error("Error inserting variants (Logged and continuing):", varError);
                }
            } catch (jsonErr) {
                console.error("Failed to parse variants JSON:", jsonErr);
            }
        }

        revalidatePath("/admin/products");
        revalidatePath("/");

        console.log("--- createProductAction Success ---");
        return { success: true };
    } catch (error: any) {
        console.error("--- createProductAction Error ---", error);
        return {
            success: false,
            error: error.message || "An unexpected error occurred while creating the product."
        };
    }
}
