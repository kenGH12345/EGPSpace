/**
 * ChemistryBuilder — chemistry-domain chainable DSL.
 *
 * Usage:
 *   new ChemistryBuilder()
 *     .flask({ id: 'F1', volumeML: 250, shape: 'beaker' })
 *     .pour('F1', { formula: 'H2SO4', moles: 0.5, concentration: 2, phase: 'aq' })
 *     .drop('F1', { formula: 'Zn', massG: 5 })
 *     .observe('F1', { tempC: 25, range: [0, 100] })
 *     .build(chemistryAssembler)   // → ChemistryGraph
 *
 * Design:
 *   - `.flask()` adds a Flask component (no connection needed yet).
 *   - `.pour()` / `.drop()` / `.observe()` add a Reagent/Solid/Thermometer AND
 *     auto-connect its `'in'` port to the target flask's `'contents'` port.
 *   - No "loop()" method — chemistry has no series-loop concept.
 */

import { FluentAssembly, type ComponentAnchor } from '../../../index';
import type { ChemistryComponent, FlaskShape, ChemistryPhase, SolidState } from '../components';

export interface FlaskOpts {
  id?: string;
  volumeML: number;
  shape: FlaskShape;
  label?: string;
  anchor?: ComponentAnchor;
}

export interface ReagentOpts {
  id?: string;
  formula: string;
  moles: number;
  concentration?: number;
  phase: ChemistryPhase;
  label?: string;
  anchor?: ComponentAnchor;
}

export interface SolidOpts {
  id?: string;
  formula: string;
  massG: number;
  state?: SolidState;
  anchor?: ComponentAnchor;
}

export interface ThermometerOpts {
  id?: string;
  tempC: number;
  range?: readonly [number, number];
  anchor?: ComponentAnchor;
}

export class ChemistryBuilder extends FluentAssembly<'chemistry', ChemistryComponent> {
  constructor() {
    super('chemistry');
  }

  /** Add a Flask as a top-level container. */
  flask(opts: FlaskOpts): this {
    return this.add(
      'flask',
      { volumeML: opts.volumeML, shape: opts.shape, label: opts.label },
      { id: opts.id, anchor: opts.anchor },
    );
  }

  /**
   * Pour a Reagent into the specified flask. Adds the reagent component AND
   * connects (reagent 'in') → (flask 'contents').
   */
  pour(flaskId: string, opts: ReagentOpts): this {
    this.add(
      'reagent',
      {
        formula: opts.formula,
        moles: opts.moles,
        concentration: opts.concentration ?? 0,
        phase: opts.phase,
        label: opts.label,
      },
      { id: opts.id, anchor: opts.anchor },
    );
    const reagentId = this._spec.components[this._spec.components.length - 1].id;
    this._spec.connections.push({
      from: { componentId: reagentId, portName: 'in' },
      to: { componentId: flaskId, portName: 'contents' },
    });
    return this;
  }

  /** Drop a Solid into the specified flask (connects solid.in → flask.contents). */
  drop(flaskId: string, opts: SolidOpts): this {
    this.add(
      'solid',
      {
        formula: opts.formula,
        massG: opts.massG,
        state: opts.state ?? 'intact',
      },
      { id: opts.id, anchor: opts.anchor },
    );
    const solidId = this._spec.components[this._spec.components.length - 1].id;
    this._spec.connections.push({
      from: { componentId: solidId, portName: 'in' },
      to: { componentId: flaskId, portName: 'contents' },
    });
    return this;
  }

  /** Insert a Thermometer into the specified flask. */
  observe(flaskId: string, opts: ThermometerOpts): this {
    this.add(
      'thermometer',
      {
        tempC: opts.tempC,
        range: opts.range ?? [-10, 110],
      },
      { id: opts.id, anchor: opts.anchor },
    );
    const thermId = this._spec.components[this._spec.components.length - 1].id;
    this._spec.connections.push({
      from: { componentId: thermId, portName: 'in' },
      to: { componentId: flaskId, portName: 'contents' },
    });
    return this;
  }
}
