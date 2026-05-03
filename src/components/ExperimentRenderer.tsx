'use client';

import React from 'react';
import { EditorShell } from '@/components/editor/EditorShell';
import IframeExperiment from '@/components/IframeExperiment';
import { conceptToTemplateId } from '@/lib/concept-to-template';
import { isApprovedTemplate } from '@/lib/template-registry';
import type { AssemblyBundle } from '@/lib/framework';
import type { ExperimentSchema } from '@/lib/experiment-schema';

/** Preset experiment routing metadata */
export interface PresetExperiment {
  name: string;
  icon: string;
  gradient: string;
  color: string;
  subject: string;
  templateId?: string;
  defaultKnowledge?: string[];
  steps?: string[];
}

interface ExperimentRendererProps {
  experiment: PresetExperiment | null;
  aiSchema: ExperimentSchema | null;
  aiConfig: GeneratedConfig | null;
  resolvedTemplateId: string | null;
  onMetadataChange?: (metadata: Record<string, unknown>) => void;
}

/** AI-generated experiment config type (legacy, non-schema) */
export interface GeneratedConfig {
  name: string;
  subject: string;
  topic: string;
  description?: string;
  icon: string;
  gradient: string;
  teaching?: any;
  experiment?: any;
}

export function ExperimentRenderer({
  experiment,
  aiSchema,
  aiConfig,
  resolvedTemplateId,
  onMetadataChange,
}: ExperimentRendererProps) {
  // Lock 1: Ensure if resolvedTemplateId is provided, we strictly follow it and don't fallback to EditorShell
  if (resolvedTemplateId && isApprovedTemplate(resolvedTemplateId)) {
    return <IframeExperiment templateId={resolvedTemplateId} height={900} onMetadataChange={onMetadataChange} />;
  }

  // Lock 2: If we didn't receive a resolvedTemplateId but we can manually resolve one here
  const backendTid = (aiSchema as (ExperimentSchema & { _templateId?: string }) | null)?._templateId || null;
  const selfResolvedTid = resolveTemplateId(aiSchema, aiConfig, experiment, backendTid);
  
  if (selfResolvedTid && isApprovedTemplate(selfResolvedTid)) {
    return <IframeExperiment templateId={selfResolvedTid} height={900} onMetadataChange={onMetadataChange} />;
  }

  const hasAssemblySchema = Boolean(aiSchema?.components && aiSchema.components.length > 0);

  if (hasAssemblySchema) {
    const domain = aiSchema?.meta?.physicsType === 'circuit'
      ? 'circuit'
      : (aiSchema?.meta?.physicsType as string) === 'chemistry'
        ? 'chemistry'
        : (experiment?.subject === '物理' && (experiment as any)?.component === 'refraction')
          ? 'optics'
          : (experiment?.subject === '物理')
            ? 'mechanics'
            : 'chemistry';

    const components = aiSchema?.components || [];
    const connections = aiSchema?.connections || [];

    const bundle: AssemblyBundle = {
      spec: {
        domain: domain as any,
        components: components,
        connections: connections.map(c => ({
          from: { componentId: c.from, portName: c.fromPort },
          to: { componentId: c.to, portName: c.toPort }
        }))
      }
    } as any;

    return (
      <div className="h-[800px] border rounded-xl overflow-hidden relative">
        <EditorShell initialDomain={domain as any} initialBundle={bundle as any} />
      </div>
    );
  }

  return (
    <div className="h-[800px] border rounded-xl overflow-hidden relative">
      <EditorShell initialDomain="chemistry" initialBundle={{} as any} />
    </div>
  );
}

/** Resolve the best approved template for an experiment (Triple-Lock routing). */
export function resolveTemplateId(
  aiSchema: ExperimentSchema | null,
  aiConfig: GeneratedConfig | null,
  experiment: PresetExperiment | null,
  backendTid?: string | null,
): string | null {
  // Highest priority: injected _templateId (often passed as backendTid)
  const injectedTid = (aiSchema as (ExperimentSchema & { _templateId?: string }) | null)?._templateId || null;

  const candidates = [
    injectedTid,
    backendTid,
    experiment?.templateId,
    conceptToTemplateId(aiSchema?.meta?.topic ?? aiSchema?.meta?.name),
    conceptToTemplateId(aiConfig?.topic ?? aiConfig?.name),
  ];

  // Defensive domain check to normalize missing 'chemistry/' prefixes etc.
  for (let candidate of candidates) {
    if (!candidate) continue;
    
    // Auto-fix chemistry domains
    if (['acid-base-titration', 'electrolysis', 'iron-rusting', 'reaction-rate', 'combustion-conditions'].includes(candidate)) {
      candidate = `chemistry/${candidate}`;
    }
    
    if (isApprovedTemplate(candidate)) {
      return candidate;
    }
  }

  return null;
}
