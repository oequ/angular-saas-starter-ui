import type {
  BillingPlan,
  BillingSummary,
  Invoice,
  InvoiceListPage,
} from '@oequ/ports';

import { MOCK_ORGANIZATIONS } from './mock-data';

const PARCEL_ID = MOCK_ORGANIZATIONS[0].id;
const NOVA_ID = MOCK_ORGANIZATIONS[1].id;

export function addDaysIso(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

export const MOCK_BILLING_SUMMARIES: Readonly<Record<string, BillingSummary>> = {
  [PARCEL_ID]: {
    organizationId: PARCEL_ID,
    planId: 'professional',
    planName: 'Professional',
    status: 'active',
    currentPeriodEnd: addDaysIso(28),
    cancelAtPeriodEnd: false,
    seatsUsed: 5,
    seatsLimit: 5,
    meters: [],
    trialEnd: null,
  },
  [NOVA_ID]: {
    organizationId: NOVA_ID,
    planId: 'starter',
    planName: 'Starter',
    status: 'trialing',
    currentPeriodEnd: addDaysIso(14),
    cancelAtPeriodEnd: false,
    seatsUsed: 2,
    seatsLimit: 10,
    meters: [],
    trialEnd: addDaysIso(5),
  },
};

export const MOCK_BILLING_PLANS: readonly BillingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'For small teams getting started.',
    priceAmount: 29,
    priceCurrency: 'USD',
    interval: 'month',
    features: [
      { id: 'seats', name: 'Up to 10 seats', included: true, limit: 10 },
    ],
    isPerSeat: false,
    isUsageBased: false,
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'For growing teams that need more seats.',
    priceAmount: 49,
    priceCurrency: 'USD',
    interval: 'month',
    features: [
      { id: 'seats', name: 'Up to 50 seats', included: true, limit: 50 },
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
      meters: [],
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

export const MOCK_BILLING_LATENCY_MS = 900;
