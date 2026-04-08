import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
    try {
        const supabase = await createClient();
        
        // Ensure user is admin
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
        if (!profile?.is_admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const { data: reviews, error } = await supabase
            .from('reviews')
            .select(`
                *,
                products ( name ),
                profiles ( first_name, last_name ),
                review_images ( image_url )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return NextResponse.json({ reviews });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const productId = formData.get('product_id');
        const rating = formData.get('rating');
        const comment = formData.get('comment');
        const images = formData.getAll('images') as File[];

        if (!productId || !rating ) {
            return NextResponse.json({ error: "Product ID and Rating are required" }, { status: 400 });
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // 1. Insert Review
        const { data: review, error: reviewError } = await supabase
            .from('reviews')
            .insert([{
                product_id: productId,
                user_id: user.id,
                rating: parseInt(rating as string),
                comment: comment as string,
                status: 'pending' // Admin approval required
            }])
            .select()
            .single();

        if (reviewError) throw reviewError;

        // 2. Upload Images
        const uploadedImages: string[] = [];
        if (images && images.length > 0) {
            for (const file of images) {
                if (file.size > 0) {
                    const fileExt = file.name.split('.').pop() || 'jpg';
                    const fileName = `${review.id}/img_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
                    
                    const { error: uploadError } = await supabase.storage
                        .from('reviews')
                        .upload(fileName, file);

                    if (uploadError) {
                        console.error("Review Image Upload Error:", uploadError);
                        continue; // Skip failed upload
                    }

                    const { data: urlData } = supabase.storage.from('reviews').getPublicUrl(fileName);
                    uploadedImages.push(urlData.publicUrl);
                }
            }
        }

        // 3. Insert Review Images into DB
        if (uploadedImages.length > 0) {
            const imageInserts = uploadedImages.map(url => ({
                review_id: review.id,
                image_url: url
            }));
            const { error: imgInsertError } = await supabase.from('review_images').insert(imageInserts);
            if (imgInsertError) console.error("Database Image Insert Error:", imgInsertError);
        }

        return NextResponse.json({ success: true, review_id: review.id });
    } catch (error: any) {
        console.error("Review Submission Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
