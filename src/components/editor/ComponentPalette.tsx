'use client';

import React from 'react';
import type { EditorDomainConfig } from '@/lib/editor';
import { isMacroPaletteEntry } from '@/lib/editor/macro-config';

export interface ComponentPaletteProps {
  config: EditorDomainConfig;
  /**
   * Optional callback for removing a macro definition (T-4).
   * When provided, macro entries gain a hover-visible delete button.
   */
  onRemoveMacro?: (kind: string) => void;
}

/**
 * Left-side palette showing all available component kinds for the current
 * domain. Entries are split into two groups (T-4):
 *   - "原子组件": statically registered by the domain config
 *   - "我的元件": user-defined macros (kind.startsWith("macro:"))
 *
 * Each item is HTML5-draggable; EditorCanvas handles drop.
 * Drag payload: "kind" via dataTransfer text/plain.
 */
export function ComponentPalette({ config, onRemoveMacro }: ComponentPaletteProps) {
  const atomic = config.palette.filter((e) => !isMacroPaletteEntry(e));
  const macros = config.palette.filter(isMacroPaletteEntry);

  return (
    <div className="p-2 space-y-1">
      <h3 className="text-xs font-semibold text-slate-500 uppercase px-2 py-1">原子组件</h3>
      {atomic.map((entry) => (
        <PaletteItem key={entry.kind} entry={entry} />
      ))}

      <h3 className="text-xs font-semibold text-amber-700 uppercase px-2 py-1 pt-3">
        我的元件 {macros.length > 0 && <span className="text-slate-400">({macros.length})</span>}
      </h3>
      {macros.length === 0 ? (
        <p className="text-xs text-slate-400 px-2 py-1 italic">多选 2+ 组件后点击「封装」生成</p>
      ) : (
        macros.map((entry) => (
          <PaletteItem
            key={entry.kind}
            entry={entry}
            onRemove={onRemoveMacro ? () => onRemoveMacro(entry.kind) : undefined}
          />
        ))
      )}

      <p className="text-xs text-slate-400 px-2 pt-3 leading-relaxed">
        拖拽元件到画布放置；点击端口小圆点进行连线。
      </p>
    </div>
  );
}

function PaletteItem({
  entry,
  onRemove,
}: {
  entry: EditorDomainConfig['palette'][number];
  onRemove?: () => void;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('application/x-egp-kind', entry.kind);
        e.dataTransfer.setData('text/plain', entry.kind);
        e.dataTransfer.effectAllowed = 'copy';
      }}
      className="group flex items-center gap-2 px-2 py-2 rounded border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 cursor-grab active:cursor-grabbing select-none"
      title={entry.description ?? entry.displayName}
    >
      <span className="text-lg">{entry.icon}</span>
      <span className="text-sm text-slate-700 flex-1 truncate">{entry.displayName}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            if (confirm(`删除元件定义「${entry.displayName}」？（画布上已放置的实例会阻止删除）`)) {
              onRemove();
            }
          }}
          className="opacity-0 group-hover:opacity-100 text-xs text-red-500 hover:text-red-700 px-1"
          title="删除该自定义元件"
        >
          ✕
        </button>
      )}
    </div>
  );
}
