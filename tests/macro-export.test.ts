import { SpecFlattener, MacroResolver } from '../src/lib/framework/macro/flattener';
import type { AssemblySpec } from '../src/lib/framework/contracts/assembly';
import type { MacroDefinition } from '../src/lib/framework/contracts/layout';

describe('Macro Export Map Validation', () => {
  it('throws a clear error when a connection references a non-existent exported port on a macro', () => {
    const spec: AssemblySpec = {
      domain: 'circuit',
      components: [
        { id: 'battery', kind: 'power', props: {} },
        { id: 'macro1', kind: 'my-macro', props: {} }
      ],
      connections: [
        { from: { componentId: 'battery', portName: 'out' }, to: { componentId: 'macro1', portName: 'invalidPort' } }
      ]
    };

    const macroDef: MacroDefinition = {
      spec: {
        domain: 'circuit',
        components: [{ id: 'internal', kind: 'resistor', props: {} }],
        connections: []
      },
      exportPortMap: {
        'validPort': { componentId: 'internal', portName: 'in' }
      }
    };

    const resolver: MacroResolver = {
      resolve: (kind) => kind === 'my-macro' ? macroDef : undefined
    };

    const flattener = new SpecFlattener(resolver);

    expect(() => flattener.flatten(spec)).toThrow(
      'Macro instance "macro1" does not export port "invalidPort"'
    );
  });

  it('throws a clear error when a macro export map points to a missing internal component', () => {
    const spec: AssemblySpec = {
      domain: 'circuit',
      components: [
        { id: 'battery', kind: 'power', props: {} },
        { id: 'macro1', kind: 'my-macro', props: {} }
      ],
      connections: [
        { from: { componentId: 'battery', portName: 'out' }, to: { componentId: 'macro1', portName: 'validPort' } }
      ]
    };

    const macroDef: MacroDefinition = {
      spec: {
        domain: 'circuit',
        components: [{ id: 'internal', kind: 'resistor', props: {} }],
        connections: []
      },
      exportPortMap: {
        // points to a non-existent internal component id
        'validPort': { componentId: 'ghost-component', portName: 'in' }
      }
    };

    const resolver: MacroResolver = {
      resolve: (kind) => kind === 'my-macro' ? macroDef : undefined
    };

    const flattener = new SpecFlattener(resolver);

    expect(() => flattener.flatten(spec)).toThrow(
      'Exported port maps to missing internal component: ghost-component'
    );
  });

  it('throws a clear error when a nested macro does not export the required port', () => {
    const spec: AssemblySpec = {
      domain: 'circuit',
      components: [
        { id: 'battery', kind: 'power', props: {} },
        { id: 'parent-macro', kind: 'macro-a', props: {} }
      ],
      connections: [
        { from: { componentId: 'battery', portName: 'out' }, to: { componentId: 'parent-macro', portName: 'portA' } }
      ]
    };

    const macroA: MacroDefinition = {
      spec: {
        domain: 'circuit',
        components: [{ id: 'child-macro', kind: 'macro-b', props: {} }],
        connections: []
      },
      exportPortMap: {
        'portA': { componentId: 'child-macro', portName: 'missingPortB' }
      }
    };

    const macroB: MacroDefinition = {
      spec: {
        domain: 'circuit',
        components: [{ id: 'internal', kind: 'resistor', props: {} }],
        connections: []
      },
      exportPortMap: {
        'portB': { componentId: 'internal', portName: 'in' }
      }
    };

    const resolver: MacroResolver = {
      resolve: (kind) => {
        if (kind === 'macro-a') return macroA;
        if (kind === 'macro-b') return macroB;
        return undefined;
      }
    };

    const flattener = new SpecFlattener(resolver);

    expect(() => flattener.flatten(spec)).toThrow(
      'Nested macro "child-macro" does not export port "missingPortB"'
    );
  });
});
