import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 400 });
    }

    console.log('[MoneyFusion Verify] Checking payment status for token:', token);
    const response = await fetch(`https://www.pay.moneyfusion.net/paiementNotif/${token}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[MoneyFusion Verify] Error response:', errorText);
      return NextResponse.json({ error: 'Impossible de vérifier le paiement' }, { status: 500 });
    }

    const paymentData = await response.json();
    console.log('[MoneyFusion Verify] Payment data:', paymentData);

    if (paymentData.statut && paymentData.data?.statut === 'paid') {
      const userId = paymentData.data.personal_Info?.[0]?.userId;

      if (userId) {
        const { error } = await supabaseAdmin
          .from('subscriptions')
          .upsert({
            id: `moneyfusion_${token}`,
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

      return NextResponse.json({ success: true, status: paymentData.data?.statut });
    }

    return NextResponse.json({ success: false, status: paymentData.data?.statut });
  } catch (error) {
    console.error('[MoneyFusion Verify] Full error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
