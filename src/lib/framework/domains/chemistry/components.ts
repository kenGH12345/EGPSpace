/**
 * Chemistry domain — concrete components.
 *
 * Five component kinds cover every scenario the StoichiometrySolver needs:
 *   - Flask     : a container (beaker / tube / erlenmeyer) with a `contents` port
 *   - Reagent   : a dissolved / pure substance placed into a Flask
 *   - Bubble    : a gas evolving from a Flask (spawned by reactions, e.g. H2)
 *   - Solid     : an undissolved solid piece (e.g. Zn granule, Fe nail)
 *   - Thermometer: measures tempC inside a Flask (read-only; informs reaction rules)
 *
 * All five inherit `AbstractComponent<'chemistry'>` so they automatically satisfy
 * the framework contract (serialize/toStamp/id/ports/props).
 *
 * Port semantics for chemistry (re-interpreted vs circuit):
 *   - Flask.ports = ['contents']  — the bag that holds things
 *   - Reagent/Bubble/Solid/Thermometer.ports = ['in']  — their containment link
 * A Connection from (reagent 'in') → (flask 'contents') means "this reagent is
 * inside that flask". This is NOT a bidirectional electrical edge.
 */

import {
  AbstractComponent,
  type ComponentDomain,
  type ComponentStamp,
  type ComponentAnchor,
} from '../../index';

// ── Shared types ──────────────────────────────────────────────────────────

export type ChemistryPhase = 'aq' | 'l' | 's' | 'g';

export type FlaskShape = 'beaker' | 'tube' | 'erlenmeyer';

export type SolidState = 'intact' | 'rusting' | 'dissolved';

// Chemistry components have no MNA-style stamp. We use `unknown` entries — the
// StoichiometrySolver walks components directly without stamps.
type ChemStampEntry = unknown;

function chemStamp(id: string): ComponentStamp<ChemStampEntry> {
  return { componentId: id, entries: [] };
}

// ── Flask ─────────────────────────────────────────────────────────────────

export interface FlaskProps {
  volumeML: number;
  shape: FlaskShape;
  /** Optional free-form label shown in UI. */
  label?: string;
  /** Optional extension slot for future fields without breaking DTOs. */
  meta?: Record<string, unknown>;
}

export class Flask extends AbstractComponent<FlaskProps, ChemStampEntry> {
  readonly domain: ComponentDomain = 'chemistry';
  readonly kind = 'flask';
  readonly ports = ['contents'] as const;

  constructor(id: string, props: FlaskProps, anchor?: ComponentAnchor) {
    if (!(props.volumeML > 0)) {
      throw new Error(`Flask "${id}": volumeML must be > 0 (got ${props.volumeML})`);
    }
    super(id, props, anchor);
  }

  toStamp(): ComponentStamp<ChemStampEntry> {
    return chemStamp(this.id);
  }
}

// ── Reagent ───────────────────────────────────────────────────────────────

export interface ReagentProps {
  /** Chemical formula, e.g. 'H2SO4', 'NaOH', 'ZnSO4'. */
  formula: string;
  moles: number;
  /** mol/L for aqueous; ignored for 's'/'g' but kept uniform for DTO simplicity. */
  concentration: number;
  phase: ChemistryPhase;
  label?: string;
  meta?: Record<string, unknown>;
}

export class Reagent extends AbstractComponent<ReagentProps, ChemStampEntry> {
  readonly domain: ComponentDomain = 'chemistry';
  readonly kind = 'reagent';
  readonly ports = ['in'] as const;

  constructor(id: string, props: ReagentProps, anchor?: ComponentAnchor) {
    if (!props.formula) {
      throw new Error(`Reagent "${id}": formula is required`);
    }
    if (!Number.isFinite(props.moles)) {
      throw new Error(`Reagent "${id}": moles must be a finite number`);
    }
    super(id, props, anchor);
  }

  toStamp(): ComponentStamp<ChemStampEntry> {
    return chemStamp(this.id);
  }
}

// ── Bubble ────────────────────────────────────────────────────────────────

export interface BubbleProps {
  /** Gas formula, e.g. 'H2', 'CO2', 'O2'. */
  gas: string;
  /** Rate at which the bubble grows per reaction tick (mol). */
  rateMolPerTick: number;
  /** Cumulative moles produced so far. */
  accumulatedMoles?: number;
  meta?: Record<string, unknown>;
}

export class Bubble extends AbstractComponent<BubbleProps, ChemStampEntry> {
  readonly domain: ComponentDomain = 'chemistry';
  readonly kind = 'bubble';
  readonly ports = ['in'] as const;

  constructor(id: string, props: BubbleProps, anchor?: ComponentAnchor) {
    if (!props.gas) throw new Error(`Bubble "${id}": gas formula is required`);
    if (!Number.isFinite(props.rateMolPerTick)) {
      throw new Error(`Bubble "${id}": rateMolPerTick must be finite`);
    }
    super(id, props, anchor);
  }

  toStamp(): ComponentStamp<ChemStampEntry> {
    return chemStamp(this.id);
  }
}

// ── Solid ─────────────────────────────────────────────────────────────────

export interface SolidProps {
  formula: string;
  massG: number;
  state: SolidState;
  meta?: Record<string, unknown>;
}

export class Solid extends AbstractComponent<SolidProps, ChemStampEntry> {
  readonly domain: ComponentDomain = 'chemistry';
  readonly kind = 'solid';
  readonly ports = ['in'] as const;

  constructor(id: string, props: SolidProps, anchor?: ComponentAnchor) {
    if (!props.formula) throw new Error(`Solid "${id}": formula is required`);
    if (!(props.massG >= 0)) {
      throw new Error(`Solid "${id}": massG must be >= 0`);
    }
    super(id, props, anchor);
  }

  toStamp(): ComponentStamp<ChemStampEntry> {
    return chemStamp(this.id);
  }
}

// ── Thermometer ───────────────────────────────────────────────────────────

export interface ThermometerProps {
  tempC: number;
  /** [min, max] display range for the thermometer scale. */
  range: readonly [number, number];
  meta?: Record<string, unknown>;
}

export class Thermometer extends AbstractComponent<ThermometerProps, ChemStampEntry> {
  readonly domain: ComponentDomain = 'chemistry';
  readonly kind = 'thermometer';
  readonly ports = ['in'] as const;

  constructor(id: string, props: ThermometerProps, anchor?: ComponentAnchor) {
    if (!Number.isFinite(props.tempC)) {
      throw new Error(`Thermometer "${id}": tempC must be finite`);
    }
    const [min, max] = props.range;
    if (!(min <= max)) {
      throw new Error(`Thermometer "${id}": range min (${min}) must be <= max (${max})`);
    }
    super(id, props, anchor);
  }

  toStamp(): ComponentStamp<ChemStampEntry> {
    return chemStamp(this.id);
  }
}

// ── Union type for convenience ────────────────────────────────────────────

export type ChemistryComponent = Flask | Reagent | Bubble | Solid | Thermometer;

// ── Factory helpers (used by componentRegistry in index.ts) ───────────────

export function createFlask(dto: { id: string; props: FlaskProps; anchor?: ComponentAnchor }): Flask {
  return new Flask(dto.id, dto.props, dto.anchor);
}
export function createReagent(dto: { id: string; props: ReagentProps; anchor?: ComponentAnchor }): Reagent {
  return new Reagent(dto.id, dto.props, dto.anchor);
}
export function createBubble(dto: { id: string; props: BubbleProps; anchor?: ComponentAnchor }): Bubble {
  return new Bubble(dto.id, dto.props, dto.anchor);
}
export function createSolid(dto: { id: string; props: SolidProps; anchor?: ComponentAnchor }): Solid {
  return new Solid(dto.id, dto.props, dto.anchor);
}
export function createThermometer(dto: { id: string; props: ThermometerProps; anchor?: ComponentAnchor }): Thermometer {
  return new Thermometer(dto.id, dto.props, dto.anchor);
}
