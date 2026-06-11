import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { origin } = new URL(request.url);

    // TEMPORARY BYPASS: Directly unlock premium status without Stripe checkout
    const { error: insertError } = await supabaseAdmin
      .from('subscriptions')
      .upsert({
        id: `sub_mock_${Date.now()}`,
        user_id: user.id,
        status: 'active',
        price_id: 'mock_price_id',
        cancel_at_period_end: false,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });

    if (insertError) {
      console.error("Erreur d'insertion abonnement mock:", insertError);
      return NextResponse.json({ error: 'Impossible de déverrouiller le compte.' }, { status: 500 });
    }

    return NextResponse.json({ url: `${origin}/dashboard?payment_success=true` });

  } catch (error: any) {
    console.error("Erreur Mock Checkout:", error);
    return NextResponse.json({ error: 'Impossible de déverrouiller le compte.' }, { status: 500 });
  }
}
