// app/api/appointments/[id]/route.ts
import { NextRequest, NextResponse }          from 'next/server';
import { createAdminClient }                  from '@/lib/supabase';
import { getAdminFromRequest }                from '@/lib/auth';
import { sendAppointmentApproved, sendAppointmentRejected } from '@/lib/email';
import type { AppointmentStatus }             from '@/types';
import { formatDate, formatTime }             from '@/lib/utils';

interface Params { params: { id: string } }

// PATCH — Admin: update appointment status
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    const { id } = params;
    const body   = await req.json();
    const { status, reason }: { status: AppointmentStatus; reason?: string } = body;

    const validStatuses: AppointmentStatus[] = ['Pending', 'Approved', 'Rejected', 'Completed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid status value.' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Fetch current appointment
    const { data: existing, error: fetchErr } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !existing) {
      return NextResponse.json({ success: false, error: 'Appointment not found.' }, { status: 404 });
    }

    // Update status
    const { data, error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Send email notification based on new status (fire and forget)
    if (status === 'Approved') {
      sendAppointmentApproved({
        to:      existing.email,
        name:    existing.customer_name,
        service: existing.service,
        date:    formatDate(existing.appointment_date),
        time:    formatTime(existing.appointment_time),
      }).catch(console.error);
    } else if (status === 'Rejected') {
      sendAppointmentRejected({
        to:      existing.email,
        name:    existing.customer_name,
        service: existing.service,
        date:    formatDate(existing.appointment_date),
        reason,
      }).catch(console.error);
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (err) {
    console.error('[Appointments PATCH Error]', err);
    return NextResponse.json({ success: false, error: 'Failed to update appointment.' }, { status: 500 });
  }
}

// DELETE — Admin: remove appointment
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase.from('appointments').delete().eq('id', params.id);
    if (error) throw error;

    return NextResponse.json({ success: true, data: null }, { status: 200 });
  } catch (err) {
    console.error('[Appointments DELETE Error]', err);
    return NextResponse.json({ success: false, error: 'Failed to delete appointment.' }, { status: 500 });
  }
}
