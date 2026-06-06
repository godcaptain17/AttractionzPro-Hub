// app/api/checkout/route.ts
import { NextRequest, NextResponse }  from 'next/server';
import { createAdminClient }          from '@/lib/supabase';
import { sendOrderConfirmation, sendAdminOrderAlert } from '@/lib/email';
import { generateWhatsAppText }       from '@/lib/utils';
import type { CheckoutFormData, CartItem } from '@/types';

interface CheckoutBody {
  formData:   CheckoutFormData;
  cartItems:  { productId: string; quantity: number }[];
}

export async function POST(req: NextRequest) {
  try {
    const body: CheckoutBody = await req.json();
    const { formData, cartItems } = body;

    if (!formData.customer_name || !formData.email || !formData.phone || !formData.address) {
      return NextResponse.json({ success: false, error: 'All customer details are required.' }, { status: 400 });
    }

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ success: false, error: 'Cart is empty.' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // ── 1. Fetch product details & validate stock ────────────
    const productIds = cartItems.map(i => i.productId);
    const { data: products, error: prodErr } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds)
      .eq('is_available', true);

    if (prodErr || !products) throw prodErr || new Error('Failed to fetch products');

    const productMap = new Map(products.map(p => [p.id, p]));
    for (const item of cartItems) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json({ success: false, error: `Product not found or unavailable.` }, { status: 404 });
      }
      if (product.stock < item.quantity) {
        return NextResponse.json({ success: false, error: `Insufficient stock for "${product.name}". Only ${product.stock} left.` }, { status: 409 });
      }
    }

    // ── 2. Validate promo code ───────────────────────────────
    let discountPercent = 0;
    let discountAmount  = 0;
    const promoCode     = formData.promo_code?.trim().toUpperCase();

    if (promoCode) {
      const { data: promo, error: promoErr } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', promoCode)
        .eq('active', true)
        .single();

      if (promoErr || !promo) {
        return NextResponse.json({ success: false, error: 'Invalid or expired promo code.' }, { status: 400 });
      }

      if (promo.expiry_date && new Date(promo.expiry_date) < new Date()) {
        return NextResponse.json({ success: false, error: 'This promo code has expired.' }, { status: 400 });
      }

      discountPercent = promo.discount_percent;
    }

    // ── 3. Calculate totals ──────────────────────────────────
    let subtotal = 0;
    const orderItemsPayload: { product_id: string; quantity: number; price: number }[] = [];
    const emailItems: { name: string; qty: number; price: number }[] = [];
    const whatsAppItems: { name: string; quantity: number; price: number }[] = [];

    for (const item of cartItems) {
      const product = productMap.get(item.productId)!;
      subtotal += product.price * item.quantity;
      orderItemsPayload.push({ product_id: item.productId, quantity: item.quantity, price: product.price });
      emailItems.push({ name: product.name, qty: item.quantity, price: product.price });
      whatsAppItems.push({ name: product.name, quantity: item.quantity, price: product.price });
    }

    if (discountPercent > 0) {
      discountAmount = Math.round((subtotal * discountPercent) / 100);
    }
    const total = subtotal - discountAmount;

    // ── 4. Insert order ──────────────────────────────────────
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        customer_name:   formData.customer_name.trim(),
        email:           formData.email.trim().toLowerCase(),
        phone:           formData.phone.trim(),
        address:         formData.address.trim(),
        total_amount:    total,
        promo_code:      promoCode || null,
        discount_amount: discountAmount,
        status:          'Pending',
        whatsapp_sent:   false,
      })
      .select()
      .single();

    if (orderErr || !order) throw orderErr || new Error('Failed to create order');

    // ── 5. Insert order items ────────────────────────────────
    const { error: itemsErr } = await supabase
      .from('order_items')
      .insert(orderItemsPayload.map(i => ({ ...i, order_id: order.id })));

    if (itemsErr) throw itemsErr;

    // ── 6. Decrement stock ───────────────────────────────────
    for (const item of cartItems) {
      const { error: stockErr } = await supabase.rpc('decrement_stock', {
        p_product_id: item.productId,
        p_quantity:   item.quantity,
      });
      if (stockErr) console.error('[Stock Decrement Error]', stockErr);
    }

    // ── 7. Mark whatsapp_sent ────────────────────────────────
    await supabase.from('orders').update({ whatsapp_sent: true }).eq('id', order.id);

    // ── 8. Generate WhatsApp message ─────────────────────────
    const whatsAppNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '2348023208886';
    const whatsAppText   = generateWhatsAppText({
      orderId:      order.id,
      customerName: formData.customer_name,
      phone:        formData.phone,
      address:      formData.address,
      items:        whatsAppItems,
      total,
      discount:     discountAmount,
      promoCode,
    });
    const whatsAppUrl = `https://wa.me/${whatsAppNumber}?text=${encodeURIComponent(whatsAppText)}`;

    // ── 9. Send emails (fire and forget) ─────────────────────
    sendOrderConfirmation({
      to:       formData.email,
      name:     formData.customer_name,
      orderId:  order.id,
      items:    emailItems,
      total,
      discount: discountAmount,
      address:  formData.address,
    }).catch(console.error);

    sendAdminOrderAlert({
      orderId:      order.id,
      customerName: formData.customer_name,
      total,
      itemCount:    cartItems.length,
    }).catch(console.error);

    return NextResponse.json({
      success: true,
      data: {
        orderId:      order.id,
        total,
        discount:     discountAmount,
        whatsAppUrl,
      },
    }, { status: 201 });
  } catch (err) {
    console.error('[Checkout Error]', err);
    return NextResponse.json({ success: false, error: 'Checkout failed. Please try again.' }, { status: 500 });
  }
}
