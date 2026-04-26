'use client';

import React from 'react';
import Link from 'next/link';
import { experimentSchemaToLegacy, type ExperimentConfig, type PhysicsRules } from '@/components/DynamicExperiment';
import { UniversalPhysicsRenderer } from '@/components/DynamicExperiment';
import { IframeExperiment } from '@/components/IframeExperiment';
import { conceptToTemplateId } from '@/lib/concept-to-template';
import { getTemplate } from '@/lib/template-registry';
import { enrichSchema } from '@/lib/schema-enricher';
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
}

interface ExperimentRendererProps {
  experiment: PresetExperiment | null;
  aiSchema: ExperimentSchema | null;
  aiConfig: GeneratedConfig | null;
  resolvedTemplateId: string | null;
}

/** AI-generated experiment config type (legacy, non-schema) */
export interface GeneratedConfig {
  name: string;
  subject: string;
  topic: string;
  description?: string;
  icon: string;
  gradient: string;
  teaching?: {
    understanding?: { concept?: string; principles?: string[] };
    reasoning?: { independent?: string; dependent?: string; controlled?: string[]; hypothesis?: string };
    design?: { coreQuestion?: string; steps?: string[]; observationPoints?: string[]; recordPoints?: string[]; discussionPoints?: string[] };
    errors?: { operation?: string[]; concept?: string[]; calculation?: string[] };
    evaluation?: { formative?: string; summative?: string; extension?: string };
  };
  experiment?: {
    type?: string;
    rules?: import('@/components/DynamicExperiment').PhysicsRules;
    code?: string;
  };
}

export function ExperimentRenderer({
  experiment,
  aiSchema,
  aiConfig,
  resolvedTemplateId,
}: ExperimentRendererProps) {
  // PRIMARY PATH — Triple-Lock approved template via iframe
  if (resolvedTemplateId) {
    return <IframeExperiment templateId={resolvedTemplateId} height={560} />;
  }

  // SECONDARY — Unified Schema (declarative framework)
  if (aiSchema) {
    const legacyConfig = experimentSchemaToLegacy(aiSchema);
    return <UniversalPhysicsRenderer config={legacyConfig} />;
  }

  // TERTIARY — Legacy AI config with rule enrichment
  const rules = aiConfig?.experiment?.rules;
  if (rules && aiConfig) {
    if (!('calculate' in rules)) {
      const rawRules = rules as Record<string, unknown>;
      const physicsType = (rawRules.physicsType as string | undefined)?.toLowerCase() || 'generic';
      const partial: Partial<ExperimentSchema> = {
        meta: {
          name: aiConfig.name ?? '实验',
          subject: 'physics',
          topic: aiConfig.topic ?? '',
          description: aiConfig.description ?? `${aiConfig.name ?? '实验'} - 探索物理规律`,
          icon: aiConfig.icon ?? '🔬',
          gradient: aiConfig.gradient ?? 'from-blue-500 to-purple-500',
          physicsType: physicsType as import('@/lib/experiment-schema').PhysicsEngineType,
        },
        params: ((rawRules.variables as Array<Record<string, unknown>>) ?? []).map(v => ({
          name: (v.name as string) ?? '',
          label: (v.label as string) ?? '',
          unit: (v.unit as string) ?? '',
          defaultValue: (v.default as number) ?? (v.defaultValue as number) ?? 0,
          min: (v.min as number) ?? 0,
          max: (v.max as number) ?? 100,
          step: (v.step as number) ?? 1,
          category: 'input' as const,
          description: (v.description as string) ?? `${v.label as string ?? ''}参数`,
        })),
        formulas: (rawRules.formula as string) ? [{
          name: '核心公式',
          expression: rawRules.formula as string,
          description: `${aiConfig.name ?? '实验'}的核心计算公式`,
          variables: ((rawRules.variables as Array<Record<string, unknown>>) ?? []).map(v => v.name as string),
          resultVariable: 'result',
        }] : [],
      };
      const fullSchema = enrichSchema(partial);
      const correctConfig = experimentSchemaToLegacy(fullSchema);
      return <UniversalPhysicsRenderer config={correctConfig} />;
    }

    if ('calculate' in rules) {
      const correctConfig: ExperimentConfig = {
        name: aiConfig.name,
        subject: aiConfig.subject,
        topic: aiConfig.topic || (experiment?.name ?? ''),
        icon: aiConfig.icon,
        gradient: aiConfig.gradient,
        teaching: aiConfig.teaching,
        experiment: {
          type: aiConfig.experiment?.type || 'canvas',
          rules: rules as PhysicsRules,
        },
      };
      return <UniversalPhysicsRenderer config={correctConfig} />;
    }
  }

  // FALLBACK — For unknown experiments, show placeholder
  return (
    <div className="text-center py-20 text-gray-500">
      <div className="text-4xl mb-4">🔬</div>
      <p className="text-lg font-medium mb-2">实验加载中</p>
      <p className="text-sm">正在初始化实验环境...</p>
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
  // 0. Backend-resolved templateId (already whitelist-verified)
  if (backendTid && getTemplate(backendTid)) return backendTid;

  // 1. AI concept routing
  const aiConcept = aiSchema?.meta?.topic || aiSchema?.meta?.name || aiConfig?.topic || aiConfig?.name || null;
  if (aiConcept) {
    const tid = conceptToTemplateId(aiConcept);
    if (tid) return tid;
  }

  // 2. Preset experiment templateId
  if (experiment?.templateId && getTemplate(experiment.templateId)) {
    return experiment.templateId;
  }

  return null;
}

/** Placeholder for legacy embedded experiments (kept for backward compat) */
export function BuoyancyExperimentPlaceholder() {
  return <div className="text-center py-20 text-gray-500">浮力实验 - 请访问 <Link href="/experiments/buoyancy" className="text-blue-500">完整版</Link></div>;
}

export function LeverExperimentPlaceholder() {
  return <div className="text-center py-20 text-gray-500">杠杆原理实验 - 请访问 <Link href="/experiments/lever" className="text-amber-500">完整版</Link></div>;
}

export function RefractionExperimentPlaceholder() {
  return <div className="text-center py-20 text-gray-500">光的折射实验 - 请访问 <Link href="/experiments/refraction" className="text-cyan-500">完整版</Link></div>;
}

export function CircuitExperimentPlaceholder() {
  return <div className="text-center py-20 text-gray-500">电路实验 - 请访问 <Link href="/experiments/circuit" className="text-emerald-500">完整版</Link></div>;
}

export function AcidBaseExperimentPlaceholder() {
  return <div className="text-center py-20 text-gray-500">酸碱滴定实验 - 请访问 <Link href="/experiments/acid-base" className="text-red-500">完整版</Link></div>;
}