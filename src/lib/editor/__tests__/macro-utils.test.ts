/**
 * macro-utils tests (T-1) — pure-function coverage for component encapsulation.
 *
 * Covers:
 *   - classifyConnections: 4 scenarios (all internal / all external / mixed / T-branch)
 *   - remapBoundaryToComposite: boundary rewrite + error paths
 *   - buildDefaultExportPortMap: default port-name derivation + forward+inverse maps
 */

import {
  classifyConnections,
  remapBoundaryToComposite,
  buildDefaultExportPortMap,
} from '../macro-utils';
import type { ConnectionDecl } from '@/lib/framework';

const conn = (
  fromId: string,
  fromPort: string,
  toId: string,
  toPort: string,
  kind: string = 'wire',
): ConnectionDecl => ({
  from: { componentId: fromId, portName: fromPort },
  to: { componentId: toId, portName: toPort },
  kind,
});

describe('classifyConnections', () => {
  const conns: ConnectionDecl[] = [
    conn('r1', 'a', 'r2', 'a'),  // inside↔inside  → internal
    conn('r2', 'b', 'bat', 'p'), // inside↔outside → boundary
    conn('bat', 'n', 'gnd', 'g'), // outside↔outside → external
  ];

  it('splits connections into internal / boundary / external buckets', () => {
    const selected = new Set(['r1', 'r2']);
    const { internal, boundary, external } = classifyConnections(selected, conns);
    expect(internal).toHaveLength(1);
    expect(internal[0].from.componentId).toBe('r1');
    expect(boundary).toHaveLength(1);
    expect(boundary[0].to.componentId).toBe('bat');
    expect(external).toHaveLength(1);
    expect(external[0].from.componentId).toBe('bat');
  });

  it('treats every connection as internal when all endpoints are selected', () => {
    const selected = new Set(['r1', 'r2', 'bat', 'gnd']);
    const { internal, boundary, external } = classifyConnections(selected, conns);
    expect(internal).toHaveLength(3);
    expect(boundary).toHaveLength(0);
    expect(external).toHaveLength(0);
  });

  it('treats every connection as external when no endpoint is selected', () => {
    const selected = new Set<string>();
    const { internal, boundary, external } = classifyConnections(selected, conns);
    expect(internal).toHaveLength(0);
    expect(boundary).toHaveLength(0);
    expect(external).toHaveLength(3);
  });

  it('handles T-branch: three connections meeting at one inside node', () => {
    // Selection: { r1 }. Three connections all touching r1 from different outside nodes.
    const tConns: ConnectionDecl[] = [
      conn('r1', 'a', 'x', 'p'),
      conn('r1', 'b', 'y', 'p'),
      conn('z', 'q', 'r1', 'c'),
    ];
    const selected = new Set(['r1']);
    const { internal, boundary, external } = classifyConnections(selected, tConns);
    expect(internal).toHaveLength(0);
    expect(boundary).toHaveLength(3);
    expect(external).toHaveLength(0);
  });

  it('returns empty buckets for empty connection list', () => {
    const { internal, boundary, external } = classifyConnections(new Set(['a']), []);
    expect(internal).toHaveLength(0);
    expect(boundary).toHaveLength(0);
    expect(external).toHaveLength(0);
  });
});

describe('remapBoundaryToComposite', () => {
  const portMap = {
    'r2#b': 'A',     // inner "r2.b" → external port "A"
    'r1#c': 'B',
  };
  const selected = new Set(['r1', 'r2']);

  it('rewrites the inside "from" endpoint to the composite instance', () => {
    const c = conn('r2', 'b', 'bat', 'p');
    const out = remapBoundaryToComposite(c, selected, 'macro1', portMap);
    expect(out.from).toEqual({ componentId: 'macro1', portName: 'A' });
    expect(out.to).toEqual({ componentId: 'bat', portName: 'p' });
    expect(out.kind).toBe('wire');
  });

  it('rewrites the inside "to" endpoint to the composite instance', () => {
    const c = conn('gnd', 'g', 'r1', 'c');
    const out = remapBoundaryToComposite(c, selected, 'macroX', portMap);
    expect(out.from).toEqual({ componentId: 'gnd', portName: 'g' });
    expect(out.to).toEqual({ componentId: 'macroX', portName: 'B' });
  });

  it('throws when the inside endpoint has no exported port mapping', () => {
    const c = conn('r2', 'UNKNOWN', 'bat', 'p');
    expect(() => remapBoundaryToComposite(c, selected, 'm', portMap))
      .toThrow(/no exported port name/);
  });

  it('throws when given an internal connection (both endpoints inside)', () => {
    const c = conn('r1', 'a', 'r2', 'a');
    expect(() => remapBoundaryToComposite(c, selected, 'm', portMap))
      .toThrow(/internal, not boundary/);
  });

  it('throws when given an external connection (no endpoint inside)', () => {
    const c = conn('bat', 'n', 'gnd', 'g');
    expect(() => remapBoundaryToComposite(c, selected, 'm', portMap))
      .toThrow(/external, not boundary/);
  });
});

describe('buildDefaultExportPortMap', () => {
  it('generates exportPortMap with predictable "<id>_<port>" external names', () => {
    const selected = new Set(['r1', 'r2']);
    const boundary: ConnectionDecl[] = [
      conn('r2', 'b', 'bat', 'p'),
      conn('gnd', 'g', 'r1', 'c'),
    ];
    const { exportPortMap, inverseMap } = buildDefaultExportPortMap(selected, boundary);
    expect(exportPortMap).toEqual({
      r2_b: { componentId: 'r2', portName: 'b' },
      r1_c: { componentId: 'r1', portName: 'c' },
    });
    expect(inverseMap).toEqual({
      'r2#b': 'r2_b',
      'r1#c': 'r1_c',
    });
  });

  it('deduplicates when the same inside port appears in multiple boundary conns', () => {
    // r1.a is the inside endpoint of two boundary conns (fan-out T-branch)
    const selected = new Set(['r1']);
    const boundary: ConnectionDecl[] = [
      conn('r1', 'a', 'x', 'p'),
      conn('r1', 'a', 'y', 'q'), // same inside port r1.a
    ];
    const { exportPortMap } = buildDefaultExportPortMap(selected, boundary);
    expect(Object.keys(exportPortMap)).toHaveLength(1);
    expect(exportPortMap.r1_a).toEqual({ componentId: 'r1', portName: 'a' });
  });

  it('returns empty maps for empty boundary list', () => {
    const { exportPortMap, inverseMap } = buildDefaultExportPortMap(new Set(['x']), []);
    expect(exportPortMap).toEqual({});
    expect(inverseMap).toEqual({});
  });
});
