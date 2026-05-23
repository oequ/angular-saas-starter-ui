import { request } from '@playwright/test';

const supabaseUrl =
  process.env['SUPABASE_URL'] ?? 'http://127.0.0.1:54321';
const anonKey =
  process.env['SUPABASE_ANON_KEY'] ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

async function globalSetup(): Promise<void> {
  const api = await request.newContext({
    baseURL: supabaseUrl,
    extraHTTPHeaders: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
    },
  });

  const health = await api.get('/rest/v1/', { failOnStatusCode: false });
  if (!health.ok()) {
    throw new Error(
      `Supabase is not reachable at ${supabaseUrl} (status ${health.status()}). ` +
        'Run: npm run db:start && npm run db:reset',
    );
  }

  await api.dispose();
}

export default globalSetup;
