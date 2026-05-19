import { computed, Injectable, signal } from '@angular/core';

import {
  COOKIE_CONSENT_STORAGE_KEY,
  COOKIE_CONSENT_VERSION,
  DEFAULT_COOKIE_PREFERENCES,
  type CookieCategoryPreferences,
  type CookieConsentSource,
  type OptionalCookieCategory,
  type StoredCookieConsent,
} from './cookie-consent.model';

const ANALYTICS_CONSENT_EVENT = 'oequ:cookie-consent:analytics';
const MARKETING_CONSENT_EVENT = 'oequ:cookie-consent:marketing';

@Injectable({ providedIn: 'root' })
export class CookieConsentService {
  private readonly stored = signal<StoredCookieConsent | null>(null);
  readonly preferencesDialogOpen = signal(false);

  /** First-layer banner: no valid stored consent. */
  readonly bannerVisible = computed(
    () => this.stored() === null && !this.preferencesDialogOpen(),
  );

  readonly consent = this.stored.asReadonly();

  init(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    const raw = localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    if (!raw) {
      return;
    }
    try {
      const parsed = JSON.parse(raw) as StoredCookieConsent;
      if (parsed.version !== COOKIE_CONSENT_VERSION) {
        return;
      }
      this.stored.set({
        version: parsed.version,
        preferences: {
          analytics: Boolean(parsed.preferences?.analytics),
          marketing: Boolean(parsed.preferences?.marketing),
        },
        updatedAt: parsed.updatedAt,
        source: parsed.source,
      });
      this.applyOptionalScripts();
    } catch {
      localStorage.removeItem(COOKIE_CONSENT_STORAGE_KEY);
    }
  }

  openPreferences(): void {
    this.preferencesDialogOpen.set(true);
  }

  closePreferences(): void {
    this.preferencesDialogOpen.set(false);
  }

  rejectAll(): void {
    this.persist(
      { ...DEFAULT_COOKIE_PREFERENCES },
      'reject_all',
    );
    this.preferencesDialogOpen.set(false);
  }

  acceptAll(): void {
    this.persist(
      { analytics: true, marketing: true },
      'accept_all',
    );
    this.preferencesDialogOpen.set(false);
  }

  savePreferences(preferences: CookieCategoryPreferences): void {
    this.persist(preferences, 'save_preferences');
    this.preferencesDialogOpen.set(false);
  }

  hasOptionalConsent(category: OptionalCookieCategory): boolean {
    return this.stored()?.preferences[category] === true;
  }

  /** Draft values for the preferences dialog (existing choice or opt-out defaults). */
  draftPreferences(): CookieCategoryPreferences {
    return this.stored()?.preferences ?? { ...DEFAULT_COOKIE_PREFERENCES };
  }

  private persist(
    preferences: CookieCategoryPreferences,
    source: CookieConsentSource,
  ): void {
    const record: StoredCookieConsent = {
      version: COOKIE_CONSENT_VERSION,
      preferences,
      updatedAt: new Date().toISOString(),
      source,
    };
    this.stored.set(record);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(record));
    }
    this.applyOptionalScripts();
  }

  private applyOptionalScripts(): void {
    if (typeof window === 'undefined') {
      return;
    }
    const prefs = this.stored()?.preferences;
    if (!prefs) {
      return;
    }
    if (prefs.analytics) {
      window.dispatchEvent(new CustomEvent(ANALYTICS_CONSENT_EVENT));
    }
    if (prefs.marketing) {
      window.dispatchEvent(new CustomEvent(MARKETING_CONSENT_EVENT));
    }
  }
}
