/**
 * CircuitBuilder — circuit-domain chainable DSL.
 *
 * Extends FluentAssembly with type-safe sugar for each circuit component kind:
 *   new CircuitBuilder()
 *     .battery({ voltage: 6, id: 'B1' })
 *     .wire({ id: 'W1' })
 *     .switch_({ closed: true, id: 'S1' })
 *     .resistor({ resistance: 10, id: 'R1' })
 *     .bulb({ ratedPower: 2, id: 'L1' })
 *     .loop()                   // auto-connect in a series loop
 *     .build(circuitAssembler)  // → CircuitGraph
 *
 * Design:
 *   - Each sugar method returns `this` for chaining.
 *   - Ids default to "<kind>N" where N is the global counter from FluentAssembly.
 *   - `loop()` auto-connects components in series using conventional port pairs
 *     (negative/a→positive/b wrap-around), suitable for simple classroom demos.
 *   - Complex topologies (parallel, bridge) should use explicit connect() calls.
 */

import { FluentAssembly, type ComponentAnchor } from '../../../index';
import type { CircuitComponent } from '../components';

export interface BatteryOpts {
  voltage: number;
  id?: string;
  anchor?: ComponentAnchor;
}

export interface WireOpts {
  id?: string;
  anchor?: ComponentAnchor;
}

export interface SwitchOpts {
  closed?: boolean;
  id?: string;
  anchor?: ComponentAnchor;
}

export interface ResistorOpts {
  resistance: number;
  label?: string;
  id?: string;
  anchor?: ComponentAnchor;
}

export interface BulbOpts {
  resistance?: number;   // default 6
  ratedPower?: number;   // default 2 W
  label?: string;
  id?: string;
  anchor?: ComponentAnchor;
}

export interface AmmeterOpts {
  id?: string;
  anchor?: ComponentAnchor;
}

export interface VoltmeterOpts {
  id?: string;
  anchor?: ComponentAnchor;
}

/**
 * CircuitBuilder — chainable circuit spec authoring.
 */
export class CircuitBuilder extends FluentAssembly<'circuit', CircuitComponent> {
  constructor() {
    super('circuit');
  }

  // ── Typed sugar methods ──

  battery(opts: BatteryOpts): this {
    return this.add('battery', { voltage: opts.voltage }, { id: opts.id, anchor: opts.anchor });
  }

  wire(opts: WireOpts = {}): this {
    return this.add('wire', {}, { id: opts.id, anchor: opts.anchor });
  }

  // `switch` is a reserved word
  switch_(opts: SwitchOpts = {}): this {
    return this.add('switch', { closed: opts.closed ?? true }, { id: opts.id, anchor: opts.anchor });
  }

  resistor(opts: ResistorOpts): this {
    return this.add(
      'resistor',
      { resistance: opts.resistance, label: opts.label },
      { id: opts.id, anchor: opts.anchor },
    );
  }

  bulb(opts: BulbOpts = {}): this {
    return this.add(
      'bulb',
      {
        resistance: opts.resistance ?? 6,
        ratedPower: opts.ratedPower ?? 2,
        label: opts.label,
      },
      { id: opts.id, anchor: opts.anchor },
    );
  }

  ammeter(opts: AmmeterOpts = {}): this {
    return this.add('ammeter', {}, { id: opts.id, anchor: opts.anchor });
  }

  voltmeter(opts: VoltmeterOpts = {}): this {
    return this.add('voltmeter', {}, { id: opts.id, anchor: opts.anchor });
  }

  // ── Circuit-specific convenience: loop connect ──

  /**
   * Connect all added components in a series loop:
   *   C0.endPort → C1.startPort, C1.endPort → C2.startPort, ..., CN.endPort → C0.startPort
   *
   * Port-pair resolution per kind:
   *   battery:    positive (end) / negative (start)
   *   wire/resistor/bulb/burnt_bulb/voltmeter:  a/b
   *   switch/ammeter:  in/out
   *
   * This is a convenience for simple demos; complex topologies must use
   * explicit connect() calls.
   */
  loop(): this {
    const kinds = this._spec.components;
    if (kinds.length < 2) return this;

    for (let i = 0; i < kinds.length; i++) {
      const a = kinds[i];
      const b = kinds[(i + 1) % kinds.length];
      const fromPort = this._endPortOf(a.kind);
      const toPort = this._startPortOf(b.kind);
      this._spec.connections.push({
        from: { componentId: a.id, portName: fromPort },
        to: { componentId: b.id, portName: toPort },
      });
    }
    return this;
  }

  // ── Internal port-name resolution ──

  private _startPortOf(kind: string): string {
    switch (kind) {
      case 'battery': return 'negative';
      case 'switch':
      case 'ammeter':
        return 'in';
      default: return 'a';
    }
  }

  private _endPortOf(kind: string): string {
    switch (kind) {
      case 'battery': return 'positive';
      case 'switch':
      case 'ammeter':
        return 'out';
      default: return 'b';
    }
  }
}
