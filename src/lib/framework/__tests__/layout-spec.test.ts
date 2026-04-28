/**
 * T-11 · LayoutSpec & anchor-Spec separation tests.
 *
 * Covers AC-D1, D2, D4, D9–D14 from the execution plan.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

import {
  // Layout API
  emptyLayout,
  isLayoutSpec,
  layoutLookup,
  isAssemblyBundle,
  // Spec API
  isAssemblySpec,
  emptySpec,
  // Builder
  FluentAssembly,
  // Assembler
  Assembler,
  type ComponentDomain,
  type LayoutSpec,
  type AssemblySpec,
  type AssemblyBundle,
} from '../index';

import { CircuitBuilder, circuitAssembler } from '../domains/circuit/assembly';
import { makeReagent, makeBubble, makeSolid } from '../domains/chemistry';
// ensure domain factories are registered (side-effect import)
import '../domains/circuit';
import '../domains/chemistry';

describe('T-11 · LayoutSpec separation', () => {
  // ── AC-D1 · file-level decoupling ─────────────────────────────────────
  test('AC-D1 · layout.ts does NOT import AssemblySpec type', () => {
    const file = readFileSync(
      join(__dirname, '..', 'assembly', 'layout.ts'),
      'utf8',
    );
    // Allow mention in comments (documentation) but no real type import
    const importLines = file
      .split('\n')
      .filter((l) => /^\s*import\b/.test(l));
    const importsAssemblySpecType = importLines.some((l) =>
      /\bAssemblySpec\b/.test(l),
    );
    expect(importsAssemblySpecType).toBe(false);
  });

  // ── AC-D4 · runtime type guard ─────────────────────────────────────
  test('AC-D4 · isLayoutSpec type guard positive and negatives', () => {
    expect(isLayoutSpec({
      domain: 'circuit',
      entries: [{ componentId: 'X', anchor: { x: 1, y: 2 } }],
    })).toBe(true);

    expect(isLayoutSpec(null)).toBe(false);
    expect(isLayoutSpec('not an object')).toBe(false);
    expect(isLayoutSpec({ domain: 'circuit' })).toBe(false); // missing entries
    expect(isLayoutSpec({ entries: [] })).toBe(false); // missing domain
    expect(isLayoutSpec({ domain: 'circuit', entries: [{ componentId: 'X' }] })).toBe(false); // entry missing anchor
  });

  // ── AC-D9 · JSON round-trip ─────────────────────────────────────
  test('AC-D9 · LayoutSpec survives JSON.parse(JSON.stringify(...)) deep-equal', () => {
    const original: LayoutSpec<'circuit'> = {
      domain: 'circuit',
      entries: [
        { componentId: 'B1', anchor: { x: 40, y: 110 } },
        { componentId: 'R1', anchor: { x: 280, y: 110, rotation: 90 } },
      ],
      metadata: { name: 'default', gridSizePx: 20 },
    };
    const round = JSON.parse(JSON.stringify(original));
    expect(round).toEqual(original);
    expect(isLayoutSpec(round)).toBe(true);
  });

  // ── AC-D10 · AssemblyBundle combinations ─────────────────────────
  test('AC-D10a · assembleBundle({spec}) works without layout', () => {
    const b = new CircuitBuilder()
      .battery({ voltage: 6, id: 'B1' })
      .resistor({ resistance: 10, id: 'R1' })
      .connect('B1', 'positive', 'R1', 'a')
      .connect('R1', 'b', 'B1', 'negative');
    const bundle: AssemblyBundle<'circuit'> = { spec: b.toSpec() };
    expect(isAssemblyBundle(bundle)).toBe(true);
    const graph = circuitAssembler.assembleBundle(bundle);
    expect(graph.componentCount()).toBe(2);
  });

  test('AC-D10b · assembleBundle({spec, layout: empty}) works', () => {
    const b = new CircuitBuilder().battery({ voltage: 6, id: 'B1' });
    const emptyL: LayoutSpec<'circuit'> = emptyLayout('circuit');
    const bundle: AssemblyBundle<'circuit'> = { spec: b.toSpec(), layout: emptyL };
    expect(isAssemblyBundle(bundle)).toBe(true);
    const graph = circuitAssembler.assembleBundle(bundle);
    expect(graph.componentCount()).toBe(1);
  });

  test('AC-D10c · isAssemblyBundle rejects malformed bundle', () => {
    expect(isAssemblyBundle(null)).toBe(false);
    expect(isAssemblyBundle({})).toBe(false); // missing spec
    expect(isAssemblyBundle({ spec: { domain: 'x', components: [], connections: [] }, layout: 'bad' })).toBe(false);
  });

  // ── AC-D11 · Builder sugar splits anchors into _layout ────────────
  test('AC-D11 · Builder with 5 anchor calls → toLayout().entries.length === 5', () => {
    const b = new CircuitBuilder()
      .battery({ voltage: 6, id: 'B1', anchor: { x: 40, y: 110 } })
      .switch_({ closed: true, id: 'S1', anchor: { x: 160, y: 110 } })
      .resistor({ resistance: 10, id: 'R1', anchor: { x: 280, y: 110 } })
      .bulb({ ratedPower: 2, id: 'L1', anchor: { x: 420, y: 110 } })
      .ammeter({ id: 'A1', anchor: { x: 520, y: 110 } });
    const layout = b.toLayout();
    expect(layout.entries).toHaveLength(5);
    expect(layout.entries.find((e) => e.componentId === 'B1')?.anchor).toEqual({ x: 40, y: 110 });
    expect(layout.entries.find((e) => e.componentId === 'L1')?.anchor).toEqual({ x: 420, y: 110 });
  });

  test('AC-D11b · Builder.toSpec() returns components WITHOUT anchor fields', () => {
    const b = new CircuitBuilder()
      .battery({ voltage: 6, id: 'B1', anchor: { x: 40, y: 110 } });
    const spec = b.toSpec();
    // @deprecated field should not be present (undefined or omitted both pass)
    expect(spec.components[0].anchor).toBeUndefined();
  });

  test('AC-D11c · Builder without any anchor → empty layout', () => {
    const b = new CircuitBuilder()
      .battery({ voltage: 6, id: 'B1' })
      .resistor({ resistance: 10, id: 'R1' });
    expect(b.toLayout().entries).toHaveLength(0);
  });

  // ── AC-D12 · legacy decl.anchor triggers console.warn ─────────────
  test('AC-D12 · Assembler warns (once) on legacy decl.anchor, does not throw', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const legacySpec: AssemblySpec<'circuit'> = {
        domain: 'circuit',
        components: [
          // @ts-expect-error — anchor is @deprecated; on purpose for this test
          { id: 'B1', kind: 'battery', props: { voltage: 6 }, anchor: { x: 40, y: 110 } },
          { id: 'R1', kind: 'resistor', props: { resistance: 10 } },
        ],
        connections: [
          { from: { componentId: 'B1', portName: 'positive' }, to: { componentId: 'R1', portName: 'a' } },
          { from: { componentId: 'R1', portName: 'b' }, to: { componentId: 'B1', portName: 'negative' } },
        ],
      };
      expect(() => circuitAssembler.assemble(legacySpec)).not.toThrow();
      expect(spy).toHaveBeenCalledWith(expect.stringMatching(/legacy "decl.anchor"/));
    } finally {
      spy.mockRestore();
    }
  });

  // ── AC-D13 · toBundle returns valid AssemblySpec + LayoutSpec ─────
  test('AC-D13 · toBundle() shape matches AssemblyBundle runtime checks', () => {
    const b = new CircuitBuilder()
      .battery({ voltage: 6, id: 'B1', anchor: { x: 10, y: 20 } });
    const bundle = b.toBundle();
    expect(isAssemblySpec(bundle.spec)).toBe(true);
    expect(bundle.layout && isLayoutSpec(bundle.layout)).toBe(true);
    expect(isAssemblyBundle(bundle)).toBe(true);
  });

  // ── AC-D14 · reaction-spawned components have PLACEHOLDER_ANCHOR ──
  test('AC-D14 · makeReagent/makeBubble/makeSolid carry placeholder anchor {0,0}', () => {
    const r = makeReagent('r1', 'Na2SO4', 0.5, 'aq');
    const b = makeBubble('b1', 'H2', 0.01);
    const s = makeSolid('s1', 'Fe2O3', 1);
    expect(r.anchor).toEqual({ x: 0, y: 0 });
    expect(b.anchor).toEqual({ x: 0, y: 0 });
    expect(s.anchor).toEqual({ x: 0, y: 0 });
  });

  // ── AC-D2 · Engine consumes spec only (no anchor leakage) ─────────
  test('AC-D2a · circuit engine v2 does not leak anchor in perComponent output', async () => {
    const { CircuitEngine } = await import('@/lib/engines/physics/circuit');
    const engine = new CircuitEngine();
    const spec = new CircuitBuilder()
      .battery({ voltage: 6, id: 'B1', anchor: { x: 40, y: 110 } })
      .resistor({ resistance: 10, id: 'R1', anchor: { x: 280, y: 110 } })
      .bulb({ ratedPower: 2, id: 'L1', anchor: { x: 420, y: 110 } })
      .connect('B1', 'positive', 'R1', 'a')
      .connect('R1', 'b', 'L1', 'a')
      .connect('L1', 'b', 'B1', 'negative')
      .toSpec();
    const r = engine.compute({ graph: spec } as unknown as Record<string, number>);
    expect(r.state).not.toBe('error');
    const perComponent = r.values.perComponent as Record<string, Record<string, unknown>>;
    // perComponent values carry solved physics, NOT visual position
    for (const id of Object.keys(perComponent)) {
      expect(perComponent[id]).not.toHaveProperty('anchor');
      expect(perComponent[id]).not.toHaveProperty('x');
      expect(perComponent[id]).not.toHaveProperty('y');
    }
  });

  test('AC-D2b · chemistry engine v2 returns components without anchor field', async () => {
    const { ChemistryReactionEngine } = await import('@/lib/engines/chemistry/reaction');
    const engine = new ChemistryReactionEngine();
    const { ChemistryBuilder } = await import('../domains/chemistry/assembly');
    const spec = new ChemistryBuilder()
      .flask({ id: 'F1', volumeML: 100, shape: 'beaker', anchor: { x: 250, y: 100 } })
      .pour('F1', { id: 'R1', formula: 'H2O', moles: 1, phase: 'l', anchor: { x: 50, y: 200 } })
      .toSpec();
    const r = engine.compute({ graph: spec } as unknown as Record<string, number>);
    expect(r.state).not.toBe('error');
    const components = r.values.components as Array<Record<string, unknown>>;
    expect(Array.isArray(components)).toBe(true);
    for (const c of components) {
      expect(c).not.toHaveProperty('anchor');
    }
  });

  // ── Sugar API flow end-to-end ─────────────────────────────────
  test('Sugar dispatch · .battery({anchor}) → spec anchor-free + layout has entry', () => {
    const b = new CircuitBuilder().battery({
      voltage: 6,
      id: 'B1',
      anchor: { x: 40, y: 110 },
    });
    expect(b.toSpec().components[0].anchor).toBeUndefined();
    expect(b.toLayout().entries[0]).toEqual({
      componentId: 'B1',
      anchor: { x: 40, y: 110 },
    });
  });

  // ── Cross-builder fingerprint: TS vs browser JS match ─────────
  test('Browser JS builder mirror uses _layout internally (source-level check)', () => {
    const jsFile = readFileSync(
      join(__dirname, '..', '..', '..', '..', 'public', 'templates', '_shared', 'circuit-builder.js'),
      'utf8',
    );
    // Must reference _layout and toLayoutSpec — proof the mirror is in sync
    expect(jsFile).toMatch(/this\._layout\b/);
    expect(jsFile).toMatch(/toLayoutSpec\s*\(/);
    // Must NOT write anchor directly into _spec.components
    expect(jsFile).not.toMatch(/anchor:\s*opts\.anchor,\s*\n\s*\}\);[\s\S]*_spec\.components\.push/);
  });

  // ── layoutLookup helper ─────
  test('layoutLookup returns O(1) Map with "last write wins" on duplicate ids', () => {
    const layout: LayoutSpec = {
      domain: 'circuit',
      entries: [
        { componentId: 'B1', anchor: { x: 1, y: 1 } },
        { componentId: 'R1', anchor: { x: 2, y: 2 } },
        { componentId: 'B1', anchor: { x: 99, y: 99 } }, // duplicate
      ],
    };
    const map = layoutLookup(layout);
    expect(map.get('B1')).toEqual({ x: 99, y: 99 });
    expect(map.get('R1')).toEqual({ x: 2, y: 2 });
    expect(map.size).toBe(2);
  });

  // ── Cross-domain: chemistry builder also splits anchors ─────
  test('Cross-domain parity · ChemistryBuilder also routes anchor to _layout', async () => {
    const { ChemistryBuilder } = await import('../domains/chemistry/assembly');
    const b = new ChemistryBuilder()
      .flask({ id: 'F1', volumeML: 100, shape: 'beaker', anchor: { x: 250, y: 100 } })
      .pour('F1', { id: 'R1', formula: 'H2O', moles: 1, phase: 'l', anchor: { x: 50, y: 200 } });
    expect(b.toLayout().entries).toHaveLength(2);
    expect(b.toSpec().components[0].anchor).toBeUndefined();
    expect(b.toSpec().components[1].anchor).toBeUndefined();
  });

  // ── emptyLayout helper ─────
  test('emptyLayout(domain) returns a valid empty LayoutSpec', () => {
    const L = emptyLayout('circuit');
    expect(isLayoutSpec(L)).toBe(true);
    expect(L.entries).toHaveLength(0);
    expect(L.domain).toBe('circuit');
  });
});
