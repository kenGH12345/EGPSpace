/**
 * Experiment Controller — Central coordination layer for experiments
 *
 * Architecture improvements:
 * 1. Single responsibility — coordinate schema, physics, rendering
 * 2. State management — central state machine for experiment lifecycle
 * 3. Event system — publish/subscribe for UI updates
 * 4. Performance monitoring — track frame rates and bottlenecks
 *
 * Compatible with the unified ExperimentSchema in experiment-schema.ts
 */

import type {
  ExperimentSchema,
  ParamDefinition,
  CanvasElement,
  CanvasLayout,
} from './experiment-schema';
import { validateSchema, enrichSchema } from './experiment-schema';
import { computePhysics, type PhysicsResult } from './physics-engine';
import { renderCanvas } from './declarative-renderer';
import { renderElementsOptimized } from './optimized-renderer';

// ─── Event Types ────────────────────────────────────────────────────────────

export type ExperimentEvent =
  | { type: 'physicsUpdate'; data: PhysicsResult | null }
  | { type: 'paramChange'; param: string; value: number }
  | { type: 'stateChange'; state: ExperimentState }
  | { type: 'error'; message: string; code: string };

type EventListener = (event: ExperimentEvent) => void;

// ─── Experiment State Machine ───────────────────────────────────────────────

export type ExperimentState =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'running'
  | 'paused'
  | 'error'
  | 'complete';

// ─── Performance Metrics ────────────────────────────────────────────────────

export interface PerformanceMetrics {
  frameRate: number;
  physicsTime: number;
  renderTime: number;
  cacheHits: number;
  cacheMisses: number;
}

// ─── Main Controller Class ──────────────────────────────────────────────────

export class ExperimentController {
  private schema: ExperimentSchema | null = null;
  private currentParams: Record<string, number> = {};
  private computedResults: Record<string, number> = {};
  private lastPhysicsResult: PhysicsResult | null = null;

  private state: ExperimentState = 'idle';
  private listeners: Set<EventListener> = new Set();

  private metrics: PerformanceMetrics = {
    frameRate: 0,
    physicsTime: 0,
    renderTime: 0,
    cacheHits: 0,
    cacheMisses: 0,
  };

  private frameCount = 0;
  private lastFpsTime = 0;
  private fpsRafId: number | null = null;

  constructor(options: { enableFpsMonitor?: boolean } = {}) {
    if (options.enableFpsMonitor !== false && typeof window !== 'undefined') {
      this.setupFrameRateMonitor();
    }
  }

  /**
   * Load experiment schema and initialize
   */
  load(schema: ExperimentSchema): void {
    this.setState('loading');

    try {
      const validation = validateSchema(schema);
      if (!validation.valid) {
        throw new Error(`Schema validation failed: ${validation.errors.join(', ')}`);
      }

      // Enrich with preset template defaults when fields are missing
      this.schema = enrichSchema(schema);
      this.currentParams = this.extractDefaultParams(this.schema);

      this.recomputePhysics();

      this.setState('ready');
      this.emit({ type: 'physicsUpdate', data: this.lastPhysicsResult });
    } catch (error) {
      this.setState('error');
      this.emit({
        type: 'error',
        message: `Failed to load experiment: ${error instanceof Error ? error.message : String(error)}`,
        code: 'LOAD_FAILED',
      });
    }
  }

  /**
   * Update a parameter value and recompute physics
   */
  setParameter(name: string, value: number): void {
    if (!this.schema || this.state === 'error') return;

    this.currentParams[name] = value;
    this.recomputePhysics();

    this.emit({ type: 'paramChange', param: name, value });
    this.emit({ type: 'physicsUpdate', data: this.lastPhysicsResult });
  }

  /**
   * Batch update multiple parameters (only recomputes once)
   */
  setParameters(updates: Record<string, number>): void {
    if (!this.schema || this.state === 'error') return;

    Object.assign(this.currentParams, updates);
    this.recomputePhysics();

    for (const [param, value] of Object.entries(updates)) {
      this.emit({ type: 'paramChange', param, value });
    }
    this.emit({ type: 'physicsUpdate', data: this.lastPhysicsResult });
  }

  getSchema(): ExperimentSchema | null {
    return this.schema;
  }

  getParams(): Record<string, number> {
    return { ...this.currentParams };
  }

  getPhysicsResult(): PhysicsResult | null {
    return this.lastPhysicsResult;
  }

  getComputedResults(): Record<string, number> {
    return { ...this.computedResults };
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  getState(): ExperimentState {
    return this.state;
  }

  addListener(listener: EventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Render to canvas (optimized or original version)
   */
  render(ctx: CanvasRenderingContext2D, useOptimized: boolean = true): void {
    if (!this.schema) return;

    const startTime = performance.now();
    const elements: CanvasElement[] = this.schema.canvas.elements;
    const layout: CanvasLayout = this.schema.canvas.layout;

    if (useOptimized) {
      // Optimized path skips the clearRect/background/grid pre-pass;
      // callers that need those should use useOptimized=false or draw them separately.
      ctx.clearRect(0, 0, layout.width, layout.height);
      if (layout.background) {
        ctx.fillStyle = layout.background;
        ctx.fillRect(0, 0, layout.width, layout.height);
      }
      renderElementsOptimized(
        ctx,
        elements,
        layout,
        this.currentParams,
        this.computedResults
      );
    } else {
      renderCanvas(
        ctx,
        elements,
        layout,
        this.currentParams,
        this.computedResults
      );
    }

    this.metrics.renderTime = performance.now() - startTime;
  }

  /**
   * Dispose the controller (stops FPS monitor, clears listeners)
   */
  dispose(): void {
    if (this.fpsRafId !== null && typeof window !== 'undefined') {
      window.cancelAnimationFrame(this.fpsRafId);
      this.fpsRafId = null;
    }
    this.listeners.clear();
    this.schema = null;
    this.lastPhysicsResult = null;
  }

  /**
   * Reset to schema default parameter values
   */
  reset(): void {
    if (!this.schema) return;
    this.currentParams = this.extractDefaultParams(this.schema);
    this.recomputePhysics();
    this.emit({ type: 'physicsUpdate', data: this.lastPhysicsResult });
  }

  /**
   * Export current state for persistence
   */
  exportState(): {
    schema: ExperimentSchema | null;
    params: Record<string, number>;
    state: ExperimentState;
    timestamp: number;
  } {
    return {
      schema: this.schema,
      params: { ...this.currentParams },
      state: this.state,
      timestamp: Date.now(),
    };
  }

  /**
   * Import saved state
   */
  importState(state: {
    schema?: ExperimentSchema;
    params?: Record<string, number>;
  }): boolean {
    try {
      if (state.schema) {
        this.load(state.schema);
      }
      if (state.params && this.schema) {
        const clean: Record<string, number> = {};
        for (const [k, v] of Object.entries(state.params)) {
          if (typeof v === 'number' && Number.isFinite(v)) clean[k] = v;
        }
        this.setParameters(clean);
      }
      return true;
    } catch (error) {
      console.error('Failed to import state:', error);
      return false;
    }
  }

  // ─── Private Methods ──────────────────────────────────────────────────

  private setState(newState: ExperimentState): void {
    if (this.state === newState) return;
    this.state = newState;
    this.emit({ type: 'stateChange', state: newState });
  }

  private emit(event: ExperimentEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (err) {
        console.error('Listener error:', err);
      }
    });
  }

  private recomputePhysics(): void {
    if (!this.schema) return;

    const startTime = performance.now();
    this.setState('running');

    try {
      const result = computePhysics(this.schema.physics, this.currentParams);
      this.lastPhysicsResult = result;
      this.computedResults = result.results ?? {};
      this.metrics.physicsTime = performance.now() - startTime;
      this.setState('ready');
    } catch (error) {
      this.setState('error');
      this.emit({
        type: 'error',
        message: `Physics computation failed: ${error instanceof Error ? error.message : String(error)}`,
        code: 'PHYSICS_FAILED',
      });
    }
  }

  private extractDefaultParams(schema: ExperimentSchema): Record<string, number> {
    const params: Record<string, number> = {};
    if (Array.isArray(schema.params)) {
      schema.params.forEach((p: ParamDefinition) => {
        if (p.category === 'input' || p.category === 'reference') {
          params[p.name] = p.defaultValue;
        }
      });
    }
    return params;
  }

  private setupFrameRateMonitor(): void {
    const checkFps = () => {
      const now = performance.now();
      this.frameCount++;

      if (now - this.lastFpsTime >= 1000) {
        this.metrics.frameRate = Math.round(
          (this.frameCount * 1000) / (now - this.lastFpsTime)
        );
        this.frameCount = 0;
        this.lastFpsTime = now;
      }

      this.fpsRafId = window.requestAnimationFrame(checkFps);
    };

    this.lastFpsTime = performance.now();
    this.fpsRafId = window.requestAnimationFrame(checkFps);
  }
}

// ─── Singleton Accessor (optional) ───────────────────────────────────────────

let globalController: ExperimentController | null = null;

export function getExperimentController(): ExperimentController {
  if (!globalController) {
    globalController = new ExperimentController();
  }
  return globalController;
}

export function resetGlobalController(): void {
  if (globalController) {
    globalController.dispose();
  }
  globalController = null;
}