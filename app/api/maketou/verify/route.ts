import { NextResponse } from 'next/server';
import { MAKETOU_API_KEY, MAKETOU_BASE_URL } from '@/lib/maketou';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const { cartId } = await request.json();

    if (!cartId) {
      return NextResponse.json({ error: 'Cart ID missing' }, { status: 400 });
    }

    // Get cart status from Maketou
    const response = await fetch(`${MAKETOU_BASE_URL}/stores/cart/${cartId}`, {
      headers: {
        'Authorization': `Bearer ${MAKETOU_API_KEY}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to check cart' }, { status: 500 });
    }

    const cart = await response.json();

    // If payment completed, activate subscription
    if (cart.status === 'completed') {
      const userId = cart.meta?.userId;
      
      if (userId) {
        const { error } = await supabaseAdmin
          .from('subscriptions')
          .upsert({
            id: `maketou_${cartId}`,
            user_id: userId,
            status: 'active',
            price_id: cart.productDocumentId,
            cancel_at_period_end: false,
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          });

        if (error) {
          console.error('Failed to activate subscription:', error);
          return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }
      }

      return NextResponse.json({ success: true, status: cart.status });
    }

    return NextResponse.json({ success: false, status: cart.status });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
