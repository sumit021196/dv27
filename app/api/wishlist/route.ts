import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ items: [] });
    }

    // Get wishlist items with product details
    const { data, error } = await supabase
      .from('wishlist')
      .select('product_id, products(id, name, price, media_url)')
      .eq('user_id', user.id);

    if (error) throw error;

    const items = data.map((item: any) => ({
      id: item.products.id,
      name: item.products.name,
      price: item.products.price,
      image: item.products.media_url,
    }));

    return NextResponse.json({ items });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Auth required' }, { status: 401 });
    }

    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    // Check if it already exists
    const { data: existing } = await supabase
      .from('wishlist')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .single();

    if (existing) {
      // Remove it (Toggle behavior)
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);
      
      if (error) throw error;
      return NextResponse.json({ status: 'removed' });
    } else {
      // Add it
      const { error } = await supabase
        .from('wishlist')
        .insert({
          user_id: user.id,
          product_id: productId
        });

      if (error) throw error;
      return NextResponse.json({ status: 'added' });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
