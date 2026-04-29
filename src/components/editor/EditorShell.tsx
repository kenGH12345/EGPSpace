'use client';

import React, { useReducer, useState, useCallback } from 'react';
import {
  applyEditorAction,
  emptyEditorState,
  getDomainConfig,
  getAvailableDomains,
  type EditorState,
  type EditorAction,
} from '@/lib/editor';
import type { ComponentDomain } from '@/lib/framework';
import { ComponentPalette } from './ComponentPalette';
import { EditorCanvas } from './EditorCanvas';
import { PropertyPanel } from './PropertyPanel';
import { RunControls } from './RunControls';

export interface EditorShellProps {
  initialDomain?: ComponentDomain;
}

/**
 * Top-level editor container. Owns the reducer state and layout.
 *
 * Layout:
 *   ┌──────────────────────────────────────────────────┐
 *   │  Header: domain switch + RunControls + I/O       │
 *   ├────────┬──────────────────────────┬──────────────┤
 *   │Palette │       EditorCanvas       │  Property    │
 *   │ (left) │        (center)          │  (right)     │
 *   └────────┴──────────────────────────┴──────────────┘
 */
export function EditorShell({ initialDomain = 'circuit' }: EditorShellProps) {
  const [state, dispatch] = useReducer(
    applyEditorAction as (s: EditorState, a: EditorAction) => EditorState,
    initialDomain,
    (d) => emptyEditorState(d),
  );
  const [runResult, setRunResult] = useState<Record<string, Record<string, unknown>> | undefined>(undefined);
  const [statusMsg, setStatusMsg] = useState<string>('');

  const config = getDomainConfig(state.domain);
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
    [state.placed.length],
  );

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
          config={config}
          onResult={(r, msg) => {
            setRunResult(r);
            setStatusMsg(msg);
          }}
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
          <ComponentPalette config={config} />
        </aside>

        <main className="flex-1 relative overflow-hidden">
          <EditorCanvas state={state} config={config} dispatch={dispatch} runResult={runResult} />
        </main>

        <aside className="w-64 border-l bg-white overflow-y-auto">
          <PropertyPanel state={state} config={config} dispatch={dispatch} runResult={runResult} />
        </aside>
      </div>

      {/* Footer */}
      <footer className="border-t bg-white px-4 py-1 text-xs text-slate-500 flex gap-4">
        <span>元件 {state.placed.length}</span>
        <span>连接 {state.connections.length}</span>
        <span>
          {state.selection.kind === 'component' && `选中: ${state.selection.id}`}
          {state.selection.kind === 'connection' && `选中连线 #${state.selection.index}`}
          {state.selection.kind === 'none' && '未选中'}
        </span>
        <span className="flex-1 text-right">Esc 取消连线 · Delete 删除选中</span>
      </footer>
    </div>
  );
}

export default EditorShell;
