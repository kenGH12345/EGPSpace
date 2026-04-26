/**
 * Geography Engines Index - Auto-registration
 */
export { PlateTectonicsEngine, default as plateTectonicsEngine } from './plate-tectonics';
export { OceanCurrentEngine, default as oceanCurrentEngine } from './ocean-current';
export { SeismicWaveEngine, default as seismicWaveEngine } from './seismic-wave';

import { registry } from '../registry';
import plateTectonicsEngine from './plate-tectonics';
import oceanCurrentEngine from './ocean-current';
import seismicWaveEngine from './seismic-wave';

registry.register(plateTectonicsEngine);
registry.register(oceanCurrentEngine);
registry.register(seismicWaveEngine);
