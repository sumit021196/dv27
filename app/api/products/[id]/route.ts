import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { getPathFromUrl } from '@/utils/storage';

// Helper to verify admin status
async function verifyAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
    if (!profile?.is_admin) return null;
    return user;
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
        const adminUser = await verifyAdmin();
        if (!adminUser) return NextResponse.json({ error: "Unauthorized or Forbidden" }, { status: 403 });

        const { id } = await params;
        const supabase = await createClient();
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

export async function PUT() {
    return NextResponse.json(
        { error: "Method not allowed. Use Server Actions for full product updates." },
        { status: 405 }
    );
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const adminUser = await verifyAdmin();
        if (!adminUser) return NextResponse.json({ error: "Unauthorized or Forbidden" }, { status: 403 });

        const { id } = await params;
        // Use admin client for consistent DB + Storage cleanup
        const supabaseAdmin = await createClient(true);

        // 1. Fetch product to get media URLs
        const { data: product } = await supabaseAdmin
            .from('products')
            .select('media_url, video_url, product_images(image_url)')
            .eq('id', id)
            .single();

        if (product) {
            const urlsToDelete = [];
            if (product.media_url) urlsToDelete.push(product.media_url);
            if (product.video_url) urlsToDelete.push(product.video_url);
            product.product_images?.forEach((img: any) => {
                if (img.image_url) urlsToDelete.push(img.image_url);
            });

            // 2. Delete from storage
            const pathsToRemove = urlsToDelete.map(url => getPathFromUrl(url, 'products')).filter((p): p is string => p !== null);
            if (pathsToRemove.length > 0) {
                await supabaseAdmin.storage.from('products').remove(pathsToRemove);
            }
        }

        // 3. Cleanup variants and images (though CASCADE might handle it, explicit is safer)
        await supabaseAdmin.from('product_variants').delete().eq('product_id', id);
        await supabaseAdmin.from('product_images').delete().eq('product_id', id);

        // 4. Delete product
        const { error: deleteError } = await supabaseAdmin.from('products').delete().eq('id', id);
        if (deleteError) throw deleteError;

        revalidatePath('/');
        revalidatePath('/products');
        revalidatePath('/admin/products');

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
