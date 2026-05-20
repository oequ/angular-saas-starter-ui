import { inject, isDevMode, LOCALE_ID } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideTransloco } from '@jsverse/transloco';

import { LocalePreferenceService } from './locale-preference.service';
import { OequTranslocoHttpLoader } from './oequ-transloco-http-loader';

export function provideOequI18n() {
  return [
    provideHttpClient(withFetch()),
    provideTransloco({
      config: {
        availableLangs: ['en'],
        defaultLang: 'en',
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
      loader: OequTranslocoHttpLoader,
    }),
    {
      provide: LOCALE_ID,
      useFactory: () => inject(LocalePreferenceService).activeLang(),
    },
  ];
}
