import type {
  IntegrationCatalogItem,
  WorkspaceIntegration,
} from '@oequ/ports';

import { MOCK_DEMO_EMAIL, MOCK_ORGANIZATIONS } from './mock-data';

const NOVA_ID = MOCK_ORGANIZATIONS[1].id;
const LUMEN_ID = MOCK_ORGANIZATIONS[2].id;

function daysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

export const MOCK_INTEGRATIONS_CATALOG: readonly IntegrationCatalogItem[] = [
  {
    id: 'supabase',
    name: 'Supabase',
    description: 'Postgres, auth, storage, and edge functions for your workspace.',
    logoUrl: 'integrations/supabase.svg',
  },
  {
    id: 'vercel',
    name: 'Vercel',
    description: 'Deploy previews and production builds from your repository.',
    logoUrl: 'integrations/vercel.svg',
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Send workspace notifications and alerts to your team channels.',
    logoUrl: 'integrations/slack.svg',
  },
];

export function cloneMockIntegrationsSeed(): Map<
  string,
  WorkspaceIntegration[]
> {
  return new Map([
    [
      NOVA_ID,
      [
        {
          integrationId: 'slack',
          organizationId: NOVA_ID,
          connectedAt: daysAgo(12),
          connectedByEmail: MOCK_DEMO_EMAIL,
        },
      ],
    ],
    [
      LUMEN_ID,
      [
        {
          integrationId: 'supabase',
          organizationId: LUMEN_ID,
          connectedAt: daysAgo(30),
          connectedByEmail: MOCK_DEMO_EMAIL,
        },
        {
          integrationId: 'vercel',
          organizationId: LUMEN_ID,
          connectedAt: daysAgo(7),
          connectedByEmail: MOCK_DEMO_EMAIL,
        },
      ],
    ],
  ]);
}
