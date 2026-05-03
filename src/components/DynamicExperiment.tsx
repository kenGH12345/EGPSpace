// Stub to keep legacy files compiling
import type { ExperimentSchema } from '@/lib/experiment-schema';
export interface PhysicsRules { type: string; formula?: string; variables?: any[]; calculate?: any; }
export interface ExperimentConfig { name: string; subject: string; topic: string; icon: string; gradient: string; experiment?: { type: string; rules?: PhysicsRules }; }
export function experimentSchemaToLegacy(schema: ExperimentSchema): ExperimentConfig { return schema as any; }
export function UniversalPhysicsRenderer(props: any) { return null; }
