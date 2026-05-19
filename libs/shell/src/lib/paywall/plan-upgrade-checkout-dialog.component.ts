import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';

import { SETTINGS_DIALOG_CONTENT_CLASS } from '../settings-layout.tokens';

@Component({
  selector: 'oequ-plan-upgrade-checkout-dialog',
  imports: [HlmButtonImports, HlmDialogImports, HlmSkeletonImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <hlm-dialog [state]="dialogState()" (closed)="onDialogClosed()">
      <ng-template hlmDialogPortal>
        <hlm-dialog-content [class]="dialogContentClass">
          <hlm-dialog-header>
            <h3 hlmDialogTitle>Upgrade to {{ planName() }}</h3>
            <p hlmDialogDescription>
              Simulated checkout for the standalone demo. No card is charged.
            </p>
          </hlm-dialog-header>

          @if (loading()) {
            <div
              class="space-y-4 py-2"
              aria-busy="true"
              aria-label="Initializing checkout"
            >
              <hlm-skeleton class="h-4 w-full" />
              <hlm-skeleton class="h-4 w-5/6" />
              <hlm-skeleton class="h-10 w-full rounded-md" />
            </div>
          } @else {
            <p class="text-sm leading-6">
              By upgrading, you agree to the organizational Terms of Service.
              Billed securely via our payment partner.
            </p>

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
                @if (confirming()) {
                  Processing…
                } @else {
                  Simulate payment success
                }
              </button>
            </hlm-dialog-footer>
          }
        </hlm-dialog-content>
      </ng-template>
    </hlm-dialog>
  `,
})
export class PlanUpgradeCheckoutDialogComponent {
  readonly open = input(false);
  readonly planName = input.required<string>();
  readonly loading = input(false);
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
