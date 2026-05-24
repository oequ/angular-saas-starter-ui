import { inject, Injectable } from '@angular/core';
import { MockBillingAdapter } from '@oequ/adapters-mock';
import {
  BILLING_PORT,
  portOk,
  type AddPaymentMethodInput,
  type BillingPort,
  type BillingPlan,
  type BillingSummary,
  type CheckoutSession,
  type InvoiceListPage,
  type OrganizationId,
  type PaymentMethod,
  type PortalSession,
  type PortResult,
} from '@oequ/ports';
import type { Observable } from 'rxjs';

import { SupabaseClientService } from './supabase-client.service';
import { supabaseErr } from './supabase-port-error';
import { supabaseErrFromRpc } from './supabase-rpc-error';

interface BillingSnapshotRpc {
  plan_id: string;
  seats_limit: number;
  seats_used: number;
}

const PLAN_NAMES: Readonly<Record<string, string>> = {
  free: 'Free',
  pro: 'Pro',
  team: 'Team',
};

@Injectable()
export class WebBillingAdapter implements BillingPort {
  private readonly mock = inject(MockBillingAdapter);
  private readonly supabase = inject(SupabaseClientService);

  get summary$(): Observable<BillingSummary | null> {
    return this.mock.summary$;
  }

  getSummary(
    organizationId: OrganizationId,
    abortSignal?: AbortSignal,
  ): Promise<PortResult<BillingSummary>> {
    return this.withPostgresSnapshot(
      organizationId,
      this.mock.getSummary(organizationId, abortSignal),
    );
  }

  listInvoices(
    organizationId: OrganizationId,
    cursor?: string,
    abortSignal?: AbortSignal,
  ): Promise<PortResult<InvoiceListPage>> {
    return this.mock.listInvoices(organizationId, cursor, abortSignal);
  }

  listAvailablePlans(
    abortSignal?: AbortSignal,
  ): Promise<PortResult<readonly BillingPlan[]>> {
    return this.mock.listAvailablePlans(abortSignal);
  }

  createCheckoutSession(
    organizationId: OrganizationId,
    planId: string,
    seats: number,
  ): Promise<PortResult<CheckoutSession>> {
    return this.mock.createCheckoutSession(organizationId, planId, seats);
  }

  async confirmCheckout(
    organizationId: OrganizationId,
  ): Promise<PortResult<BillingSummary>> {
    const result = await this.mock.confirmCheckout(organizationId);
    if (!result.ok) {
      return result;
    }
    const planId = result.data.planId ?? 'free';
    const syncError = await this.syncPlanToPostgres(organizationId, planId);
    if (syncError) {
      return syncError;
    }
    return this.getSummary(organizationId);
  }

  async changePlan(
    organizationId: OrganizationId,
    planId: string,
  ): Promise<PortResult<BillingSummary>> {
    const result = await this.mock.changePlan(organizationId, planId);
    if (!result.ok) {
      return result;
    }
    const syncError = await this.syncPlanToPostgres(organizationId, planId);
    if (syncError) {
      return syncError;
    }
    return this.getSummary(organizationId);
  }

  createPortalSession(
    organizationId: OrganizationId,
    returnUrl: string,
  ): Promise<PortResult<PortalSession>> {
    return this.mock.createPortalSession(organizationId, returnUrl);
  }

  listPaymentMethods(
    organizationId: OrganizationId,
    abortSignal?: AbortSignal,
  ): Promise<PortResult<readonly PaymentMethod[]>> {
    return this.mock.listPaymentMethods(organizationId, abortSignal);
  }

  addPaymentMethod(
    organizationId: OrganizationId,
    input: AddPaymentMethodInput,
  ): Promise<PortResult<PaymentMethod>> {
    return this.mock.addPaymentMethod(organizationId, input);
  }

  setDefaultPaymentMethod(
    organizationId: OrganizationId,
    paymentMethodId: string,
  ): Promise<PortResult<PaymentMethod>> {
    return this.mock.setDefaultPaymentMethod(organizationId, paymentMethodId);
  }

  removePaymentMethod(
    organizationId: OrganizationId,
    paymentMethodId: string,
  ): Promise<PortResult<void>> {
    return this.mock.removePaymentMethod(organizationId, paymentMethodId);
  }

  cancelSubscription(
    organizationId: OrganizationId,
    reason: string,
  ): Promise<PortResult<void>> {
    return this.mock.cancelSubscription(organizationId, reason);
  }

  private async withPostgresSnapshot(
    organizationId: OrganizationId,
    mockResult: Promise<PortResult<BillingSummary>>,
  ): Promise<PortResult<BillingSummary>> {
    const result = await mockResult;
    if (!result.ok) {
      return result;
    }
    const snapshot = await this.fetchSnapshot(organizationId);
    if (snapshot.ok === false) {
      return { ok: false, error: snapshot.error };
    }
    return portOk(this.mergeSnapshot(result.data, snapshot.data));
  }

  private async fetchSnapshot(
    organizationId: OrganizationId,
  ): Promise<PortResult<BillingSnapshotRpc>> {
    const client = this.supabase.getClient();
    if (!client) {
      return supabaseErr('UNAVAILABLE', 'supabaseNotConfigured');
    }
    const { data, error } = await client.rpc('get_organization_billing_snapshot', {
      p_organization_id: organizationId,
    });
    if (error) {
      return supabaseErrFromRpc(error);
    }
    return portOk(data as BillingSnapshotRpc);
  }

  private mergeSnapshot(
    summary: BillingSummary,
    snapshot: BillingSnapshotRpc,
  ): BillingSummary {
    const planId = snapshot.plan_id === 'free' ? null : snapshot.plan_id;
    return {
      ...summary,
      planId,
      planName: PLAN_NAMES[snapshot.plan_id] ?? summary.planName,
      seatsLimit: snapshot.seats_limit,
      seatsUsed: snapshot.seats_used,
    };
  }

  private async syncPlanToPostgres(
    organizationId: OrganizationId,
    planId: string | null,
  ): Promise<PortResult<BillingSummary> | null> {
    const client = this.supabase.getClient();
    if (!client) {
      return supabaseErr('UNAVAILABLE', 'supabaseNotConfigured');
    }
    const tier = planId && planId !== 'free' ? planId : 'free';
    const { error } = await client.rpc('update_organization_plan', {
      p_organization_id: organizationId,
      p_plan_id: tier,
    });
    if (error) {
      return supabaseErrFromRpc(error);
    }
    return null;
  }
}

export const WEB_BILLING_PROVIDER = {
  provide: BILLING_PORT,
  useExisting: WebBillingAdapter,
};
