/**
 * persistence — localStorage save/load for AssemblyBundle.
 *
 * Design (B-11):
 *   - Key scheme: "egpspace-editor-<domain>-<slot>"
 *   - Never throws on read — returns null on parse/shape failure (F-4).
 *   - Catches QuotaExceededError on write and returns { ok:false, reason } (F-5).
 *   - Uses AssemblyBundle type guard for defensive load.
 */

import type { AssemblyBundle, ComponentDomain } from '@/lib/framework';
import { isAssemblyBundle } from '@/lib/framework';

export const STORAGE_PREFIX = 'egpspace-editor';

/** Build a storage key from domain and slot name. */
export function storageKey(domain: ComponentDomain, slot: string): string {
  // normalise slot to avoid collision/injection
  const safe = slot.replace(/[^a-z0-9_-]/gi, '_').slice(0, 64);
  return `${STORAGE_PREFIX}-${domain}-${safe}`;
}

export type SaveResult =
  | { ok: true; key: string }
  | { ok: false; reason: 'quota-exceeded' | 'serialization-failed' | 'storage-unavailable'; message: string };

export type LoadResult<D extends ComponentDomain = ComponentDomain> =
  | { ok: true; bundle: AssemblyBundle<D> }
  | { ok: false; reason: 'not-found' | 'parse-error' | 'shape-invalid' | 'storage-unavailable'; message: string };

/**
 * Resolve the Storage backend. Accepts an explicit arg (for tests) or falls
 * back to window.localStorage. Returns null when no storage is available
 * (SSR / private mode with localStorage blocked).
 */
function resolveStorage(storage?: Storage): Storage | null {
  if (storage) return storage;
  if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
  return null;
}

/**
 * Save a bundle to localStorage. Returns an ok/err result without throwing.
 */
export function saveBundle<D extends ComponentDomain>(
  domain: D,
  slot: string,
  bundle: AssemblyBundle<D>,
  storage?: Storage,
): SaveResult {
  const s = resolveStorage(storage);
  if (!s) return { ok: false, reason: 'storage-unavailable', message: 'no Storage backend' };

  let json: string;
  try {
    json = JSON.stringify(bundle);
  } catch (e) {
    return {
      ok: false,
      reason: 'serialization-failed',
      message: e instanceof Error ? e.message : String(e),
    };
  }

  const key = storageKey(domain, slot);
  try {
    s.setItem(key, json);
    return { ok: true, key };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    // QuotaExceededError names vary across browsers; match loosely
    if (/quota|QUOTA/i.test(msg) || /QuotaExceeded/i.test(msg)) {
      return { ok: false, reason: 'quota-exceeded', message: msg };
    }
    return { ok: false, reason: 'storage-unavailable', message: msg };
  }
}

/**
 * Load a bundle from localStorage. Validates shape via isAssemblyBundle.
 */
export function loadBundle<D extends ComponentDomain>(
  domain: D,
  slot: string,
  storage?: Storage,
): LoadResult<D> {
  const s = resolveStorage(storage);
  if (!s) return { ok: false, reason: 'storage-unavailable', message: 'no Storage backend' };

  const key = storageKey(domain, slot);
  const raw = s.getItem(key);
  if (raw === null) return { ok: false, reason: 'not-found', message: `no entry for ${key}` };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    return { ok: false, reason: 'parse-error', message: e instanceof Error ? e.message : String(e) };
  }

  if (!isAssemblyBundle(parsed)) {
    return { ok: false, reason: 'shape-invalid', message: 'parsed value is not an AssemblyBundle' };
  }
  if ((parsed as AssemblyBundle).spec.domain !== domain) {
    return {
      ok: false,
      reason: 'shape-invalid',
      message: `domain mismatch: expected ${domain}, got ${(parsed as AssemblyBundle).spec.domain}`,
    };
  }

  return { ok: true, bundle: parsed as AssemblyBundle<D> };
}

/**
 * List all saved slots for a domain, returning sorted slot names.
 */
export function listSlots(domain: ComponentDomain, storage?: Storage): string[] {
  const s = resolveStorage(storage);
  if (!s) return [];
  const prefix = `${STORAGE_PREFIX}-${domain}-`;
  const slots: string[] = [];
  for (let i = 0; i < s.length; i++) {
    const key = s.key(i);
    if (key && key.startsWith(prefix)) {
      slots.push(key.slice(prefix.length));
    }
  }
  return slots.sort();
}

/**
 * Remove a saved slot. Returns true if removed, false if not found.
 */
export function removeSlot(domain: ComponentDomain, slot: string, storage?: Storage): boolean {
  const s = resolveStorage(storage);
  if (!s) return false;
  const key = storageKey(domain, slot);
  if (s.getItem(key) === null) return false;
  s.removeItem(key);
  return true;
}

/**
 * Export a bundle as a downloadable Blob (browser-only helper).
 * In SSR / jest, returns a plain string.
 */
export function exportBundleJson<D extends ComponentDomain>(bundle: AssemblyBundle<D>): string {
  return JSON.stringify(bundle, null, 2);
}

/**
 * Import a bundle from raw JSON text. Same validation as loadBundle.
 */
export function importBundleJson<D extends ComponentDomain>(
  raw: string,
  expectedDomain?: D,
): LoadResult<D> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    return { ok: false, reason: 'parse-error', message: e instanceof Error ? e.message : String(e) };
  }
  if (!isAssemblyBundle(parsed)) {
    return { ok: false, reason: 'shape-invalid', message: 'not an AssemblyBundle' };
  }
  if (expectedDomain && (parsed as AssemblyBundle).spec.domain !== expectedDomain) {
    return {
      ok: false,
      reason: 'shape-invalid',
      message: `domain mismatch: expected ${expectedDomain}, got ${(parsed as AssemblyBundle).spec.domain}`,
    };
  }
  return { ok: true, bundle: parsed as AssemblyBundle<D> };
}
