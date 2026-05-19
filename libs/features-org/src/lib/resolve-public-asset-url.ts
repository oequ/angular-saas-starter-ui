/** Resolves a path under the app `public/` folder (e.g. `integrations/foo.svg`). */
export function resolvePublicAssetUrl(
  document: Document,
  assetPath: string,
): string {
  const base =
    document.querySelector('base')?.href ?? `${document.location.origin}/`;
  const path = assetPath.replace(/^\//, '');
  return new URL(path, base).href;
}
