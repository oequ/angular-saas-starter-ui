import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { TranslocoPipe } from '@oequ/i18n';
import type { CommercialPlanId } from '@oequ/ports';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';

import { SETTINGS_DIALOG_CONTENT_CLASS } from '../settings-layout.tokens';

@Component({
  selector: 'oequ-plan-downgrade-confirm-dialog',
  imports: [HlmButtonImports, HlmDialogImports, TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <hlm-dialog [state]="dialogState()" (closed)="onDialogClosed()">
      <ng-template hlmDialogPortal>
        <hlm-dialog-content [class]="dialogContentClass">
          <hlm-dialog-header>
            <h3 hlmDialogTitle>
              {{
                'paywall.downgradeDialog.title'
                  | transloco: { plan: (planNameKey() | transloco) }
              }}
            </h3>
            <p hlmDialogDescription>
              {{ 'paywall.downgradeDialog.description' | transloco }}
            </p>
          </hlm-dialog-header>

          <ul
            class="text-muted-foreground list-disc space-y-2 ps-5 text-sm leading-6"
          >
            <li>
              {{
                'paywall.downgradeDialog.bulletFeatures'
                  | transloco: { plan: (planNameKey() | transloco) }
              }}
            </li>
            <li>{{ 'paywall.downgradeDialog.bulletSeats' | transloco }}</li>
          </ul>

          @if (error(); as message) {
            <p class="text-destructive text-sm" role="alert">{{ message }}</p>
          }

          <hlm-dialog-footer>
            <button hlmBtn type="button" variant="secondary" hlmDialogClose>
              {{ 'common.cancel' | transloco }}
            </button>
            <button
              hlmBtn
              type="button"
              [disabled]="confirming()"
              (click)="confirm()"
            >
              {{
                confirming()
                  ? ('paywall.downgradeDialog.applying' | transloco)
                  : ('paywall.downgradeDialog.confirm' | transloco)
              }}
            </button>
          </hlm-dialog-footer>
        </hlm-dialog-content>
      </ng-template>
    </hlm-dialog>
  `,
})
export class PlanDowngradeConfirmDialogComponent {
  readonly open = input(false);
  readonly planId = input.required<CommercialPlanId>();
  readonly confirming = input(false);
  readonly error = input<string | null>(null);

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  protected readonly dialogContentClass = SETTINGS_DIALOG_CONTENT_CLASS;

  protected readonly planNameKey = computed(
    () => `paywall.plans.${this.planId()}.name`,
  );

  protected readonly dialogState = computed(() =>
    this.open() ? 'open' : 'closed',
  );

  protected confirm(): void {
    this.confirmed.emit();
  }

  protected onDialogClosed(): void {
    this.cancelled.emit();
  }
}
