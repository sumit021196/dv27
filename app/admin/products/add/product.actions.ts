"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createProductAction(formData: {
    name: string;
    price: number;
    description?: string | null;
    category?: string | null;
    category_id?: string | null;
    images?: File[];
    video?: File | null;
    variants?: string | null; // JSON string of { size, color, stock, sku }
}) {
    try {
        const supabase = await createClient(true); // Create admin client

        let finalVideoUrl = null;
        let finalImageUrls: string[] = [];

        // 1. Upload Video if provided
        if (formData.video && formData.video.size > 0) {
            const file = formData.video;
            const fileExt = file.name.split('.').pop();
            const fileName = `vid_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from('products')
                .upload(fileName, file, { cacheControl: '3600', upsert: false });

            if (uploadError) throw uploadError;
            const { data: urlData } = supabase.storage.from('products').getPublicUrl(fileName);
            finalVideoUrl = urlData.publicUrl;
        }

        // 2. Upload Images if provided
        if (formData.images && formData.images.length > 0) {
            for (const file of formData.images) {
                if (file.size > 0) {
                    const fileExt = file.name.split('.').pop();
                    const fileName = `img_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
                    const { error: uploadError } = await supabase.storage
                        .from('products')
                        .upload(fileName, file, { cacheControl: '3600', upsert: false });
                    
                    if (uploadError) throw uploadError;
                    const { data: urlData } = supabase.storage.from('products').getPublicUrl(fileName);
                    finalImageUrls.push(urlData.publicUrl);
                }
            }
        }

        // 3. Insert into Database
        const mainMediaUrl = finalImageUrls.length > 0 ? finalImageUrls[0] : null;

        const { data: productData, error: dbError } = await supabase
            .from('products')
            .insert([{
                name: formData.name,
                slug: formData.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Math.random().toString(36).substring(7),
                price: formData.price,
                description: formData.description || null,
                category_id: formData.category_id || null,
                media_url: mainMediaUrl,
                video_url: finalVideoUrl,
                stock: 10, // Fallback default stock
                is_active: true,
                rating: 4.5
            }])
            .select()
            .single();

        if (dbError) throw dbError;
        const productId = productData.id;

        // 4. Insert extra images into product_images
        if (finalImageUrls.length > 0) {
            const imageInserts = finalImageUrls.map((url, idx) => ({
                product_id: productId,
                image_url: url,
                display_order: idx
            }));
            const { error: imgError } = await supabase.from('product_images').insert(imageInserts);
            if (imgError) console.error("Error inserting multiple images:", imgError);
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
                    if (varError) console.error("Error inserting variants:", varError);
                }
            } catch (jsonErr) {
                console.error("Failed to parse variants JSON", jsonErr);
            }
        }

        revalidatePath("/admin/products");
        revalidatePath("/");

        return { success: true };
    } catch (error: any) {
        console.error("Error creating product:", error);
        return {
            success: false,
            error: error.message || "An unexpected error occurred while creating the product."
        };
    }
}
