// app/api/gallery/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient }         from '@/lib/supabase';
import { getAdminFromRequest }       from '@/lib/auth';

// GET — Public: fetch gallery items
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const limit    = parseInt(searchParams.get('limit') || '50');

    const supabase = createAdminClient();
    let query = supabase
      .from('gallery')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (category && category !== 'All') query = query.eq('category', category);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (err) {
    console.error('[Gallery GET Error]', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch gallery.' }, { status: 500 });
  }
}

// POST — Admin: add gallery item
export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });

    const body = await req.json();
    const { title, before_image_url, after_image_url, category } = body;

    if (!title || !after_image_url || !category) {
      return NextResponse.json({ success: false, error: 'Title, after image, and category are required.' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('gallery')
      .insert({ title, before_image_url: before_image_url || null, after_image_url, category })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err) {
    console.error('[Gallery POST Error]', err);
    return NextResponse.json({ success: false, error: 'Failed to add gallery item.' }, { status: 500 });
  }
}

// DELETE — Admin: remove gallery item
export async function DELETE(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'Item ID required.' }, { status: 400 });

    const supabase = createAdminClient();
    const { error } = await supabase.from('gallery').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true, data: null }, { status: 200 });
  } catch (err) {
    console.error('[Gallery DELETE Error]', err);
    return NextResponse.json({ success: false, error: 'Failed to delete gallery item.' }, { status: 500 });
  }
}
