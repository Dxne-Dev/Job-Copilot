import { NextResponse } from 'next/server';
import { MONEROO_API_KEY, MONEROO_BASE_URL } from '@/lib/moneroo';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const { cartId } = await request.json();

    if (!cartId) {
      return NextResponse.json({ error: 'Cart ID missing' }, { status: 400 });
    }

    // Get payment status from Moneroo
    console.log('[Moneroo Verify] Checking payment status for cartId:', cartId);
    const response = await fetch(`${MONEROO_BASE_URL}/payments/${cartId}`, {
      headers: {
        'Authorization': `Bearer ${MONEROO_API_KEY}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Moneroo Verify] Error response:', errorText);
      return NextResponse.json({ error: 'Failed to check payment' }, { status: 500 });
    }

    const paymentData = await response.json();
    console.log('[Moneroo Verify] Payment data:', paymentData);

    // If payment completed, activate subscription
    if (paymentData.data?.status === 'success' || paymentData.status === 'success') {
      const userId = paymentData.data?.metadata?.userId || paymentData.metadata?.userId;
      
      if (userId) {
        const { error } = await supabaseAdmin
          .from('subscriptions')
          .upsert({
            id: `moneroo_${cartId}`,
            user_id: userId,
            status: 'active',
            cancel_at_period_end: false,
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          });

        if (error) {
          console.error('Failed to activate subscription:', error);
          return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }
      }

      return NextResponse.json({ success: true, status: paymentData.data?.status || paymentData.status });
    }

    return NextResponse.json({ success: false, status: paymentData.data?.status || paymentData.status });
  } catch (error) {
    console.error('[Moneroo Verify] Full error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
