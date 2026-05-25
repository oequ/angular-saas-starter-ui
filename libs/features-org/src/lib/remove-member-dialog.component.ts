import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { TranslocoPipe } from '@oequ/i18n';
import {
  SETTINGS_DIALOG_CONTENT_CLASS,
} from '@oequ/shell';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';

export type MemberRemovalDialogMode = 'remove' | 'revoke';

@Component({
  selector: 'oequ-remove-member-dialog',
  imports: [HlmButtonImports, HlmDialogImports, TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <hlm-dialog [state]="dialogState()" (closed)="onDialogClosed()">
      <ng-template hlmDialogPortal>
        <hlm-dialog-content [class]="dialogContentClass">
          <hlm-dialog-header>
            <h3 hlmDialogTitle class="text-destructive">
              {{
                (mode() === 'revoke'
                  ? 'org.members.revokeDialog.title'
                  : 'org.members.removeDialog.title'
                ) | transloco
              }}
            </h3>
            <p hlmDialogDescription>
              {{
                (mode() === 'revoke'
                  ? 'org.members.revokeDialog.description'
                  : 'org.members.removeDialog.description'
                ) | transloco: { name: memberLabel() }
              }}
            </p>
          </hlm-dialog-header>

          <hlm-dialog-footer>
            <button hlmBtn type="button" variant="secondary" hlmDialogClose>
              {{ 'common.cancel' | transloco }}
            </button>
            <button
              hlmBtn
              type="button"
              class="!border-destructive !bg-destructive !text-white shadow-xs hover:!bg-destructive/90"
              [disabled]="removing() || syncingSeats()"
              (click)="confirm()"
            >
              @if (syncingSeats()) {
                {{ 'org.members.inviteDialog.syncingSeats' | transloco }}
              } @else if (removing()) {
                {{
                  (mode() === 'revoke'
                    ? 'org.members.revokeDialog.revoking'
                    : 'org.members.removeDialog.removing'
                  ) | transloco
                }}
              } @else {
                {{
                  (mode() === 'revoke'
                    ? 'org.members.revokeDialog.submit'
                    : 'org.members.removeDialog.submit'
                  ) | transloco
                }}
              }
            </button>
          </hlm-dialog-footer>
        </hlm-dialog-content>
      </ng-template>
    </hlm-dialog>
  `,
})
export class RemoveMemberDialogComponent {
  readonly open = input(false);
  readonly mode = input<MemberRemovalDialogMode>('remove');
  readonly memberLabel = input.required<string>();
  readonly removing = input(false);
  readonly syncingSeats = input(false);

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  protected readonly dialogContentClass = SETTINGS_DIALOG_CONTENT_CLASS;

  protected readonly dialogState = computed(() =>
    this.open() ? 'open' : 'closed',
  );

  private confirming = false;

  protected confirm(): void {
    this.confirming = true;
    this.confirmed.emit();
  }

  protected onDialogClosed(): void {
    if (this.confirming) {
      this.confirming = false;
      return;
    }
    this.cancelled.emit();
  }
}
