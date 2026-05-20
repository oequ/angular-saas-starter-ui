import { inject, Injectable, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { firstValueFrom } from 'rxjs';

import {
  SUPPORTED_LOCALES,
  type OequLocaleId,
} from './supported-locales';

const STORAGE_KEY = 'oequ-locale';

@Injectable({ providedIn: 'root' })
export class LocalePreferenceService {
  private readonly transloco = inject(TranslocoService);

  readonly activeLang = signal<OequLocaleId>('en');
  readonly supportedLocales = SUPPORTED_LOCALES;

  async init(): Promise<void> {
    const lang = this.resolveStoredLang();
    this.activeLang.set(lang);
    await firstValueFrom(this.transloco.load(lang));
    this.transloco.setActiveLang(lang);
    document.documentElement.lang = lang;
  }

  async setLanguage(lang: string): Promise<void> {
    if (!this.isSupported(lang)) {
      return;
    }
    this.activeLang.set(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    await firstValueFrom(this.transloco.load(lang));
    this.transloco.setActiveLang(lang);
    document.documentElement.lang = lang;
  }

  private resolveStoredLang(): OequLocaleId {
    const stored = localStorage.getItem(STORAGE_KEY);
    return this.isSupported(stored) ? stored : 'en';
  }

  private isSupported(lang: string | null): lang is OequLocaleId {
    return (
      lang !== null &&
      SUPPORTED_LOCALES.some((entry) => entry.id === lang)
    );
  }
}
