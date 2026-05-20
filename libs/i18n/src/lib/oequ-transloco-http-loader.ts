import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Translation, TranslocoLoader } from '@jsverse/transloco';
import { forkJoin, map, Observable } from 'rxjs';

const SCOPES = [
  'common',
  'shell',
  'auth',
  'onboarding',
  'account',
  'org-members',
  'cookie',
  'org-billing',
  'paywall',
  'org-usage',
  'org-metrics',
] as const;

@Injectable({ providedIn: 'root' })
export class OequTranslocoHttpLoader implements TranslocoLoader {
  private readonly http = inject(HttpClient);

  getTranslation(lang: string): Observable<Translation> {
    const requests = SCOPES.map((scope) =>
      this.http
        .get<Record<string, unknown>>(`/i18n/${lang}/${scope}.json`)
        .pipe(map((data) => ({ [scope]: data }))),
    );
    return forkJoin(requests).pipe(
      map((parts) => Object.assign({}, ...parts) as Translation),
    );
  }
}
