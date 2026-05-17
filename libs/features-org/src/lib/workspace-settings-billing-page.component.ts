import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { ORG_PORT } from '@oequ/ports';

import {
  OrgSettingsBillingComponent,
  type BillingSettingsSection,
} from './org-settings-billing.component';

function parseBillingSection(value: unknown): BillingSettingsSection {
  if (value === 'invoices' || value === 'payment') {
    return value;
  }
  return 'overview';
}

@Component({
  selector: 'oequ-workspace-settings-billing-page',
  imports: [OrgSettingsBillingComponent],
  template: `
    @if (activeOrganization(); as org) {
      <oequ-org-settings-billing
        [organizationId]="org.id"
        [section]="section()"
      />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkspaceSettingsBillingPageComponent {
  private readonly orgPort = inject(ORG_PORT);
  private readonly route = inject(ActivatedRoute);

  protected readonly activeOrganization = toSignal(
    this.orgPort.activeOrganization$,
    { initialValue: null },
  );

  protected readonly section = computed(() =>
    parseBillingSection(this.route.snapshot.data['billingSection']),
  );
}
