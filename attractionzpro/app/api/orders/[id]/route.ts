// app/api/orders/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient }         from '@/lib/supabase';
import { getAdminFromRequest }       from '@/lib/auth';
import type { OrderStatus }          from '@/types';

interface Params { params: { id: string } }

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });

    const body = await req.json();
    const { status }: { status: OrderStatus } = body;

    const valid: OrderStatus[] = ['Pending', 'Processing', 'Delivered', 'Cancelled'];
    if (!valid.includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid status.' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (err) {
    console.error('[Orders PATCH Error]', err);
    return NextResponse.json({ success: false, error: 'Failed to update order.' }, { status: 500 });
  }
}
