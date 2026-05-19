import { Injectable } from '@angular/core';
import {
  alignBillingSummarySeats,
  BILLING_PORT,
  type BillingPort,
  type BillingPlan,
  type BillingSummary,
  type CheckoutSession,
  type CommercialPlanId,
  type InvoiceListPage,
  type OrganizationId,
  type PortalSession,
  comparePlanTiers,
  getDowngradeBlocker,
  getPlanChangeDirection,
  portErr,
  portOk,
  type PortResult,
  resolveCurrentPlanId,
} from '@oequ/ports';
import { BehaviorSubject, type Observable } from 'rxjs';

import {
  addDaysIso,
  MOCK_BILLING_LATENCY_MS,
  MOCK_BILLING_PLANS,
  mockBillingSummaryForOrg,
  mockInvoicesForOrg,
} from './data/mock-billing-data';
import { MOCK_ORGANIZATIONS } from './data/mock-data';

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason ?? new DOMException('Aborted', 'AbortError'));
      return;
    }
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(signal.reason ?? new DOMException('Aborted', 'AbortError'));
      },
      { once: true },
    );
  });
}

@Injectable()
export class MockBillingAdapter implements BillingPort {
  private pendingCheckout: { organizationId: string; planId: string } | null =
    null;

  private readonly summaries = new Map<string, BillingSummary>(
    MOCK_ORGANIZATIONS.map((org) => {
      const summary = alignBillingSummarySeats(
        { ...mockBillingSummaryForOrg(org.id) },
        MOCK_BILLING_PLANS,
      );
      return [org.id, summary] as const;
    }),
  );

  private readonly summarySubject = new BehaviorSubject<BillingSummary | null>(
    this.summaries.get(MOCK_ORGANIZATIONS[0].id) ?? null,
  );

  readonly summary$: Observable<BillingSummary | null> =
    this.summarySubject.asObservable();

  async getSummary(
    organizationId: OrganizationId,
    abortSignal?: AbortSignal,
  ): Promise<PortResult<BillingSummary>> {
    await delay(MOCK_BILLING_LATENCY_MS, abortSignal);
    const summary = this.persistSummary(
      this.getOrCreateSummary(organizationId),
    );
    this.summarySubject.next(summary);
    return portOk(summary);
  }

  async listInvoices(
    organizationId: OrganizationId,
    _cursor?: string,
    abortSignal?: AbortSignal,
  ): Promise<PortResult<InvoiceListPage>> {
    await delay(MOCK_BILLING_LATENCY_MS, abortSignal);
    return portOk(mockInvoicesForOrg(organizationId));
  }

  async listAvailablePlans(
    abortSignal?: AbortSignal,
  ): Promise<PortResult<readonly BillingPlan[]>> {
    await delay(MOCK_BILLING_LATENCY_MS, abortSignal);
    return portOk(MOCK_BILLING_PLANS);
  }

  async createCheckoutSession(
    organizationId: OrganizationId,
    planId: string,
    seats: number,
  ): Promise<PortResult<CheckoutSession>> {
    await delay(400);
    this.pendingCheckout = { organizationId, planId };
    return portOk({
      clientSecret: `mock_cs_${organizationId}_${planId}_${seats}`,
    });
  }

  async confirmCheckout(
    organizationId: OrganizationId,
  ): Promise<PortResult<BillingSummary>> {
    await delay(500);
    const pending = this.pendingCheckout;
    if (pending?.organizationId === organizationId) {
      this.applyMockPlanChange(organizationId, pending.planId);
      this.pendingCheckout = null;
    }
    const summary = this.getOrCreateSummary(organizationId);
    this.summarySubject.next(summary);
    return portOk(summary);
  }

  async changePlan(
    organizationId: OrganizationId,
    planId: string,
  ): Promise<PortResult<BillingSummary>> {
    await delay(400);
    const current = this.getOrCreateSummary(organizationId);
    const currentTier = resolveCurrentPlanId(current);
    const targetTier = planId as CommercialPlanId;

    if (getPlanChangeDirection(currentTier, targetTier) !== 'downgrade') {
      return portErr({
        code: 'VALIDATION',
        message: 'Only downgrades are supported on this action.',
      });
    }

    const blocker = getDowngradeBlocker(current, planId, MOCK_BILLING_PLANS);
    if (blocker) {
      return portErr({
        code: 'PLAN_DOWNGRADE_BLOCKED',
        message: blocker,
      });
    }

    const summary = this.persistSummary(
      this.applyMockPlanChangeSummary(organizationId, planId, current),
    );
    return portOk(summary);
  }

  async createPortalSession(
    _organizationId: OrganizationId,
    returnUrl: string,
  ): Promise<PortResult<PortalSession>> {
    await delay(300);
    return portOk({
      url: `${returnUrl}?mock-portal=1`,
    });
  }

  async cancelSubscription(
    organizationId: OrganizationId,
    reason: string,
  ): Promise<PortResult<void>> {
    void reason;
    await delay(400);
    const current = this.getOrCreateSummary(organizationId);
    this.persistSummary({
      ...current,
      cancelAtPeriodEnd: true,
      status: current.status === 'trialing' ? 'canceled' : current.status,
    });
    return portOk(undefined);
  }

  seedOrganization(organizationId: OrganizationId): void {
    this.persistSummary({
      organizationId,
      planId: 'pro',
      planName: 'Pro',
      status: 'trialing',
      currentPeriodEnd: addDaysIso(14),
      cancelAtPeriodEnd: false,
      seatsUsed: 1,
      seatsLimit: 10,
      meters: [],
      trialEnd: addDaysIso(14),
    });
  }

  removeOrganization(organizationId: OrganizationId): void {
    this.summaries.delete(organizationId);
    if (this.summarySubject.value?.organizationId === organizationId) {
      this.summarySubject.next(null);
    }
  }

  adjustSeatsUsed(organizationId: OrganizationId, delta: number): void {
    const current = this.getOrCreateSummary(organizationId);
    this.syncSeatsUsed(organizationId, Math.max(0, current.seatsUsed + delta));
  }

  /** Authoritative seat usage from org members (active + invited). */
  syncSeatsUsed(organizationId: OrganizationId, seatsUsed: number): void {
    const current = this.getOrCreateSummary(organizationId);
    this.persistSummary({ ...current, seatsUsed });
  }

  /** Restores fixture billing data (E2E / screenshot runs). */
  resetMockState(): void {
    this.pendingCheckout = null;
    this.summaries.clear();
    for (const org of MOCK_ORGANIZATIONS) {
      this.persistSummary({ ...mockBillingSummaryForOrg(org.id) });
    }
    this.summarySubject.next(
      this.summaries.get(MOCK_ORGANIZATIONS[0].id) ?? null,
    );
  }

  /** Called by mock checkout UI after simulated payment success. */
  applyMockUpgrade(organizationId: OrganizationId, planId: string): void {
    const current = this.getOrCreateSummary(organizationId);
    this.persistSummary(
      this.applyMockPlanChangeSummary(organizationId, planId, current),
    );
  }

  private applyMockPlanChange(
    organizationId: OrganizationId,
    planId: string,
  ): void {
    const current = this.getOrCreateSummary(organizationId);
    this.persistSummary(
      this.applyMockPlanChangeSummary(organizationId, planId, current),
    );
  }

  private applyMockPlanChangeSummary(
    organizationId: OrganizationId,
    planId: string,
    current: BillingSummary,
  ): BillingSummary {
    void organizationId;
    const plan = MOCK_BILLING_PLANS.find((p) => p.id === planId);
    const targetTier = planId as CommercialPlanId;
    const isDowngrade =
      comparePlanTiers(targetTier, resolveCurrentPlanId(current)) < 0;

    return {
      ...current,
      planId,
      planName: plan?.name ?? planId,
      status: isDowngrade && current.status === 'trialing' ? 'active' : current.status,
      cancelAtPeriodEnd: false,
      trialEnd: isDowngrade ? null : current.trialEnd,
    };
  }

  private getOrCreateSummary(organizationId: OrganizationId): BillingSummary {
    const existing = this.summaries.get(organizationId);
    if (existing) {
      return this.normalizeSummary(existing);
    }
    const created = this.normalizeSummary({
      ...mockBillingSummaryForOrg(organizationId),
    });
    this.summaries.set(organizationId, created);
    return created;
  }

  private normalizeSummary(summary: BillingSummary): BillingSummary {
    return alignBillingSummarySeats(summary, MOCK_BILLING_PLANS);
  }

  private persistSummary(summary: BillingSummary): BillingSummary {
    const next = this.normalizeSummary(summary);
    this.summaries.set(summary.organizationId, next);
    if (this.summarySubject.value?.organizationId === summary.organizationId) {
      this.summarySubject.next(next);
    }
    return next;
  }
}

export const MOCK_BILLING_PROVIDER = {
  provide: BILLING_PORT,
  useExisting: MockBillingAdapter,
};
