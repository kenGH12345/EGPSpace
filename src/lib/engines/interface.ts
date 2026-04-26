/**
 * Unified Experiment Engine Interface
 *
 * Defines the contract ALL experiment engines must implement,
 * regardless of subject (physics, chemistry, biology, math, geography).
 *
 * Decisions:
 * - IExperimentEngine.subject maps to SubjectDomain in experiment-schema.ts
 * - compute() is idempotent (no side effects) for testability
 * - validate() runs BEFORE compute to catch bad config early
 * - render() is optional — engines may leave rendering to generic renderers
 */

import type { SubjectDomain } from '../experiment-schema';

export type EngineCapability =
  | 'compute'      // Numerical computation
  | 'simulate'     // Time-stepped simulation (frame-by-frame)
  | 'render'       // Custom rendering (overrides generic renderer)
  | 'interact'     // Custom interaction handling
  | 'validate';    // Config validation

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface ComputationResult {
  // Numeric results (key → value)
  values: Record<string, number | string | boolean | object>;
  // Computed params with their intermediate derivation for debugging
  trace?: Record<string, { formula: string; inputs: Record<string, number>; result: number }>;
  // Overall state string (e.g. "floating", "acidic", "converging")
  state?: string;
  // Human-readable explanation of what happened
  explanation?: string;
}

export interface EngineMetadata {
  id: string;               // e.g. "chemistry/titration"
  subject: SubjectDomain;   // e.g. "chemistry"
  displayName: string;      // e.g. "酸碱滴定"
  description: string;
  version: string;          // semver
  capabilities: EngineCapability[];
  // Which Canvas element types this engine can drive dynamically
  supportedElementTypes?: string[];
}

/**
 * Core interface for all experiment engines.
 *
 * @example Physics buoyancy engine:
 * ```
 * class BuoyancyEngine implements IExperimentEngine {
 *   metadata = {
 *     id: 'physics/buoyancy',
 *     subject: 'physics',
 *     displayName: '浮力原理',
 *     capabilities: ['compute', 'validate'],
 *   };
 *
 *   compute(params) {
 *     const rhoObj = params.rho_object ?? 800;
 *     const rhoLiq = params.rho_liquid ?? 1000;
 *     const immersionRatio = Math.min(1, rhoObj / rhoLiq);
 *     return { values: { immersionRatio }, state: rhoObj < rhoLiq ? 'floating' : 'sinking' };
 *   }
 * }
 * ```
 */
export interface IExperimentEngine {
  metadata: EngineMetadata;

  /**
   * Given input params, compute all derived values.
   * Must be PURE — no side effects. Call as often as needed.
   */
  compute(params: Record<string, number>): ComputationResult;

  /**
   * Validate configuration BEFORE compute.
   * Return warnings for non-critical issues, errors for blockers.
   */
  validate(params: Record<string, number>): ValidationResult;

  /**
   * Optional: generate Canvas-specific render hints.
   * Generic renderer handles most cases; use this only for
   * subject-specific visual effects (e.g. molecular vibration).
   */
  render?(
    ctx: CanvasRenderingContext2D,
    params: Record<string, number>,
    computed: ComputationResult,
    elementId: string
  ): void;

  /**
   * Optional: handle custom interactions (drag, click, etc.)
   * Return updated params if handled, null otherwise.
   */
  interact?(
    event: { type: string; x: number; y: number; delta?: number },
    params: Record<string, number>,
    elementId: string
  ): Record<string, number> | null;
}
