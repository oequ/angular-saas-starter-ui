import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { TranslocoPipe } from '@oequ/i18n';
import { SETTINGS_DIALOG_CONTENT_CLASS } from '@oequ/shell';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';

@Component({
  selector: 'oequ-connect-integration-dialog',
  imports: [HlmButtonImports, HlmDialogImports, TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <hlm-dialog [state]="dialogState()" (closed)="onDialogClosed()">
      <ng-template hlmDialogPortal>
        <hlm-dialog-content [class]="dialogContentClass">
          <hlm-dialog-header>
            <h3 hlmDialogTitle>
              {{
                'org.integrations.connectDialog.title'
                  | transloco: { name: integrationName() }
              }}
            </h3>
            <p hlmDialogDescription>
              {{ 'org.integrations.connectDialog.description' | transloco }}
            </p>
          </hlm-dialog-header>

          <hlm-dialog-footer>
            <button hlmBtn type="button" variant="secondary" hlmDialogClose>
              {{ 'common.cancel' | transloco }}
            </button>
            <button
              hlmBtn
              type="button"
              [disabled]="connecting()"
              (click)="confirm()"
            >
              {{
                connecting()
                  ? ('org.integrations.connectDialog.connecting' | transloco)
                  : ('org.integrations.connect' | transloco)
              }}
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
