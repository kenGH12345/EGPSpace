/**
 * Editor Wave 0 tests — reducer + bundle + persistence + port-layout.
 *
 * Runs in plain jest (no jsdom React needed) — proves AC-B2 (zero React).
 */

import {
  emptyEditorState,
  applyEditorAction,
  bundleFromState,
  screenToCanvas,
  canvasToScreen,
  getPortCanvasPos,
  findPortAtScreen,
  saveBundle,
  loadBundle,
  listSlots,
  removeSlot,
  storageKey,
  exportBundleJson,
  importBundleJson,
  componentBounds,
  isPointInBounds,
  snapToGrid,
  snapPointToGrid,
  type EditorState,
  type PortLayoutTable,
} from '../index';
import type { AssemblyBundle } from '@/lib/framework';

// ── In-memory Storage mock ────────────────────────────────────────────────

function createMockStorage(opts: { quotaBytes?: number } = {}): Storage {
  const map = new Map<string, string>();
  let used = 0;
  return {
    get length() {
      return map.size;
    },
    key(i: number) {
      return Array.from(map.keys())[i] ?? null;
    },
    getItem(k: string) {
      return map.get(k) ?? null;
    },
    setItem(k: string, v: string) {
      const prev = map.get(k)?.length ?? 0;
      const next = used - prev + v.length;
      if (opts.quotaBytes !== undefined && next > opts.quotaBytes) {
        const err = new Error('QuotaExceededError: The quota has been exceeded.');
        err.name = 'QuotaExceededError';
        throw err;
      }
      map.set(k, v);
      used = next;
    },
    removeItem(k: string) {
      const prev = map.get(k)?.length ?? 0;
      map.delete(k);
      used -= prev;
    },
    clear() {
      map.clear();
      used = 0;
    },
  } as Storage;
}

// ── Reducer tests ────────────────────────────────────────────────────────

describe('editor-state-reducer', () => {
  test('R-1 · placeComponent adds to placed[] with auto-generated id', () => {
    const s0 = emptyEditorState('circuit');
    const s1 = applyEditorAction(s0, {
      type: 'placeComponent',
      kind: 'battery',
      position: { x: 40, y: 80 },
      defaults: { voltage: 6 },
    });
    expect(s1.placed).toHaveLength(1);
    expect(s1.placed[0].id).toBe('battery-1');
    expect(s1.placed[0].kind).toBe('battery');
    expect(s1.placed[0].anchor).toEqual({ x: 40, y: 80 });
    expect(s1.placed[0].props).toEqual({ voltage: 6 });
    expect(s1.selection).toEqual({ kind: 'component', id: 'battery-1' });
    // input not mutated
    expect(s0.placed).toHaveLength(0);
  });

  test('R-2 · second component of same kind gets incrementing id', () => {
    let s = emptyEditorState('circuit');
    s = applyEditorAction(s, { type: 'placeComponent', kind: 'battery', position: { x: 0, y: 0 } });
    s = applyEditorAction(s, { type: 'placeComponent', kind: 'battery', position: { x: 10, y: 0 } });
    expect(s.placed.map((p) => p.id)).toEqual(['battery-1', 'battery-2']);
  });

  test('R-3 · moveComponent updates anchor by delta; input unchanged', () => {
    const s0 = applyEditorAction(emptyEditorState('circuit'), {
      type: 'placeComponent',
      kind: 'r',
      position: { x: 100, y: 200 },
    });
    const s1 = applyEditorAction(s0, {
      type: 'moveComponent',
      id: 'r-1',
      delta: { x: 5, y: -3 },
    });
    expect(s1.placed[0].anchor).toEqual({ x: 105, y: 197 });
    expect(s0.placed[0].anchor).toEqual({ x: 100, y: 200 }); // immutability
  });

  test('R-4 · startWire → finishWire commits a connection and clears draft', () => {
    let s = emptyEditorState('circuit');
    s = applyEditorAction(s, { type: 'placeComponent', kind: 'battery', position: { x: 0, y: 0 } });
    s = applyEditorAction(s, { type: 'placeComponent', kind: 'resistor', position: { x: 100, y: 0 } });
    s = applyEditorAction(s, {
      type: 'startWire',
      componentId: 'battery-1',
      port: 'positive',
      cursor: { x: 20, y: 0 },
    });
    expect(s.draftWire).not.toBeNull();
    s = applyEditorAction(s, { type: 'finishWire', componentId: 'resistor-1', port: 'a' });
    expect(s.draftWire).toBeNull();
    expect(s.connections).toHaveLength(1);
    expect(s.connections[0].from).toEqual({ componentId: 'battery-1', portName: 'positive' });
    expect(s.connections[0].to).toEqual({ componentId: 'resistor-1', portName: 'a' });
  });

  test('R-5 · finishWire on same port as startWire → self-loop rejected', () => {
    let s = emptyEditorState('circuit');
    s = applyEditorAction(s, { type: 'placeComponent', kind: 'battery', position: { x: 0, y: 0 } });
    s = applyEditorAction(s, {
      type: 'startWire',
      componentId: 'battery-1',
      port: 'positive',
      cursor: { x: 0, y: 0 },
    });
    s = applyEditorAction(s, { type: 'finishWire', componentId: 'battery-1', port: 'positive' });
    expect(s.connections).toHaveLength(0);
    expect(s.draftWire).toBeNull();
  });

  test('R-6 · duplicate connection rejected (both directions)', () => {
    let s = emptyEditorState('circuit');
    s = applyEditorAction(s, { type: 'placeComponent', kind: 'battery', position: { x: 0, y: 0 } });
    s = applyEditorAction(s, { type: 'placeComponent', kind: 'resistor', position: { x: 100, y: 0 } });
    const connect = (fromId: string, fromPort: string, toId: string, toPort: string) => {
      s = applyEditorAction(s, { type: 'startWire', componentId: fromId, port: fromPort, cursor: { x: 0, y: 0 } });
      s = applyEditorAction(s, { type: 'finishWire', componentId: toId, port: toPort });
    };
    connect('battery-1', 'positive', 'resistor-1', 'a');
    expect(s.connections).toHaveLength(1);
    // attempt duplicate in same direction
    connect('battery-1', 'positive', 'resistor-1', 'a');
    expect(s.connections).toHaveLength(1);
    // attempt duplicate in reverse direction
    connect('resistor-1', 'a', 'battery-1', 'positive');
    expect(s.connections).toHaveLength(1);
  });

  test('R-7 · deleteSelection on component removes it + cascades connections', () => {
    let s = emptyEditorState('circuit');
    s = applyEditorAction(s, { type: 'placeComponent', kind: 'battery', position: { x: 0, y: 0 } });
    s = applyEditorAction(s, { type: 'placeComponent', kind: 'resistor', position: { x: 100, y: 0 } });
    s = applyEditorAction(s, { type: 'startWire', componentId: 'battery-1', port: 'positive', cursor: { x: 0, y: 0 } });
    s = applyEditorAction(s, { type: 'finishWire', componentId: 'resistor-1', port: 'a' });
    expect(s.connections).toHaveLength(1);
    s = applyEditorAction(s, { type: 'selectComponent', id: 'battery-1' });
    s = applyEditorAction(s, { type: 'deleteSelection' });
    expect(s.placed).toHaveLength(1);
    expect(s.placed[0].id).toBe('resistor-1');
    expect(s.connections).toHaveLength(0);
  });

  test('R-8 · updateProp changes a prop without touching anchor', () => {
    let s = emptyEditorState('circuit');
    s = applyEditorAction(s, {
      type: 'placeComponent',
      kind: 'resistor',
      position: { x: 10, y: 20 },
      defaults: { resistance: 10 },
    });
    s = applyEditorAction(s, { type: 'updateProp', id: 'resistor-1', key: 'resistance', value: 47 });
    expect(s.placed[0].props.resistance).toBe(47);
    expect(s.placed[0].anchor).toEqual({ x: 10, y: 20 });
  });

  test('R-9 · switchDomain resets everything', () => {
    let s = emptyEditorState('circuit');
    s = applyEditorAction(s, { type: 'placeComponent', kind: 'battery', position: { x: 0, y: 0 } });
    s = applyEditorAction(s, { type: 'switchDomain', domain: 'chemistry' });
    expect(s.domain).toBe('chemistry');
    expect(s.placed).toHaveLength(0);
    expect(s.connections).toHaveLength(0);
  });

  test('R-10 · loadBundle restores placed + connections from bundle', () => {
    const bundle: AssemblyBundle = {
      spec: {
        domain: 'circuit',
        components: [
          { id: 'b1', kind: 'battery', props: { voltage: 9 } },
          { id: 'r1', kind: 'resistor', props: { resistance: 10 } },
        ],
        connections: [
          { from: { componentId: 'b1', portName: 'positive' }, to: { componentId: 'r1', portName: 'a' } },
        ],
      },
      layout: {
        domain: 'circuit',
        entries: [
          { componentId: 'b1', anchor: { x: 50, y: 80 } },
          { componentId: 'r1', anchor: { x: 200, y: 80 } },
        ],
      },
    };
    const s = applyEditorAction(emptyEditorState('circuit'), { type: 'loadBundle', bundle });
    expect(s.placed).toHaveLength(2);
    expect(s.placed[0].anchor).toEqual({ x: 50, y: 80 });
    expect(s.connections).toHaveLength(1);
  });
});

// ── bundle-from-state tests ──────────────────────────────────────────────

describe('bundleFromState', () => {
  test('B-1 · spec.components[i] does NOT contain anchor (AC-D5 / AC-B4)', () => {
    let s = emptyEditorState('circuit');
    s = applyEditorAction(s, {
      type: 'placeComponent',
      kind: 'battery',
      position: { x: 40, y: 110 },
      defaults: { voltage: 6 },
    });
    const bundle = bundleFromState(s);
    for (const c of bundle.spec.components) {
      expect(c).not.toHaveProperty('anchor');
    }
  });

  test('B-2 · layout.entries mirrors placed components with anchors', () => {
    let s = emptyEditorState('circuit');
    s = applyEditorAction(s, { type: 'placeComponent', kind: 'battery', position: { x: 40, y: 110 } });
    s = applyEditorAction(s, { type: 'placeComponent', kind: 'resistor', position: { x: 280, y: 110 } });
    const bundle = bundleFromState(s);
    expect(bundle.layout).toBeDefined();
    expect(bundle.layout!.entries).toHaveLength(2);
    expect(bundle.layout!.entries[0].anchor).toEqual({ x: 40, y: 110 });
  });

  test('B-3 · roundtrip state→bundle→loadBundle→state preserves structure', () => {
    let s1 = emptyEditorState('circuit');
    s1 = applyEditorAction(s1, { type: 'placeComponent', kind: 'battery', position: { x: 40, y: 110 }, defaults: { voltage: 6 } });
    s1 = applyEditorAction(s1, { type: 'placeComponent', kind: 'resistor', position: { x: 280, y: 110 }, defaults: { resistance: 10 } });
    s1 = applyEditorAction(s1, { type: 'startWire', componentId: 'battery-1', port: 'positive', cursor: { x: 0, y: 0 } });
    s1 = applyEditorAction(s1, { type: 'finishWire', componentId: 'resistor-1', port: 'a' });
    const bundle = bundleFromState(s1);
    const s2 = applyEditorAction(emptyEditorState('circuit'), { type: 'loadBundle', bundle });
    // Component ids, kinds, anchors preserved
    expect(s2.placed.map((p) => p.id)).toEqual(s1.placed.map((p) => p.id));
    expect(s2.placed.map((p) => p.anchor)).toEqual(s1.placed.map((p) => p.anchor));
    expect(s2.placed.map((p) => p.props)).toEqual(s1.placed.map((p) => p.props));
    expect(s2.connections).toEqual(s1.connections);
  });
});

// ── port-layout tests ────────────────────────────────────────────────────

describe('port-layout', () => {
  const table: PortLayoutTable = {
    battery: { '+': { dx: 20, dy: 0 }, '-': { dx: -20, dy: 0 } },
    resistor: { a: { dx: -20, dy: 0 }, b: { dx: 20, dy: 0 } },
  };

  test('C-1 · screenToCanvas and canvasToScreen are inverses', () => {
    const cam = { offset: { x: 50, y: 20 }, zoom: 2 };
    const p = { x: 170, y: 80 };
    const back = canvasToScreen(screenToCanvas(p, cam), cam);
    expect(back.x).toBeCloseTo(p.x);
    expect(back.y).toBeCloseTo(p.y);
  });

  test('C-2 · getPortCanvasPos applies offset to anchor', () => {
    const comp = { kind: 'battery', anchor: { x: 100, y: 50 } };
    expect(getPortCanvasPos(comp, '+', table)).toEqual({ x: 120, y: 50 });
    expect(getPortCanvasPos(comp, '-', table)).toEqual({ x: 80, y: 50 });
  });

  test('C-3 · findPortAtScreen finds nearest port within radius', () => {
    const comps = [
      { id: 'b1', kind: 'battery', props: {}, anchor: { x: 100, y: 50 } },
      { id: 'r1', kind: 'resistor', props: {}, anchor: { x: 300, y: 50 } },
    ];
    const cam = { offset: { x: 0, y: 0 }, zoom: 1 };
    // click near battery + port
    const hit = findPortAtScreen({ x: 122, y: 51 }, comps, table, cam, 12);
    expect(hit).not.toBeNull();
    expect(hit!.componentId).toBe('b1');
    expect(hit!.portName).toBe('+');
    // click far from any port
    expect(findPortAtScreen({ x: 200, y: 200 }, comps, table, cam, 12)).toBeNull();
  });

  test('C-4 · getPortCanvasPos returns anchor itself for unknown port', () => {
    const comp = { kind: 'battery', anchor: { x: 100, y: 50 } };
    expect(getPortCanvasPos(comp, 'mystery', table)).toEqual({ x: 100, y: 50 });
  });
});

// ── persistence tests ────────────────────────────────────────────────────

describe('persistence', () => {
  function makeBundle(): AssemblyBundle {
    return {
      spec: {
        domain: 'circuit',
        components: [{ id: 'b1', kind: 'battery', props: { voltage: 6 } }],
        connections: [],
      },
      layout: {
        domain: 'circuit',
        entries: [{ componentId: 'b1', anchor: { x: 40, y: 110 } }],
      },
    };
  }

  test('P-1 · storageKey is stable and namespaced', () => {
    expect(storageKey('circuit', 'my-circuit-01')).toBe('egpspace-editor-circuit-my-circuit-01');
  });

  test('P-2 · save + load roundtrip', () => {
    const storage = createMockStorage();
    const r1 = saveBundle('circuit', 'slot-1', makeBundle(), storage);
    expect(r1.ok).toBe(true);
    const r2 = loadBundle('circuit', 'slot-1', storage);
    expect(r2.ok).toBe(true);
    if (r2.ok) {
      expect(r2.bundle.spec.components[0].id).toBe('b1');
      expect(r2.bundle.layout!.entries[0].anchor).toEqual({ x: 40, y: 110 });
    }
  });

  test('P-3 · load not-found returns structured error', () => {
    const storage = createMockStorage();
    const r = loadBundle('circuit', 'does-not-exist', storage);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('not-found');
  });

  test('P-4 · load with malformed JSON returns parse-error', () => {
    const storage = createMockStorage();
    storage.setItem(storageKey('circuit', 'bad'), '{not json');
    const r = loadBundle('circuit', 'bad', storage);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('parse-error');
  });

  test('P-5 · load with valid JSON but wrong shape returns shape-invalid', () => {
    const storage = createMockStorage();
    storage.setItem(storageKey('circuit', 'wrong'), JSON.stringify({ hello: 'world' }));
    const r = loadBundle('circuit', 'wrong', storage);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('shape-invalid');
  });

  test('P-6 · quota exceeded returns structured error (does not throw)', () => {
    const storage = createMockStorage({ quotaBytes: 10 });
    const r = saveBundle('circuit', 'slot-1', makeBundle(), storage);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('quota-exceeded');
  });

  test('P-7 · listSlots returns only matching-domain slots', () => {
    const storage = createMockStorage();
    saveBundle('circuit', 'a', makeBundle(), storage);
    saveBundle('circuit', 'b', makeBundle(), storage);
    const chemBundle: AssemblyBundle = { ...makeBundle(), spec: { ...makeBundle().spec, domain: 'chemistry' as const } };
    saveBundle('chemistry', 'c', chemBundle, storage);
    expect(listSlots('circuit', storage).sort()).toEqual(['a', 'b']);
    expect(listSlots('chemistry', storage)).toEqual(['c']);
  });

  test('P-8 · removeSlot deletes and returns true, false if missing', () => {
    const storage = createMockStorage();
    saveBundle('circuit', 'a', makeBundle(), storage);
    expect(removeSlot('circuit', 'a', storage)).toBe(true);
    expect(removeSlot('circuit', 'a', storage)).toBe(false);
  });

  test('P-9 · exportBundleJson + importBundleJson roundtrip', () => {
    const b = makeBundle();
    const json = exportBundleJson(b);
    const r = importBundleJson(json, 'circuit');
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.bundle.spec.components).toEqual(b.spec.components);
    }
  });

  test('P-10 · importBundleJson with domain mismatch returns shape-invalid', () => {
    const json = exportBundleJson(makeBundle());
    const r = importBundleJson(json, 'chemistry');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('shape-invalid');
  });
});

// ── Integration: state → bundle → jsonRoundTrip → loadBundle → state ─────

describe('integration · full roundtrip', () => {
  test('I-1 · state JSON roundtrip preserves editor state', () => {
    let s: EditorState = emptyEditorState('circuit');
    s = applyEditorAction(s, { type: 'placeComponent', kind: 'battery', position: { x: 40, y: 110 }, defaults: { voltage: 6 } });
    s = applyEditorAction(s, { type: 'placeComponent', kind: 'resistor', position: { x: 280, y: 110 }, defaults: { resistance: 10 } });
    s = applyEditorAction(s, { type: 'startWire', componentId: 'battery-1', port: 'positive', cursor: { x: 0, y: 0 } });
    s = applyEditorAction(s, { type: 'finishWire', componentId: 'resistor-1', port: 'a' });

    const bundle1 = bundleFromState(s);
    const json = JSON.stringify(bundle1);
    const parsed = JSON.parse(json) as AssemblyBundle;
    const s2 = applyEditorAction(emptyEditorState('circuit'), { type: 'loadBundle', bundle: parsed });
    const bundle2 = bundleFromState(s2);
    expect(JSON.stringify(bundle2)).toBe(JSON.stringify(bundle1));
  });
});

// ── C 阶段 · autoLayout action + loadBundle 自动补 layout ────────────────

describe('reducer · autoLayout action (C 阶段)', () => {
  test('R-11 · autoLayout action 后所有 placed.anchor 非 (0,0)', () => {
    let s: EditorState = emptyEditorState('circuit');
    s = applyEditorAction(s, { type: 'placeComponent', kind: 'battery', position: { x: 0, y: 0 } });
    s = applyEditorAction(s, { type: 'placeComponent', kind: 'resistor', position: { x: 0, y: 0 } });
    s = applyEditorAction(s, { type: 'placeComponent', kind: 'bulb', position: { x: 0, y: 0 } });
    s = applyEditorAction(s, { type: 'autoLayout' });
    expect(s.placed.length).toBe(3);
    // 至少 1 个 anchor 非 (0,0)（grid 从 60,60 起算，全部非零）
    expect(s.placed.every((p) => p.anchor.x !== 0 || p.anchor.y !== 0)).toBe(true);
  });

  test('R-12 · autoLayout 保持 placed 数量和 id 不变', () => {
    let s: EditorState = emptyEditorState('circuit');
    s = applyEditorAction(s, { type: 'placeComponent', kind: 'battery', position: { x: 100, y: 100 } });
    s = applyEditorAction(s, { type: 'placeComponent', kind: 'resistor', position: { x: 200, y: 200 } });
    const idsBefore = s.placed.map((p) => p.id).sort();
    s = applyEditorAction(s, { type: 'autoLayout', algorithm: 'grid' });
    const idsAfter = s.placed.map((p) => p.id).sort();
    expect(idsAfter).toEqual(idsBefore);
  });

  test('R-13 · loadBundle 无 layout + 全零 anchor → 自动补 layout (anchor 非 0)', () => {
    const bundle: AssemblyBundle = {
      spec: {
        domain: 'circuit',
        components: [
          { id: 'b1', kind: 'battery', props: {} },
          { id: 'r1', kind: 'resistor', props: {} },
          { id: 'l1', kind: 'bulb', props: {} },
        ],
        connections: [],
      },
      // 注意：无 layout 字段
    } as AssemblyBundle;
    const s = applyEditorAction(emptyEditorState('circuit'), { type: 'loadBundle', bundle });
    expect(s.placed.length).toBe(3);
    // grid 布局 → 至少一个 anchor 非 0
    const nonZeroCount = s.placed.filter((p) => p.anchor.x !== 0 || p.anchor.y !== 0).length;
    expect(nonZeroCount).toBe(3); // grid 从 (60,60) 起所有都非 0
  });

  test('R-14 · loadBundle 有 layout → 保留原 layout（不覆盖）', () => {
    const bundle: AssemblyBundle = {
      spec: {
        domain: 'circuit',
        components: [
          { id: 'b1', kind: 'battery', props: {} },
          { id: 'r1', kind: 'resistor', props: {} },
        ],
        connections: [],
      },
      layout: {
        domain: 'circuit',
        entries: [
          { componentId: 'b1', anchor: { x: 500, y: 500 } },
          { componentId: 'r1', anchor: { x: 700, y: 300 } },
        ],
      },
    };
    const s = applyEditorAction(emptyEditorState('circuit'), { type: 'loadBundle', bundle });
    const b1 = s.placed.find((p) => p.id === 'b1');
    const r1 = s.placed.find((p) => p.id === 'r1');
    expect(b1?.anchor).toEqual({ x: 500, y: 500 });
    expect(r1?.anchor).toEqual({ x: 700, y: 300 });
  });

  test('R-15 · loadBundle 有部分非零 anchor → 保留不自动补（保护用户数据）', () => {
    const bundle: AssemblyBundle = {
      spec: {
        domain: 'circuit',
        components: [
          { id: 'b1', kind: 'battery', props: {} },
          { id: 'r1', kind: 'resistor', props: {} },
        ],
        connections: [],
      },
      layout: {
        domain: 'circuit',
        entries: [
          { componentId: 'b1', anchor: { x: 42, y: 42 } },
          // r1 无 entry → 默认 (0, 0)
        ],
      },
    };
    const s = applyEditorAction(emptyEditorState('circuit'), { type: 'loadBundle', bundle });
    const b1 = s.placed.find((p) => p.id === 'b1');
    const r1 = s.placed.find((p) => p.id === 'r1');
    // 有 layout entries → 走保留路径，不触发 autoLayout
    expect(b1?.anchor).toEqual({ x: 42, y: 42 });
    expect(r1?.anchor).toEqual({ x: 0, y: 0 }); // 未自动补
  });

  test('R-16 · loadBundle 空 placed → 不 throw 不 autoLayout', () => {
    const bundle: AssemblyBundle = {
      spec: { domain: 'circuit', components: [], connections: [] },
    } as AssemblyBundle;
    const s = applyEditorAction(emptyEditorState('circuit'), { type: 'loadBundle', bundle });
    expect(s.placed.length).toBe(0);
  });
});

// ── D 阶段 · port-layout: componentBounds + snapToGrid ──────────────────

describe('D · componentBounds + snapToGrid', () => {
  const circuitPalette = [
    { kind: 'battery', hintSize: { width: 50, height: 40 } },
    { kind: 'resistor', hintSize: { width: 50, height: 40 } },
  ];
  const chemistryPalette = [
    { kind: 'flask', hintSize: { width: 60, height: 60 } },
    { kind: 'reagent', hintSize: { width: 60, height: 60 } },
  ];

  test('B-1 · componentBounds 走 palette.hintSize (circuit 50×40)', () => {
    const c = { kind: 'battery', anchor: { x: 100, y: 200 } };
    const b = componentBounds(c, circuitPalette);
    expect(b).toEqual({ x: 100, y: 200, width: 50, height: 40 });
  });

  test('B-2 · componentBounds 走 palette.hintSize (chemistry 60×60)', () => {
    const c = { kind: 'flask', anchor: { x: 300, y: 400 } };
    const b = componentBounds(c, chemistryPalette);
    expect(b).toEqual({ x: 300, y: 400, width: 60, height: 60 });
  });

  test('B-3 · componentBounds 对未知 kind fallback 50×40', () => {
    const c = { kind: 'unknown-kind', anchor: { x: 10, y: 20 } };
    const b = componentBounds(c, circuitPalette);
    expect(b).toEqual({ x: 10, y: 20, width: 50, height: 40 });
  });

  test('B-3b · componentBounds 对 palette entry 无 hintSize → fallback', () => {
    const palette = [{ kind: 'battery' }]; // 无 hintSize
    const c = { kind: 'battery', anchor: { x: 0, y: 0 } };
    const b = componentBounds(c, palette);
    expect(b).toEqual({ x: 0, y: 0, width: 50, height: 40 });
  });

  test('B-4 · isPointInBounds: 点在 AABB 内', () => {
    const b = { x: 100, y: 200, width: 50, height: 40 };
    expect(isPointInBounds({ x: 125, y: 220 }, b)).toBe(true);
    expect(isPointInBounds({ x: 100, y: 200 }, b)).toBe(true); // 左上角
    expect(isPointInBounds({ x: 150, y: 240 }, b)).toBe(true); // 右下角
  });

  test('B-4b · isPointInBounds: 点在 AABB 外', () => {
    const b = { x: 100, y: 200, width: 50, height: 40 };
    expect(isPointInBounds({ x: 99, y: 220 }, b)).toBe(false);
    expect(isPointInBounds({ x: 151, y: 220 }, b)).toBe(false);
    expect(isPointInBounds({ x: 125, y: 199 }, b)).toBe(false);
    expect(isPointInBounds({ x: 125, y: 241 }, b)).toBe(false);
  });

  test('B-5 · snapToGrid: grid=20 value=33 → 40', () => {
    expect(snapToGrid(33, 20)).toBe(40);
    expect(snapToGrid(30, 20)).toBe(40); // 30/20 = 1.5, round 到 2 → 40
    expect(snapToGrid(29, 20)).toBe(20);
    expect(snapToGrid(10, 20)).toBe(20); // 10/20 = 0.5, round 到 1 → 20
    expect(snapToGrid(9, 20)).toBe(0);
  });

  test('B-6 · snapToGrid: grid=0 → 不变', () => {
    expect(snapToGrid(33, 0)).toBe(33);
    expect(snapToGrid(-15.7, 0)).toBe(-15.7);
  });

  test('B-7 · snapToGrid: grid 负数/NaN/Infinity → 不变', () => {
    expect(snapToGrid(33, -5)).toBe(33);
    expect(snapToGrid(33, NaN)).toBe(33);
    expect(snapToGrid(33, Infinity)).toBe(33);
  });

  test('B-8 · snapToGrid: value 已经是 grid 倍数 → 不变', () => {
    expect(snapToGrid(40, 20)).toBe(40);
    expect(snapToGrid(0, 20)).toBe(0);
    expect(snapToGrid(-60, 20)).toBe(-60);
  });

  test('B-9 · snapPointToGrid 同时 snap x 和 y', () => {
    expect(snapPointToGrid({ x: 33, y: 47 }, 20)).toEqual({ x: 40, y: 40 });
  });
});

// ── D 阶段 · reducer: hoverComponent + moveComponent snap ───────────────

describe('D · reducer hoverComponent + snap', () => {
  test('R-17 · hoverComponent {id:"x"} → state.hoveredId="x"', () => {
    let s: EditorState = emptyEditorState('circuit');
    s = applyEditorAction(s, { type: 'placeComponent', kind: 'battery', position: { x: 0, y: 0 } });
    s = applyEditorAction(s, { type: 'hoverComponent', id: 'battery-1' });
    expect(s.hoveredId).toBe('battery-1');
  });

  test('R-18 · hoverComponent {id:null} → state.hoveredId=null', () => {
    let s: EditorState = emptyEditorState('circuit');
    s = applyEditorAction(s, { type: 'hoverComponent', id: 'x' });
    expect(s.hoveredId).toBe('x');
    s = applyEditorAction(s, { type: 'hoverComponent', id: null });
    expect(s.hoveredId).toBeNull();
  });

  test('R-19 · moveComponent with snapGrid=20 → anchor 对齐 20 倍数', () => {
    let s: EditorState = emptyEditorState('circuit');
    s = applyEditorAction(s, { type: 'placeComponent', kind: 'battery', position: { x: 0, y: 0 } });
    s = applyEditorAction(s, { type: 'moveComponent', id: 'battery-1', delta: { x: 33, y: 27 }, snapGrid: 20 });
    const p = s.placed.find((x) => x.id === 'battery-1');
    // 0+33=33 → snap 20 → 40;  0+27=27 → snap 20 → 20
    expect(p?.anchor.x).toBe(40);
    expect(p?.anchor.y).toBe(20);
  });

  test('R-20 · moveComponent 无 snapGrid → anchor 任意浮点', () => {
    let s: EditorState = emptyEditorState('circuit');
    s = applyEditorAction(s, { type: 'placeComponent', kind: 'battery', position: { x: 0, y: 0 } });
    s = applyEditorAction(s, { type: 'moveComponent', id: 'battery-1', delta: { x: 33.7, y: 27.3 } });
    const p = s.placed.find((x) => x.id === 'battery-1');
    expect(p?.anchor.x).toBeCloseTo(33.7);
    expect(p?.anchor.y).toBeCloseTo(27.3);
  });

  test('R-21 · setComponentAnchor 不 snap (保留精确值)', () => {
    let s: EditorState = emptyEditorState('circuit');
    s = applyEditorAction(s, { type: 'placeComponent', kind: 'battery', position: { x: 0, y: 0 } });
    s = applyEditorAction(s, { type: 'setComponentAnchor', id: 'battery-1', anchor: { x: 187.5, y: 142.3 } });
    const p = s.placed.find((x) => x.id === 'battery-1');
    expect(p?.anchor.x).toBe(187.5);
    expect(p?.anchor.y).toBe(142.3);
  });

  test('R-22 · loadBundle 不 snap (保留精确 layout entries)', () => {
    const bundle: AssemblyBundle = {
      spec: {
        domain: 'circuit',
        components: [{ id: 'b1', kind: 'battery', props: {} }],
        connections: [],
      },
      layout: {
        domain: 'circuit',
        entries: [{ componentId: 'b1', anchor: { x: 187.5, y: 142.3 } }],
      },
    };
    const s = applyEditorAction(emptyEditorState('circuit'), { type: 'loadBundle', bundle });
    const p = s.placed.find((x) => x.id === 'b1');
    expect(p?.anchor.x).toBe(187.5);
    expect(p?.anchor.y).toBe(142.3);
  });

  test('R-23 · moveComponent snapGrid=0 → 不 snap', () => {
    let s: EditorState = emptyEditorState('circuit');
    s = applyEditorAction(s, { type: 'placeComponent', kind: 'battery', position: { x: 0, y: 0 } });
    s = applyEditorAction(s, { type: 'moveComponent', id: 'battery-1', delta: { x: 33.7, y: 0 }, snapGrid: 0 });
    const p = s.placed.find((x) => x.id === 'battery-1');
    expect(p?.anchor.x).toBeCloseTo(33.7);
  });
});
