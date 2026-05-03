import { AssemblyBundle } from '../framework/contracts/layout';

/**
 * Provides predefined AssemblyBundles for preset experiments.
 * This bridges the gap between fixed preset experiments and the dynamic Editor Canvas.
 */
export function getPresetBundle(experimentId: string): AssemblyBundle | null {
  switch (experimentId) {
    case 'circuit':
      return {
        spec: {
          domain: 'circuit',
          components: [
            { id: 'bat1', kind: 'battery', props: { voltage: 9 }, anchor: { x: 0, y: 0 } },
            { id: 'sw1', kind: 'switch', props: { closed: false }, anchor: { x: 0, y: 0 } },
            { id: 'res1', kind: 'resistor', props: { resistance: 10 }, anchor: { x: 0, y: 0 } },
            { id: 'lamp1', kind: 'bulb', props: { ratedPower: 3, resistance: 6 }, anchor: { x: 0, y: 0 } },
          ],
          connections: [
            { from: { componentId: 'bat1', portName: 'positive' }, to: { componentId: 'sw1', portName: 'in' } },
            { from: { componentId: 'sw1', portName: 'out' }, to: { componentId: 'res1', portName: 'a' } },
            { from: { componentId: 'res1', portName: 'b' }, to: { componentId: 'lamp1', portName: 'a' } },
            { from: { componentId: 'lamp1', portName: 'b' }, to: { componentId: 'bat1', portName: 'negative' } },
          ],
        },
        layout: {
          domain: 'circuit',
          entries: [
            { componentId: 'bat1', anchor: { x: 100, y: 200 } },
            { componentId: 'sw1', anchor: { x: 250, y: 100 } },
            { componentId: 'res1', anchor: { x: 450, y: 100 } },
            { componentId: 'lamp1', anchor: { x: 600, y: 200 } },
          ],
        },
      } as AssemblyBundle<'circuit'>;
    case 'acid-base':
    case 'acid-base-titration':
      return {
        spec: {
          domain: 'chemistry',
          components: [
            { id: 'flask', kind: 'beaker', props: { volume: 250 }, anchor: { x: 0, y: 0 } },
            { id: 'burette', kind: 'burette', props: { volume: 50 }, anchor: { x: 0, y: 0 } },
          ],
          connections: [],
        },
        layout: {
          domain: 'chemistry',
          entries: [
            { componentId: 'flask', anchor: { x: 300, y: 300 } },
            { componentId: 'burette', anchor: { x: 300, y: 100 } },
          ],
        },
      } as AssemblyBundle<'chemistry'>;
    case 'buoyancy':
      return {
        spec: {
          domain: 'mechanics',
          components: [
            { id: 'beaker', kind: 'beaker', props: { volume: 500 }, anchor: { x: 0, y: 0 } },
            { id: 'block', kind: 'block', props: { mass: 2, volume: 100 }, anchor: { x: 0, y: 0 } },
            { id: 'force_meter', kind: 'force_meter', props: {}, anchor: { x: 0, y: 0 } },
          ],
          connections: [],
        },
        layout: {
          domain: 'mechanics',
          entries: [
            { componentId: 'beaker', anchor: { x: 300, y: 300 } },
            { componentId: 'block', anchor: { x: 300, y: 150 } },
            { componentId: 'force_meter', anchor: { x: 300, y: 50 } },
          ],
        },
      } as AssemblyBundle<'mechanics'>;
    case 'lever':
      return {
        spec: {
          domain: 'mechanics',
          components: [
            { id: 'pivot', kind: 'pivot', props: {}, anchor: { x: 0, y: 0 } },
            { id: 'beam', kind: 'beam', props: { length: 100 }, anchor: { x: 0, y: 0 } },
            { id: 'weight', kind: 'weight', props: { mass: 5 }, anchor: { x: 0, y: 0 } },
          ],
          connections: [],
        },
        layout: {
          domain: 'mechanics',
          entries: [
            { componentId: 'pivot', anchor: { x: 400, y: 300 } },
            { componentId: 'beam', anchor: { x: 400, y: 300 } },
            { componentId: 'weight', anchor: { x: 200, y: 300 } },
          ],
        },
      } as AssemblyBundle<'mechanics'>;
    case 'refraction':
      return {
        spec: {
          domain: 'optics',
          components: [
            { id: 'laser', kind: 'laser', props: {}, anchor: { x: 0, y: 0 } },
            { id: 'glass_block', kind: 'glass_block', props: { refractiveIndex: 1.5 }, anchor: { x: 0, y: 0 } },
          ],
          connections: [],
        },
        layout: {
          domain: 'optics',
          entries: [
            { componentId: 'laser', anchor: { x: 100, y: 200 } },
            { componentId: 'glass_block', anchor: { x: 400, y: 200 } },
          ],
        },
      } as AssemblyBundle<'optics'>;
    default:
      return null;
  }
}
