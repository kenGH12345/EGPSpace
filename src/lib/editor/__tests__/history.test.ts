/**
 * history.test.ts — Wave 0 GATE
 *
 * 目标：验证 withHistory 高阶 reducer 的所有行为语义：
 * - 基础 undo/redo
 * - squash 合并策略
 * - maxPast FIFO
 * - 状态隔离
 * - 集成场景
 */

import {
  emptyHistory,
  withHistory,
  canUndo,
  canRedo,
  type HistoryState,
  type HistoryAction,
} from '../history';

// ── 测试 fixtures ──────────────────────────────────────────────────

interface TestState {
  count: number;
  label: string;
}

type TestAction =
  | { type: 'inc' }
  | { type: 'dec' }
  | { type: 'setLabel'; value: string }
  | { type: 'move'; id: string; x: number }
  | { type: 'noop' };

function testReducer(state: TestState, action: TestAction): TestState {
  switch (action.type) {
    case 'inc':
      return { ...state, count: state.count + 1 };
    case 'dec':
      return { ...state, count: state.count - 1 };
    case 'setLabel':
      return { ...state, label: action.value };
    case 'move':
      return { ...state, label: `${action.id}@${action.x}` };
    case 'noop':
      return state; // 返回同引用 → history 应 no-op
    default:
      return state;
  }
}

const baseOptions = {
  maxPast: 50,
  squash: {
    squashActions: new Set(['move', 'setLabel']),
    windowMs: 500,
    targetIdOf: (action: unknown) => {
      const a = action as { id?: string };
      return a.id;
    },
  },
};

// ── 测试用例 ────────────────────────────────────────────────────

describe('history · withHistory + emptyHistory', () => {
  test('H-1 · emptyHistory 初始状态正确', () => {
    const hs = emptyHistory<TestState>({ count: 0, label: 'init' });
    expect(hs.past).toEqual([]);
    expect(hs.present).toEqual({ count: 0, label: 'init' });
    expect(hs.future).toEqual([]);
    expect(canUndo(hs)).toBe(false);
    expect(canRedo(hs)).toBe(false);
  });

  test('H-2 · 普通 action 推入 past，present 更新，future 清空', () => {
    const reducer = withHistory(testReducer, { maxPast: 10 });
    let hs: HistoryState<TestState> = emptyHistory({ count: 0, label: 'init' });
    hs = reducer(hs, { type: 'inc' });
    expect(hs.past.length).toBe(1);
    expect(hs.past[0]).toEqual({ count: 0, label: 'init' });
    expect(hs.present).toEqual({ count: 1, label: 'init' });
    expect(hs.future).toEqual([]);
  });

  test('H-3 · __UNDO__ 把 past[top] 恢复为 present，present 推入 future', () => {
    const reducer = withHistory(testReducer, { maxPast: 10 });
    let hs: HistoryState<TestState> = emptyHistory({ count: 0, label: 'init' });
    hs = reducer(hs, { type: 'inc' });
    hs = reducer(hs, { type: 'inc' });
    // present={count:2}; past=[{0},{1}]
    hs = reducer(hs, { type: '__UNDO__' });
    expect(hs.present.count).toBe(1);
    expect(hs.past.length).toBe(1);
    expect(hs.future.length).toBe(1);
    expect(hs.future[0].count).toBe(2);
  });

  test('H-4 · __REDO__ 把 future[0] 恢复为 present，present 推入 past', () => {
    const reducer = withHistory(testReducer, { maxPast: 10 });
    let hs: HistoryState<TestState> = emptyHistory({ count: 0, label: 'init' });
    hs = reducer(hs, { type: 'inc' });
    hs = reducer(hs, { type: 'inc' });
    hs = reducer(hs, { type: '__UNDO__' });
    // present={1}; future=[{2}]
    hs = reducer(hs, { type: '__REDO__' });
    expect(hs.present.count).toBe(2);
    expect(hs.future.length).toBe(0);
    expect(hs.past.length).toBe(2);
  });

  test('H-5 · __UNDO__ 在 past=[] 时 no-op', () => {
    const reducer = withHistory(testReducer, { maxPast: 10 });
    const hs0: HistoryState<TestState> = emptyHistory({ count: 0, label: 'init' });
    const hs1 = reducer(hs0, { type: '__UNDO__' });
    expect(hs1).toBe(hs0); // same reference
  });

  test('H-6 · __REDO__ 在 future=[] 时 no-op', () => {
    const reducer = withHistory(testReducer, { maxPast: 10 });
    let hs: HistoryState<TestState> = emptyHistory({ count: 0, label: 'init' });
    hs = reducer(hs, { type: 'inc' });
    const hsBefore = hs;
    hs = reducer(hs, { type: '__REDO__' });
    expect(hs).toBe(hsBefore);
  });

  test('H-7 · 普通 action 清空 future（防止分叉历史）', () => {
    const reducer = withHistory(testReducer, { maxPast: 10 });
    let hs: HistoryState<TestState> = emptyHistory({ count: 0, label: 'init' });
    hs = reducer(hs, { type: 'inc' }); // count=1
    hs = reducer(hs, { type: 'inc' }); // count=2
    hs = reducer(hs, { type: '__UNDO__' }); // present=1 future=[{2}]
    expect(hs.future.length).toBe(1);
    hs = reducer(hs, { type: 'inc' }); // 新 action → future 清空
    expect(hs.future.length).toBe(0);
    expect(hs.present.count).toBe(2);
  });

  test('H-8 · canUndo/canRedo 正确反映 past/future 长度', () => {
    const reducer = withHistory(testReducer, { maxPast: 10 });
    let hs: HistoryState<TestState> = emptyHistory({ count: 0, label: 'init' });
    expect(canUndo(hs)).toBe(false);
    expect(canRedo(hs)).toBe(false);
    hs = reducer(hs, { type: 'inc' });
    expect(canUndo(hs)).toBe(true);
    expect(canRedo(hs)).toBe(false);
    hs = reducer(hs, { type: '__UNDO__' });
    expect(canUndo(hs)).toBe(false);
    expect(canRedo(hs)).toBe(true);
  });

  test('H-9 · squash: 同 type 同 targetId 300ms 内连续 push → past 仍 = 1', () => {
    let t = 1000;
    const reducer = withHistory(testReducer, { ...baseOptions, now: () => t });
    let hs: HistoryState<TestState> = emptyHistory({ count: 0, label: 'init' });
    hs = reducer(hs, { type: 'move', id: 'a', x: 10 });
    t += 100;
    hs = reducer(hs, { type: 'move', id: 'a', x: 20 });
    t += 100;
    hs = reducer(hs, { type: 'move', id: 'a', x: 30 });
    expect(hs.past.length).toBe(1);
    expect(hs.present.label).toBe('a@30'); // 合并的是最新
  });

  test('H-10 · squash: 同 type 不同 targetId → past = 2', () => {
    let t = 1000;
    const reducer = withHistory(testReducer, { ...baseOptions, now: () => t });
    let hs: HistoryState<TestState> = emptyHistory({ count: 0, label: 'init' });
    hs = reducer(hs, { type: 'move', id: 'a', x: 10 });
    t += 100;
    hs = reducer(hs, { type: 'move', id: 'b', x: 20 }); // 不同 id → 新 push
    expect(hs.past.length).toBe(2);
  });

  test('H-11 · squash: 同 type 同 targetId 但 > windowMs → past = 2', () => {
    let t = 1000;
    const reducer = withHistory(testReducer, { ...baseOptions, now: () => t });
    let hs: HistoryState<TestState> = emptyHistory({ count: 0, label: 'init' });
    hs = reducer(hs, { type: 'move', id: 'a', x: 10 });
    t += 600; // 超 windowMs=500
    hs = reducer(hs, { type: 'move', id: 'a', x: 20 });
    expect(hs.past.length).toBe(2);
  });

  test('H-12 · squash: 非 squashActions 中的 action → 总是 push', () => {
    let t = 1000;
    const reducer = withHistory(testReducer, { ...baseOptions, now: () => t });
    let hs: HistoryState<TestState> = emptyHistory({ count: 0, label: 'init' });
    hs = reducer(hs, { type: 'inc' });
    t += 50;
    hs = reducer(hs, { type: 'inc' });
    t += 50;
    hs = reducer(hs, { type: 'inc' });
    // inc 不在 squashActions → 每次都 push
    expect(hs.past.length).toBe(3);
  });

  test('H-13 · maxPast=5 超过后最早的被 FIFO 丢弃', () => {
    const reducer = withHistory(testReducer, { maxPast: 5 });
    let hs: HistoryState<TestState> = emptyHistory({ count: 0, label: 'init' });
    for (let i = 0; i < 10; i++) {
      hs = reducer(hs, { type: 'inc' });
    }
    // 10 次 inc：past 长度应被截断到 5
    expect(hs.past.length).toBe(5);
    // past[0] 应该是 count=5（因为 count=0..4 的快照被丢了）
    expect(hs.past[0].count).toBe(5);
    expect(hs.present.count).toBe(10);
  });

  test('H-14 · __RESET_HISTORY__ 清空 past/future 并设新 present', () => {
    const reducer = withHistory(testReducer, { maxPast: 10 });
    let hs: HistoryState<TestState> = emptyHistory({ count: 0, label: 'init' });
    hs = reducer(hs, { type: 'inc' });
    hs = reducer(hs, { type: 'inc' });
    hs = reducer(hs, { type: '__UNDO__' });
    expect(hs.past.length).toBe(1);
    expect(hs.future.length).toBe(1);
    const resetAction: HistoryAction<TestAction, TestState> = { type: '__RESET_HISTORY__', state: { count: 99, label: 'reset' } };
    hs = reducer(hs, resetAction);
    expect(hs.past).toEqual([]);
    expect(hs.future).toEqual([]);
    expect(hs.present).toEqual({ count: 99, label: 'reset' });
  });

  test('H-15 · state 快照隔离：修改 present 对象引用不影响 past', () => {
    const reducer = withHistory(testReducer, { maxPast: 10 });
    let hs: HistoryState<TestState> = emptyHistory({ count: 0, label: 'init' });
    hs = reducer(hs, { type: 'inc' });
    hs = reducer(hs, { type: 'inc' });
    const pastSnapshot0Count = hs.past[0].count;
    const pastSnapshot1Count = hs.past[1].count;
    // 即使业务层直接 mutate present（不该这么做但防御性测试），past 应不变
    // （这里 reducer 用 spread 创建新对象，所以 past[N] 不和 present 共享引用）
    expect(pastSnapshot0Count).toBe(0);
    expect(pastSnapshot1Count).toBe(1);
    expect(hs.present.count).toBe(2);
    // past[N] 的 count 不会因为后续 inc 改变
    hs = reducer(hs, { type: 'inc' });
    expect(hs.past[0].count).toBe(0);
    expect(hs.past[1].count).toBe(1);
  });

  test('H-16 · integration: 多次 action + undo + redo 组合', () => {
    const reducer = withHistory(testReducer, { maxPast: 10 });
    let hs: HistoryState<TestState> = emptyHistory({ count: 0, label: 'init' });
    hs = reducer(hs, { type: 'inc' }); // 1
    hs = reducer(hs, { type: 'inc' }); // 2
    hs = reducer(hs, { type: 'dec' }); // 1
    hs = reducer(hs, { type: '__UNDO__' }); // 2
    hs = reducer(hs, { type: '__UNDO__' }); // 1
    expect(hs.present.count).toBe(1);
    expect(hs.future.length).toBe(2);
    hs = reducer(hs, { type: '__REDO__' }); // 2
    hs = reducer(hs, { type: '__REDO__' }); // 1
    expect(hs.present.count).toBe(1);
    expect(hs.future.length).toBe(0);
  });

  test('H-17 · reducer 返回同引用 → history no-op（不 push past）', () => {
    const reducer = withHistory(testReducer, { maxPast: 10 });
    let hs: HistoryState<TestState> = emptyHistory({ count: 0, label: 'init' });
    hs = reducer(hs, { type: 'inc' });
    const hsBefore = hs;
    hs = reducer(hs, { type: 'noop' }); // 返回同引用
    expect(hs).toBe(hsBefore);
  });

  test('H-18 · ignoreActions: action 在集合里 → present 更新但 past/future 不变', () => {
    const reducer = withHistory(testReducer, {
      maxPast: 10,
      ignoreActions: new Set(['setLabel']),
    });
    let hs: HistoryState<TestState> = emptyHistory({ count: 0, label: 'init' });
    hs = reducer(hs, { type: 'inc' });
    hs = reducer(hs, { type: '__UNDO__' });
    // 此时 past=[], future=[{count:1}], present={count:0,label:'init'}
    expect(hs.past.length).toBe(0);
    expect(hs.future.length).toBe(1);

    // 触发 ignoreActions 中的 action：present 更新但 past/future 不变
    hs = reducer(hs, { type: 'setLabel', value: 'hovered' });
    expect(hs.present.label).toBe('hovered'); // present 已变
    expect(hs.past.length).toBe(0); // 不进 past
    expect(hs.future.length).toBe(1); // future 不被清空！
  });

  test('H-19 · ignoreActions + 其他 action 混合 → 其他 action 正常 push', () => {
    const reducer = withHistory(testReducer, {
      maxPast: 10,
      ignoreActions: new Set(['setLabel']),
    });
    let hs: HistoryState<TestState> = emptyHistory({ count: 0, label: 'init' });
    hs = reducer(hs, { type: 'setLabel', value: 'a' }); // ignored
    hs = reducer(hs, { type: 'setLabel', value: 'b' }); // ignored
    hs = reducer(hs, { type: 'inc' }); // 正常 push
    hs = reducer(hs, { type: 'setLabel', value: 'c' }); // ignored
    expect(hs.past.length).toBe(1); // 只有 inc 进 past
    expect(hs.present).toEqual({ count: 1, label: 'c' });
    // 撤销 inc 回到 label='b'（setLabel 走过的最后一次但不在 history）
    hs = reducer(hs, { type: '__UNDO__' });
    expect(hs.present.count).toBe(0);
    // 注意 label 会回到 past[0] 里存的 label='b'（inc 之前的 setLabel 结果）
    expect(hs.present.label).toBe('b');
  });
});

