/**
 * EditorDomainConfig registry.
 *
 * Adding a new domain:
 *   1. Create `./<domain>.ts` exporting `const <domain>EditorConfig: EditorDomainConfig<D>`
 *   2. Add it to EDITOR_DOMAIN_CONFIGS below
 *   3. Editor core code requires no changes (AC-B7).
 */

import type { ComponentDomain } from '@/lib/framework';
import type { EditorDomainConfig } from '../editor-config';
import { circuitEditorConfig } from './circuit';
import { chemistryEditorConfig } from './chemistry';
import { mechanicsEditorConfig } from './mechanics';
import { opticsEditorConfig } from './optics';

export { circuitEditorConfig, chemistryEditorConfig, mechanicsEditorConfig, opticsEditorConfig };

export const EDITOR_DOMAIN_CONFIGS: Partial<Record<ComponentDomain, EditorDomainConfig<ComponentDomain>>> = {
  circuit: circuitEditorConfig as unknown as EditorDomainConfig<ComponentDomain>,
  chemistry: chemistryEditorConfig as unknown as EditorDomainConfig<ComponentDomain>,
  mechanics: mechanicsEditorConfig as unknown as EditorDomainConfig<ComponentDomain>,
  optics: opticsEditorConfig as unknown as EditorDomainConfig<ComponentDomain>,
};

/** List of domains available in the UI domain switcher. */
export function getAvailableDomains(): ComponentDomain[] {
  return Object.keys(EDITOR_DOMAIN_CONFIGS) as ComponentDomain[];
}

/** Lookup config for a domain (throws if not registered). */
export function getDomainConfig(
  domain: ComponentDomain,
): EditorDomainConfig<ComponentDomain> {
  const cfg = EDITOR_DOMAIN_CONFIGS[domain];
  if (!cfg) {
    throw new Error(`[editor] No EditorDomainConfig registered for domain "${domain}"`);
  }
  return cfg;
}
