import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  resource,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  BILLING_PORT,
  formatPaymentMethodBrand,
  formatPaymentMethodExpiry,
  formatPlanLabel,
  formatSubscriptionStatus,
  resolveCurrentPlanId,
  USAGE_SETTINGS_PATH,
  type AddPaymentMethodInput,
  type BillingSummary,
  type Invoice,
  type InvoiceStatus,
  type PaymentMethod,
  type SubscriptionStatus,
} from '@oequ/ports';
import { PaywallDialogService } from '@oequ/shell';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCreditCard, lucideReceipt } from '@ng-icons/lucide';
import { toast } from '@spartan-ng/brain/sonner';
import { HlmBadgeImports, type BadgeVariants } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';

import { AddPaymentMethodDialogComponent } from './add-payment-method-dialog.component';

@Component({
  selector: 'oequ-org-settings-billing',
  imports: [
    CurrencyPipe,
    DatePipe,
    RouterLink,
    NgIcon,
    HlmCardImports,
    HlmButtonImports,
    HlmBadgeImports,
    HlmTooltipImports,
    AddPaymentMethodDialogComponent,
  ],
  providers: [provideIcons({ lucideCreditCard, lucideReceipt })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-8">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">Billing</h1>
        @if (statusMessage(); as message) {
          <p role="status" class="text-muted-foreground mt-3 text-sm">{{ message }}</p>
        }
      </div>

      <section hlmCard variant="outline" class="gap-0 overflow-hidden py-0">
        <div hlmCardContent class="!p-6">
          <h2 class="text-xl leading-8 font-semibold tracking-tight">
            Subscription Plan
          </h2>
          <p class="text-muted-foreground my-3 text-sm leading-6">
            Each workspace has its own subscription plan, billing cycle, payment
            methods and usage quotas.
          </p>

          @if (billingResource.isLoading()) {
            <p class="text-muted-foreground text-sm">Loading subscription…</p>
          } @else if (billingResource.error(); as err) {
            <p class="text-destructive text-sm">{{ err.message }}</p>
          } @else if (summary(); as billing) {
            <div class="space-y-4">
              <div
                class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div>
                  <p class="text-lg font-semibold tracking-tight">
                    {{ planDisplayLabel(billing) }}
                  </p>
                  <p
                    class="text-muted-foreground mt-1 flex flex-wrap items-center gap-2 text-sm"
                  >
                    Status
                    @let subscriptionBadge =
                      subscriptionStatusBadge(billing.status);
                    <span
                      hlmBadge
                      [variant]="subscriptionBadge.variant"
                      [class]="subscriptionBadge.class"
                    >
                      {{ formatSubscriptionStatus(billing.status) }}
                    </span>
                  </p>
                  @if (billing.currentPeriodEnd; as periodEnd) {
                    <p class="text-muted-foreground mt-1 text-sm">
                      Billing cycle resets on {{ periodEnd | date: 'mediumDate' }}
                    </p>
                  }
                  @if (billing.cancelAtPeriodEnd) {
                    <p class="text-muted-foreground mt-2 text-sm">
                      Cancels at the end of the current billing period.
                    </p>
                  }
                </div>
                <button
                  hlmBtn
                  type="button"
                  variant="outline"
                  class="shrink-0"
                  (click)="openUpgradeDialog()"
                >
                  Change subscription plan
                </button>
              </div>

              @if (resolveCurrentPlanId(billing) === 'free') {
                <div
                  class="border-border bg-muted/30 rounded-[5px] border px-4 py-3 text-sm leading-6"
                  role="note"
                >
                  <p class="font-medium">
                    This organization is limited by the included usage
                  </p>
                  <p class="text-muted-foreground mt-1">
                    Projects may become unresponsive when this organization
                    exceeds its
                    <a
                      [routerLink]="usageSettingsPath"
                      class="text-foreground underline underline-offset-4 hover:opacity-80"
                    >included usage quota</a>. To scale seamlessly, upgrade to a paid plan.
                  </p>
                </div>
              }
            </div>
          } @else {
            <p class="text-muted-foreground text-sm">
              Billing information is not available.
            </p>
          }
        </div>
      </section>

      <section hlmCard variant="outline" class="gap-0 overflow-hidden py-0">
        <div hlmCardContent class="!p-6">
          <h2 class="text-xl leading-8 font-semibold tracking-tight">
            Past Invoices
          </h2>
          <p class="text-muted-foreground my-3 text-sm leading-6">
            You get an invoice every time you change your plan or when your
            monthly billing cycle resets.
          </p>

          @if (invoicesResource.isLoading()) {
            <p class="text-muted-foreground text-sm">Loading invoices…</p>
          } @else if (invoices().length === 0) {
            <p class="text-muted-foreground text-sm">
              No invoices yet. Invoices appear after your first paid billing
              cycle or plan change.
            </p>
          } @else {
            <div class="border-input overflow-hidden rounded-[5px] border">
              <table class="w-full text-left text-sm">
                <thead
                  class="text-muted-foreground border-b text-xs font-medium"
                >
                  <tr>
                    <th class="px-4 py-2.5 font-medium">Date</th>
                    <th class="px-4 py-2.5 font-medium">Amount</th>
                    <th class="px-4 py-2.5 font-medium">Invoice number</th>
                    <th class="px-4 py-2.5 font-medium">Status</th>
                    <th class="px-4 py-2.5 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-border divide-y">
                  @for (invoice of invoices(); track invoice.id) {
                    <tr class="hover:bg-muted/30">
                      <td class="px-4 py-3 font-medium">
                        {{ invoice.created | date: 'mediumDate' }}
                      </td>
                      <td class="px-4 py-3">
                        {{
                          invoice.amountDue / 100
                            | currency: invoice.currency
                        }}
                      </td>
                      <td class="text-muted-foreground px-4 py-3 font-mono text-xs">
                        {{ invoice.number }}
                      </td>
                      <td class="px-4 py-3">
                        @let invoiceBadge = invoiceStatusBadge(invoice.status);
                        <span
                          hlmBadge
                          [variant]="invoiceBadge.variant"
                          [class]="invoiceBadge.class"
                        >
                          {{ invoiceStatusLabel(invoice.status) }}
                        </span>
                      </td>
                      <td class="px-4 py-3 text-right">
                        <a
                          class="border-input text-muted-foreground hover:text-foreground hover:bg-muted/50 inline-flex size-8 items-center justify-center rounded-[5px] border transition-colors"
                          [href]="invoice.invoicePdf"
                          target="_blank"
                          rel="noopener noreferrer"
                          [hlmTooltip]="invoiceDownloadTooltip"
                          position="top"
                          [attr.aria-label]="
                            'Download invoice ' + invoice.number
                          "
                        >
                          <ng-icon
                            name="lucideReceipt"
                            class="size-4"
                            aria-hidden="true"
                          />
                        </a>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
        @if (invoices().length > 0) {
          <div
            class="border-border text-muted-foreground border-t px-6 py-3 text-sm"
          >
            Showing 1 to {{ invoices().length }} out of
            {{ invoices().length }} invoices
          </div>
        }
      </section>

      <section hlmCard variant="outline" class="gap-0 overflow-hidden py-0">
        <div hlmCardContent class="!p-6">
          <h2 class="text-xl leading-8 font-semibold tracking-tight">
            Payment Methods
          </h2>
          <p class="text-muted-foreground mt-3 text-sm leading-6">
            Subscription charges use the default card. Add or remove cards and
            choose which one is default.
          </p>
          @if (paymentMethodsResource.isLoading()) {
            <p class="text-muted-foreground mt-4 text-sm">Loading payment methods…</p>
          } @else if (paymentMethodsResource.error(); as err) {
            <p class="text-destructive mt-4 text-sm">{{ err.message }}</p>
          } @else if (paymentMethods().length === 0) {
            <p class="text-muted-foreground mt-4 text-sm">No payment methods</p>
          } @else {
            <ul class="divide-border mt-4 divide-y rounded-[5px] border">
              @for (method of paymentMethods(); track method.id) {
                <li
                  class="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div class="flex min-w-0 items-center gap-3">
                    <span
                      class="bg-muted text-muted-foreground inline-flex size-9 shrink-0 items-center justify-center rounded-[5px]"
                      aria-hidden="true"
                    >
                      <ng-icon name="lucideCreditCard" class="size-4" />
                    </span>
                    <div class="min-w-0">
                      <p class="font-medium">
                        {{ formatPaymentMethodBrand(method.brand) }} ••••
                        {{ method.last4 }}
                      </p>
                      <p class="text-muted-foreground text-sm">
                        Expires
                        {{
                          formatPaymentMethodExpiry(
                            method.expMonth,
                            method.expYear
                          )
                        }}
                      </p>
                    </div>
                  </div>
                  <div class="flex flex-wrap items-center gap-2">
                    @if (method.isDefault) {
                      <span hlmBadge variant="secondary">Default</span>
                    } @else {
                      <button
                        hlmBtn
                        type="button"
                        variant="outline"
                        size="sm"
                        [disabled]="paymentMethodActionId() === method.id"
                        (click)="setDefaultPaymentMethod(method)"
                      >
                        Make default
                      </button>
                    }
                    <button
                      hlmBtn
                      type="button"
                      variant="ghost"
                      size="sm"
                      class="text-muted-foreground"
                      [disabled]="paymentMethodActionId() === method.id"
                      (click)="removePaymentMethod(method)"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              }
            </ul>
          }
        </div>
        <div
          hlmCardFooter
          class="border-border flex min-h-[57px] items-center justify-end border-t !py-3"
        >
          <button hlmBtn type="button" (click)="openAddPaymentMethodDialog()">
            Add payment method
          </button>
        </div>
      </section>
    </div>

    <oequ-add-payment-method-dialog
      [open]="addPaymentDialogOpen()"
      [saving]="addPaymentSaving()"
      [serverError]="addPaymentError()"
      (submitted)="onAddPaymentMethodSubmitted($event)"
      (cancelled)="closeAddPaymentMethodDialog()"
    />
  `,
})
export class OrgSettingsBillingComponent {
  readonly organizationId = input.required<string>();

  private readonly billingPort = inject(BILLING_PORT);
  private readonly paywallDialog = inject(PaywallDialogService);

  protected readonly formatPlanLabel = formatPlanLabel;
  protected readonly formatSubscriptionStatus = formatSubscriptionStatus;
  protected readonly formatPaymentMethodBrand = formatPaymentMethodBrand;
  protected readonly formatPaymentMethodExpiry = formatPaymentMethodExpiry;
  protected readonly resolveCurrentPlanId = resolveCurrentPlanId;
  protected readonly usageSettingsPath = USAGE_SETTINGS_PATH;

  protected readonly statusMessage = signal<string | null>(null);
  protected readonly addPaymentDialogOpen = signal(false);
  protected readonly addPaymentSaving = signal(false);
  protected readonly addPaymentError = signal<string | null>(null);
  protected readonly paymentMethodActionId = signal<string | null>(null);
  protected readonly invoiceDownloadTooltip = 'Download invoice';

  protected readonly billingResource = resource({
    params: () => ({ orgId: this.organizationId() }),
    loader: async ({ params, abortSignal }) => {
      const result = await this.billingPort.getSummary(
        params.orgId,
        abortSignal,
      );
      if (!result.ok) {
        throw new Error(result.error.message);
      }
      return result.data;
    },
  });

  protected readonly invoicesResource = resource({
    params: () => ({ orgId: this.organizationId() }),
    loader: async ({ params, abortSignal }) => {
      const result = await this.billingPort.listInvoices(
        params.orgId,
        undefined,
        abortSignal,
      );
      if (!result.ok) {
        throw new Error(result.error.message);
      }
      return result.data.items;
    },
  });

  protected readonly summary = computed(() => this.billingResource.value());

  protected readonly invoices = computed(
    (): readonly Invoice[] => this.invoicesResource.value() ?? [],
  );

  protected readonly paymentMethodsResource = resource({
    params: () => ({ orgId: this.organizationId() }),
    loader: async ({ params, abortSignal }) => {
      const result = await this.billingPort.listPaymentMethods(
        params.orgId,
        abortSignal,
      );
      if (!result.ok) {
        throw new Error(result.error.message);
      }
      return result.data;
    },
  });

  protected readonly paymentMethods = computed(
    (): readonly PaymentMethod[] =>
      this.paymentMethodsResource.value() ?? [],
  );

  protected planDisplayLabel(summary: BillingSummary): string {
    return `${formatPlanLabel(summary.planId, summary.planName)} Plan`;
  }

  protected invoiceStatusLabel(status: InvoiceStatus): string {
    switch (status) {
      case 'paid':
        return 'Paid';
      case 'open':
        return 'Open';
      case 'draft':
        return 'Draft';
      case 'void':
        return 'Void';
      case 'uncollectible':
        return 'Uncollectible';
      default:
        return status;
    }
  }

  protected async openUpgradeDialog(): Promise<void> {
    this.statusMessage.set(null);
    const result = await this.paywallDialog.requestOpen();
    if (result === 'success') {
      this.billingResource.reload();
      this.statusMessage.set('Plan updated successfully.');
    }
  }

  protected openAddPaymentMethodDialog(): void {
    this.addPaymentError.set(null);
    this.addPaymentDialogOpen.set(true);
  }

  protected closeAddPaymentMethodDialog(): void {
    this.addPaymentDialogOpen.set(false);
    this.addPaymentSaving.set(false);
    this.addPaymentError.set(null);
  }

  protected async onAddPaymentMethodSubmitted(
    input: AddPaymentMethodInput,
  ): Promise<void> {
    this.addPaymentSaving.set(true);
    this.addPaymentError.set(null);
    const result = await this.billingPort.addPaymentMethod(
      this.organizationId(),
      input,
    );
    this.addPaymentSaving.set(false);
    if (!result.ok) {
      this.addPaymentError.set(result.error.message);
      return;
    }
    this.paymentMethodsResource.reload();
    this.closeAddPaymentMethodDialog();
    toast.success('Payment method added.');
  }

  protected async setDefaultPaymentMethod(
    method: PaymentMethod,
  ): Promise<void> {
    this.paymentMethodActionId.set(method.id);
    const result = await this.billingPort.setDefaultPaymentMethod(
      this.organizationId(),
      method.id,
    );
    this.paymentMethodActionId.set(null);
    if (!result.ok) {
      toast.error(result.error.message);
      return;
    }
    this.paymentMethodsResource.reload();
    toast.success('Default payment method updated.');
  }

  protected async removePaymentMethod(method: PaymentMethod): Promise<void> {
    this.paymentMethodActionId.set(method.id);
    const result = await this.billingPort.removePaymentMethod(
      this.organizationId(),
      method.id,
    );
    this.paymentMethodActionId.set(null);
    if (!result.ok) {
      toast.error(result.error.message);
      return;
    }
    this.paymentMethodsResource.reload();
    toast.success('Payment method removed.');
  }

  protected subscriptionStatusBadge(status: SubscriptionStatus): {
    variant: BadgeVariants['variant'];
    class: string;
  } {
    switch (status) {
      case 'active':
        return {
          variant: 'outline',
          class:
            'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
        };
      case 'trialing':
        return {
          variant: 'outline',
          class:
            'border-amber-500/25 bg-amber-500/10 text-amber-800 dark:text-amber-400',
        };
      case 'past_due':
      case 'unpaid':
        return { variant: 'destructive', class: '' };
      default:
        return { variant: 'secondary', class: '' };
    }
  }

  protected invoiceStatusBadge(status: InvoiceStatus): {
    variant: BadgeVariants['variant'];
    class: string;
  } {
    switch (status) {
      case 'paid':
        return {
          variant: 'outline',
          class:
            'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 capitalize dark:text-emerald-400',
        };
      case 'open':
        return {
          variant: 'outline',
          class:
            'border-amber-500/25 bg-amber-500/10 text-amber-800 capitalize dark:text-amber-400',
        };
      case 'uncollectible':
        return { variant: 'destructive', class: 'capitalize' };
      default:
        return { variant: 'secondary', class: 'capitalize' };
    }
  }
}
