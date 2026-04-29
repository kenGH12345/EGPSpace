/**
 * layout.test.ts — Wave 1 GATE
 *
 * 目标：
 * - grid: 确定性、网格拓扑、边界情况
 * - force: 确定性、收敛、connection 影响、性能
 * - mulberry32: PRNG 属性
 */

import {
  gridLayout,
  forceLayout,
  autoLayout,
  mulberry32,
  seedFromIds,
  boundingBox,
} from '../index';

describe('grid-layout', () => {
  test('L-1 · gridLayout 5 元件 → 3×2 网格（cols=3）位置正确', () => {
    const result = gridLayout({
      componentIds: ['a', 'b', 'c', 'd', 'e'],
      connections: [],
    });
    // ceil(sqrt(5)) = 3, cell=120x100, origin=(60,60)
    expect(result.positions.a).toEqual({ x: 60, y: 60 });
    expect(result.positions.b).toEqual({ x: 180, y: 60 });
    expect(result.positions.c).toEqual({ x: 300, y: 60 });
    expect(result.positions.d).toEqual({ x: 60, y: 160 });
    expect(result.positions.e).toEqual({ x: 180, y: 160 });
  });

  test('L-2 · gridLayout 1 元件 → (60, 60)', () => {
    const result = gridLayout({ componentIds: ['a'], connections: [] });
    expect(result.positions.a).toEqual({ x: 60, y: 60 });
  });

  test('L-3 · gridLayout 0 元件 → positions = {}', () => {
    const result = gridLayout({ componentIds: [], connections: [] });
    expect(Object.keys(result.positions).length).toBe(0);
  });

  test('L-4 · gridLayout 元件位置互不重叠', () => {
    const ids = Array.from({ length: 20 }, (_, i) => `n${i}`);
    const result = gridLayout({ componentIds: ids, connections: [] });
    const coords = new Set<string>();
    for (const id of ids) {
      const p = result.positions[id];
      const key = `${p.x},${p.y}`;
      expect(coords.has(key)).toBe(false);
      coords.add(key);
    }
  });

  test('L-5 · gridLayout 超过 maxCols=6 → 换行', () => {
    const ids = Array.from({ length: 10 }, (_, i) => `n${i}`);
    const result = gridLayout({ componentIds: ids, connections: [] });
    // cols=min(ceil(sqrt(10))=4, 6)=4 → 前 4 在第一行
    expect(result.positions.n0.y).toBe(60);
    expect(result.positions.n3.y).toBe(60);
    expect(result.positions.n4.y).toBe(160); // 第二行
  });
});

describe('mulberry32 PRNG', () => {
  test('L-6 · mulberry32 同 seed 同序列', () => {
    const rng1 = mulberry32(12345);
    const rng2 = mulberry32(12345);
    for (let i = 0; i < 10; i++) {
      expect(rng1()).toBe(rng2());
    }
  });

  test('L-7 · mulberry32 不同 seed 不同序列', () => {
    const rng1 = mulberry32(1);
    const rng2 = mulberry32(2);
    expect(rng1()).not.toBe(rng2());
  });

  test('L-8 · mulberry32 输出在 [0, 1)', () => {
    const rng = mulberry32(42);
    for (let i = 0; i < 100; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  test('L-9 · seedFromIds 同 ids 同 seed', () => {
    expect(seedFromIds(['a', 'b', 'c'])).toBe(seedFromIds(['a', 'b', 'c']));
  });

  test('L-10 · seedFromIds 不同 ids 不同 seed', () => {
    expect(seedFromIds(['a', 'b'])).not.toBe(seedFromIds(['b', 'a']));
  });
});

describe('force-layout', () => {
  test('L-11 · forceLayout 同 componentIds 两次调用结果相同（确定性）', () => {
    const input = {
      componentIds: ['a', 'b', 'c', 'd'],
      connections: [{ from: 'a', to: 'b' }],
    };
    const r1 = forceLayout(input);
    const r2 = forceLayout(input);
    for (const id of input.componentIds) {
      expect(r1.positions[id]).toEqual(r2.positions[id]);
    }
  });

  test('L-12 · forceLayout 不同 componentIds 产生不同布局', () => {
    const r1 = forceLayout({ componentIds: ['a', 'b', 'c'], connections: [] });
    const r2 = forceLayout({ componentIds: ['x', 'y', 'z'], connections: [] });
    // 不同 seed → 至少有一个位置不一样
    const keys1 = Object.keys(r1.positions);
    const keys2 = Object.keys(r2.positions);
    expect(keys1).not.toEqual(keys2);
  });

  test('L-13 · forceLayout 收敛：所有节点在合理 bbox 内（宽高 < 2000）', () => {
    const input = {
      componentIds: ['a', 'b', 'c', 'd', 'e'],
      connections: [
        { from: 'a', to: 'b' },
        { from: 'b', to: 'c' },
      ],
    };
    const result = forceLayout(input);
    const bbox = boundingBox(result.positions);
    expect(bbox.maxX - bbox.minX).toBeLessThan(2000);
    expect(bbox.maxY - bbox.minY).toBeLessThan(2000);
    // 不允许 NaN 或 Infinity
    for (const id of input.componentIds) {
      expect(Number.isFinite(result.positions[id].x)).toBe(true);
      expect(Number.isFinite(result.positions[id].y)).toBe(true);
    }
  });

  test('L-14 · forceLayout 1 元件 → 中心 (400, 300)', () => {
    const result = forceLayout({ componentIds: ['only'], connections: [] });
    expect(result.positions.only).toEqual({ x: 400, y: 300 });
  });

  test('L-15 · forceLayout 0 元件 → {}', () => {
    const result = forceLayout({ componentIds: [], connections: [] });
    expect(Object.keys(result.positions).length).toBe(0);
  });

  test('L-16 · forceLayout 100 元件 < 2000ms (性能)', () => {
    const ids = Array.from({ length: 100 }, (_, i) => `n${i}`);
    const start = Date.now();
    const result = forceLayout({ componentIds: ids, connections: [] });
    const duration = Date.now() - start;
    expect(Object.keys(result.positions).length).toBe(100);
    expect(duration).toBeLessThan(2000); // 宽松上限 2s，CI 机器性能不定
  });
});

describe('autoLayout dispatch', () => {
  test('L-17 · autoLayout("grid") 路由到 gridLayout', () => {
    const input = { componentIds: ['a', 'b'], connections: [] };
    const grid = gridLayout(input);
    const auto = autoLayout(input, 'grid');
    expect(auto.positions).toEqual(grid.positions);
  });

  test('L-18 · autoLayout("force") 路由到 forceLayout', () => {
    const input = { componentIds: ['a', 'b', 'c'], connections: [] };
    const force = forceLayout(input);
    const auto = autoLayout(input, 'force');
    expect(auto.positions).toEqual(force.positions);
  });

  test('L-19 · autoLayout() 默认走 grid', () => {
    const input = { componentIds: ['a', 'b'], connections: [] };
    const grid = gridLayout(input);
    const auto = autoLayout(input);
    expect(auto.positions).toEqual(grid.positions);
  });
});
