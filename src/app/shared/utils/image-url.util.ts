import { environment } from '../../../environments/environment';

/**
 * Transforme un chemin de fichier renvoyé par l'API en URL HTTP configurable.
 * Les URLs déjà exploitables (HTTP, data ou blob) sont conservées telles quelles.
 */
export function resolveImageUrl(
  value?: string | null,
  folder: 'articles' | 'article-variants' = 'articles'
): string | null {
  const raw = value?.trim();
  if (!raw) return null;

  if (/^(https?:|data:|blob:|\/\/)/i.test(raw)) {
    return raw;
  }

  const normalized = raw.replace(/\\/g, '/');
  const marker = '/songoycollection/';
  const markerIndex = normalized.toLowerCase().lastIndexOf(marker);
  const relativePath = markerIndex >= 0
    ? normalized.slice(markerIndex + marker.length)
    : normalized.replace(/^file:\/\/?/i, '').replace(/^\/+/, '');
  let path = relativePath.split('/').filter(Boolean).join('/');
  if (!path.includes('/') && path) {
    path = `${folder}/${path}`;
  }
  const baseUrl = environment.assets.imagesBaseUrl.replace(/\/+$/, '');

  return path ? `${baseUrl}/${path}` : baseUrl || null;
}
