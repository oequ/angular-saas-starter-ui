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

    labelKey: 'cookie.categories.necessary.label',

    descriptionKey: 'cookie.categories.necessary.description',

    required: true,

  },

  {

    id: 'analytics' as const,

    labelKey: 'cookie.categories.analytics.label',

    descriptionKey: 'cookie.categories.analytics.description',

    required: false,

  },

  {

    id: 'marketing' as const,

    labelKey: 'cookie.categories.marketing.label',

    descriptionKey: 'cookie.categories.marketing.description',

    required: false,

  },

] as const;



export type OptionalCookieCategory = keyof CookieCategoryPreferences;

