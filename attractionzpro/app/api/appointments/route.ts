// app/api/appointments/route.ts
import { NextRequest, NextResponse }   from 'next/server';
import { createAdminClient }           from '@/lib/supabase';
import { getAdminFromRequest }         from '@/lib/auth';
import { sendAdminAppointmentAlert }   from '@/lib/email';
import type { BookingFormData }        from '@/types';

// POST — Public: book an appointment
export async function POST(req: NextRequest) {
  try {
    const body: BookingFormData = await req.json();
    const { customer_name, email, phone, service, appointment_date, appointment_time, note } = body;

    if (!customer_name || !email || !phone || !service || !appointment_date || !appointment_time) {
      return NextResponse.json({ success: false, error: 'All required fields must be provided.' }, { status: 400 });
    }

    // Basic email validation
    const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailReg.test(email)) {
      return NextResponse.json({ success: false, error: 'Invalid email address.' }, { status: 400 });
    }

    // Prevent past dates
    const selectedDate = new Date(appointment_date);
    const today        = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      return NextResponse.json({ success: false, error: 'Cannot book an appointment for a past date.' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Check for time slot conflicts
    const { data: existing } = await supabase
      .from('appointments')
      .select('id')
      .eq('appointment_date', appointment_date)
      .eq('appointment_time', appointment_time)
      .in('status', ['Pending', 'Approved'])
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json({ success: false, error: 'This time slot is already booked. Please choose another.' }, { status: 409 });
    }

    const { data, error } = await supabase
      .from('appointments')
      .insert({
        customer_name: customer_name.trim(),
        email:         email.trim().toLowerCase(),
        phone:         phone.trim(),
        service,
        appointment_date,
        appointment_time,
        note:          note?.trim() || null,
        status:        'Pending',
      })
      .select()
      .single();

    if (error) throw error;

    // Notify admin (fire and forget)
    sendAdminAppointmentAlert({
      customerName: customer_name,
      service,
      date:         appointment_date,
      time:         appointment_time,
      phone,
    }).catch(console.error);

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err) {
    console.error('[Appointments POST Error]', err);
    return NextResponse.json({ success: false, error: 'Failed to book appointment.' }, { status: 500 });
  }
}

// GET — Admin: list all appointments
export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status  = searchParams.get('status');
    const date    = searchParams.get('date');
    const page    = parseInt(searchParams.get('page') || '1');
    const limit   = parseInt(searchParams.get('limit') || '50');
    const offset  = (page - 1) * limit;

    const supabase = createAdminClient();
    let query = supabase
      .from('appointments')
      .select('*', { count: 'exact' })
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true })
      .range(offset, offset + limit - 1);

    if (status && status !== 'All') query = query.eq('status', status);
    if (date)                        query = query.eq('appointment_date', date);

    const { data, error, count } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, data, count }, { status: 200 });
  } catch (err) {
    console.error('[Appointments GET Error]', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch appointments.' }, { status: 500 });
  }
}
