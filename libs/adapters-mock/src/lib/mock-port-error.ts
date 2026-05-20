import {
  portErrorReason,
  type PortError,
  type PortErrorCode,
  type PortResult,
} from '@oequ/ports';

export function mockErr<T>(
  code: PortErrorCode,
  reason: string,
  params?: Record<string, unknown>,
): PortResult<T> {
  return { ok: false, error: portErrorReason(code, reason, params) };
}

export function mockErrFrom(error: PortError): PortResult<never> {
  return { ok: false, error };
}
