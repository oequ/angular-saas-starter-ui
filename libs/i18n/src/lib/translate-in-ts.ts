import { inject } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

/** Use inside injection context (constructors, `inject()`, `runInInjectionContext`). */
export function translateKey(
  key: string,
  params?: Record<string, unknown>,
): string {
  return inject(TranslocoService).translate(key, params);
}
