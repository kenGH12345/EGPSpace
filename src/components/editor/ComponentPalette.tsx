'use client';

import React from 'react';
import type { EditorDomainConfig } from '@/lib/editor';

export interface ComponentPaletteProps {
  config: EditorDomainConfig;
}

/**
 * Left-side palette showing all available component kinds for the current
 * domain. Each item is HTML5-draggable; EditorCanvas handles drop.
 *
 * Drag payload: "kind" via dataTransfer text/plain.
 */
export function ComponentPalette({ config }: ComponentPaletteProps) {
  return (
    <div className="p-2 space-y-1">
      <h3 className="text-xs font-semibold text-slate-500 uppercase px-2 py-1">元件</h3>
      {config.palette.map((entry) => (
        <div
          key={entry.kind}
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData('application/x-egp-kind', entry.kind);
            e.dataTransfer.setData('text/plain', entry.kind); // compatibility
            e.dataTransfer.effectAllowed = 'copy';
          }}
          className="flex items-center gap-2 px-2 py-2 rounded border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 cursor-grab active:cursor-grabbing select-none"
          title={entry.description ?? entry.displayName}
        >
          <span className="text-lg">{entry.icon}</span>
          <span className="text-sm text-slate-700">{entry.displayName}</span>
        </div>
      ))}
      <p className="text-xs text-slate-400 px-2 pt-3 leading-relaxed">
        拖拽元件到画布放置；点击端口小圆点进行连线。
      </p>
    </div>
  );
}
