import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';

import { SETTINGS_DIALOG_CONTENT_CLASS } from '../settings-layout.tokens';

@Component({
  selector: 'oequ-plan-downgrade-confirm-dialog',
  imports: [HlmButtonImports, HlmDialogImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <hlm-dialog [state]="dialogState()" (closed)="onDialogClosed()">
      <ng-template hlmDialogPortal>
        <hlm-dialog-content [class]="dialogContentClass">
          <hlm-dialog-header>
            <h3 hlmDialogTitle>Downgrade to {{ planName() }}</h3>
            <p hlmDialogDescription>
              Your plan changes immediately in this demo. Seat limits and
              features update right away.
            </p>
          </hlm-dialog-header>

          <ul
            class="text-muted-foreground list-disc space-y-2 ps-5 text-sm leading-6"
          >
            <li>
              You may lose access to features not included on
              {{ planName() }} (for example SSO or audit logs on Team).
            </li>
            <li>
              Active and invited members still count toward the new seat limit.
            </li>
          </ul>

          @if (error(); as message) {
            <p class="text-destructive text-sm" role="alert">{{ message }}</p>
          }

          <hlm-dialog-footer>
            <button hlmBtn type="button" variant="secondary" hlmDialogClose>
              Cancel
            </button>
            <button
              hlmBtn
              type="button"
              [disabled]="confirming()"
              (click)="confirm()"
            >
              {{ confirming() ? 'Applying…' : 'Confirm downgrade' }}
            </button>
          </hlm-dialog-footer>
        </hlm-dialog-content>
      </ng-template>
    </hlm-dialog>
  `,
})
export class PlanDowngradeConfirmDialogComponent {
  readonly open = input(false);
  readonly planName = input.required<string>();
  readonly confirming = input(false);
  readonly error = input<string | null>(null);

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  protected readonly dialogContentClass = SETTINGS_DIALOG_CONTENT_CLASS;

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
