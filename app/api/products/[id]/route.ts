import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { extractBucketAndPathFromUrl } from '@/utils/storage';

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
    return { supabase };
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        const { data: product, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .maybeSingle();

        if (error) throw error;
        if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
        
        return NextResponse.json({ product });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const authResult = await requireAdmin();
        if ('errorResponse' in authResult) return authResult.errorResponse;
        const { supabase } = authResult;

        const body = await req.json();
        const { data, error } = await supabase
            .from('products')
            .update(body)
            .eq('id', id)
            .select()
            .maybeSingle();

        if (error) throw error;
        
        revalidatePath('/');
        revalidatePath('/products');
        revalidatePath(`/product/${id}`);
        revalidatePath('/admin/products');

        return NextResponse.json({ product: data, success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    return NextResponse.json(
        { error: "Full product updates moved to server actions. Use PATCH for small field changes." },
        { status: 405 }
    );
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const authResult = await requireAdmin();
        if ('errorResponse' in authResult) return authResult.errorResponse;
        const { supabase } = authResult;

        const { data: product, error: productError } = await supabase
            .from('products')
            .select('media_url, video_url, product_images(image_url)')
            .eq('id', id)
            .maybeSingle();
        if (productError) throw productError;
        if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

        const urls = [
            ...(product.product_images?.map((img: { image_url: string }) => img.image_url) ?? []),
            product.media_url,
            product.video_url,
        ].filter((url): url is string => Boolean(url));

        const bucketPaths = urls
            .map((url) => extractBucketAndPathFromUrl(url))
            .filter((entry): entry is { bucket: string; path: string } => Boolean(entry?.bucket && entry?.path));

        for (const bucket of [...new Set(bucketPaths.map((entry) => entry.bucket))]) {
            const paths = bucketPaths.filter((entry) => entry.bucket === bucket).map((entry) => entry.path);
            if (paths.length > 0) {
                await supabase.storage.from(bucket).remove(paths);
            }
        }

        await supabase.from('product_images').delete().eq('product_id', id);
        await supabase.from('product_variants').delete().eq('product_id', id);

        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) throw error;

        revalidatePath('/');
        revalidatePath('/products');
        revalidatePath('/admin/products');

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
