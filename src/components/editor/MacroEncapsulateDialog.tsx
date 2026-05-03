'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { EditorState } from '@/lib/editor';
import type { MacroExportPortMap } from '@/lib/framework';
import { classifyConnections, buildDefaultExportPortMap } from '@/lib/editor';

export interface MacroEncapsulateDialogProps {
  state: EditorState;
  open: boolean;
  onCancel: () => void;
  onConfirm: (args: {
    kind: string;
    name: string;
    description?: string;
    exportPortMap?: MacroExportPortMap;
  }) => void;
}

/**
 * Modal dialog to encapsulate the current multi-selection into a reusable macro.
 *
 * UX contract (H3 — no default name, force explicit input):
 *   - User MUST provide a non-empty name
 *   - kind is auto-derived from name (slugify + "macro:" prefix), but can be edited
 *   - Shows inner component count + planned exported port count as live feedback
 *   - Preflight validation (multi-selection size >= 2, not already used kind)
 *   - On confirm: emits a complete action payload via onConfirm
 */
export function MacroEncapsulateDialog({
  state,
  open,
  onCancel,
  onConfirm,
}: MacroEncapsulateDialogProps) {
  const [name, setName] = useState('');
  const [kind, setKind] = useState('');
  const [kindEdited, setKindEdited] = useState(false);
  const [description, setDescription] = useState('');

  // Reset form each time the dialog opens
  useEffect(() => {
    if (open) {
      setName('');
      setKind('');
      setKindEdited(false);
      setDescription('');
    }
  }, [open]);

  // Auto-derive kind from name while user hasn't manually edited kind
  useEffect(() => {
    if (!kindEdited) {
      const slug = name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setKind(slug ? `macro:${slug}` : '');
    }
  }, [name, kindEdited]);

  const preview = useMemo(() => {
    if (state.selection.kind !== 'multi') {
      return { innerCount: 0, portCount: 0, crossDomain: false };
    }
    const selectedIds = new Set(state.selection.ids);
    const innerComps = state.placed.filter((p) => selectedIds.has(p.id));
    const { boundary } = classifyConnections(selectedIds, state.connections);
    const { exportPortMap } = buildDefaultExportPortMap(selectedIds, boundary);
    return {
      innerCount: innerComps.length,
      portCount: Object.keys(exportPortMap).length,
      crossDomain: innerComps.length !== state.selection.ids.length,
    };
  }, [state.selection, state.placed, state.connections]);

  const errors: string[] = [];
  if (state.selection.kind !== 'multi' || state.selection.ids.length < 2) {
    errors.push('需要先选中 ≥ 2 个组件（按住 Shift 点击组件）');
  }
  if (open && !name.trim()) errors.push('元件名称不能为空');
  if (open && !/^macro:[a-z0-9][a-z0-9-]*$/.test(kind)) {
    errors.push('kind 必须匹配 "macro:小写字母或数字开头的短横线串"');
  }
  if (open && Object.prototype.hasOwnProperty.call(state.macros, kind)) {
    errors.push(`kind "${kind}" 已存在（会覆盖定义）`);
  }
  if (preview.crossDomain) errors.push('存在未解析组件，请重新选择');

  const canSubmit = open && errors.filter((e) => !e.includes('会覆盖')).length === 0;

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!canSubmit) return;
      onConfirm({
        kind,
        name: name.trim(),
        description: description.trim() || undefined,
      });
    },
    [canSubmit, kind, name, description, onConfirm],
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      role="dialog"
      aria-modal="true"
      aria-labelledby="macro-dialog-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-xl w-[28rem] max-w-[90vw] p-5 space-y-4"
      >
        <h2 id="macro-dialog-title" className="text-lg font-semibold text-slate-800">
          封装为自定义元件
        </h2>

        <div className="text-xs text-slate-600 bg-slate-50 rounded px-3 py-2">
          内部组件 <span className="font-mono text-slate-800">{preview.innerCount}</span> 个 · 导出端口{' '}
          <span className="font-mono text-slate-800">{preview.portCount}</span> 个
        </div>

        <label className="block">
          <span className="text-sm text-slate-700">名称（必填）</span>
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如：RC 低通滤波器"
            className="mt-1 w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </label>

        <label className="block">
          <span className="text-sm text-slate-700">标识（kind）</span>
          <input
            type="text"
            value={kind}
            onChange={(e) => {
              setKind(e.target.value);
              setKindEdited(true);
            }}
            placeholder="macro:your-kind"
            className="mt-1 w-full border rounded px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <span className="text-xs text-slate-400 mt-1 block">
            自动从名称生成，可手动调整；必须唯一（同名会覆盖定义）。
          </span>
        </label>

        <label className="block">
          <span className="text-sm text-slate-700">描述（可选）</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="mt-1 w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </label>

        {errors.length > 0 && (
          <ul className="text-xs text-amber-700 bg-amber-50 rounded px-3 py-2 space-y-0.5">
            {errors.map((err, i) => (
              <li key={i}>• {err}</li>
            ))}
          </ul>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-sm rounded border hover:bg-slate-50"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="px-3 py-1.5 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            封装
          </button>
        </div>
      </form>
    </div>
  );
}
