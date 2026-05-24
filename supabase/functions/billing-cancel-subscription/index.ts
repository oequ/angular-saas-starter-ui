import Stripe from 'npm:stripe@17.7.0';
import { corsHeaders, handleCors, jsonResponse } from '../_shared/cors.ts';
import {
  applyBillingSubscription,
  BILLING_PROVIDER_STRIPE,
} from '../_shared/billing-rpc.ts';
import {
  getStripe,
  mapSubscriptionStatus,
  planIdFromSubscription,
} from '../_shared/stripe.ts';
import {
  assertOrgAdmin,
  createServiceClient,
  createUserClient,
  requireUser,
} from '../_shared/supabase-clients.ts';

interface CancelBody {
  organization_id?: string;
  reason?: string;
}

function planIdFromStripeSubscription(
  subscription: Stripe.Subscription,
): string {
  if (
    subscription.status === 'canceled' ||
    subscription.status === 'incomplete_expired'
  ) {
    return 'free';
  }
  return planIdFromSubscription(subscription);
}

async function syncSubscription(
  admin: ReturnType<typeof createServiceClient>,
  organizationId: string,
  customerId: string,
  subscription: Stripe.Subscription,
): Promise<void> {
  const periodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000).toISOString()
    : null;

  await applyBillingSubscription(admin, {
    organizationId,
    planId: planIdFromStripeSubscription(subscription),
    provider: BILLING_PROVIDER_STRIPE,
    externalCustomerId: customerId,
    externalSubscriptionId: subscription.id,
    subscriptionStatus: mapSubscriptionStatus(subscription.status),
    currentPeriodEnd: periodEnd,
    cancelAtPeriodEnd: subscription.cancel_at_period_end ?? false,
  });
}

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    if (req.method !== 'POST') {
      return jsonResponse({ error: 'method not allowed' }, 405);
    }

    const body = (await req.json()) as CancelBody;
    const organizationId = body.organization_id?.trim();

    if (!organizationId) {
      return jsonResponse({ error: 'missing organization_id' }, 400);
    }

    if (body.reason?.trim()) {
      console.log('cancel subscription reason', {
        organizationId,
        reason: body.reason.trim(),
      });
    }

    const userClient = createUserClient(req);
    const user = await requireUser(userClient);
    await assertOrgAdmin(userClient, organizationId, user.id);

    const admin = createServiceClient();
    const { data: billingRow, error: billingError } = await admin
      .from('organization_billing')
      .select('external_customer_id, external_subscription_id')
      .eq('organization_id', organizationId)
      .eq('provider', 'stripe')
      .maybeSingle();

    if (billingError) {
      console.error('organization_billing select', billingError);
      return jsonResponse({ error: 'failed to load billing' }, 500);
    }

    const subscriptionId = billingRow?.external_subscription_id as
      | string
      | undefined;
    const customerId = billingRow?.external_customer_id as string | undefined;

    if (!subscriptionId || !customerId) {
      return jsonResponse(
        { error: 'no active stripe subscription for organization' },
        400,
      );
    }

    const stripe = getStripe();
    const updated = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    await syncSubscription(admin, organizationId, customerId, updated);

    return jsonResponse({ ok: true });
  } catch (err) {
    if (err instanceof Response) {
      return new Response(err.body, {
        status: err.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    console.error(err);
    return jsonResponse(
      { error: err instanceof Error ? err.message : 'unknown error' },
      500,
    );
  }
});
