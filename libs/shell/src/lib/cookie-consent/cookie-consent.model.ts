/** Bump when categories or legal copy change to re-prompt users. */
export const COOKIE_CONSENT_VERSION = 1;

export const COOKIE_CONSENT_STORAGE_KEY = 'oequ-cookie-consent';

export type CookieConsentSource =
  | 'accept_all'
  | 'reject_all'
  | 'save_preferences';

export interface CookieCategoryPreferences {
  readonly analytics: boolean;
  readonly marketing: boolean;
}

export interface StoredCookieConsent {
  readonly version: number;
  readonly preferences: CookieCategoryPreferences;
  readonly updatedAt: string;
  readonly source: CookieConsentSource;
}

export const DEFAULT_COOKIE_PREFERENCES: CookieCategoryPreferences = {
  analytics: false,
  marketing: false,
};

export const COOKIE_CATEGORY_META = [
  {
    id: 'necessary' as const,
    label: 'Strictly necessary',
    description:
      'Required for sign-in, security, and core app features (including session and UI preference storage). Always active.',
    required: true,
  },
  {
    id: 'analytics' as const,
    label: 'Analytics',
    description:
      'Helps us understand how the product is used (page views, feature adoption). No advertising profiles.',
    required: false,
  },
  {
    id: 'marketing' as const,
    label: 'Marketing',
    description:
      'Used to measure campaigns and personalize outreach. Disabled in the default demo build.',
    required: false,
  },
] as const;

export type OptionalCookieCategory = keyof CookieCategoryPreferences;
