import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { MAKETOU_API_KEY, MAKETOU_BASE_URL } from '@/lib/maketou';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    console.log('[Maketou Checkout] Starting checkout process');
    const supabase = await createClient();

    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('[Maketou Checkout] Auth error:', authError);
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    console.log('[Maketou Checkout] User authenticated:', user.email);

    const { origin } = new URL(request.url);
    const productDocumentId = process.env.MAKETOU_PRODUCT_ID; // ID du produit dans Maketou

    console.log('[Maketou Checkout] Env check:', {
      MAKETOU_API_KEY: MAKETOU_API_KEY ? 'exists' : 'missing',
      MAKETOU_PRODUCT_ID: productDocumentId ? 'exists' : 'missing',
      MAKETOU_BASE_URL,
    });

    if (!MAKETOU_API_KEY || !productDocumentId) {
      console.error('[Maketou Checkout] Missing config');
      return NextResponse.json({ error: 'Configuration du paiement incomplète' }, { status: 500 });
    }

    const fullName = user.user_metadata?.full_name || 'Utilisateur';
    const firstName = fullName.split(' ')[0];
    const lastName = fullName.split(' ').slice(1).join(' ') || ' ';

    // 2. Initiate Maketou Checkout
    console.log('[Maketou Checkout] Calling Maketou API with:', { productDocumentId, email: user.email, firstName, lastName, redirectURL: `${origin}/dashboard?cartId={cartId}` });
    const checkoutResponse = await fetch(`${MAKETOU_BASE_URL}/stores/cart/checkout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MAKETOU_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productDocumentId: productDocumentId,
        email: user.email,
        firstName: firstName,
        lastName: lastName,
        redirectURL: `${origin}/dashboard?cartId={cartId}`,
        meta: {
          userId: user.id,
        },
      }),
    });

    console.log('[Maketou Checkout] Maketou response status:', checkoutResponse.status);

    if (!checkoutResponse.ok) {
      const errorText = await checkoutResponse.text();
      console.error('[Maketou Checkout] Maketou error response:', errorText);
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }
      throw new Error(errorData.message || 'Erreur lors de la création du paiement');
    }

    const checkoutData = await checkoutResponse.json();
    console.log('[Maketou Checkout] Maketou success response:', checkoutData);

    // For demo/testing, we can also directly give access if needed, but wait for payment confirmation
    // In production, use webhook or status check

    return NextResponse.json({ url: checkoutData.redirectUrl });

  } catch (error: any) {
    console.error("[Maketou Checkout] Full error:", error);
    return NextResponse.json({ error: error.message || 'Impossible de procéder au paiement.' }, { status: 500 });
  }
}
