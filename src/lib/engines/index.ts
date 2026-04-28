/**
 * Engines Index — Central export + auto-registration
 *
 * Importing this file registers all built-in engines into the singleton registry.
 */

// Core
export {
  registry,
  engineIdFromType,
  getEngineByType,
  EngineRegistry,
} from './registry';

export type {
  IExperimentEngine,
  EngineMetadata,
  EngineCapability,
  ComputationResult,
  ValidationResult,
  ValidationError,
} from './interface';

// Knowledge graph
export {
  GraphLayoutEngine,
  INITIAL_NODES,
  INITIAL_EDGES,
  DEFAULT_VIEW_CONFIG,
} from './knowledge-graph';

export type {
  KnowledgeNode,
  KnowledgeEdge,
  GraphState,
  NodeStatus,
} from './knowledge-graph';

// Physics engines
export { BuoyancyEngine, default as buoyancyEngine } from './physics/buoyancy';
export { CircuitEngine, default as circuitEngine } from './physics/circuit';

// Chemistry engines
export { TitrationEngine, default as titrationEngine } from './chemistry/titration';

// Biology engines (Phase 2)
export { OsmosisEngine, default as osmosisEngine } from './biology/osmosis';
export { EnzymeEngine, default as enzymeEngine } from './biology/enzyme';
export { PopulationEngine, default as populationEngine } from './biology/population';

// Math engines (Phase 2)
export { FunctionGraphEngine, default as functionGraphEngine } from './math/function-graph';
export { GeometryEngine, default as geometryEngine } from './math/geometry';
export { ProbabilityEngine, default as probabilityEngine } from './math/probability';

// Geography engines (Phase 2)
export { PlateTectonicsEngine, default as plateTectonicsEngine } from './geography/plate-tectonics';
export { OceanCurrentEngine, default as oceanCurrentEngine } from './geography/ocean-current';
export { SeismicWaveEngine, default as seismicWaveEngine } from './geography/seismic-wave';

// ─── Auto-register on module load ───
import { registry } from './registry';
import buoyancyEngine from './physics/buoyancy';
import circuitEngine from './physics/circuit';
import titrationEngine from './chemistry/titration';

// Phase 2 engines
import osmosisEngine from './biology/osmosis';
import enzymeEngine from './biology/enzyme';
import populationEngine from './biology/population';
import functionGraphEngine from './math/function-graph';
import geometryEngine from './math/geometry';
import probabilityEngine from './math/probability';
import plateTectonicsEngine from './geography/plate-tectonics';
import oceanCurrentEngine from './geography/ocean-current';
import seismicWaveEngine from './geography/seismic-wave';

registry.register(buoyancyEngine);
registry.register(circuitEngine);
registry.register(titrationEngine);
registry.register(osmosisEngine);
registry.register(enzymeEngine);
registry.register(populationEngine);
registry.register(functionGraphEngine);
registry.register(geometryEngine);
registry.register(probabilityEngine);
registry.register(plateTectonicsEngine);
registry.register(oceanCurrentEngine);
registry.register(seismicWaveEngine);

console.log('[Engines] Auto-registered:', registry.list().join(', '));
