import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
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
import type { OrgRole } from '@oequ/ports';
import {
  SETTINGS_DIALOG_CONTENT_CLASS,
  SETTINGS_DIALOG_FIELD_CLASS,
} from '@oequ/shell';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';

export interface InviteMemberInput {
  readonly email: string;
  readonly role: 'admin' | 'member';
}

export interface InviteMemberRoleOption {
  readonly value: OrgRole;
  readonly label: string;
  readonly description: string;
}

@Component({
  selector: 'oequ-invite-member-dialog',
  imports: [
    ReactiveFormsModule,
    HlmButtonImports,
    HlmDialogImports,
    HlmInput,
    HlmSelectImports,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <hlm-dialog [state]="dialogState()" (closed)="onDialogClosed()">
      <ng-template hlmDialogPortal>
        <hlm-dialog-content [class]="dialogContentClass">
          <hlm-dialog-header>
            <h3 hlmDialogTitle>Invite member</h3>
            <p hlmDialogDescription>
              Send an invitation to join this workspace.
            </p>
          </hlm-dialog-header>

          <form class="space-y-4" [formGroup]="form" (ngSubmit)="submit()">
            <div class="w-full min-w-0">
              <label for="invite-email" class="mb-1.5 block text-sm font-medium">
                Email address
              </label>
              <input
                id="invite-email"
                hlmInput
                type="email"
                placeholder="colleague@company.com"
                [class]="dialogFieldClass"
                class="border-input bg-background h-9 w-full rounded-[5px] shadow-none"
                [formControl]="form.controls.email"
                autocomplete="email"
              />
              @if (submitAttempted() && form.controls.email.invalid) {
                <p class="text-destructive mt-1.5 text-sm">
                  Enter a valid email address.
                </p>
              }
            </div>

            <div class="w-full min-w-0">
              <label
                for="invite-role-trigger"
                class="mb-1.5 block text-sm font-medium"
              >
                Role
              </label>
              <hlm-select
                class="block w-full"
                [value]="form.controls.role.value"
                (valueChange)="onRoleChange($event)"
              >
                <hlm-select-trigger
                  buttonId="invite-role-trigger"
                  [class]="dialogFieldClass"
                  class="w-full max-w-full shadow-none"
                >
                  <span hlmSelectValue placeholder="Select a role"></span>
                </hlm-select-trigger>
                <hlm-select-content
                  *hlmSelectPortal
                  class="w-[var(--brn-select-width)]"
                >
                  @for (option of roleOptions(); track option.value) {
                    <hlm-select-item [value]="option.value">
                      <span class="font-medium">{{ option.label }}</span>
                      <span
                        class="text-muted-foreground block text-xs font-normal"
                      >
                        {{ option.description }}
                      </span>
                    </hlm-select-item>
                  }
                </hlm-select-content>
              </hlm-select>
            </div>

            <hlm-dialog-footer>
              <button hlmBtn type="button" variant="secondary" hlmDialogClose>
                Cancel
              </button>
              <button hlmBtn type="submit" [disabled]="inviting()">
                {{ inviting() ? 'Sending…' : 'Send invite' }}
              </button>
            </hlm-dialog-footer>
          </form>
        </hlm-dialog-content>
      </ng-template>
    </hlm-dialog>
  `,
})
export class InviteMemberDialogComponent {
  readonly open = input(false);
  readonly inviting = input(false);
  readonly roleOptions = input.required<readonly InviteMemberRoleOption[]>();

  readonly submitted = output<InviteMemberInput>();
  readonly cancelled = output<void>();

  protected readonly dialogContentClass = SETTINGS_DIALOG_CONTENT_CLASS;
  protected readonly dialogFieldClass = SETTINGS_DIALOG_FIELD_CLASS;

  protected readonly submitAttempted = signal(false);

  protected readonly form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    role: new FormControl<'admin' | 'member'>('member', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  constructor() {
    effect(() => {
      if (this.open()) {
        this.submitAttempted.set(false);
        this.form.reset({ email: '', role: 'member' });
      }
    });
  }

  protected readonly dialogState = computed(() =>
    this.open() ? 'open' : 'closed',
  );

  private confirming = false;

  protected onRoleChange(value: string | string[] | null | undefined): void {
    const next = Array.isArray(value) ? value[0] : value;
    if (next === 'admin' || next === 'member') {
      this.form.controls.role.setValue(next);
    }
  }

  protected submit(): void {
    this.submitAttempted.set(true);
    if (this.form.invalid) {
      return;
    }
    this.confirming = true;
    this.submitted.emit({
      email: this.form.controls.email.value.trim(),
      role: this.form.controls.role.value,
    });
  }

  protected onDialogClosed(): void {
    if (this.confirming) {
      this.confirming = false;
      this.submitAttempted.set(false);
      this.form.reset({ email: '', role: 'member' });
      return;
    }
    this.cancelled.emit();
  }
}
