import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { LocalePreferenceService } from './locale-preference.service';

@Component({
  selector: 'oequ-locale-switcher',
  imports: [TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label class="flex flex-col gap-1 px-2 py-1.5">
      <span class="text-muted-foreground text-xs">{{
        'shell.userMenu.language' | transloco
      }}</span>
      <select
        class="border-input bg-background h-8 w-full rounded-md border px-2 text-sm"
        [value]="localePreference.activeLang()"
        [disabled]="localePreference.supportedLocales.length < 2"
        (change)="onChange($event)"
      >
        @for (locale of localePreference.supportedLocales; track locale.id) {
          <option [value]="locale.id">
            {{ locale.labelKey | transloco }}
          </option>
        }
      </select>
    </label>
  `,
})
export class OequLocaleSwitcherComponent {
  protected readonly localePreference = inject(LocalePreferenceService);

  protected async onChange(event: Event): Promise<void> {
    const select = event.target as HTMLSelectElement;
    await this.localePreference.setLanguage(select.value);
  }
}
