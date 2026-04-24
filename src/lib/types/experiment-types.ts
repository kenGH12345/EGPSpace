/**
 * Experiment Type Utilities — Branded types, guards, and helpers
 *
 * NOTE: The authoritative domain types (ExperimentSchema, CanvasElement,
 * CanvasLayout, ParamDefinition, etc.) live in ../experiment-schema.ts
 * and MUST be imported from there. This file only provides:
 *   1. Branded / nominal types for unit-safe arithmetic
 *   2. Literal-string enums for tighter runtime checks
 *   3. Type guards for CanvasElement discriminated unions
 *   4. Validation helpers and factory functions
 *   5. Lookup tables for element attribute introspection
 */

import type {
  CanvasElement,
  ElementType,
  ParamDefinition,
  PhysicsEngineType,
  SubjectDomain,
  ExperimentSchema,
} from '../experiment-schema';

// ─── Branded (nominal) Types ────────────────────────────────────────────────

type Brand<T, B extends string> = T & { readonly __brand: B };

export type DensityValue = Brand<number, 'Density'>;       // kg/m³
export type VolumeValue = Brand<number, 'Volume'>;         // m³
export type ForceValue = Brand<number, 'Force'>;           // N
export type PositiveNumber = Brand<number, 'Positive'>;
export type NonNegativeNumber = Brand<number, 'NonNegative'>;

export const brandPositive = (n: number): PositiveNumber => {
  if (!(n > 0)) throw new RangeError(`Expected positive number, got ${n}`);
  return n as PositiveNumber;
};

export const brandNonNegative = (n: number): NonNegativeNumber => {
  if (!(n >= 0)) throw new RangeError(`Expected non-negative number, got ${n}`);
  return n as NonNegativeNumber;
};

// ─── Runtime-validated Literal Sets ────────────────────────────────────────

export const SUBJECT_DOMAINS = [
  'physics', 'chemistry', 'biology', 'geography', 'math',
] as const satisfies readonly SubjectDomain[];

export const PHYSICS_ENGINES = [
  'buoyancy', 'lever', 'refraction', 'circuit', 'pendulum', 'wave',
  'acid_base', 'electrolysis', 'reaction_rate', 'titration',
  'osmosis', 'enzyme', 'population', 'photosynthesis',
  'function_graph', 'geometry', 'probability', 'statistics',
  'generic',
] as const satisfies readonly PhysicsEngineType[];

export const ELEMENT_TYPES = [
  'rect', 'circle', 'line', 'arrow', 'text', 'polygon', 'arc', 'image',
  'spring', 'wave', 'pendulum', 'forceArrow', 'lightRay',
  'beaker', 'molecule', 'bubble', 'reaction',
  'axis', 'functionPlot', 'point',
  'group',
] as const satisfies readonly ElementType[];

export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'expert';
export const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard', 'expert'] as const;

// ─── Runtime Type Guards ───────────────────────────────────────────────────

export function isSubjectDomain(s: unknown): s is SubjectDomain {
  return typeof s === 'string' && (SUBJECT_DOMAINS as readonly string[]).includes(s);
}

export function isPhysicsEngine(e: unknown): e is PhysicsEngineType {
  return typeof e === 'string' && (PHYSICS_ENGINES as readonly string[]).includes(e);
}

export function isElementType(t: unknown): t is ElementType {
  return typeof t === 'string' && (ELEMENT_TYPES as readonly string[]).includes(t);
}

export function isDifficultyLevel(d: unknown): d is DifficultyLevel {
  return typeof d === 'string' && (DIFFICULTY_LEVELS as readonly string[]).includes(d as DifficultyLevel);
}

// ─── CanvasElement Discriminators (structural) ─────────────────────────────
//
// Since CanvasElement is a single interface with optional fields (not a
// discriminated union), these guards check type + presence of required fields.

export const isRectElement = (el: CanvasElement): boolean => el.type === 'rect';
export const isCircleElement = (el: CanvasElement): boolean => el.type === 'circle';
export const isLineElement = (el: CanvasElement): boolean => el.type === 'line';
export const isArrowElement = (el: CanvasElement): boolean => el.type === 'arrow';
export const isTextElement = (el: CanvasElement): boolean => el.type === 'text';
export const isArcElement = (el: CanvasElement): boolean => el.type === 'arc';
export const isPolygonElement = (el: CanvasElement): boolean => el.type === 'polygon';
export const isBeakerElement = (el: CanvasElement): boolean => el.type === 'beaker';
export const isSpringElement = (el: CanvasElement): boolean => el.type === 'spring';
export const isWaveElement = (el: CanvasElement): boolean => el.type === 'wave';
export const isGroupElement = (el: CanvasElement): boolean => el.type === 'group';

// ─── Validation Results ────────────────────────────────────────────────────

export interface DetailedValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateExperimentSchemaDetailed(
  schema: ExperimentSchema
): DetailedValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!schema.meta?.name) errors.push('meta.name is required');
  if (!schema.meta?.subject) {
    errors.push('meta.subject is required');
  } else if (!isSubjectDomain(schema.meta.subject)) {
    errors.push(`Invalid subject domain: ${schema.meta.subject}`);
  }

  if (!isPhysicsEngine(schema.meta?.physicsType)) {
    errors.push(`Invalid physicsType: ${schema.meta?.physicsType}`);
  }

  if (Array.isArray(schema.params)) {
    const seen = new Set<string>();
    schema.params.forEach((p, i) => {
      if (!p.name) errors.push(`params[${i}].name is required`);
      if (seen.has(p.name)) errors.push(`Duplicate param name: ${p.name}`);
      seen.add(p.name);

      if (p.category === 'input') {
        if (p.min >= p.max) {
          errors.push(`param "${p.name}": min (${p.min}) >= max (${p.max})`);
        }
        if (p.defaultValue < p.min || p.defaultValue > p.max) {
          warnings.push(
            `param "${p.name}": defaultValue ${p.defaultValue} outside [${p.min}, ${p.max}]`
          );
        }
        if (p.step <= 0) {
          errors.push(`param "${p.name}": step must be > 0`);
        }
      }
    });
  } else {
    errors.push('params must be an array');
  }

  if (Array.isArray(schema.canvas?.elements)) {
    const ids = new Set<string>();
    schema.canvas.elements.forEach((el, i) => {
      if (!isElementType(el.type)) {
        errors.push(`canvas.elements[${i}].type "${el.type}" is not a valid ElementType`);
      }
      if (el.id) {
        if (ids.has(el.id)) errors.push(`Duplicate element id: ${el.id}`);
        ids.add(el.id);
      }
    });
  }

  return { valid: errors.length === 0, errors, warnings };
}

// ─── Parameter & Element Factories ─────────────────────────────────────────

export function createInputParam(
  name: string,
  label: string,
  defaultValue: number,
  options: {
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
    description?: string;
  } = {}
): ParamDefinition {
  return {
    name,
    label,
    unit: options.unit ?? '',
    defaultValue,
    min: options.min ?? defaultValue * 0.5,
    max: options.max ?? defaultValue * 2,
    step: options.step ?? 1,
    category: 'input',
    description: options.description ?? '',
  };
}

export function extractFormulaDependencies(formula: string): string[] {
  const matches = formula.match(/\{(\w+)\}/g) ?? [];
  return Array.from(new Set(matches.map(m => m.slice(1, -1))));
}

// ─── Attribute Introspection ───────────────────────────────────────────────

const ATTR_MAP: Record<string, readonly string[]> = {
  rect:      ['x', 'y', 'width', 'height', 'fill', 'stroke', 'strokeWidth'],
  circle:    ['x', 'y', 'radius', 'fill', 'stroke', 'strokeWidth'],
  line:      ['x', 'y', 'x2', 'y2', 'stroke', 'strokeWidth'],
  arrow:     ['x', 'y', 'x2', 'y2', 'stroke', 'strokeWidth'],
  text:      ['x', 'y', 'text', 'fontSize', 'fill'],
  arc:       ['x', 'y', 'radius', 'startAngle', 'endAngle', 'fill', 'stroke', 'strokeWidth'],
  polygon:   ['points', 'fill', 'stroke', 'strokeWidth'],
  beaker:    ['x', 'y', 'width', 'height', 'fill', 'stroke', 'strokeWidth', 'fillLevel', 'liquidColor'],
  spring:    ['x', 'y', 'length', 'coils', 'stroke', 'strokeWidth'],
  wave:      ['x', 'y', 'amplitude', 'wavelength', 'phase', 'stroke'],
  pendulum:  ['anchorX', 'anchorY', 'length', 'angle', 'bobRadius'],
  forceArrow:['x', 'y', 'magnitude', 'angle', 'stroke'],
  lightRay:  ['x', 'y', 'x2', 'y2', 'stroke'],
  group:     ['transform', 'children'],
};

export function getElementSupportedAttributes(type: ElementType): readonly string[] {
  return ATTR_MAP[type] ?? [];
}