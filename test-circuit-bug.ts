import circuitEngine from './src/lib/engines/physics/circuit';
import { AssemblySpec } from './src/lib/framework';

const spec: AssemblySpec<'circuit'> = {
  domain: 'circuit',
  components: [
    { id: 'b1', kind: 'battery', props: { voltage: 6 } },
    { id: 's1', kind: 'switch', props: { closed: false } }, // switch is OPEN
    { id: 'r1', kind: 'resistor', props: { resistance: 10 } },
    { id: 'l1', kind: 'bulb', props: { ratedPower: 2, resistance: 6 } }
  ],
  connections: [
    { from: { componentId: 'b1', portName: 'positive' }, to: { componentId: 's1', portName: 'in' } },
    { from: { componentId: 's1', portName: 'out' }, to: { componentId: 'r1', portName: 'a' } },
    { from: { componentId: 'r1', portName: 'b' }, to: { componentId: 'l1', portName: 'a' } },
    { from: { componentId: 'l1', portName: 'b' }, to: { componentId: 'b1', portName: 'negative' } },
  ],
};

const result = circuitEngine.compute({ graph: spec as any });
console.log("Current B1:", (result.values as any).perComponent.b1.current);
console.log("Current S1:", (result.values as any).perComponent.s1.current);
console.log("Current R1:", (result.values as any).perComponent.r1.current);
console.log("Current L1:", (result.values as any).perComponent.l1.current);
