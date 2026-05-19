import type { OrganizationId } from './org.model';

export interface IntegrationCatalogItem {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  /** Public asset path, e.g. `integrations/supabase.svg`. */
  readonly logoUrl: string;
}

export interface WorkspaceIntegration {
  readonly integrationId: string;
  readonly organizationId: OrganizationId;
  readonly connectedAt: string;
  readonly connectedByEmail: string;
}
