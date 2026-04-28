/**
 * Circuit Domain — stamp entry types
 *
 * Every circuit component's toStamp() returns one or more of these primitives.
 * The MNA solver reads only these 5 primitives; adding a new component type
 * means mapping it to these primitives (no solver changes needed).
 */

export type CircuitStampEntry =
  /** Pure resistor between two ports with given resistance (ohms). */
  | { kind: 'resistor'; fromPort: string; toPort: string; resistance: number }
  /** Ideal voltage source: V(from) - V(to) = voltage. */
  | { kind: 'voltageSource'; fromPort: string; toPort: string; voltage: number }
  /** Short circuit (wire, closed switch): from and to become the same node. */
  | { kind: 'short'; fromPort: string; toPort: string }
  /** Open circuit (open switch, ideal voltmeter): disconnected. Solver skips it. */
  | { kind: 'open'; fromPort: string; toPort: string }
  /** Ammeter: behaves like a short but yields a measurable current reading. */
  | { kind: 'ammeter'; fromPort: string; toPort: string };
