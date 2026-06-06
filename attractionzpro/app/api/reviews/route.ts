// app/api/reviews/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient }         from '@/lib/supabase';
import { getAdminFromRequest }       from '@/lib/auth';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const approved = searchParams.get('approved') === 'true';
  const limit    = parseInt(searchParams.get('limit') || '20');

  const supabase = createAdminClient();
  let query = supabase.from('reviews').select('*').order('created_at', { ascending: false }).limit(limit);
  if (approved) query = query.eq('is_approved', true);

  const { data, error } = await query;
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customer_name, rating, comment } = body;
    if (!customer_name || !comment) return NextResponse.json({ success: false, error: 'Name and comment required.' }, { status: 400 });
    if (rating < 1 || rating > 5)   return NextResponse.json({ success: false, error: 'Rating must be 1–5.' }, { status: 400 });

    const supabase = createAdminClient();
    const { data, error } = await supabase.from('reviews').insert({ customer_name, rating, comment, is_approved: false }).select().single();
    if (error) throw error;
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to submit review.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });

  const { id, is_approved } = await req.json();
  const supabase = createAdminClient();
  const { data, error } = await supabase.from('reviews').update({ is_approved }).eq('id', id).select().single();
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data });
}
