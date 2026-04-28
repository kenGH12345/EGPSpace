/**
 * Circuit Reactions — list of built-in reaction rules for the circuit domain.
 */

export { overloadBulbRule } from './overload-bulb';
import { overloadBulbRule } from './overload-bulb';

import type { ReactionRule } from '../../../index';
import type { CircuitGraph } from '../circuit-graph';
import type { CircuitSolveResult } from '../solver';

/** All circuit reactions. Consumers typically pass this to InteractionEngine.registerAll(). */
export const CIRCUIT_REACTIONS: ReactionRule<CircuitGraph, CircuitSolveResult>[] = [overloadBulbRule];
