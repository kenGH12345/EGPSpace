/**
 * Circuit Components — 7 primary + 1 derived (BurntBulb)
 *
 * Each class extends AbstractComponent and declares:
 *  - ports (string literal tuple)
 *  - props (mutable numeric/boolean fields, e.g. voltage/resistance/closed)
 *  - toStamp() mapping to CircuitStampEntry primitives
 *
 * All components are registered into componentRegistry via ./index.ts at module load.
 */

import {
  AbstractComponent,
  type ComponentDomain,
  type ComponentStamp,
  type ComponentAnchor,
} from '../../index';
import type { CircuitStampEntry } from './stamp';

export type CircuitComponent = AbstractComponent<Record<string, unknown>, CircuitStampEntry>;

// ────────────────────────────────────────────────────────────────────────
// Battery — ideal voltage source
// ────────────────────────────────────────────────────────────────────────
export interface BatteryProps extends Record<string, unknown> {
  voltage: number;
}
export class Battery extends AbstractComponent<BatteryProps, CircuitStampEntry> {
  readonly domain: ComponentDomain = 'circuit';
  readonly kind = 'battery';
  readonly ports = ['positive', 'negative'] as const;

  constructor(id: string, voltage: number, anchor?: ComponentAnchor) {
    super(id, { voltage }, anchor);
  }

  toStamp(): ComponentStamp<CircuitStampEntry> {
    return {
      componentId: this.id,
      entries: [{ kind: 'voltageSource', fromPort: 'positive', toPort: 'negative', voltage: this.props.voltage }],
    };
  }
}

// ────────────────────────────────────────────────────────────────────────
// Wire — ideal zero-resistance conductor
// ────────────────────────────────────────────────────────────────────────
export class Wire extends AbstractComponent<Record<string, unknown>, CircuitStampEntry> {
  readonly domain: ComponentDomain = 'circuit';
  readonly kind = 'wire';
  readonly ports = ['a', 'b'] as const;

  constructor(id: string, anchor?: ComponentAnchor) {
    super(id, {}, anchor);
  }

  toStamp(): ComponentStamp<CircuitStampEntry> {
    return {
      componentId: this.id,
      entries: [{ kind: 'short', fromPort: 'a', toPort: 'b' }],
    };
  }
}

// ────────────────────────────────────────────────────────────────────────
// Switch — open/closed binary
// ────────────────────────────────────────────────────────────────────────
export interface SwitchProps extends Record<string, unknown> {
  closed: boolean;
}
export class Switch extends AbstractComponent<SwitchProps, CircuitStampEntry> {
  readonly domain: ComponentDomain = 'circuit';
  readonly kind = 'switch';
  readonly ports = ['in', 'out'] as const;

  constructor(id: string, closed: boolean, anchor?: ComponentAnchor) {
    super(id, { closed }, anchor);
  }

  toStamp(): ComponentStamp<CircuitStampEntry> {
    return {
      componentId: this.id,
      entries: [
        this.props.closed
          ? { kind: 'short', fromPort: 'in', toPort: 'out' }
          : { kind: 'open', fromPort: 'in', toPort: 'out' },
      ],
    };
  }
}

// ────────────────────────────────────────────────────────────────────────
// Resistor — linear ohmic element
// ────────────────────────────────────────────────────────────────────────
export interface ResistorProps extends Record<string, unknown> {
  resistance: number;
  label?: string;
}
export class Resistor extends AbstractComponent<ResistorProps, CircuitStampEntry> {
  readonly domain: ComponentDomain = 'circuit';
  readonly kind = 'resistor';
  readonly ports = ['a', 'b'] as const;

  constructor(id: string, resistance: number, anchor?: ComponentAnchor, label?: string) {
    super(id, { resistance, label }, anchor);
  }

  toStamp(): ComponentStamp<CircuitStampEntry> {
    return {
      componentId: this.id,
      entries: [{ kind: 'resistor', fromPort: 'a', toPort: 'b', resistance: this.props.resistance }],
    };
  }
}

// ────────────────────────────────────────────────────────────────────────
// Bulb — resistor with a rated power (for glow + overload reactions)
// ────────────────────────────────────────────────────────────────────────
export interface BulbProps extends Record<string, unknown> {
  resistance: number;
  ratedPower: number;
  label?: string;
}
export class Bulb extends AbstractComponent<BulbProps, CircuitStampEntry> {
  readonly domain: ComponentDomain = 'circuit';
  readonly kind = 'bulb';
  readonly ports = ['a', 'b'] as const;

  constructor(id: string, resistance: number = 5, ratedPower: number = 3, anchor?: ComponentAnchor, label?: string) {
    super(id, { resistance, ratedPower, label }, anchor);
  }

  toStamp(): ComponentStamp<CircuitStampEntry> {
    return {
      componentId: this.id,
      entries: [{ kind: 'resistor', fromPort: 'a', toPort: 'b', resistance: this.props.resistance }],
    };
  }
}

// ────────────────────────────────────────────────────────────────────────
// BurntBulb — produced by the "overload bulb" reaction
// Evidence that "components interacting can produce NEW component types" (user requirement).
// ────────────────────────────────────────────────────────────────────────
export interface BurntBulbProps extends Record<string, unknown> {
  originalBulbId: string;
  burntAt: string;          // ISO timestamp
  reason: string;
}
export class BurntBulb extends AbstractComponent<BurntBulbProps, CircuitStampEntry> {
  readonly domain: ComponentDomain = 'circuit';
  readonly kind = 'burnt_bulb';
  readonly ports = ['a', 'b'] as const;

  constructor(id: string, originalBulbId: string, reason: string, anchor?: ComponentAnchor) {
    super(id, { originalBulbId, burntAt: new Date().toISOString(), reason }, anchor);
  }

  toStamp(): ComponentStamp<CircuitStampEntry> {
    // A burnt bulb is an open circuit — no current flows.
    return {
      componentId: this.id,
      entries: [{ kind: 'open', fromPort: 'a', toPort: 'b' }],
    };
  }
}

// ────────────────────────────────────────────────────────────────────────
// Ammeter — series current meter (ideally zero resistance, reads current)
// ────────────────────────────────────────────────────────────────────────
export class Ammeter extends AbstractComponent<Record<string, unknown>, CircuitStampEntry> {
  readonly domain: ComponentDomain = 'circuit';
  readonly kind = 'ammeter';
  readonly ports = ['in', 'out'] as const;

  constructor(id: string, anchor?: ComponentAnchor) {
    super(id, {}, anchor);
  }

  toStamp(): ComponentStamp<CircuitStampEntry> {
    return {
      componentId: this.id,
      entries: [{ kind: 'ammeter', fromPort: 'in', toPort: 'out' }],
    };
  }
}

// ────────────────────────────────────────────────────────────────────────
// Voltmeter — parallel voltage meter (ideally infinite resistance)
// ────────────────────────────────────────────────────────────────────────
export class Voltmeter extends AbstractComponent<Record<string, unknown>, CircuitStampEntry> {
  readonly domain: ComponentDomain = 'circuit';
  readonly kind = 'voltmeter';
  readonly ports = ['+', '-'] as const;

  constructor(id: string, anchor?: ComponentAnchor) {
    super(id, {}, anchor);
  }

  toStamp(): ComponentStamp<CircuitStampEntry> {
    // Voltmeter = open circuit for solver, but its node-voltage difference is its reading.
    return {
      componentId: this.id,
      entries: [{ kind: 'open', fromPort: '+', toPort: '-' }],
    };
  }
}
