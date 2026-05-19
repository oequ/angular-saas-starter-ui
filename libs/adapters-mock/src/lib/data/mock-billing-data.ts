import type {
  BillingPlan,
  BillingSummary,
  Invoice,
  InvoiceListPage,
  PaymentMethod,
  UsageMeter,
} from '@oequ/ports';

import { MOCK_ORGANIZATIONS } from './mock-data';

const PARCEL_ID = MOCK_ORGANIZATIONS[0].id;
const NOVA_ID = MOCK_ORGANIZATIONS[1].id;
const LUMEN_ID = MOCK_ORGANIZATIONS[2].id;

const PARCEL_METERS: readonly UsageMeter[] = [
  {
    metricId: 'emails_sent',
    name: 'Emails sent',
    consumed: 12_400,
    limit: 50_000,
    available: true,
    unit: 'emails',
  },
  {
    metricId: 'api_requests',
    name: 'API requests',
    consumed: 89_000,
    limit: 500_000,
    available: true,
  },
  {
    metricId: 'webhook_deliveries',
    name: 'Webhook deliveries',
    consumed: 1_200,
    limit: 10_000,
    available: true,
  },
  {
    metricId: 'storage_size',
    name: 'Storage size',
    consumed: 0.45,
    limit: 5,
    available: true,
    unit: 'GB',
  },
];

const NOVA_METERS: readonly UsageMeter[] = [
  {
    metricId: 'emails_sent',
    name: 'Emails sent',
    consumed: 890,
    limit: 10_000,
    available: true,
    unit: 'emails',
  },
  {
    metricId: 'api_requests',
    name: 'API requests',
    consumed: 12_000,
    limit: 100_000,
    available: true,
  },
  {
    metricId: 'webhook_deliveries',
    name: 'Webhook deliveries',
    consumed: 45,
    limit: 2_000,
    available: true,
  },
  {
    metricId: 'storage_size',
    name: 'Storage size',
    consumed: 0.08,
    limit: 1,
    available: true,
    unit: 'GB',
  },
];

const FREE_METERS: readonly UsageMeter[] = [
  {
    metricId: 'emails_sent',
    name: 'Emails sent',
    consumed: 52,
    limit: 3_000,
    available: true,
    unit: 'emails',
  },
  {
    metricId: 'api_requests',
    name: 'API requests',
    consumed: 11,
    limit: 100,
    available: true,
  },
  {
    metricId: 'webhook_deliveries',
    name: 'Webhook deliveries',
    consumed: 0,
    limit: 100,
    available: true,
  },
  {
    metricId: 'storage_size',
    name: 'Storage size',
    consumed: 0,
    limit: 0.5,
    available: true,
    unit: 'GB',
  },
];

export function addDaysIso(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

export const MOCK_BILLING_SUMMARIES: Readonly<Record<string, BillingSummary>> = {
  [PARCEL_ID]: {
    organizationId: PARCEL_ID,
    planId: 'team',
    planName: 'Team',
    status: 'active',
    currentPeriodEnd: addDaysIso(28),
    cancelAtPeriodEnd: false,
    seatsUsed: 4,
    seatsLimit: 50,
    meters: PARCEL_METERS,
    trialEnd: null,
  },
  [NOVA_ID]: {
    organizationId: NOVA_ID,
    planId: 'pro',
    planName: 'Pro',
    status: 'trialing',
    currentPeriodEnd: addDaysIso(14),
    cancelAtPeriodEnd: false,
    seatsUsed: 2,
    seatsLimit: 10,
    meters: NOVA_METERS,
    trialEnd: addDaysIso(5),
  },
  [LUMEN_ID]: {
    organizationId: LUMEN_ID,
    planId: null,
    planName: 'Free',
    status: 'none',
    currentPeriodEnd: addDaysIso(30),
    cancelAtPeriodEnd: false,
    seatsUsed: 4,
    seatsLimit: 3,
    meters: FREE_METERS,
    trialEnd: null,
  },
};

export const MOCK_BILLING_PLANS: readonly BillingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'For personal projects and experiments.',
    priceAmount: 0,
    priceCurrency: 'USD',
    interval: 'month',
    features: [
      { id: 'seats', name: 'Up to 3 seats', included: true, limit: 3 },
      { id: 'metrics', name: 'Basic metrics', included: true },
      { id: 'api_keys', name: 'Sending-only API keys', included: true },
    ],
    isPerSeat: false,
    isUsageBased: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For small teams shipping to production.',
    priceAmount: 25,
    priceCurrency: 'USD',
    interval: 'month',
    features: [
      { id: 'seats', name: 'Up to 10 seats', included: true, limit: 10 },
      { id: 'metrics', name: 'Advanced metrics & filters', included: true },
      { id: 'api_keys', name: 'Full-access API keys', included: true },
      { id: 'support', name: 'Email support', included: true },
    ],
    isPerSeat: false,
    isUsageBased: false,
  },
  {
    id: 'team',
    name: 'Team',
    description: 'For organizations that need SSO and scale.',
    priceAmount: 49,
    priceCurrency: 'USD',
    interval: 'month',
    features: [
      { id: 'seats', name: 'Up to 50 seats', included: true, limit: 50 },
      { id: 'sso', name: 'Single Sign-On (SSO)', included: true },
      { id: 'api_keys', name: 'Full-access API keys', included: true },
      { id: 'support', name: 'Priority support', included: true },
      { id: 'audit', name: 'Audit logs', included: true },
    ],
    isPerSeat: true,
    isUsageBased: false,
  },
];

const MOCK_INVOICES_BY_ORG: Readonly<Record<string, readonly Invoice[]>> = {
  [PARCEL_ID]: [
    {
      id: 'inv_parcel_1',
      number: 'PARCEL-1001',
      amountDue: 4900,
      amountPaid: 4900,
      currency: 'USD',
      status: 'paid',
      created: addDaysIso(-30),
      hostedInvoiceUrl: 'https://example.com/invoices/parcel-1001',
      invoicePdf: 'https://example.com/invoices/parcel-1001.pdf',
    },
    {
      id: 'inv_parcel_2',
      number: 'PARCEL-1002',
      amountDue: 4900,
      amountPaid: 4900,
      currency: 'USD',
      status: 'paid',
      created: addDaysIso(-60),
      hostedInvoiceUrl: 'https://example.com/invoices/parcel-1002',
      invoicePdf: 'https://example.com/invoices/parcel-1002.pdf',
    },
  ],
  [NOVA_ID]: [
    {
      id: 'inv_nova_1',
      number: 'NOVA-2001',
      amountDue: 0,
      amountPaid: 0,
      currency: 'USD',
      status: 'paid',
      created: addDaysIso(-7),
      hostedInvoiceUrl: 'https://example.com/invoices/nova-2001',
      invoicePdf: 'https://example.com/invoices/nova-2001.pdf',
    },
  ],
};

export function mockBillingSummaryForOrg(
  organizationId: string,
): BillingSummary {
  return (
    MOCK_BILLING_SUMMARIES[organizationId] ?? {
      organizationId,
      planId: null,
      planName: 'Free',
      status: 'none',
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      seatsUsed: 1,
      seatsLimit: 3,
      meters: FREE_METERS,
      trialEnd: null,
    }
  );
}

export function mockInvoicesForOrg(organizationId: string): InvoiceListPage {
  return {
    items: MOCK_INVOICES_BY_ORG[organizationId] ?? [],
    nextCursor: null,
  };
}

const MOCK_PAYMENT_METHODS_BY_ORG: Readonly<
  Record<string, readonly PaymentMethod[]>
> = {
  [PARCEL_ID]: [
    {
      id: 'pm_parcel_default',
      brand: 'visa',
      last4: '4242',
      expMonth: 12,
      expYear: 2028,
      isDefault: true,
    },
  ],
  [NOVA_ID]: [
    {
      id: 'pm_nova_default',
      brand: 'mastercard',
      last4: '4444',
      expMonth: 8,
      expYear: 2027,
      isDefault: true,
    },
  ],
};

export function mockPaymentMethodsForOrg(
  organizationId: string,
): readonly PaymentMethod[] {
  const seeded = MOCK_PAYMENT_METHODS_BY_ORG[organizationId] ?? [];
  return seeded.map((method) => ({ ...method }));
}

export const MOCK_BILLING_LATENCY_MS = 900;
