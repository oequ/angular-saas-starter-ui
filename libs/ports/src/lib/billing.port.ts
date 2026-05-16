import { InjectionToken } from '@angular/core';
import type { Observable } from 'rxjs';

import type { BillingSummary } from './models/billing.model';
import type { PortResult } from './models/common.model';
import type { OrganizationId } from './models/org.model';

/**
 * Billing UI stub for v0.1. Full-stack adapter wires Stripe later.
 */
export interface BillingPort {
  readonly summary$: Observable<BillingSummary | null>;

  getSummary(organizationId: OrganizationId): Promise<PortResult<BillingSummary>>;
}

export const BILLING_PORT = new InjectionToken<BillingPort>('BILLING_PORT');
