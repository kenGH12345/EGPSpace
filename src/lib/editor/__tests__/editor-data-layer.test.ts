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
