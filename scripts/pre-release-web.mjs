#!/usr/bin/env node
/**
 * Pre-release gate for apps/web: local Supabase + Playwright smoke (@web).
 *
 * Usage: npm run pre-release:web
 * Requires: Docker (Supabase CLI), Playwright chromium (npm run postinstall or npx playwright install chromium)
 */
import { spawnSync } from 'node:child_process';

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function run(label, args, extraEnv = {}) {
  console.log(`\n▶ ${label}`);
  const result = spawnSync(npmCmd, args, {
    stdio: 'inherit',
    env: { ...process.env, ...extraEnv },
    shell: process.platform === 'win32',
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function runNode(label, scriptPath) {
  console.log(`\n▶ ${label}`);
  const result = spawnSync(process.execPath, [scriptPath], {
    stdio: 'inherit',
    env: process.env,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run('Supabase start', ['run', 'db:start']);
run('DB reset (migrations + seed)', ['run', 'db:reset']);
runNode('Web Supabase settings', 'scripts/write-web-supabase-settings.mjs');
run('Web E2E smoke (@web)', ['run', 'e2e:web:release']);

console.log('\n✓ pre-release:web passed');
