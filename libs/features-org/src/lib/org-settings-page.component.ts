import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ORG_PORT } from '@oequ/ports';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';

import { OrgSettingsMembersComponent } from './org-settings-members.component';

@Component({
  selector: 'oequ-org-settings-page',
  imports: [
    ReactiveFormsModule,
    HlmTabsImports,
    HlmCardImports,
    HlmButtonImports,
    HlmInput,
    OrgSettingsMembersComponent,
  ],
  templateUrl: './org-settings-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrgSettingsPageComponent {
  private readonly orgPort = inject(ORG_PORT);

  protected readonly activeOrganization = toSignal(
    this.orgPort.activeOrganization$,
    { initialValue: null },
  );

  protected readonly generalForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(64),
      ],
    }),
  });

  protected readonly saving = signal(false);
  protected readonly statusMessage = signal<string | null>(null);
  private readonly savedName = signal<string | null>(null);

  protected readonly generalName = toSignal(
    this.generalForm.controls.name.valueChanges.pipe(
      startWith(this.generalForm.controls.name.value),
    ),
    { initialValue: '' },
  );

  protected readonly canSaveGeneral = computed(() => {
    const saved = this.savedName();
    const name = this.generalName().trim();
    return (
      saved !== null &&
      name !== saved.trim() &&
      this.generalForm.controls.name.valid &&
      !this.saving()
    );
  });

  constructor() {
    effect(() => {
      const org = this.activeOrganization();
      if (org) {
        this.generalForm.patchValue({ name: org.name }, { emitEvent: false });
        this.generalForm.markAsPristine();
        this.savedName.set(org.name);
        this.statusMessage.set(null);
      }
    });
  }

  protected async saveGeneral(): Promise<void> {
    const org = this.activeOrganization();
    if (!org || !this.canSaveGeneral()) {
      this.generalForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.statusMessage.set(null);

    const name = this.generalForm.getRawValue().name.trim();

    try {
      const result = await this.orgPort.update(org.id, { name });

      if (result.ok) {
        this.generalForm.patchValue({ name }, { emitEvent: false });
        this.savedName.set(name);
        this.generalForm.markAsPristine();
        this.statusMessage.set('Saved.');
      } else {
        this.statusMessage.set(result.error.message);
      }
    } catch {
      this.statusMessage.set('Something went wrong. Please try again.');
    } finally {
      this.saving.set(false);
    }
  }
}
