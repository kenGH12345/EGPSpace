/**
 * Circuit Domain — public API barrel.
 *
 * Importing this file registers all circuit component factories into the
 * framework's componentRegistry (side effect).
 */

import { componentRegistry } from '../../index';
import {
  Battery,
  Wire,
  Switch,
  Resistor,
  Bulb,
  BurntBulb,
  Ammeter,
  Voltmeter,
} from './components';

// ── Public exports ──────────────────────────────────────────────────────
export * from './components';
export * from './stamp';
export { CircuitGraph } from './circuit-graph';
export { CircuitSolver } from './solver';
export type { CircuitPerComponent, CircuitSolveResult } from './solver';
export { CIRCUIT_REACTIONS, overloadBulbRule } from './reactions';
// Assembly layer (Spec + DSL builder + assembler)
export * from './assembly';
// E 阶段 · 补缺失 re-export（circuit-assembly.test.ts 消费）
// F 阶段 · 路径跟随 assembly/errors → contracts/errors 迁移更新
export { AssemblyBuildError } from '../../contracts/errors';
export { validateSpec } from '../../runtime/validator';

// ── Register factories for DTO → instance reconstruction ────────────────
componentRegistry.register('circuit', 'battery', (dto) =>
  new Battery(dto.id, dto.props.voltage as number, dto.anchor),
);
componentRegistry.register('circuit', 'wire', (dto) => new Wire(dto.id, dto.anchor));
componentRegistry.register('circuit', 'switch', (dto) =>
  new Switch(dto.id, dto.props.closed as boolean, dto.anchor),
);
componentRegistry.register('circuit', 'resistor', (dto) =>
  new Resistor(
    dto.id,
    dto.props.resistance as number,
    dto.anchor,
    dto.props.label as string | undefined,
  ),
);
componentRegistry.register('circuit', 'bulb', (dto) =>
  new Bulb(
    dto.id,
    dto.props.resistance as number,
    dto.props.ratedPower as number,
    dto.anchor,
    dto.props.label as string | undefined,
  ),
);
componentRegistry.register('circuit', 'burnt_bulb', (dto) =>
  new BurntBulb(
    dto.id,
    dto.props.originalBulbId as string,
    dto.props.reason as string,
    dto.anchor,
  ),
);
componentRegistry.register('circuit', 'ammeter', (dto) => new Ammeter(dto.id, dto.anchor));
componentRegistry.register('circuit', 'voltmeter', (dto) => new Voltmeter(dto.id, dto.anchor));
