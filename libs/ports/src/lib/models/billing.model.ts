import type { OrganizationId } from './org.model';

export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'none';

export interface BillingSummary {
  readonly organizationId: OrganizationId;
  readonly status: SubscriptionStatus;
  readonly planId: string | null;
  readonly seatsUsed: number;
  readonly seatsLimit: number | null;
}
