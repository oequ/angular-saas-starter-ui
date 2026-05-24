import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslocoPipe } from '@oequ/i18n';
import {
  SETTINGS_DIALOG_CONTENT_CLASS,
  SETTINGS_DIALOG_FIELD_CLASS,
} from '@oequ/shell';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmTextarea } from '@spartan-ng/helm/textarea';

@Component({
  selector: 'oequ-cancel-subscription-dialog',
  imports: [
    ReactiveFormsModule,
    HlmButtonImports,
    HlmDialogImports,
    HlmTextarea,
    TranslocoPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <hlm-dialog [state]="dialogState()" (closed)="onDialogClosed()">
      <ng-template hlmDialogPortal>
        <hlm-dialog-content [class]="dialogContentClass">
          <hlm-dialog-header>
            <h3 hlmDialogTitle>
              {{ 'org.billing.subscription.cancelDialog.title' | transloco }}
            </h3>
            <p hlmDialogDescription>
              {{
                'org.billing.subscription.cancelDialog.description' | transloco
              }}
            </p>
          </hlm-dialog-header>

          <div [class]="fieldClass">
            <label
              for="cancel-subscription-reason"
              class="mb-1.5 block text-sm font-medium"
            >
              {{
                'org.billing.subscription.cancelDialog.reasonLabel'
                  | transloco
              }}
            </label>
            <textarea
              id="cancel-subscription-reason"
              hlmTextarea
              class="border-input bg-background min-h-20 w-full rounded-[5px] shadow-none"
              [placeholder]="
                'org.billing.subscription.cancelDialog.reasonPlaceholder'
                  | transloco
              "
              [formControl]="reasonControl"
            ></textarea>
          </div>

          <hlm-dialog-footer>
            <button hlmBtn type="button" variant="secondary" hlmDialogClose>
              {{ 'common.cancel' | transloco }}
            </button>
            <button
              hlmBtn
              type="button"
              class="!border-destructive !bg-destructive !text-white shadow-xs hover:!bg-destructive/90"
              [disabled]="cancelling()"
              (click)="confirm()"
            >
              {{
                cancelling()
                  ? ('org.billing.subscription.cancelDialog.cancelling'
                    | transloco)
                  : ('org.billing.subscription.cancelDialog.submit' | transloco)
              }}
            </button>
          </hlm-dialog-footer>
        </hlm-dialog-content>
      </ng-template>
    </hlm-dialog>
  `,
})
export class CancelSubscriptionDialogComponent {
  readonly open = input(false);
  readonly cancelling = input(false);

  readonly confirmed = output<string>();
  readonly cancelled = output<void>();

  protected readonly dialogContentClass = SETTINGS_DIALOG_CONTENT_CLASS;
  protected readonly fieldClass = SETTINGS_DIALOG_FIELD_CLASS;

  protected readonly dialogState = computed(() =>
    this.open() ? 'open' : 'closed',
  );

  protected readonly reasonControl = new FormControl('', { nonNullable: true });

  private confirming = false;

  protected onDialogClosed(): void {
    if (this.confirming) {
      return;
    }
    this.cancelled.emit();
  }

  protected confirm(): void {
    this.confirming = true;
    this.confirmed.emit(this.reasonControl.value.trim());
    this.confirming = false;
  }
}
