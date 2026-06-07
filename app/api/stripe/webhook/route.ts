import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase/admin';
import Stripe from 'stripe';

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return new Response('Missing stripe-signature header', { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(`Erreur de validation du Webhook Stripe: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    // Handle specific event types
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const subscriptionId = session.subscription as string;
      const userId = session.client_reference_id as string;

      if (subscriptionId && userId) {
        const subscription = (await stripe.subscriptions.retrieve(subscriptionId)) as any;
        
        const { error } = await supabaseAdmin
          .from('subscriptions')
          .upsert({
            id: subscriptionId,
            user_id: userId,
            status: subscription.status,
            price_id: subscription.items.data[0].price.id,
            cancel_at_period_end: subscription.cancel_at_period_end,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          });

        if (error) {
          console.error("Erreur d'insertion de l'abonnement via webhook:", error);
          return new Response(`Database error: ${error.message}`, { status: 500 });
        }
      }
    }

    if (
      event.type === 'customer.subscription.updated' ||
      event.type === 'customer.subscription.deleted'
    ) {
      const subscription = event.data.object as any;
      const userId = subscription.metadata?.user_id;

      if (userId) {
        const { error } = await supabaseAdmin
          .from('subscriptions')
          .upsert({
            id: subscription.id,
            user_id: userId,
            status: subscription.status,
            price_id: subscription.items.data[0].price.id,
            cancel_at_period_end: subscription.cancel_at_period_end,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          });

        if (error) {
          console.error("Erreur de mise à jour de l'abonnement via webhook:", error);
          return new Response(`Database error: ${error.message}`, { status: 500 });
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });

  } catch (error: any) {
    console.error("Erreur dans le handler de webhook Stripe:", error);
    return new Response(`Internal Server Error: ${error.message}`, { status: 500 });
  }
}
