/**
 * Example: custom payment provider webhook (YooKassa, CloudPayments, invoice, etc.).
 * Copy to `billing-custom-webhook/` and register in supabase/config.toml.
 *
 * Contract:
 * 1. Verify provider signature (your secret) — BEFORE any processing.
 * 2. recordBillingEvent(admin, 'your_provider', eventId, eventType)
 * 3. Map payload → applyBillingSubscription(...) with plan_id + external ids
 *
 * See docs/BILLING_CUSTOM_PROVIDER.md
 */
import {
  applyBillingSubscription,
  recordBillingEvent,
  deleteBillingEvent,
} from '../_shared/billing-rpc.ts';
import { createServiceClient } from '../_shared/supabase-clients.ts';

const PROVIDER_ID = 'custom';

/**
 * Replace with your provider's actual verification logic.
 * Most providers send an HMAC-SHA256 signature in a header; check it
 * against the raw request body before parsing JSON.
 */
async function verifySignature(
  rawBody: string,
  signatureHeader: string | null,
): Promise<boolean> {
  const secret = Deno.env.get('CUSTOM_WEBHOOK_SECRET');
  if (!secret || !signatureHeader) {
    return false;
  }

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const expected = new Uint8Array(
    await crypto.subtle.sign('HMAC', key, encoder.encode(rawBody)),
  );

  const received = new Uint8Array(
    signatureHeader.match(/.{1,2}/g)?.map((b) => parseInt(b, 16)) ?? [],
  );

  if (expected.byteLength !== received.byteLength) {
    return false;
  }

  let diff = 0;
  for (let i = 0; i < expected.byteLength; i++) {
    diff |= expected[i] ^ received[i];
  }
  return diff === 0;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('method not allowed', { status: 405 });
  }

  // --- Step 1: verify signature BEFORE any processing ---
  const rawBody = await req.text();
  const signatureHeader = req.headers.get('X-Webhook-Signature');

  if (!(await verifySignature(rawBody, signatureHeader))) {
    return new Response('invalid signature', { status: 401 });
  }

  // --- Step 2: parse body and record idempotency key ---
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return new Response('invalid JSON', { status: 400 });
  }

  const eventId = String(body?.id ?? '');
  const eventType = String(body?.type ?? 'unknown');

  if (!eventId) {
    return new Response('missing event id', { status: 400 });
  }

  const admin = createServiceClient();

  try {
    const recorded = await recordBillingEvent(
      admin,
      PROVIDER_ID,
      eventId,
      eventType,
    );
    if (recorded === 'duplicate') {
      return new Response(JSON.stringify({ received: true, duplicate: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // --- Step 3: map the event and apply billing subscription ---
    // await applyBillingSubscription(admin, {
    //   organizationId: String(body.organization_id),
    //   planId: 'pro',
    //   provider: PROVIDER_ID,
    //   externalCustomerId: String(body.customer_id),
    //   externalSubscriptionId: body.subscription_id ? String(body.subscription_id) : null,
    //   subscriptionStatus: 'active',
    //   currentPeriodEnd: null,
    //   cancelAtPeriodEnd: false,
    // });

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    await deleteBillingEvent(admin, PROVIDER_ID, eventId);
    console.error('custom webhook failed', err);
    return new Response('webhook processing failed', { status: 500 });
  }
});
