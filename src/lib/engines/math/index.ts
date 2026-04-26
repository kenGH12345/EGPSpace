/**
 * Math Engines Index - Auto-registration
 */
export { FunctionGraphEngine, default as functionGraphEngine } from './function-graph';
export { GeometryEngine, default as geometryEngine } from './geometry';
export { ProbabilityEngine, default as probabilityEngine } from './probability';

import { registry } from '../registry';
import functionGraphEngine from './function-graph';
import geometryEngine from './geometry';
import probabilityEngine from './probability';

registry.register(functionGraphEngine);
registry.register(geometryEngine);
registry.register(probabilityEngine);
