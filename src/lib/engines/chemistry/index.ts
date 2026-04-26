/**
 * Chemistry Engines Index — Auto-registration
 */
export { TitrationEngine, default as titrationEngine } from './titration';
export { IronRustingEngine, default as ironRustingEngine } from './iron-rusting';
export { ElectrolysisEngine, default as electrolysisEngine } from './electrolysis';
export { ReactionRateEngine, default as reactionRateEngine } from './reaction-rate';

// Auto-register on load (when imported via engines/index.ts)
import { registry } from '../registry';
import titrationEngine from './titration';
import ironRustingEngine from './iron-rusting';
import electrolysisEngine from './electrolysis';
import reactionRateEngine from './reaction-rate';

registry.register(titrationEngine);
registry.register(ironRustingEngine);
registry.register(electrolysisEngine);
registry.register(reactionRateEngine);
