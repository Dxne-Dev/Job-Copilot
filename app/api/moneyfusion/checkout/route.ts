import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { MONEYFUSION_API_URL } from '@/lib/moneyfusion';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    console.log('[MoneyFusion Checkout] Starting checkout process');
    const supabase = await createClient();

    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('[MoneyFusion Checkout] Auth error:', authError);
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { phoneNumber } = body;

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Numéro de téléphone requis' }, { status: 400 });
    }

    console.log('[MoneyFusion Checkout] User authenticated:', user.email);
    console.log('[MoneyFusion Checkout] Phone number:', phoneNumber);

    const { origin } = new URL(request.url);

    console.log('[MoneyFusion Checkout] Env check:', {
      MONEYFUSION_API_URL: MONEYFUSION_API_URL ? 'exists' : 'missing',
    });

    if (!MONEYFUSION_API_URL) {
      console.error('[MoneyFusion Checkout] Missing config: MONEYFUSION_API_URL');
      return NextResponse.json(
        { error: 'Configuration du paiement incomplète (ajoutez MONEYFUSION_API_URL dans les variables d\'environnement Vercel)' },
        { status: 500 }
      );
    }

    const fullName = user.user_metadata?.full_name || 'Utilisateur';
    const token = crypto.randomUUID();

    // 2. Initiate MoneyFusion Checkout
    const paymentData = {
      totalPrice: 8160, // XOF amount
      article: [
        {
          'Abonnement Premium JobCopilot': 8160,
        },
      ],
      personal_Info: [
        {
          userId: user.id,
          orderId: token,
        },
      ],
      numeroSend: phoneNumber,
      nomclient: fullName,
      return_url: `${origin}/dashboard?token=${token}`,
    };

    console.log('[MoneyFusion Checkout] Calling MoneyFusion API with:', paymentData);

    const checkoutResponse = await fetch(MONEYFUSION_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    console.log('[MoneyFusion Checkout] MoneyFusion response status:', checkoutResponse.status);

    const rawResponse = await checkoutResponse.text();
    console.log('[MoneyFusion Checkout] MoneyFusion raw response:', rawResponse);

    if (!checkoutResponse.ok) {
      console.error('[MoneyFusion Checkout] MoneyFusion error response:', rawResponse);
      throw new Error('Échec de création de la session de paiement MoneyFusion');
    }

    let checkoutData;
    try {
      checkoutData = JSON.parse(rawResponse);
    } catch (err) {
      console.error('[MoneyFusion Checkout] Failed to parse MoneyFusion response as JSON');
      throw new Error('Réponse MoneyFusion invalide');
    }
    console.log('[MoneyFusion Checkout] MoneyFusion parsed response:', checkoutData);

    // Store the user in Supabase (if not already there)
    try {
      await supabaseAdmin.from('users').upsert({
        id: user.id,
        email: user.email,
        full_name: fullName,
      });
    } catch (err) {
      console.error('Error upserting user:', err);
    }

    return NextResponse.json({ url: checkoutData.url, token: checkoutData.token });
  } catch (error: any) {
    console.error('[MoneyFusion Checkout] Full error:', error);
    return NextResponse.json(
      { error: error.message || 'Impossible de procéder au paiement.' },
      { status: 500 }
    );
  }
}
