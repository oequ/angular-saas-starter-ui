/** Runtime locale entry; add `de` + JSON copy when translating. */
export interface SupportedLocale {
  readonly id: string;
  readonly labelKey: string;
}

export const SUPPORTED_LOCALES: readonly SupportedLocale[] = [
  { id: 'en', labelKey: 'shell.locale.english' },
] as const;

export type OequLocaleId = (typeof SUPPORTED_LOCALES)[number]['id'];
