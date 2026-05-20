/** Stable error surface for all port adapters (HTTP, Supabase, mock). */
export type PortErrorCode =
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION'
  | 'CONFLICT'
  | 'SEATS_EXHAUSTED'
  | 'PLAN_DOWNGRADE_BLOCKED'
  | 'RATE_LIMITED'
  | 'UNAVAILABLE'
  | 'UNKNOWN';

export interface PortError {
  readonly code: PortErrorCode;
  /** Fallback for logs and adapters without i18n; not shown when `reason` resolves. */
  readonly message: string;
  /** Stable key under `errors.reasons.*` in Transloco. */
  readonly reason?: string;
  readonly params?: Record<string, unknown>;
  readonly cause?: unknown;
}

export type PortResult<T> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly error: PortError };

export function portOk<T>(data: T): PortResult<T> {
  return { ok: true, data };
}

export function portErr<T>(error: PortError): PortResult<T> {
  return { ok: false, error };
}

export function portError(
  code: PortErrorCode,
  message: string,
  cause?: unknown,
): PortError {
  return { code, message, cause };
}

/** Prefer in adapters: UI resolves `reason` via `translatePortError`. */
export function portErrorReason(
  code: PortErrorCode,
  reason: string,
  params?: Record<string, unknown>,
  message?: string,
): PortError {
  return {
    code,
    reason,
    params,
    message: message ?? reason,
  };
}
