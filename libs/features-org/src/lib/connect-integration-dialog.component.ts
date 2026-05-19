import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { SETTINGS_DIALOG_CONTENT_CLASS } from '@oequ/shell';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';

@Component({
  selector: 'oequ-connect-integration-dialog',
  imports: [HlmButtonImports, HlmDialogImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <hlm-dialog [state]="dialogState()" (closed)="onDialogClosed()">
      <ng-template hlmDialogPortal>
        <hlm-dialog-content [class]="dialogContentClass">
          <hlm-dialog-header>
            <h3 hlmDialogTitle>Connect {{ integrationName() }}</h3>
            <p hlmDialogDescription>
              Simulated OAuth for the demo. No real account is linked.
            </p>
          </hlm-dialog-header>

          <hlm-dialog-footer>
            <button hlmBtn type="button" variant="secondary" hlmDialogClose>
              Cancel
            </button>
            <button
              hlmBtn
              type="button"
              [disabled]="connecting()"
              (click)="confirm()"
            >
              {{ connecting() ? 'Connecting…' : 'Connect' }}
            </button>
          </hlm-dialog-footer>
        </hlm-dialog-content>
      </ng-template>
    </hlm-dialog>
  `,
})
export class ConnectIntegrationDialogComponent {
  readonly open = input(false);
  readonly integrationName = input.required<string>();
  readonly connecting = input(false);

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
