import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { MONEROO_API_KEY, MONEROO_BASE_URL } from '@/lib/moneroo';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    console.log('[Moneroo Checkout] Starting checkout process');
    const supabase = await createClient();

    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('[Moneroo Checkout] Auth error:', authError);
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    console.log('[Moneroo Checkout] User authenticated:', user.email);

    const { origin } = new URL(request.url);
    const productDocumentId = process.env.MONEROO_PRODUCT_ID; // ID du produit dans Moneroo

    console.log('[Moneroo Checkout] Env check:', {
      MONEROO_API_KEY: MONEROO_API_KEY ? 'exists' : 'missing',
      MONEROO_PRODUCT_ID: productDocumentId ? 'exists' : 'missing',
      MONEROO_BASE_URL,
    });

    if (!MONEROO_API_KEY) {
      console.error('[Moneroo Checkout] Missing config');
      return NextResponse.json({ error: 'Configuration du paiement incomplète' }, { status: 500 });
    }

    const fullName = user.user_metadata?.full_name || 'Utilisateur';
    const firstName = fullName.split(' ')[0];
    const lastName = fullName.split(' ').slice(1).join(' ').trim() || 'User'; // Fixed: trim and default to User

    // Generate a unique cart ID
    const cartId = crypto.randomUUID();

    // 2. Initiate Moneroo Checkout (based on the error we saw)
    console.log('[Moneroo Checkout] Calling Moneroo API with:', { amount: 8160, currency: 'XOF', description: 'Job Copilot Premium', email: user.email, firstName, lastName, return_url: `${origin}/dashboard?cartId=${cartId}` });
    const checkoutResponse = await fetch(`${MONEROO_BASE_URL}/payments/initialize`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MONEROO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: 8160,
        currency: 'XOF',
        description: 'Job Copilot Premium',
        return_url: `${origin}/dashboard?cartId=${cartId}`,
        customer: {
          email: user.email,
          first_name: firstName,
          last_name: lastName,
        },
        metadata: {
          id: cartId,
          object: 'order',
          userId: user.id,
        },
      }),
    });

    console.log('[Moneroo Checkout] Moneroo response status:', checkoutResponse.status);

    if (!checkoutResponse.ok) {
      const errorText = await checkoutResponse.text();
      console.error('[Moneroo Checkout] Moneroo error response:', errorText);
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }
      throw new Error(errorData.message || 'Erreur lors de la création du paiement');
    }

    const checkoutData = await checkoutResponse.json();
    console.log('[Moneroo Checkout] Moneroo success response:', checkoutData);

    return NextResponse.json({ url: checkoutData.data?.checkout_url || checkoutData.checkout_url });

  } catch (error: any) {
    console.error("[Moneroo Checkout] Full error:", error);
    return NextResponse.json({ error: error.message || 'Impossible de procéder au paiement.' }, { status: 500 });
  }
}
