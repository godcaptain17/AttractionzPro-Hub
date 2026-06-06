// app/api/messages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient }         from '@/lib/supabase';
import { getAdminFromRequest }       from '@/lib/auth';
import { sendMessageReply }          from '@/lib/email';

// POST — Public: submit a contact message
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ success: false, error: 'Name, email, subject, and message are required.' }, { status: 400 });
    }

    const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailReg.test(email)) {
      return NextResponse.json({ success: false, error: 'Invalid email address.' }, { status: 400 });
    }

    if (message.trim().length < 10) {
      return NextResponse.json({ success: false, error: 'Message is too short. Please provide more detail.' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('messages')
      .insert({
        name:    name.trim(),
        email:   email.trim().toLowerCase(),
        phone:   phone?.trim() || null,
        subject: subject.trim(),
        message: message.trim(),
        status:  'Unread',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err) {
    console.error('[Messages POST Error]', err);
    return NextResponse.json({ success: false, error: 'Failed to send message.' }, { status: 500 });
  }
}

// GET — Admin: list all messages
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
      .from('messages')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && status !== 'All') query = query.eq('status', status);

    const { data, error, count } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, data, count }, { status: 200 });
  } catch (err) {
    console.error('[Messages GET Error]', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch messages.' }, { status: 500 });
  }
}

// PATCH — Admin: mark read / reply
export async function PATCH(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });

    const body = await req.json();
    const { id, status, admin_reply } = body;

    if (!id) return NextResponse.json({ success: false, error: 'Message ID required.' }, { status: 400 });

    const supabase = createAdminClient();

    const updates: Record<string, unknown> = {};
    if (status)      updates.status      = status;
    if (admin_reply) updates.admin_reply = admin_reply;

    const { data, error } = await supabase
      .from('messages')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Send reply email if provided
    if (admin_reply && data) {
      sendMessageReply({
        to:      data.email,
        name:    data.name,
        subject: data.subject,
        reply:   admin_reply,
      }).catch(console.error);
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (err) {
    console.error('[Messages PATCH Error]', err);
    return NextResponse.json({ success: false, error: 'Failed to update message.' }, { status: 500 });
  }
}
