import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

const ALLOWED_BUCKETS = ['products', 'categories', 'banners'];

export async function GET() {
    try {
        const supabase = await createClient();

        // Enforce Admin Auth
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
        if (!profile?.is_admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const supabaseAdmin = await createClient(true);
        let allFiles: any[] = [];

        for (const bucketName of ALLOWED_BUCKETS) {
            const { data: files, error } = await supabaseAdmin.storage
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
                    const { data: urlData } = supabaseAdmin.storage.from(bucketName).getPublicUrl(file.name);
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
        const supabase = await createClient();

        // Enforce Admin Auth
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
        if (!profile?.is_admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const { searchParams } = new URL(req.url);
        const bucket = searchParams.get('bucket');
        const fileName = searchParams.get('file');

        if (!bucket || !fileName) {
            return NextResponse.json({ error: "Bucket and file name are required" }, { status: 400 });
        }

        if (!ALLOWED_BUCKETS.includes(bucket)) {
             return NextResponse.json({ error: "Invalid bucket" }, { status: 400 });
        }

        const supabaseAdmin = await createClient(true);

        // 1. Get Public URL for the file to check references
        const { data: urlData } = supabaseAdmin.storage.from(bucket).getPublicUrl(fileName);
        const publicUrl = urlData.publicUrl;

        // 2. Perform Reference Checks (returning 409 if in use)
        if (bucket === 'products') {
             // Check products.media_url
             const { count: prodCount } = await supabaseAdmin.from('products').select('*', { count: 'exact', head: true }).eq('media_url', publicUrl);
             if (prodCount && prodCount > 0) return NextResponse.json({ error: "File is in use by a product" }, { status: 409 });

             // Check product_images.image_url
             const { count: prodImgCount } = await supabaseAdmin.from('product_images').select('*', { count: 'exact', head: true }).eq('image_url', publicUrl);
             if (prodImgCount && prodImgCount > 0) return NextResponse.json({ error: "File is in use by a product gallery" }, { status: 409 });

             // Check products.video_url
             const { count: prodVideoCount } = await supabaseAdmin.from('products').select('*', { count: 'exact', head: true }).eq('video_url', publicUrl);
             if (prodVideoCount && prodVideoCount > 0) return NextResponse.json({ error: "File is in use by a product as video" }, { status: 409 });
        } else if (bucket === 'categories') {
             const { count: catCount } = await supabaseAdmin.from('categories').select('*', { count: 'exact', head: true }).eq('image_url', publicUrl);
             if (catCount && catCount > 0) return NextResponse.json({ error: "File is in use by a category" }, { status: 409 });
        } else if (bucket === 'banners') {
             const { count: bannerCount } = await supabaseAdmin.from('banners').select('*', { count: 'exact', head: true }).eq('image_url', publicUrl);
             if (bannerCount && bannerCount > 0) return NextResponse.json({ error: "File is in use by a banner" }, { status: 409 });

             const { count: bannerMobCount } = await supabaseAdmin.from('banners').select('*', { count: 'exact', head: true }).eq('mobile_image_url', publicUrl);
             if (bannerMobCount && bannerMobCount > 0) return NextResponse.json({ error: "File is in use by a banner (mobile)" }, { status: 409 });
        }

        // 3. Perform Deletion
        const { error } = await supabaseAdmin.storage.from(bucket).remove([fileName]);

        if (error) throw error;

        // 4. Trigger cache revalidation
        revalidatePath('/');
        if (bucket === 'products') revalidatePath('/products');

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
