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
  selector: 'oequ-disconnect-integration-dialog',
  imports: [HlmButtonImports, HlmDialogImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <hlm-dialog [state]="dialogState()" (closed)="onDialogClosed()">
      <ng-template hlmDialogPortal>
        <hlm-dialog-content [class]="dialogContentClass">
          <hlm-dialog-header>
            <h3 hlmDialogTitle>Disconnect {{ integrationName() }}</h3>
            <p hlmDialogDescription>
              This removes the simulated connection for this workspace.
            </p>
          </hlm-dialog-header>

          <hlm-dialog-footer>
            <button hlmBtn type="button" variant="secondary" hlmDialogClose>
              Cancel
            </button>
            <button
              hlmBtn
              type="button"
              variant="destructive"
              [disabled]="disconnecting()"
              (click)="confirm()"
            >
              {{ disconnecting() ? 'Disconnecting…' : 'Disconnect' }}
            </button>
          </hlm-dialog-footer>
        </hlm-dialog-content>
      </ng-template>
    </hlm-dialog>
  `,
})
export class DisconnectIntegrationDialogComponent {
  readonly open = input(false);
  readonly integrationName = input.required<string>();
  readonly disconnecting = input(false);

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
