'use client';

import React, { useReducer, useState, useCallback, useEffect, useMemo } from 'react';
import {
  applyEditorAction,
  emptyEditorState,
  getDomainConfig,
  getAvailableDomains,
  withHistory,
  emptyHistory,
  canUndo as historyCanUndo,
  canRedo as historyCanRedo,
  type EditorState,
  type EditorAction,
  type HistoryState,
  type HistoryAction,
} from '@/lib/editor';
import { mergeConfigWithMacros } from '@/lib/editor/macro-config';
import type { ComponentDomain, AssemblyBundle } from '@/lib/framework';
import { ComponentPalette } from './ComponentPalette';
import { EditorCanvas } from './EditorCanvas';
import { PropertyPanel } from './PropertyPanel';
import { RunControls } from './RunControls';
import { SelectionToolbar } from './SelectionToolbar';
import { MacroEncapsulateDialog } from './MacroEncapsulateDialog';
import { useAutoRun } from './useAutoRun';

export interface EditorShellProps {
  initialDomain?: ComponentDomain;
  initialBundle?: AssemblyBundle;
}

// Squash: 连续 moveComponent / updateProp / updateWireCursor 合并为一条历史
const HISTORY_OPTIONS = {
  maxPast: 50,
  squash: {
    squashActions: new Set(['moveComponent', 'updateProp', 'updateWireCursor', 'setCamera']),
    windowMs: 500,
    targetIdOf: (action: unknown): string | undefined => {
      const a = action as { id?: string; componentId?: string };
      return a.id ?? a.componentId;
    },
  },
  // D 阶段: transient action 白名单 · 不污染 undo 栈
  ignoreActions: new Set(['hoverComponent']),
};

type HEditorState = HistoryState<EditorState>;
type HEditorAction = HistoryAction<EditorAction, EditorState>;

/**
 * Top-level editor container. Owns the history-wrapped reducer state.
 *
 * C 阶段：引入 withHistory 包装，支持撤销/重做
 */
export function EditorShell({ initialDomain = 'circuit', initialBundle }: EditorShellProps) {
  // 用 useMemo 保证 reducer 稳定引用（withHistory 内部有 squash meta 状态，不能每次 render 新建）
  const historyReducer = useMemo(
    () =>
      withHistory<EditorState, EditorAction>(
        applyEditorAction as (s: EditorState, a: EditorAction) => EditorState,
        HISTORY_OPTIONS,
      ),
    [],
  );

  const [historyState, hDispatch] = useReducer(
    historyReducer as (s: HEditorState, a: HEditorAction) => HEditorState,
    initialDomain,
    (d) => {
      const targetDomain = initialBundle?.spec?.domain ?? d;
      const emptyState = emptyEditorState(targetDomain);
      const state = initialBundle?.spec
        ? applyEditorAction(emptyState, { type: 'loadBundle', bundle: initialBundle })
        : emptyState;
      return emptyHistory(state);
    }
  );

  const state = historyState.present;
  const canUndo = historyCanUndo(historyState);
  const canRedo = historyCanRedo(historyState);

  // 兼容层：外部组件仍然 dispatch 业务 action，内部透传给 history reducer
  const dispatch = useCallback((action: EditorAction) => {
    hDispatch(action as HEditorAction);
  }, []);

  // 提取 AI 生成的 Schema 并进行布局
  useEffect(() => {
    // 优先读取新的配置键名，其次兜底旧键名
    const aiSchemaStr = sessionStorage.getItem('eureka_experiment_config') || sessionStorage.getItem('ai-generated-schema');
    if (aiSchemaStr) {
      try {
        const schema = JSON.parse(aiSchemaStr);
        if (schema.components && schema.components.length > 0) {
          // Wrap into an AssemblyBundle format
          const bundle: AssemblyBundle = {
            spec: {
              domain: schema.domain || initialDomain,
              components: schema.components,
              connections: schema.connections || [],
            },
          };
          // 清除标志，避免刷新重复加载
          sessionStorage.removeItem('eureka_experiment_config');
          sessionStorage.removeItem('ai-generated-schema');
          dispatch({ type: 'loadBundle', bundle });
        }
      } catch (e) {
        console.error('Failed to load AI generated schema', e);
      }
    }
  }, [dispatch, initialDomain]);

  const undo = useCallback(() => hDispatch({ type: '__UNDO__' }), []);
  const redo = useCallback(() => hDispatch({ type: '__REDO__' }), []);

  const [runResult, setRunResult] = useState<Record<string, Record<string, unknown>> | undefined>(undefined);
  const [statusMsg, setStatusMsg] = useState<string>('');
  const [encapsulateOpen, setEncapsulateOpen] = useState(false);

  useAutoRun(
    state,
    (perC, msg) => {
      setRunResult(perC);
      setStatusMsg(msg);
    },
    setStatusMsg
  );

  const config = getDomainConfig(state.domain);
  const mergedConfig = useMemo(
    () => mergeConfigWithMacros(config, state.macros),
    [config, state.macros],
  );
  const availableDomains = getAvailableDomains();

  const onDomainSwitch = useCallback(
    (d: ComponentDomain) => {
      if (state.placed.length > 0) {
        const ok = confirm('切换领域将清空当前画布，确定继续？（建议先保存）');
        if (!ok) return;
      }
      dispatch({ type: 'switchDomain', domain: d });
      setRunResult(undefined);
      setStatusMsg('');
    },
    [state.placed.length, dispatch],
  );

  // ── 键盘快捷键 Ctrl+Z / Ctrl+Shift+Z / Ctrl+Y ──────────────────────────
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      // 输入框内不拦截（AC-C15）
      const tgt = e.target as HTMLElement | null;
      if (tgt && (tgt.tagName === 'INPUT' || tgt.tagName === 'TEXTAREA' || tgt.isContentEditable)) {
        return;
      }
      const ctrlOrMeta = e.ctrlKey || e.metaKey;
      if (!ctrlOrMeta) return;
      if (e.key === 'z' || e.key === 'Z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if (e.key === 'y' || e.key === 'Y') {
        e.preventDefault();
        redo();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [undo, redo]);

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header */}
      <header className="flex items-center gap-4 px-4 py-2 border-b bg-white shadow-sm">
        <h1 className="text-lg font-semibold text-slate-800">EGPSpace 实验编辑器</h1>

        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">领域:</span>
          <select
            value={state.domain}
            onChange={(e) => onDomainSwitch(e.target.value as ComponentDomain)}
            className="text-sm border rounded px-2 py-1 bg-white"
          >
            {availableDomains.map((d) => {
              const cfg = getDomainConfig(d);
              return (
                <option key={d} value={d}>
                  {cfg.displayName}
                </option>
              );
            })}
          </select>
        </div>

        <div className="flex-1" />

        <RunControls
          state={state}
          config={mergedConfig}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={undo}
          onRedo={redo}
          onAutoLayout={(algorithm) => dispatch({ type: 'autoLayout', algorithm })}
          onStatus={setStatusMsg}
          onLoadState={(bundle) => {
            dispatch({ type: 'loadBundle', bundle });
            setRunResult(undefined);
            setStatusMsg('已加载');
          }}
        />

        {statusMsg && (
          <span className="text-xs text-slate-600 min-w-[12rem] text-right">{statusMsg}</span>
        )}
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-48 border-r bg-white overflow-y-auto">
          <ComponentPalette
            config={mergedConfig}
            onRemoveMacro={(kind) => dispatch({ type: 'removeMacro', key: kind })}
          />
        </aside>

        <main className="flex-1 relative overflow-hidden">
          <EditorCanvas state={state} config={mergedConfig} dispatch={dispatch} runResult={runResult} />
          {(() => {
            const sel = state.selection;
            const showToolbar =
              sel.kind === 'multi' ||
              (sel.kind === 'component' &&
                state.placed.find((p) => p.id === sel.id)?.kind.startsWith('macro:'));
            if (!showToolbar) return null;
            return (
              <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10">
                <SelectionToolbar
                  state={state}
                  onEncapsulate={() => setEncapsulateOpen(true)}
                  onClearSelection={() => dispatch({ type: 'selectComponent', id: null })}
                  onUnpack={(id) => {
                    dispatch({ type: 'unpackMacro', id });
                    setStatusMsg('🔓 元件已解散');
                  }}
                />
              </div>
            );
          })()}
        </main>

        <aside className="w-64 border-l bg-white overflow-y-auto">
          <PropertyPanel state={state} config={mergedConfig} dispatch={dispatch} runResult={runResult} />
        </aside>
      </div>

      {/* Footer */}
      <footer className="border-t bg-white px-4 py-1 text-xs text-slate-500 flex gap-4">
        <span>元件 {state.placed.length}</span>
        <span>连接 {state.connections.length}</span>
        <span>
          {state.selection.kind === 'component' && `选中: ${state.selection.id}`}
          {state.selection.kind === 'connection' && `选中连线 #${state.selection.index}`}
          {state.selection.kind === 'multi' && `已选 ${state.selection.ids.length} 个组件`}
          {state.selection.kind === 'none' && '未选中'}
        </span>
        <span className="flex-1 text-right">Ctrl+Z 撤销 · Ctrl+Y 重做 · Esc 取消连线 · Delete 删除选中 · Shift+点击 多选</span>
      </footer>

      <MacroEncapsulateDialog
        state={state}
        open={encapsulateOpen}
        onCancel={() => setEncapsulateOpen(false)}
        onConfirm={({ kind, name, description }) => {
          dispatch({
            type: 'encapsulateSelection',
            kind,
            metadata: { name, description },
          });
          setEncapsulateOpen(false);
          setStatusMsg(`✅ 已封装: ${name}`);
        }}
      />
    </div>
  );
}

export default EditorShell;
