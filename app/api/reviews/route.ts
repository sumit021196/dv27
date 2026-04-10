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
                profiles ( full_name ),
                review_media ( media_url, media_type )
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
        const guestName = formData.get('guest_name');
        const images = formData.getAll('images') as File[];
        const videos = formData.getAll('videos') as File[];

        if (!productId || !rating ) {
            return NextResponse.json({ error: "Product ID and Rating are required" }, { status: 400 });
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        // 1. Insert Review
        const { data: review, error: reviewError } = await supabase
            .from('reviews')
            .insert([{
                product_id: productId,
                user_id: user?.id || null,
                guest_name: user ? null : (guestName || "Anonymous"),
                rating: parseInt(rating as string),
                comment: comment as string,
                status: 'pending' // Admin approval required
            }])
            .select()
            .single();

        if (reviewError) throw reviewError;

        // 2. Upload Media (Images & Videos)
        const mediaInserts: any[] = [];
        
        const processFiles = async (files: File[], type: 'image' | 'video') => {
            for (const file of files) {
                if (file.size > 0) {
                    const fileExt = file.name.split('.').pop() || (type === 'image' ? 'jpg' : 'mp4');
                    const fileName = `${review.id}/${type}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
                    
                    const { error: uploadError } = await supabase.storage
                        .from('reviews')
                        .upload(fileName, file);

                    if (uploadError) {
                        console.error(`Review ${type} Upload Error:`, uploadError);
                        continue;
                    }

                    const { data: urlData } = supabase.storage.from('reviews').getPublicUrl(fileName);
                    mediaInserts.push({
                        review_id: review.id,
                        media_url: urlData.publicUrl,
                        media_type: type
                    });
                }
            }
        };

        if (images?.length > 0) await processFiles(images, 'image');
        if (videos?.length > 0) await processFiles(videos, 'video');

        // 3. Insert Review Media into DB
        if (mediaInserts.length > 0) {
            const { error: mediaInsertError } = await supabase.from('review_media').insert(mediaInserts);
            if (mediaInsertError) console.error("Database Media Insert Error:", mediaInsertError);
        }

        return NextResponse.json({ success: true, review_id: review.id });
    } catch (error: any) {
        console.error("Review Submission Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
