// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient }         from '@/lib/supabase';
import { getAdminFromRequest }       from '@/lib/auth';

// GET — Public: fetch products with filters
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category    = searchParams.get('category');
    const search      = searchParams.get('search');
    const adminMode   = searchParams.get('admin') === 'true';
    const page        = parseInt(searchParams.get('page') || '1');
    const limit       = parseInt(searchParams.get('limit') || '24');
    const offset      = (page - 1) * limit;

    if (adminMode) {
      const req2 = req; // re-check auth
      const admin = await getAdminFromRequest(req2);
      if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    const supabase = createAdminClient();
    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (!adminMode) query = query.eq('is_available', true);
    if (category && category !== 'All') query = query.eq('category', category);
    if (search) query = query.ilike('name', `%${search}%`);

    const { data, error, count } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, data, count }, { status: 200 });
  } catch (err) {
    console.error('[Products GET Error]', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch products.' }, { status: 500 });
  }
}

// POST — Admin: create product
export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });

    const body = await req.json();
    const { name, description, price, stock, category, image_urls, is_available } = body;

    if (!name || price === undefined || price === null) {
      return NextResponse.json({ success: false, error: 'Name and price are required.' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('products')
      .insert({
        name:         name.trim(),
        description:  description?.trim() || '',
        price:        Number(price),
        stock:        Number(stock) || 0,
        category:     category || 'Uncategorized',
        image_urls:   image_urls || [],
        is_available: is_available !== false,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err) {
    console.error('[Products POST Error]', err);
    return NextResponse.json({ success: false, error: 'Failed to create product.' }, { status: 500 });
  }
}

// PATCH — Admin: update product
export async function PATCH(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });

    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ success: false, error: 'Product ID required.' }, { status: 400 });

    if (updates.price !== undefined) updates.price = Number(updates.price);
    if (updates.stock !== undefined) updates.stock = Number(updates.stock);

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (err) {
    console.error('[Products PATCH Error]', err);
    return NextResponse.json({ success: false, error: 'Failed to update product.' }, { status: 500 });
  }
}

// DELETE — Admin: delete product
export async function DELETE(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'Product ID required.' }, { status: 400 });

    const supabase = createAdminClient();
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true, data: null }, { status: 200 });
  } catch (err) {
    console.error('[Products DELETE Error]', err);
    return NextResponse.json({ success: false, error: 'Failed to delete product.' }, { status: 500 });
  }
}
