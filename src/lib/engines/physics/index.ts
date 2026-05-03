/**
 * Physics Engines Index — Auto-registration
 */
export { BuoyancyEngine, default as buoyancyEngine } from './buoyancy';

// Auto-register (duplicate import OK, registry prevents double-register)
import { registry } from '../registry';
import buoyancyEngine from './buoyancy';
import circuitEngine from './circuit';
import leverEngine from './lever';
import refractionEngine from './refraction';
import pressureEngine from './pressure';
import densityEngine from './density';

registry.register(buoyancyEngine);
registry.register(circuitEngine);
registry.register(leverEngine);
registry.register(refractionEngine);
registry.register(pressureEngine);
registry.register(densityEngine);
