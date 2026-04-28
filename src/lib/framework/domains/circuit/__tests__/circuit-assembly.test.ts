/**
 * Circuit-domain assembly tests — verifies the circuit binding of the generic
 * framework/assembly layer.
 *
 * Coverage:
 *   - CircuitSpec literal → CircuitGraph
 *   - CircuitBuilder DSL → CircuitGraph
 *   - Literal ≡ DSL equivalence (AC-E, circuit-specific)
 *   - loop() convenience connects components in series
 *   - Validation catches bad kinds / bad ports
 *   - Reference DTO snapshot (cross-language contract; see also circuit-builder.js)
 */

import {
  CircuitBuilder,
  circuitAssembler,
  circuitPortsOf,
  CIRCUIT_PORTS,
  CircuitGraph,
  AssemblyBuildError,
  validateSpec,
  type CircuitSpec,
} from '../index';

// Ensure factories are registered (side-effect of importing circuit domain index).
// (The index import above already triggers this, but keep the explicit line for clarity.)

describe('Circuit assembly · CircuitSpec literal path', () => {
  test('assembles a 3-component series circuit', () => {
    const spec: CircuitSpec = {
      domain: 'circuit',
      components: [
        { id: 'b1', kind: 'battery', props: { voltage: 6 } },
        { id: 'r1', kind: 'resistor', props: { resistance: 10 } },
        { id: 'l1', kind: 'bulb', props: { resistance: 6, ratedPower: 2 } },
      ],
      connections: [
        { from: { componentId: 'b1', portName: 'positive' }, to: { componentId: 'r1', portName: 'a' } },
        { from: { componentId: 'r1', portName: 'b' }, to: { componentId: 'l1', portName: 'a' } },
        { from: { componentId: 'l1', portName: 'b' }, to: { componentId: 'b1', portName: 'negative' } },
      ],
    };
    const g = circuitAssembler.assembleCircuit(spec);
    expect(g).toBeInstanceOf(CircuitGraph);
    expect(g.componentCount()).toBe(3);
    expect(g.connections()).toHaveLength(3);
    // Each component is a live object with toStamp
    const b1 = g.get('b1');
    expect(b1?.kind).toBe('battery');
    expect(b1?.props.voltage).toBe(6);
  });

  test('rejects unknown kind via Validator Layer 2', () => {
    const spec: CircuitSpec = {
      domain: 'circuit',
      components: [{ id: 'x', kind: 'flux_capacitor', props: {} }],
      connections: [],
    };
    expect(() => circuitAssembler.assembleCircuit(spec)).toThrow(AssemblyBuildError);
  });

  test('rejects bad port reference via Validator Layer 3', () => {
    const spec: CircuitSpec = {
      domain: 'circuit',
      components: [
        { id: 'b1', kind: 'battery', props: { voltage: 6 } },
        { id: 'r1', kind: 'resistor', props: { resistance: 5 } },
      ],
      connections: [{ from: { componentId: 'b1', portName: 'POSITIVE_TYPO' }, to: { componentId: 'r1', portName: 'a' } }],
    };
    expect(() => circuitAssembler.assembleCircuit(spec)).toThrow(AssemblyBuildError);
  });

  test('CIRCUIT_PORTS table matches 8 known kinds', () => {
    expect(Object.keys(CIRCUIT_PORTS).sort()).toEqual(
      ['ammeter', 'battery', 'bulb', 'burnt_bulb', 'resistor', 'switch', 'voltmeter', 'wire'].sort(),
    );
  });

  test('circuitPortsOf returns correct ports for each kind', () => {
    expect(circuitPortsOf('battery')).toEqual(['positive', 'negative']);
    expect(circuitPortsOf('bulb')).toEqual(['a', 'b']);
    expect(circuitPortsOf('unknown')).toBeUndefined();
  });
});

describe('Circuit assembly · CircuitBuilder DSL path', () => {
  test('chainable sugar methods build spec correctly', () => {
    const b = new CircuitBuilder()
      .battery({ voltage: 9, id: 'B' })
      .resistor({ resistance: 20, id: 'R' })
      .bulb({ ratedPower: 3, id: 'L' });
    const spec = b.toSpec();
    expect(spec.components.map((c) => c.kind)).toEqual(['battery', 'resistor', 'bulb']);
    expect(spec.components[0].id).toBe('B');
    expect(spec.components[0].props.voltage).toBe(9);
    expect(spec.components[2].props.ratedPower).toBe(3);
  });

  test('loop() auto-connects components in series (round-trip)', () => {
    const b = new CircuitBuilder()
      .battery({ voltage: 6, id: 'B' })
      .resistor({ resistance: 10, id: 'R' })
      .bulb({ id: 'L' })
      .loop();
    const spec = b.toSpec();
    expect(spec.connections).toHaveLength(3);
    // Connections: B.positive→R.a, R.b→L.a, L.b→B.negative
    expect(spec.connections[0]).toMatchObject({
      from: { componentId: 'B', portName: 'positive' },
      to: { componentId: 'R', portName: 'a' },
    });
    expect(spec.connections[2]).toMatchObject({
      from: { componentId: 'L', portName: 'b' },
      to: { componentId: 'B', portName: 'negative' },
    });
  });

  test('switch_ sugar respects JS reserved word workaround', () => {
    const b = new CircuitBuilder().switch_({ closed: false, id: 'S' });
    expect(b.toSpec().components[0].kind).toBe('switch');
    expect(b.toSpec().components[0].props.closed).toBe(false);
  });

  test('build() produces a live CircuitGraph', () => {
    const g = new CircuitBuilder()
      .battery({ voltage: 6, id: 'B' })
      .resistor({ resistance: 10, id: 'R' })
      .loop()
      .build(circuitAssembler);
    expect(g).toBeInstanceOf(CircuitGraph);
    expect(g.componentCount()).toBe(2);
  });
});

describe('Circuit assembly · AC-E literal ≡ DSL (circuit-specific)', () => {
  test('simple 3-element loop produces identical DTO via literal and DSL', () => {
    // Literal
    const literal: CircuitSpec = {
      domain: 'circuit',
      components: [
        { id: 'B', kind: 'battery', props: { voltage: 6 } },
        { id: 'R', kind: 'resistor', props: { resistance: 10, label: undefined } },
        { id: 'L', kind: 'bulb', props: { resistance: 6, ratedPower: 2, label: undefined } },
      ],
      connections: [
        { from: { componentId: 'B', portName: 'positive' }, to: { componentId: 'R', portName: 'a' } },
        { from: { componentId: 'R', portName: 'b' }, to: { componentId: 'L', portName: 'a' } },
        { from: { componentId: 'L', portName: 'b' }, to: { componentId: 'B', portName: 'negative' } },
      ],
    };
    const gLiteral = circuitAssembler.assembleCircuit(literal);

    // DSL
    const gDSL = new CircuitBuilder()
      .battery({ voltage: 6, id: 'B' })
      .resistor({ resistance: 10, id: 'R' })
      .bulb({ id: 'L' })  // uses defaults matching literal
      .loop()
      .build(circuitAssembler);

    expect(gDSL.toDTO()).toEqual(gLiteral.toDTO());
  });
});

describe('Circuit assembly · Reference DTO snapshot (cross-language contract)', () => {
  test('simple circuit DTO has expected structure (snapshot)', () => {
    const g = new CircuitBuilder()
      .battery({ voltage: 6, id: 'B1' })
      .resistor({ resistance: 10, id: 'R1' })
      .loop()
      .build(circuitAssembler);

    const dto = g.toDTO();
    // Fix snapshot shape; circuit-builder.js in browser must produce equivalent.
    expect(dto).toMatchObject({
      domain: 'circuit',
      components: [
        { id: 'B1', domain: 'circuit', kind: 'battery', props: { voltage: 6 }, anchor: { x: 0, y: 0 } },
        { id: 'R1', domain: 'circuit', kind: 'resistor', props: { resistance: 10 }, anchor: { x: 0, y: 0 } },
      ],
      connections: expect.arrayContaining([
        expect.objectContaining({
          from: { componentId: 'B1', portName: 'positive' },
          to: { componentId: 'R1', portName: 'a' },
        }),
        expect.objectContaining({
          from: { componentId: 'R1', portName: 'b' },
          to: { componentId: 'B1', portName: 'negative' },
        }),
      ]),
    });
  });
});
