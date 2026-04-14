import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

const MANAGED_BUCKETS = ['products', 'categories', 'banners'];

async function requireAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { errorResponse: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
    }
    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).maybeSingle();
    if (!profile?.is_admin) {
        return { errorResponse: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
    }
    return { supabase: await createClient(true) };
}

export async function GET() {
    try {
        const authResult = await requireAdmin();
        if ('errorResponse' in authResult) return authResult.errorResponse;
        const { supabase } = authResult;
        const buckets = MANAGED_BUCKETS;
        let allFiles: any[] = [];

        for (const bucketName of buckets) {
            const { data: files, error } = await supabase.storage
                .from(bucketName)
                .list('', {
                    limit: 100,
                    offset: 0,
                    sortBy: { column: 'created_at', order: 'desc' },
                });

            if (error) {
                console.error(`Error listing files in bucket ${bucketName}:`, error);
                continue;
            }

            if (files) {
                const filesWithUrls = files.map(file => {
                    const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(file.name);
                    return {
                        ...file,
                        bucket: bucketName,
                        publicUrl: urlData.publicUrl,
                        id: `${bucketName}/${file.name}`
                    };
                });
                allFiles = [...allFiles, ...filesWithUrls];
            }
        }

        // Sort all files by created_at desc
        allFiles.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        return NextResponse.json({ files: allFiles });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const authResult = await requireAdmin();
        if ('errorResponse' in authResult) return authResult.errorResponse;
        const { supabase } = authResult;
        const { searchParams } = new URL(req.url);
        const bucket = searchParams.get('bucket');
        const fileName = searchParams.get('file');

        if (!bucket || !fileName) {
            return NextResponse.json({ error: "Bucket and file name are required" }, { status: 400 });
        }
        if (!MANAGED_BUCKETS.includes(bucket)) {
            return NextResponse.json({ error: "Invalid bucket" }, { status: 400 });
        }

        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
        const publicUrl = urlData.publicUrl;
        const referenceChecks = await Promise.all([
            supabase.from('products').select('id').or(`media_url.eq.${publicUrl},video_url.eq.${publicUrl}`).limit(1),
            supabase.from('product_images').select('id').eq('image_url', publicUrl).limit(1),
            supabase.from('categories').select('id').eq('image_url', publicUrl).limit(1),
            supabase.from('banners').select('id').eq('image_url', publicUrl).limit(1),
            supabase.from('review_media').select('id').eq('media_url', publicUrl).limit(1),
        ]);
        const isReferenced = referenceChecks.some((result) => (result.data?.length ?? 0) > 0);
        if (isReferenced) {
            return NextResponse.json(
                { error: "Cannot delete media that is still referenced by database records" },
                { status: 409 }
            );
        }

        const { error } = await supabase.storage.from(bucket).remove([fileName]);

        if (error) throw error;
        revalidatePath('/admin/media');
        revalidatePath('/');
        revalidatePath('/products');
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
