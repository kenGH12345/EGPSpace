import { SpecFlattener, MacroResolver } from './flattener';
import type { AssemblySpec } from '../contracts/assembly';

describe('SpecFlattener', () => {
  it('should flatten a nested macro component into atomic components', () => {
    const macroSpec: AssemblySpec = {
      domain: 'circuit',
      components: [
        { id: 'b1', kind: 'battery', props: { voltage: 9 } },
        { id: 's1', kind: 'switch', props: {} }
      ],
      connections: [
        { from: { componentId: 'b1', portName: 'pos' }, to: { componentId: 's1', portName: 'in' } }
      ]
    };

    const resolver: MacroResolver = {
      resolve: (kind) => {
        if (kind === 'power-module') {
          return {
            spec: macroSpec,
            exportPortMap: {
              out: { componentId: 's1', portName: 'out' },
              gnd: { componentId: 'b1', portName: 'neg' },
            }
          };
        }
        return undefined;
      }
    };

    const flattener = new SpecFlattener(resolver);

    const mainSpec: AssemblySpec = {
      domain: 'circuit',
      components: [
        { id: 'mod1', kind: 'power-module', props: {} },
        { id: 'l1', kind: 'lamp', props: {} }
      ],
      connections: [
        { from: { componentId: 'mod1', portName: 'out' }, to: { componentId: 'l1', portName: 'in' } },
        { from: { componentId: 'mod1', portName: 'gnd' }, to: { componentId: 'l1', portName: 'out' } }
      ]
    };

    const flat = flattener.flatten(mainSpec);

    // The flattened spec should have exactly 3 components: mod1_b1, mod1_s1, l1
    expect(flat.components).toHaveLength(3);
    const compIds = flat.components.map(c => c.id).sort();
    expect(compIds).toEqual(['l1', 'mod1_b1', 'mod1_s1']);

    // Connections should be:
    // 1. Internal: mod1_b1#pos -> mod1_s1#in
    // 2. External 1: mod1_s1#out -> l1#in
    // 3. External 2: mod1_b1#neg -> l1#out
    expect(flat.connections).toHaveLength(3);
    
    // check internal
    const internalConn = flat.connections.find(c => c.from.componentId === 'mod1_b1');
    expect(internalConn?.to.componentId).toBe('mod1_s1');
    expect(internalConn?.to.portName).toBe('in');

    // check external 1
    const ext1 = flat.connections.find(c => c.from.portName === 'out' && c.from.componentId === 'mod1_s1');
    expect(ext1?.to.componentId).toBe('l1');
    expect(ext1?.to.portName).toBe('in');

    // check external 2
    const ext2 = flat.connections.find(c => c.from.portName === 'neg' && c.from.componentId === 'mod1_b1');
    expect(ext2?.to.componentId).toBe('l1');
    expect(ext2?.to.portName).toBe('out');
  });

  it('should detect circular dependencies and throw error', () => {
    const resolver: MacroResolver = {
      resolve: (kind) => {
        if (kind === 'macro-a') {
          return {
            spec: {
              domain: 'circuit',
              components: [{ id: 'b', kind: 'macro-b', props: {} }],
              connections: []
            },
            exportPortMap: {}
          };
        }
        if (kind === 'macro-b') {
          return {
            spec: {
              domain: 'circuit',
              components: [{ id: 'a', kind: 'macro-a', props: {} }],
              connections: []
            },
            exportPortMap: {}
          };
        }
        return undefined;
      }
    };

    const flattener = new SpecFlattener(resolver);

    const mainSpec: AssemblySpec = {
      domain: 'circuit',
      components: [{ id: 'm1', kind: 'macro-a', props: {} }],
      connections: []
    };

    expect(() => flattener.flatten(mainSpec)).toThrow(/Circular macro dependency detected/);
  });
});
