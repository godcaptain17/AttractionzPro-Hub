// ============================================================
// lib/email.ts — Resend email dispatch utility
// ============================================================

const RESEND_API_KEY  = process.env.RESEND_API_KEY!;
const FROM_EMAIL      = process.env.RESEND_FROM_EMAIL  || 'notifications@attractionzprohub.com';
const ADMIN_EMAIL     = process.env.ADMIN_EMAIL         || 'admin@attractionzprohub.com';
const BUSINESS_NAME   = 'AttractionzPro Hub';
const BUSINESS_PHONE  = '+234 802 320 8886';
const BUSINESS_ADDR   = '2-14 James Robertson Rd, Surulere, Lagos';

// ── Base branded layout ──────────────────────────────────────
function baseTemplate(title: string, body: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#141414;border-radius:16px;overflow:hidden;border:1px solid #2a2a2a;">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0a0a0a,#1a1a1a);padding:40px 40px 30px;text-align:center;border-bottom:1px solid #D4AF37;">
            <p style="margin:0 0 8px;font-size:11px;letter-spacing:4px;color:#D4AF37;text-transform:uppercase;">Luxury Beauty &amp; Perfume</p>
            <h1 style="margin:0;font-size:28px;font-weight:400;color:#ffffff;letter-spacing:2px;">${BUSINESS_NAME}</h1>
            <div style="width:60px;height:2px;background:#D4AF37;margin:16px auto 0;"></div>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            ${body}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#0a0a0a;padding:24px 40px;text-align:center;border-top:1px solid #2a2a2a;">
            <p style="margin:0 0 6px;font-size:12px;color:#888888;">${BUSINESS_ADDR}</p>
            <p style="margin:0 0 6px;font-size:12px;color:#888888;">${BUSINESS_PHONE}</p>
            <p style="margin:0;font-size:11px;color:#555555;">&copy; ${new Date().getFullYear()} ${BUSINESS_NAME}. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Core send function ───────────────────────────────────────
async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({ from: `${BUSINESS_NAME} <${FROM_EMAIL}>`, to, subject, html }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error('[Resend Error]', err);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Email Send Error]', err);
    return false;
  }
}

// ── 1. Appointment Approved ──────────────────────────────────
export async function sendAppointmentApproved(params: {
  to:       string;
  name:     string;
  service:  string;
  date:     string;
  time:     string;
}): Promise<boolean> {
  const body = `
    <h2 style="color:#D4AF37;font-size:22px;font-weight:400;margin:0 0 24px;">Appointment Confirmed ✓</h2>
    <p style="color:#cccccc;font-size:15px;line-height:1.7;margin:0 0 20px;">
      Dear <strong style="color:#ffffff;">${params.name}</strong>,<br/><br/>
      We're delighted to confirm your appointment at <strong style="color:#D4AF37;">${BUSINESS_NAME}</strong>. 
      We look forward to making you feel extraordinary.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border-radius:12px;border:1px solid #2a2a2a;margin:24px 0;">
      <tr><td style="padding:24px;">
        <p style="margin:0 0 12px;color:#888888;font-size:12px;letter-spacing:2px;text-transform:uppercase;">Appointment Details</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding:8px 0;border-bottom:1px solid #2a2a2a;color:#888888;font-size:13px;">Service</td>
              <td style="padding:8px 0;border-bottom:1px solid #2a2a2a;color:#ffffff;font-size:13px;text-align:right;">${params.service}</td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid #2a2a2a;color:#888888;font-size:13px;">Date</td>
              <td style="padding:8px 0;border-bottom:1px solid #2a2a2a;color:#ffffff;font-size:13px;text-align:right;">${params.date}</td></tr>
          <tr><td style="padding:8px 0;color:#888888;font-size:13px;">Time</td>
              <td style="padding:8px 0;color:#D4AF37;font-size:13px;font-weight:bold;text-align:right;">${params.time}</td></tr>
        </table>
      </td></tr>
    </table>
    <p style="color:#888888;font-size:13px;line-height:1.6;margin:0 0 20px;">
      📍 <strong style="color:#cccccc;">Location:</strong> ${BUSINESS_ADDR}<br/>
      📞 <strong style="color:#cccccc;">Contact:</strong> ${BUSINESS_PHONE}
    </p>
    <div style="background:linear-gradient(135deg,rgba(212,175,55,0.1),transparent);border:1px solid rgba(212,175,55,0.2);border-radius:8px;padding:16px;margin-top:16px;">
      <p style="margin:0;color:#D4AF37;font-size:13px;text-align:center;">Please arrive 5 minutes early. We can't wait to see you!</p>
    </div>`;

  return sendEmail(params.to, `Appointment Confirmed — ${params.service} | ${BUSINESS_NAME}`, baseTemplate('Appointment Confirmed', body));
}

// ── 2. Appointment Rejected ──────────────────────────────────
export async function sendAppointmentRejected(params: {
  to:      string;
  name:    string;
  service: string;
  date:    string;
  reason?: string;
}): Promise<boolean> {
  const body = `
    <h2 style="color:#e88c8c;font-size:22px;font-weight:400;margin:0 0 24px;">Appointment Update</h2>
    <p style="color:#cccccc;font-size:15px;line-height:1.7;margin:0 0 20px;">
      Dear <strong style="color:#ffffff;">${params.name}</strong>,<br/><br/>
      We regret to inform you that we're unable to accommodate your appointment request for 
      <strong style="color:#D4AF37;">${params.service}</strong> on <strong style="color:#D4AF37;">${params.date}</strong>.
    </p>
    ${params.reason ? `<div style="background:#1a1a1a;border-left:3px solid #D4AF37;border-radius:4px;padding:16px;margin:16px 0;">
      <p style="margin:0;color:#cccccc;font-size:14px;font-style:italic;">"${params.reason}"</p>
    </div>` : ''}
    <p style="color:#cccccc;font-size:15px;line-height:1.7;">
      We'd love to reschedule at a more convenient time. Please visit our website or call us at 
      <strong style="color:#D4AF37;">${BUSINESS_PHONE}</strong> to book a new appointment.
    </p>`;

  return sendEmail(params.to, `Appointment Update — ${BUSINESS_NAME}`, baseTemplate('Appointment Update', body));
}

// ── 3. Order Confirmation ────────────────────────────────────
export async function sendOrderConfirmation(params: {
  to:          string;
  name:        string;
  orderId:     string;
  items:       { name: string; qty: number; price: number }[];
  total:       number;
  discount:    number;
  address:     string;
}): Promise<boolean> {
  const itemRows = params.items.map(i => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;color:#cccccc;font-size:13px;">${i.name}</td>
      <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;color:#888888;font-size:13px;text-align:center;">x${i.qty}</td>
      <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;color:#ffffff;font-size:13px;text-align:right;">₦${(i.price * i.qty).toLocaleString()}</td>
    </tr>`).join('');

  const body = `
    <h2 style="color:#D4AF37;font-size:22px;font-weight:400;margin:0 0 8px;">Order Confirmed 🛍️</h2>
    <p style="color:#888888;font-size:12px;letter-spacing:2px;margin:0 0 24px;text-transform:uppercase;">Order #${params.orderId.slice(0, 8).toUpperCase()}</p>
    <p style="color:#cccccc;font-size:15px;line-height:1.7;margin:0 0 24px;">
      Dear <strong style="color:#ffffff;">${params.name}</strong>,<br/>
      Thank you for shopping with us! Your order is being processed.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border-radius:12px;border:1px solid #2a2a2a;margin:0 0 24px;">
      <tr><td style="padding:24px;">
        <p style="margin:0 0 16px;color:#888888;font-size:12px;letter-spacing:2px;text-transform:uppercase;">Order Summary</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          ${itemRows}
          ${params.discount > 0 ? `
          <tr><td colspan="2" style="padding:10px 0;color:#D4AF37;font-size:13px;">Discount Applied</td>
              <td style="padding:10px 0;color:#D4AF37;font-size:13px;text-align:right;">-₦${params.discount.toLocaleString()}</td></tr>` : ''}
          <tr><td colspan="2" style="padding:16px 0 0;color:#ffffff;font-size:15px;font-weight:bold;">Total</td>
              <td style="padding:16px 0 0;color:#D4AF37;font-size:18px;font-weight:bold;text-align:right;">₦${params.total.toLocaleString()}</td></tr>
        </table>
      </td></tr>
    </table>
    <div style="background:#1a1a1a;border-radius:8px;padding:16px;margin-bottom:24px;border:1px solid #2a2a2a;">
      <p style="margin:0 0 6px;color:#888888;font-size:12px;letter-spacing:2px;text-transform:uppercase;">Delivery Address</p>
      <p style="margin:0;color:#cccccc;font-size:14px;">${params.address}</p>
    </div>
    <div style="background:linear-gradient(135deg,rgba(212,175,55,0.1),transparent);border:1px solid rgba(212,175,55,0.2);border-radius:8px;padding:16px;">
      <p style="margin:0;color:#D4AF37;font-size:13px;text-align:center;">
        💬 Our team will contact you via WhatsApp to confirm delivery details.
      </p>
    </div>`;

  return sendEmail(params.to, `Order Confirmed #${params.orderId.slice(0, 8).toUpperCase()} — ${BUSINESS_NAME}`, baseTemplate('Order Confirmed', body));
}

// ── 4. Admin New Order Alert ─────────────────────────────────
export async function sendAdminOrderAlert(params: {
  orderId:      string;
  customerName: string;
  total:        number;
  itemCount:    number;
}): Promise<boolean> {
  const body = `
    <h2 style="color:#D4AF37;font-size:22px;font-weight:400;margin:0 0 24px;">🛍️ New Order Received</h2>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border-radius:12px;border:1px solid #2a2a2a;">
      <tr><td style="padding:24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding:8px 0;border-bottom:1px solid #2a2a2a;color:#888888;font-size:13px;">Order ID</td>
              <td style="padding:8px 0;border-bottom:1px solid #2a2a2a;color:#ffffff;font-size:13px;text-align:right;">#${params.orderId.slice(0, 8).toUpperCase()}</td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid #2a2a2a;color:#888888;font-size:13px;">Customer</td>
              <td style="padding:8px 0;border-bottom:1px solid #2a2a2a;color:#ffffff;font-size:13px;text-align:right;">${params.customerName}</td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid #2a2a2a;color:#888888;font-size:13px;">Items</td>
              <td style="padding:8px 0;border-bottom:1px solid #2a2a2a;color:#ffffff;font-size:13px;text-align:right;">${params.itemCount} item(s)</td></tr>
          <tr><td style="padding:8px 0;color:#888888;font-size:13px;">Total</td>
              <td style="padding:8px 0;color:#D4AF37;font-size:16px;font-weight:bold;text-align:right;">₦${params.total.toLocaleString()}</td></tr>
        </table>
      </td></tr>
    </table>
    <p style="color:#888888;font-size:13px;margin:20px 0 0;text-align:center;">
      Log in to your admin dashboard to process this order.
    </p>`;

  return sendEmail(ADMIN_EMAIL, `New Order #${params.orderId.slice(0, 8).toUpperCase()} — Action Required`, baseTemplate('New Order', body));
}

// ── 5. Admin New Appointment Alert ───────────────────────────
export async function sendAdminAppointmentAlert(params: {
  customerName: string;
  service:      string;
  date:         string;
  time:         string;
  phone:        string;
}): Promise<boolean> {
  const body = `
    <h2 style="color:#D4AF37;font-size:22px;font-weight:400;margin:0 0 24px;">📅 New Appointment Booking</h2>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border-radius:12px;border:1px solid #2a2a2a;">
      <tr><td style="padding:24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding:8px 0;border-bottom:1px solid #2a2a2a;color:#888888;font-size:13px;">Client</td>
              <td style="padding:8px 0;border-bottom:1px solid #2a2a2a;color:#ffffff;font-size:13px;text-align:right;">${params.customerName}</td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid #2a2a2a;color:#888888;font-size:13px;">Service</td>
              <td style="padding:8px 0;border-bottom:1px solid #2a2a2a;color:#D4AF37;font-size:13px;text-align:right;">${params.service}</td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid #2a2a2a;color:#888888;font-size:13px;">Date</td>
              <td style="padding:8px 0;border-bottom:1px solid #2a2a2a;color:#ffffff;font-size:13px;text-align:right;">${params.date}</td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid #2a2a2a;color:#888888;font-size:13px;">Time</td>
              <td style="padding:8px 0;border-bottom:1px solid #2a2a2a;color:#ffffff;font-size:13px;text-align:right;">${params.time}</td></tr>
          <tr><td style="padding:8px 0;color:#888888;font-size:13px;">Phone</td>
              <td style="padding:8px 0;color:#ffffff;font-size:13px;text-align:right;">${params.phone}</td></tr>
        </table>
      </td></tr>
    </table>`;

  return sendEmail(ADMIN_EMAIL, `New Appointment — ${params.customerName} | ${params.service}`, baseTemplate('New Appointment', body));
}

// ── 6. Message Reply ─────────────────────────────────────────
export async function sendMessageReply(params: {
  to:      string;
  name:    string;
  subject: string;
  reply:   string;
}): Promise<boolean> {
  const body = `
    <h2 style="color:#D4AF37;font-size:22px;font-weight:400;margin:0 0 24px;">Response to Your Message</h2>
    <p style="color:#cccccc;font-size:15px;line-height:1.7;margin:0 0 20px;">
      Dear <strong style="color:#ffffff;">${params.name}</strong>,<br/><br/>
      Thank you for reaching out to us. Here is our response to your message regarding 
      "<strong style="color:#D4AF37;">${params.subject}</strong>":
    </p>
    <div style="background:#1a1a1a;border-left:3px solid #D4AF37;border-radius:4px;padding:20px;margin:16px 0;">
      <p style="margin:0;color:#cccccc;font-size:15px;line-height:1.8;">${params.reply}</p>
    </div>
    <p style="color:#888888;font-size:14px;margin:20px 0 0;">
      If you have further questions, don't hesitate to reach out at ${BUSINESS_PHONE}.
    </p>`;

  return sendEmail(params.to, `Re: ${params.subject} — ${BUSINESS_NAME}`, baseTemplate('Message Reply', body));
}
