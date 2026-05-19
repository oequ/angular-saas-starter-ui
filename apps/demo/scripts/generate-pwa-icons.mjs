/**
 * PWA icons from Lucide "layers" (ISC) — https://lucide.dev/icons/layers
 * Run: node apps/demo/scripts/generate-pwa-icons.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const publicDir = join(scriptDir, '..', 'public');
const iconsDir = join(publicDir, 'icons');
mkdirSync(iconsDir, { recursive: true });

const lucidePaths = `
  <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z" />
  <path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12" />
  <path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17" />
`;

function iconSvg(size) {
  const pad = Math.round(size * 0.18);
  const inner = size - pad * 2;
  const scale = inner / 24;
  const tx = pad;
  const ty = pad;
  const radius = Math.round(size * 0.22);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3f3f46"/>
      <stop offset="100%" stop-color="#18181b"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${radius}" fill="url(#bg)"/>
  <g transform="translate(${tx} ${ty}) scale(${scale})" fill="none" stroke="#fafafa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    ${lucidePaths}
  </g>
</svg>`;
}

function renderPng(size) {
  const svg = iconSvg(size);
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: size },
  });
  return resvg.render().asPng();
}

for (const size of [72, 96, 128, 144, 152, 192, 384, 512]) {
  const out = join(iconsDir, `icon-${size}x${size}.png`);
  writeFileSync(out, renderPng(size));
  console.log('wrote', out);
}

writeFileSync(join(iconsDir, 'source.svg'), iconSvg(512));

const favicon32 = renderPng(32);
writeFileSync(join(publicDir, 'favicon-32.png'), favicon32);

writeFileSync(
  join(iconsDir, 'ATTRIBUTION.md'),
  `# App icons

Glyph: [Lucide "layers"](https://lucide.dev/icons/layers) (ISC License).

Regenerate: \`node apps/demo/scripts/generate-pwa-icons.mjs\`
`,
);

console.log('Done.');
