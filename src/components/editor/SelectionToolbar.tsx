'use client';

import React from 'react';
import type { EditorState } from '@/lib/editor';

export interface SelectionToolbarProps {
  state: EditorState;
  onEncapsulate: () => void;
  onClearSelection: () => void;
  onUnpack?: (id: string) => void;
}

/**
 * Floating toolbar shown above the canvas when the user has either:
 *   - a multi-selection (offers "封装")
 *   - a single-selection of a macro instance (offers "解散")
 *
 * Positioned absolutely by the parent.
 */
export function SelectionToolbar({
  state,
  onEncapsulate,
  onClearSelection,
  onUnpack,
}: SelectionToolbarProps) {
  if (state.selection.kind === 'multi') {
    const count = state.selection.ids.length;
    return (
      <div className="flex items-center gap-2 bg-white/95 backdrop-blur border rounded-lg shadow px-3 py-1.5 text-sm">
        <span className="text-slate-600">
          已选 <span className="font-semibold text-slate-900">{count}</span> 个组件
        </span>
        <span className="w-px h-4 bg-slate-300" />
        <button
          type="button"
          onClick={onEncapsulate}
          disabled={count < 2}
          className="px-2 py-1 rounded bg-blue-600 text-white text-xs hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
          title={count < 2 ? '至少需要 2 个组件才能封装' : '封装为自定义元件'}
        >
          📦 封装…
        </button>
        <button
          type="button"
          onClick={onClearSelection}
          className="px-2 py-1 rounded border text-xs text-slate-600 hover:bg-slate-50"
          title="取消选择"
        >
          清除
        </button>
      </div>
    );
  }

  if (state.selection.kind === 'component' && onUnpack) {
    const selectedId = state.selection.id;
    const comp = state.placed.find((p) => p.id === selectedId);
    if (comp && comp.kind.startsWith('macro:')) {
      const def = state.macros[comp.kind];
      const displayName = def?.spec.metadata?.name ?? comp.kind.replace(/^macro:/, '');
      return (
        <div className="flex items-center gap-2 bg-white/95 backdrop-blur border rounded-lg shadow px-3 py-1.5 text-sm">
          <span className="text-slate-600">
            元件 <span className="font-semibold text-slate-900">📦 {displayName}</span>
          </span>
          <span className="w-px h-4 bg-slate-300" />
          <button
            type="button"
            onClick={() => onUnpack(selectedId)}
            className="px-2 py-1 rounded bg-amber-600 text-white text-xs hover:bg-amber-700"
            title="把该元件解散为内部组件"
          >
            🔓 解散
          </button>
        </div>
      );
    }
  }

  return null;
}
