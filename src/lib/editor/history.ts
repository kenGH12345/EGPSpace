/**
 * history.ts — 高阶 reducer 包装实现撤销/重做
 *
 * 设计要点（ADR: C 阶段 D-1 ~ D-5）：
 * - 状态快照模式：past/present/future 存完整 state，undo/redo 零成本
 * - Squash 策略：同 actionType + 同 targetId + 时间窗内连续 push 合并为 1 条
 * - maxPast FIFO：超过 50 步最早的被丢弃（防内存溢出）
 * - 零 React 依赖：纯 TS 高阶函数，可独立 jest 测试
 *
 * 对业务 reducer 零侵入：业务 reducer 无需感知 history 层的存在。
 */

/** 历史状态容器：过去快照栈 + 当前 + 未来快照栈 */
export interface HistoryState<S> {
  readonly past: readonly S[];
  readonly present: S;
  readonly future: readonly S[];
}

/** 内部控制 action（以 __ 前缀区隔业务 action） */
export type HistoryControlAction<S> =
  | { type: '__UNDO__' }
  | { type: '__REDO__' }
  | { type: '__RESET_HISTORY__'; state: S };

/** 对外 action = 业务 action ∪ 控制 action */
export type HistoryAction<A, S> = A | HistoryControlAction<S>;

/** Squash 配置 */
export interface SquashOptions {
  /** 需要合并的 actionType 集合（其他 action 永远 push 新条目） */
  readonly squashActions: ReadonlySet<string>;
  /** 时间窗口（ms）；窗口内同 key 连续 push 合并 */
  readonly windowMs: number;
  /** 从业务 action 提取目标 id（用于 squash 判同）；返回 undefined 表示无 targetId */
  readonly targetIdOf?: (action: unknown) => string | undefined;
}

/** withHistory 选项 */
export interface HistoryOptions {
  /** past 最大长度；超出按 FIFO 丢弃最早 */
  readonly maxPast: number;
  /** Squash 配置；若不设则每个 action 都 push 新条目 */
  readonly squash?: SquashOptions;
  /**
   * Transient action 白名单（D 阶段）：在此集合内的 action type 会更新 present 但
   * **完全不影响 history**（past 不变 / future 不变 / meta 不变）。用于 hover
   * 之类的纯交互态反馈，避免污染 undo 栈。
   */
  readonly ignoreActions?: ReadonlySet<string>;
  /** 当前时间源（测试可注入） */
  readonly now?: () => number;
}

/** 创建空历史状态（past/future 为空，present = initial） */
export function emptyHistory<S>(initial: S): HistoryState<S> {
  return { past: [], present: initial, future: [] };
}

/** 是否可撤销 */
export function canUndo<S>(hs: HistoryState<S>): boolean {
  return hs.past.length > 0;
}

/** 是否可重做 */
export function canRedo<S>(hs: HistoryState<S>): boolean {
  return hs.future.length > 0;
}

/** Squash 内部记账（用 WeakMap 外置状态，避免污染 HistoryState） */
interface SquashMeta {
  lastActionType: string | null;
  lastTargetId: string | undefined;
  lastPushAt: number;
}

/**
 * 包装业务 reducer 为带历史的 reducer。
 *
 * @param reducer 业务 reducer（纯函数 (S, A) => S）
 * @param options 历史选项（maxPast / squash / now）
 * @returns 新 reducer (HistoryState<S>, HistoryAction<A, S>) => HistoryState<S>
 */
export function withHistory<S, A extends { type: string }>(
  reducer: (state: S, action: A) => S,
  options: HistoryOptions,
): (hs: HistoryState<S>, action: HistoryAction<A, S>) => HistoryState<S> {
  const now = options.now ?? (() => Date.now());
  const meta: SquashMeta = { lastActionType: null, lastTargetId: undefined, lastPushAt: 0 };

  return function historyReducer(hs: HistoryState<S>, action: HistoryAction<A, S>): HistoryState<S> {
    // ── 控制 action ────────────────────────────────────────────────
    if (action.type === '__UNDO__') {
      if (hs.past.length === 0) return hs;
      const prev = hs.past[hs.past.length - 1];
      const newPast = hs.past.slice(0, -1);
      meta.lastActionType = null; // 撤销后重置 squash 记账
      return { past: newPast, present: prev, future: [hs.present, ...hs.future] };
    }

    if (action.type === '__REDO__') {
      if (hs.future.length === 0) return hs;
      const next = hs.future[0];
      const newFuture = hs.future.slice(1);
      meta.lastActionType = null;
      return { past: [...hs.past, hs.present], present: next, future: newFuture };
    }

    if (action.type === '__RESET_HISTORY__') {
      const resetAction = action as { type: '__RESET_HISTORY__'; state: S };
      meta.lastActionType = null;
      return emptyHistory(resetAction.state);
    }

    // ── 业务 action ────────────────────────────────────────────────
    const businessAction = action as A;
    const nextPresent = reducer(hs.present, businessAction);

    // reducer 未改变引用 → no-op（不 push history）
    if (Object.is(nextPresent, hs.present)) {
      return hs;
    }

    // D 阶段: ignoreActions 白名单 · 更新 present 但完全不影响 history（past/future/meta 不变）
    if (options.ignoreActions?.has(businessAction.type)) {
      return { past: hs.past, present: nextPresent, future: hs.future };
    }

    // 判断是否 squash
    const currentType = businessAction.type;
    const currentTargetId = options.squash?.targetIdOf?.(businessAction);
    const currentAt = now();

    const shouldSquash =
      options.squash !== undefined &&
      options.squash.squashActions.has(currentType) &&
      meta.lastActionType === currentType &&
      meta.lastTargetId === currentTargetId &&
      currentAt - meta.lastPushAt <= options.squash.windowMs;

    if (shouldSquash) {
      // squash: past 不变，仅更新 present + 刷新时间戳
      meta.lastPushAt = currentAt;
      return { past: hs.past, present: nextPresent, future: [] };
    }

    // 正常 push：present → past；新 nextPresent 成 present；future 清空（分叉历史丢弃）
    meta.lastActionType = currentType;
    meta.lastTargetId = currentTargetId;
    meta.lastPushAt = currentAt;

    let newPast = [...hs.past, hs.present];
    // FIFO: 超出 maxPast 丢最早
    if (newPast.length > options.maxPast) {
      newPast = newPast.slice(newPast.length - options.maxPast);
    }

    return { past: newPast, present: nextPresent, future: [] };
  };
}
