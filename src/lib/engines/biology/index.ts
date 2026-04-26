/**
 * Biology Engines Index - Auto-registration
 */
export { OsmosisEngine, default as osmosisEngine } from './osmosis';
export { EnzymeEngine, default as enzymeEngine } from './enzyme';
export { PopulationEngine, default as populationEngine } from './population';

import { registry } from '../registry';
import osmosisEngine from './osmosis';
import enzymeEngine from './enzyme';
import populationEngine from './population';

registry.register(osmosisEngine);
registry.register(enzymeEngine);
registry.register(populationEngine);
