"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

function getPathFromUrl(url: string, bucket: string = 'products') {
    if (!url.includes(`storage/v1/object/public/${bucket}/`)) return null;
    return url.split(`storage/v1/object/public/${bucket}/`)[1];
}

export async function updateProductAction(productId: string | number, formData: {
    name: string;
    slug: string;
    price: number;
    original_price?: number | null;
    description?: string | null;
    category_id?: string | null;
    imageUrls?: string[];
    videoUrl?: string | null;
    isActive?: boolean;
    isTrending?: boolean;
    stock?: number;
    variants?: string | null; // JSON string of { size, color, stock, sku }
    details?: string | null; // JSON string of dynamic key-value pairs
}) {
    try {
        console.log("--- updateProductAction Start ---");
        const supabase = await createClient(true); // Create admin client

        // 1. Fetch current product data (to handle image deletion)
        const { data: oldProduct, error: fetchError } = await supabase
            .from('products')
            .select('*, product_images(*)')
            .eq('id', productId)
            .single();

        if (fetchError || !oldProduct) throw new Error("Product not found");

        const newImageUrls = formData.imageUrls || [];
        const newVideoUrl = formData.videoUrl || null;
        const mainMediaUrl = newImageUrls.length > 0 ? newImageUrls[0] : null;

        // 2. Identify files to delete from storage
        const oldImageUrls = oldProduct.product_images?.map((img: any) => img.image_url) || [];
        if (oldProduct.media_url) oldImageUrls.push(oldProduct.media_url);
        
        const oldVideoUrl = oldProduct.video_url;
        
        const urlsToDelete: string[] = [];
        
        // Check images
        oldImageUrls.forEach((url: string) => {
            if (!newImageUrls.includes(url) && url !== mainMediaUrl) {
                urlsToDelete.push(url);
            }
        });
        
        // Check video
        if (oldVideoUrl && oldVideoUrl !== newVideoUrl) {
            urlsToDelete.push(oldVideoUrl);
        }

        // Delete from storage concurrently
        const pathsToDelete = urlsToDelete
            .map(url => getPathFromUrl(url))
            .filter((path): path is string => path !== null);

        // Run storage deletion and main product update concurrently
        const storageDeletePromise = pathsToDelete.length > 0
            ? supabase.storage.from('products').remove(pathsToDelete).then(() => console.log(`Deleted files from storage`))
            : Promise.resolve();

        // 3. Update products table
        const productUpdatePromise = supabase
            .from('products')
            .update({
                name: formData.name,
                slug: formData.slug,
                price: formData.price,
                original_price: formData.original_price === undefined ? null : formData.original_price,
                description: formData.description || null,
                category_id: formData.category_id || null,
                media_url: mainMediaUrl,
                video_url: newVideoUrl,
                stock: formData.stock ?? 0,
                is_active: formData.isActive ?? true,
                is_trending: formData.isTrending ?? false,
                details: formData.details ? JSON.parse(formData.details) : {},
                updated_at: new Date().toISOString()
            })
            .eq('id', productId);

        const [_, { error: dbError }] = await Promise.all([storageDeletePromise, productUpdatePromise]);

        if (dbError) throw dbError;

        // 4. Sync related tables (Images & Variants) concurrently
        const syncPromises: Promise<any>[] = [];

        // Sync product_images table
        const syncImages = async () => {
            await supabase.from('product_images').delete().eq('product_id', productId);
            if (newImageUrls.length > 0) {
                const imageInserts = newImageUrls.map((url, idx) => ({
                    product_id: productId,
                    image_url: url,
                    display_order: idx
                }));
                const { error: imgError } = await supabase.from('product_images').insert(imageInserts);
                if (imgError) console.error("Error syncing images:", imgError);
            }
        };
        syncPromises.push(syncImages());

        // Sync product_variants table
        if (formData.variants) {
            const syncVariants = async () => {
                try {
                    const parsedVariants = JSON.parse(formData.variants!);
                    await supabase.from('product_variants').delete().eq('product_id', productId);

                    if (Array.isArray(parsedVariants) && parsedVariants.length > 0) {
                        const variantInserts = parsedVariants.map((v: any) => ({
                            product_id: productId,
                            color: v.color || null,
                            size: v.size || null,
                            stock: Number(v.stock) || 0,
                            sku: v.sku || null
                        }));
                        const { error: varError } = await supabase.from('product_variants').insert(variantInserts);
                        if (varError) console.error("Error syncing variants:", varError);
                    }
                } catch (jsonErr) {
                    console.error("Failed to parse variants JSON:", jsonErr);
                }
            };
            syncPromises.push(syncVariants());
        }

        await Promise.all(syncPromises);

        revalidatePath("/admin/products");
        revalidatePath(`/admin/products/${productId}`);
        revalidatePath("/");

        console.log("--- updateProductAction Success ---");
        return { success: true };
    } catch (error: any) {
        console.error("--- updateProductAction Error ---", error);
        const errorData = {
            message: error?.message || "An unexpected error occurred while updating the product.",
            details: error?.details || "",
            hint: error?.hint || "",
            code: error?.code || ""
        };

        return {
            success: false,
            error: errorData
        };
    }
}
