// app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient }         from '@/lib/supabase';
import { getAdminFromRequest }       from '@/lib/auth';

// GET — Admin: list all orders
export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const page   = parseInt(searchParams.get('page') || '1');
    const limit  = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const supabase = createAdminClient();
    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id, quantity, price,
          product:products (id, name, image_urls)
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && status !== 'All') query = query.eq('status', status);

    const { data, error, count } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, data, count }, { status: 200 });
  } catch (err) {
    console.error('[Orders GET Error]', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch orders.' }, { status: 500 });
  }
}
