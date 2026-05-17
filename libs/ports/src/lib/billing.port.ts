import { InjectionToken } from '@angular/core';
import type { Observable } from 'rxjs';

import type {
  BillingPlan,
  BillingSummary,
  CheckoutSession,
  InvoiceListPage,
  PortalSession,
} from './models/billing.model';
import type { PortResult } from './models/common.model';
import type { OrganizationId } from './models/org.model';

/**
 * Billing UI contract. v0.3: mock adapter; v1.0: Stripe via full-stack repo.
 * Loaders accept AbortSignal for rxResource / workspace switch safety.
 */
export interface BillingPort {
  /** Optional hot stream for shell; prefer rxResource per organizationId in features. */
  readonly summary$: Observable<BillingSummary | null>;

  getSummary(
    organizationId: OrganizationId,
    abortSignal?: AbortSignal,
  ): Promise<PortResult<BillingSummary>>;

  listInvoices(
    organizationId: OrganizationId,
    cursor?: string,
    abortSignal?: AbortSignal,
  ): Promise<PortResult<InvoiceListPage>>;

  listAvailablePlans(
    abortSignal?: AbortSignal,
  ): Promise<PortResult<readonly BillingPlan[]>>;

  createCheckoutSession(
    organizationId: OrganizationId,
    planId: string,
    seats: number,
  ): Promise<PortResult<CheckoutSession>>;

  /** After hosted/embedded checkout completes (mock: simulated; v1.0: polls backend). */
  confirmCheckout(
    organizationId: OrganizationId,
  ): Promise<PortResult<BillingSummary>>;

  createPortalSession(
    organizationId: OrganizationId,
    returnUrl: string,
  ): Promise<PortResult<PortalSession>>;

  cancelSubscription(
    organizationId: OrganizationId,
    reason: string,
  ): Promise<PortResult<void>>;
}

export const BILLING_PORT = new InjectionToken<BillingPort>('BILLING_PORT');
