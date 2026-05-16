import type { OrgRole } from './org.model';

export type UserId = string;

export interface AuthUser {
  readonly id: UserId;
  readonly email: string;
  readonly displayName: string | null;
}

/** Mirrors JWT `app_metadata.org` from the access-token hook (see full-stack ARCHITECTURE). */
export interface OrgContextClaim {
  readonly organizationId: string;
  readonly role: OrgRole;
}

export interface AuthClaims {
  readonly sub: UserId;
  readonly email?: string;
  readonly org: OrgContextClaim | null;
}

export interface AuthSession {
  readonly user: AuthUser;
  readonly claims: AuthClaims;
}

export interface EmailPasswordCredentials {
  readonly email: string;
  readonly password: string;
}
