import type { PortError } from '@oequ/ports';
import type { TranslocoService } from '@jsverse/transloco';

type TranslateFn = TranslocoService['translate'];

function resolveKey(
  translate: TranslateFn,
  key: string,
  params?: Record<string, unknown>,
): string | null {
  const translated = translate(key, params);
  return translated === key ? null : translated;
}

/** User-facing message for a port error (reason → code → message → generic). */
export function translatePortError(
  error: PortError,
  transloco: TranslocoService,
): string {
  const translate = transloco.translate.bind(transloco) as TranslateFn;

  if (error.reason) {
    const fromReason = resolveKey(
      translate,
      `errors.reasons.${error.reason}`,
      error.params,
    );
    if (fromReason) {
      return fromReason;
    }
  }

  const fromCode = resolveKey(
    translate,
    `errors.codes.${error.code}`,
    error.params,
  );
  if (fromCode) {
    return fromCode;
  }

  if (error.message.trim()) {
    return error.message;
  }

  return translate('common.errorGeneric');
}

export function portErrorToError(
  error: PortError,
  transloco: TranslocoService,
): Error {
  return new Error(translatePortError(error, transloco));
}
