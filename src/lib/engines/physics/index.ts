/**
 * Physics Engines Index — Auto-registration
 */
export { BuoyancyEngine, default as buoyancyEngine } from './buoyancy';

// Auto-register (duplicate import OK, registry prevents double-register)
import { registry } from '../registry';
import buoyancyEngine from './buoyancy';

registry.register(buoyancyEngine);
