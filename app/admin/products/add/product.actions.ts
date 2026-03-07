"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createProductAction(formData: {
    name: string;
    price: number;
    description?: string | null;
    category?: string | null;
    size?: string | null;
    image?: File | null;
}) {
    try {
        const supabase = await createClient(true); // Create admin client

        let finalImageUrl = null;

        // 1. Upload to Storage if file exists
        if (formData.image && formData.image.size > 0) {
            const file = formData.image;
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('products')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: urlData } = supabase.storage.from('products').getPublicUrl(fileName);
            finalImageUrl = urlData.publicUrl;
        }

        // 3. Insert into Database
        const { error: dbError } = await supabase
            .from('products')
            .insert([{
                name: formData.name,
                price: formData.price,
                description: formData.description || null,
                category: formData.category || null,
                size: formData.size || null,
                image_url: finalImageUrl
            }]);

        if (dbError) throw dbError;

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
