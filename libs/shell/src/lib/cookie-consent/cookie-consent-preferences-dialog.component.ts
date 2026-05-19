import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCheckboxImports } from '@spartan-ng/helm/checkbox';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';

import {
  COOKIE_CATEGORY_META,
  type CookieCategoryPreferences,
} from './cookie-consent.model';
import { CookieConsentService } from './cookie-consent.service';

@Component({
  selector: 'oequ-cookie-consent-preferences-dialog',
  imports: [
    RouterLink,
    HlmButtonImports,
    HlmCheckboxImports,
    HlmDialogImports,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <hlm-dialog
      [state]="dialogState()"
      (closed)="onDialogClosed()"
    >
      <ng-template hlmDialogPortal>
        <hlm-dialog-content class="sm:!max-w-[440px]">
          <hlm-dialog-header>
            <h3 hlmDialogTitle>Cookie preferences</h3>
            <p hlmDialogDescription>
              Choose which optional cookies we may use. You can change this
              anytime. See our
              <a
                routerLink="/auth/cookies"
                class="text-foreground underline underline-offset-4"
                >Cookie Policy</a
              >.
            </p>
          </hlm-dialog-header>

          <ul class="space-y-4 py-2" role="list">
            @for (category of categories; track category.id) {
              <li
                class="border-border flex gap-3 rounded-[5px] border px-3 py-3"
              >
                <hlm-checkbox
                  class="mt-0.5"
                  [inputId]="'cookie-' + category.id"
                  [checked]="isChecked(category.id)"
                  [disabled]="category.required"
                  (checkedChange)="onCategoryChange(category.id, $event)"
                />
                <div class="min-w-0 flex-1">
                  <label
                    [for]="'cookie-' + category.id"
                    class="text-sm font-medium leading-none"
                  >
                    {{ category.label }}
                    @if (category.required) {
                      <span class="text-muted-foreground font-normal">
                        (always on)
                      </span>
                    }
                  </label>
                  <p class="text-muted-foreground mt-1.5 text-sm leading-6">
                    {{ category.description }}
                  </p>
                </div>
              </li>
            }
          </ul>

          <hlm-dialog-footer class="flex-col gap-2 sm:flex-row sm:justify-between">
            <button
              hlmBtn
              type="button"
              variant="outline"
              class="w-full sm:w-auto"
              (click)="rejectAll()"
            >
              Reject all
            </button>
            <div class="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <button
                hlmBtn
                type="button"
                variant="outline"
                class="w-full sm:w-auto"
                hlmDialogClose
              >
                Cancel
              </button>
              <button
                hlmBtn
                type="button"
                class="w-full sm:w-auto"
                (click)="save()"
              >
                Save preferences
              </button>
            </div>
          </hlm-dialog-footer>
        </hlm-dialog-content>
      </ng-template>
    </hlm-dialog>
  `,
})
export class CookieConsentPreferencesDialogComponent {
  private readonly cookieConsent = inject(CookieConsentService);

  protected readonly categories = COOKIE_CATEGORY_META;

  protected readonly dialogState = computed(() =>
    this.cookieConsent.preferencesDialogOpen() ? 'open' : 'closed',
  );

  private readonly analytics = signal(false);
  private readonly marketing = signal(false);

  constructor() {
    effect(() => {
      if (this.cookieConsent.preferencesDialogOpen()) {
        const draft = this.cookieConsent.draftPreferences();
        this.analytics.set(draft.analytics);
        this.marketing.set(draft.marketing);
      }
    });
  }

  protected isChecked(
    id: (typeof COOKIE_CATEGORY_META)[number]['id'],
  ): boolean {
    if (id === 'necessary') {
      return true;
    }
    if (id === 'analytics') {
      return this.analytics();
    }
    return this.marketing();
  }

  protected onCategoryChange(
    id: (typeof COOKIE_CATEGORY_META)[number]['id'],
    checked: boolean,
  ): void {
    if (id === 'analytics') {
      this.analytics.set(checked);
    } else if (id === 'marketing') {
      this.marketing.set(checked);
    }
  }

  protected rejectAll(): void {
    this.cookieConsent.rejectAll();
  }

  protected save(): void {
    const preferences: CookieCategoryPreferences = {
      analytics: this.analytics(),
      marketing: this.marketing(),
    };
    this.cookieConsent.savePreferences(preferences);
  }

  protected onDialogClosed(): void {
    this.cookieConsent.closePreferences();
  }
}
