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
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  type AddPaymentMethodInput,
  parseCardExpiryInput,
} from '@oequ/ports';
import { TranslocoPipe, TranslocoService } from '@oequ/i18n';
import {
  SETTINGS_DIALOG_CONTENT_CLASS,
  SETTINGS_DIALOG_FIELD_CLASS,
} from '@oequ/shell';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInput } from '@spartan-ng/helm/input';

@Component({
  selector: 'oequ-add-payment-method-dialog',
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
        <hlm-dialog-content [class]="dialogContentClass">
          <hlm-dialog-header>
            <h3 hlmDialogTitle>
              {{ 'org.billing.addPaymentDialog.title' | transloco }}
            </h3>
            <p hlmDialogDescription>
              {{ 'org.billing.addPaymentDialog.description' | transloco }}
            </p>
          </hlm-dialog-header>

          <form class="space-y-4" [formGroup]="form" (ngSubmit)="submit()">
            <div [class]="fieldClass">
              <label for="pm-cardholder" class="mb-1.5 block text-sm font-medium">
                {{ 'org.billing.addPaymentDialog.nameOnCard' | transloco }}
              </label>
              <input
                id="pm-cardholder"
                hlmInput
                type="text"
                class="border-input bg-background h-9 w-full rounded-[5px] shadow-none"
                formControlName="cardholderName"
                autocomplete="cc-name"
              />
            </div>

            <div [class]="fieldClass">
              <label for="pm-number" class="mb-1.5 block text-sm font-medium">
                {{ 'org.billing.addPaymentDialog.cardNumber' | transloco }}
              </label>
              <input
                id="pm-number"
                hlmInput
                type="text"
                inputmode="numeric"
                class="border-input bg-background h-9 w-full rounded-[5px] font-mono shadow-none"
                formControlName="number"
                placeholder="4242 4242 4242 4242"
                autocomplete="cc-number"
              />
            </div>

            <div class="grid gap-4 sm:grid-cols-2">
              <div [class]="fieldClass">
                <label for="pm-expiry" class="mb-1.5 block text-sm font-medium">
                  {{ 'org.billing.addPaymentDialog.expiry' | transloco }}
                </label>
                <input
                  id="pm-expiry"
                  hlmInput
                  type="text"
                  inputmode="numeric"
                  class="border-input bg-background h-9 w-full rounded-[5px] font-mono shadow-none"
                  formControlName="expiry"
                  placeholder="MM/YY"
                  autocomplete="cc-exp"
                />
              </div>
              <div [class]="fieldClass">
                <label for="pm-cvc" class="mb-1.5 block text-sm font-medium">
                  {{ 'org.billing.addPaymentDialog.cvc' | transloco }}
                </label>
                <input
                  id="pm-cvc"
                  hlmInput
                  type="text"
                  inputmode="numeric"
                  class="border-input bg-background h-9 w-full rounded-[5px] font-mono shadow-none"
                  formControlName="cvc"
                  placeholder="123"
                  autocomplete="cc-csc"
                />
              </div>
            </div>

            @if (clientError(); as err) {
              <p class="text-destructive text-sm" role="alert">{{ err }}</p>
            }
            @if (serverError(); as err) {
              <p class="text-destructive text-sm" role="alert">{{ err }}</p>
            }

            <hlm-dialog-footer>
              <button hlmBtn type="button" variant="secondary" hlmDialogClose>
                {{ 'common.cancel' | transloco }}
              </button>
              <button hlmBtn type="submit" [disabled]="saving()">
                {{
                  saving()
                    ? ('org.billing.addPaymentDialog.saving' | transloco)
                    : ('org.billing.addPaymentDialog.submit' | transloco)
                }}
              </button>
            </hlm-dialog-footer>
          </form>
        </hlm-dialog-content>
      </ng-template>
    </hlm-dialog>
  `,
})
export class AddPaymentMethodDialogComponent {
  private readonly transloco = inject(TranslocoService);

  readonly open = input(false);
  readonly saving = input(false);
  readonly serverError = input<string | null>(null);

  readonly submitted = output<AddPaymentMethodInput>();
  readonly cancelled = output<void>();

  protected readonly dialogContentClass = SETTINGS_DIALOG_CONTENT_CLASS;
  protected readonly fieldClass = SETTINGS_DIALOG_FIELD_CLASS;

  protected readonly dialogState = computed(() =>
    this.open() ? 'open' : 'closed',
  );

  protected readonly clientError = signal<string | null>(null);

  protected readonly form = new FormGroup({
    cardholderName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    number: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    expiry: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    cvc: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  private submitting = false;

  constructor() {
    effect(() => {
      if (this.open()) {
        this.resetForm();
      }
    });
  }

  protected submit(): void {
    this.clientError.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.clientError.set(
        this.transloco.translate('org.billing.addPaymentDialog.fillAllFields'),
      );
      return;
    }

    const expiry = parseCardExpiryInput(this.form.controls.expiry.value);
    if (!expiry) {
      this.clientError.set(
        this.transloco.translate('org.billing.addPaymentDialog.expiryInvalid'),
      );
      return;
    }

    this.submitting = true;
    this.submitted.emit({
      cardholderName: this.form.controls.cardholderName.value.trim(),
      number: this.form.controls.number.value,
      expMonth: expiry.expMonth,
      expYear: expiry.expYear,
      cvc: this.form.controls.cvc.value,
    });
  }

  protected onDialogClosed(): void {
    if (this.submitting) {
      this.submitting = false;
      return;
    }
    this.resetForm();
    this.cancelled.emit();
  }

  private resetForm(): void {
    this.clientError.set(null);
    this.form.reset();
  }
}
