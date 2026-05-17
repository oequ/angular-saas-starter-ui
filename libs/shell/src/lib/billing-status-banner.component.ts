import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  resource,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { BILLING_PORT, billingStatusBanner, ORG_PORT } from '@oequ/ports';
import { toSignal } from '@angular/core/rxjs-interop';
import { HlmButtonImports } from '@spartan-ng/helm/button';

@Component({
  selector: 'oequ-billing-status-banner',
  imports: [RouterLink, HlmButtonImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (banner(); as alert) {
      <div
        role="status"
        class="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md border px-4 py-3 text-sm"
        [class]="bannerClass(alert.tone)"
      >
        <p class="min-w-0 flex-1 leading-relaxed">{{ alert.message }}</p>
        <a hlmBtn size="sm" variant="secondary" [routerLink]="alert.ctaPath">
          {{ alert.ctaLabel }}
        </a>
      </div>
    }
  `,
})
export class BillingStatusBannerComponent {
  private readonly orgPort = inject(ORG_PORT);
  private readonly billingPort = inject(BILLING_PORT);

  private readonly activeOrganization = toSignal(
    this.orgPort.activeOrganization$,
    { initialValue: null },
  );

  private readonly billingResource = resource({
    params: () => {
      const org = this.activeOrganization();
      return org ? { orgId: org.id } : undefined;
    },
    loader: async ({ params, abortSignal }) => {
      const result = await this.billingPort.getSummary(params.orgId, abortSignal);
      if (!result.ok) {
        throw new Error(result.error.message);
      }
      return result.data;
    },
  });

  protected readonly banner = computed(() =>
    billingStatusBanner(this.billingResource.value()),
  );

  protected bannerClass(tone: 'info' | 'warning' | 'critical'): string {
    switch (tone) {
      case 'critical':
        return 'border-destructive/40 bg-destructive/10 text-destructive';
      case 'warning':
        return 'border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-200';
      default:
        return 'border-primary/30 bg-primary/5 text-foreground';
    }
  }
}
