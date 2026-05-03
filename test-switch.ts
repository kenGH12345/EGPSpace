import circuitEngine from './src/lib/engines/physics/circuit';
import { AssemblySpec } from './src/lib/framework';

const spec: AssemblySpec<'circuit'> = {
  domain: 'circuit',
  components: [
    { id: 'b1', kind: 'battery', props: { voltage: 6 } },
    { id: 's1', kind: 'switch', props: { closed: false } },
    { id: 'r1', kind: 'resistor', props: { resistance: 10 } },
  ],
  connections: [
    { from: { componentId: 'b1', portName: 'positive' }, to: { componentId: 's1', portName: 'in' } },
    { from: { componentId: 's1', portName: 'out' }, to: { componentId: 'r1', portName: 'a' } },
    { from: { componentId: 'r1', portName: 'b' }, to: { componentId: 'b1', portName: 'negative' } },
  ],
};

const result = circuitEngine.compute({ graph: spec as any });
console.log(JSON.stringify(result, null, 2));
