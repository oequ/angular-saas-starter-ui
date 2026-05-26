import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslocoPipe } from '@oequ/i18n';
import {
  SETTINGS_DIALOG_CONTENT_CLASS,
  SETTINGS_DIALOG_FIELD_CLASS,
} from '@oequ/shell';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInput } from '@spartan-ng/helm/input';

@Component({
  selector: 'oequ-delete-account-dialog',
  imports: [
    ReactiveFormsModule,
    HlmButtonImports,
    HlmDialogImports,
    HlmInput,
    TranslocoPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <hlm-dialog [state]="dialogState()" (closed)="onDialogClosed()">
      <ng-template hlmDialogPortal>
        <hlm-dialog-content>
          <hlm-dialog-header>
            <h3 hlmDialogTitle class="text-destructive">
              {{ 'account.deleteDialog.title' | transloco }}
            </h3>
            <p hlmDialogDescription>
              {{ 'account.deleteDialog.description' | transloco }}
            </p>
          </hlm-dialog-header>

          <form
            class="space-y-4"
            [formGroup]="form"
            (ngSubmit)="confirm()"
          >
            <div [class]="fieldClass">
              <label for="delete-email" class="mb-1.5 block text-sm font-medium">
                {{ 'account.deleteDialog.confirmLabel' | transloco }}
              </label>
              <input
                id="delete-email"
                hlmInput
                type="email"
                [attr.placeholder]="expectedEmail()"
                class="border-input bg-background h-9 w-full rounded-[5px] shadow-none"
                [formControl]="form.controls.email"
                autocomplete="email"
              />
              @if (submitAttempted() && !canConfirm()) {
                <p class="text-destructive mt-1.5 text-sm">
                  {{ 'account.deleteDialog.emailMismatch' | transloco }}
                </p>
              }
            </div>

            <hlm-dialog-footer>
              <button hlmBtn type="button" variant="secondary" hlmDialogClose>
                {{ 'common.cancel' | transloco }}
              </button>
              <button
                hlmBtn
                type="submit"
                class="!border-destructive !bg-destructive !text-white shadow-xs hover:!bg-destructive/90"
              >
                {{ 'account.deleteDialog.submit' | transloco }}
              </button>
            </hlm-dialog-footer>
          </form>
        </hlm-dialog-content>
      </ng-template>
    </hlm-dialog>
  `,
})
export class DeleteAccountDialogComponent {
  readonly open = input(false);
  readonly expectedEmail = input.required<string>();

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  protected readonly dialogContentClass = SETTINGS_DIALOG_CONTENT_CLASS;
  protected readonly fieldClass = SETTINGS_DIALOG_FIELD_CLASS;

  protected readonly dialogState = computed(() =>
    this.open() ? 'open' : 'closed',
  );

  protected readonly submitAttempted = signal(false);

  protected readonly form = new FormGroup<{
    email: FormControl<string>;
  }>({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
  });

  private readonly emailValue = toSignal(this.form.controls.email.valueChanges, {
    initialValue: '',
  });
  private confirming = false;

  constructor() {
    effect(() => {
      if (this.open()) {
        this.resetForm();
      }
    });
  }

  protected canConfirm(): boolean {
    return this.emailValue().trim() === this.expectedEmail().trim();
  }

  protected confirm(): void {
    this.submitAttempted.set(true);
    if (!this.canConfirm()) {
      return;
    }
    this.confirming = true;
    this.confirmed.emit();
    this.resetForm();
  }

  protected onDialogClosed(): void {
    if (this.confirming) {
      this.confirming = false;
      return;
    }
    this.resetForm();
    this.cancelled.emit();
  }

  private resetForm(): void {
    this.submitAttempted.set(false);
    this.form.reset();
  }
}
