'use client';

import React, { useCallback, useRef, useState } from 'react';
import {
  bundleFromState,
  exportBundleJson,
  importBundleJson,
  listSlots,
  loadBundle,
  removeSlot,
  runEditorBundle,
  extractPerComponent,
  saveBundle,
  type EditorDomainConfig,
  type EditorState,
} from '@/lib/editor';
import type { AssemblyBundle, ComponentDomain } from '@/lib/framework';
import type { LayoutAlgorithm } from '@/lib/editor';

export interface RunControlsProps {
  state: EditorState;
  config: EditorDomainConfig;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onAutoLayout: (algorithm: LayoutAlgorithm) => void;
  onResult: (per: Record<string, Record<string, unknown>>, msg: string) => void;
  onStatus: (msg: string) => void;
  onLoadState: (bundle: AssemblyBundle<ComponentDomain>) => void;
}

/**
 * Header controls: Undo/Redo / AutoLayout / Run / Save / Load / Export / Import.
 */
export function RunControls({
  state,
  config,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onAutoLayout,
  onResult,
  onStatus,
  onLoadState,
}: RunControlsProps) {
  const [running, setRunning] = useState(false);
  const [slots, setSlots] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshSlots = useCallback(() => {
    setSlots(listSlots(state.domain));
  }, [state.domain]);

  const onRun = useCallback(async () => {
    const errors = config.validateBundle
      ? config.validateBundle(state.placed.length, state.connections.length)
      : [];
    if (errors.length > 0) {
      onStatus(`⚠ ${errors.join(' · ')}`);
      return;
    }
    setRunning(true);
    onStatus('运行中...');
    const bundle = bundleFromState(state);
    const r = await runEditorBundle(state.domain, bundle);
    setRunning(false);
    if (!r.ok || !r.result) {
      onStatus(`❌ 运行失败: ${r.error ?? 'unknown'}`);
      return;
    }
    if (r.result.state === 'error') {
      const msg = (r.result.values.errorMessage as string) ?? r.result.explanation ?? 'error';
      onStatus(`❌ 引擎返回错误: ${msg}`);
      return;
    }
    const perC = extractPerComponent(r.result);
    onResult(perC, `✅ 已运行 · state=${r.result.state}`);
  }, [state, config, onResult, onStatus]);

  const onSave = useCallback(() => {
    const slot = prompt('保存为存档名', 'untitled');
    if (!slot) return;
    const r = saveBundle(state.domain, slot, bundleFromState(state));
    if (r.ok) {
      onStatus(`💾 已保存: ${r.key}`);
      refreshSlots();
    } else {
      onStatus(`❌ 保存失败: ${r.reason} — ${r.message}`);
    }
  }, [state, onStatus, refreshSlots]);

  const onLoad = useCallback(
    (slot: string) => {
      if (!slot) return;
      const r = loadBundle(state.domain, slot);
      if (r.ok) {
        onLoadState(r.bundle);
        onStatus(`📂 已加载: ${slot}`);
      } else {
        onStatus(`❌ 加载失败: ${r.reason}`);
      }
    },
    [state.domain, onLoadState, onStatus],
  );

  const onDelete = useCallback(
    (slot: string) => {
      if (!slot) return;
      if (!confirm(`删除存档 "${slot}"？`)) return;
      if (removeSlot(state.domain, slot)) {
        onStatus(`🗑 已删除: ${slot}`);
        refreshSlots();
      }
    },
    [state.domain, onStatus, refreshSlots],
  );

  const onExport = useCallback(() => {
    const bundle = bundleFromState(state);
    const json = exportBundleJson(bundle);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `egpspace-${state.domain}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onStatus('📤 已导出 JSON');
  }, [state, onStatus]);

  const onImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const onImportFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const text = await file.text();
      const r = importBundleJson(text, state.domain);
      e.target.value = '';
      if (r.ok) {
        onLoadState(r.bundle);
        onStatus(`📥 已导入: ${file.name}`);
      } else {
        onStatus(`❌ 导入失败: ${r.reason}`);
      }
    },
    [state.domain, onLoadState, onStatus],
  );

  return (
    <div className="flex items-center gap-1">
      {/* Undo/Redo */}
      <button
        className="px-2 py-1 text-sm rounded border hover:bg-slate-50 disabled:opacity-40"
        onClick={onUndo}
        disabled={!canUndo}
        title="撤销 (Ctrl+Z)"
      >
        ↶
      </button>
      <button
        className="px-2 py-1 text-sm rounded border hover:bg-slate-50 disabled:opacity-40"
        onClick={onRedo}
        disabled={!canRedo}
        title="重做 (Ctrl+Y / Ctrl+Shift+Z)"
      >
        ↷
      </button>

      {/* AutoLayout dropdown */}
      <select
        className="text-sm border rounded px-2 py-1 bg-white"
        onChange={(e) => {
          const v = e.target.value as LayoutAlgorithm | '';
          if (v) onAutoLayout(v);
          e.target.value = '';
        }}
        defaultValue=""
        title="自动布局"
        disabled={state.placed.length === 0}
      >
        <option value="" disabled>
          ⊞ 自动布局
        </option>
        <option value="grid">网格布局</option>
        <option value="force">力导向布局</option>
      </select>

      <span className="w-px h-5 bg-slate-300 mx-1" />

      <button
        className="px-3 py-1 text-sm rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
        onClick={onRun}
        disabled={running || state.placed.length === 0}
      >
        ▶ 运行
      </button>
      <button className="px-2 py-1 text-sm rounded border hover:bg-slate-50" onClick={onSave}>
        💾 保存
      </button>
      <select
        className="text-sm border rounded px-2 py-1 bg-white"
        onFocus={refreshSlots}
        onChange={(e) => {
          if (e.target.value) onLoad(e.target.value);
          e.target.value = '';
        }}
        defaultValue=""
      >
        <option value="" disabled>
          📂 加载 ({slots.length})
        </option>
        {slots.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      {slots.length > 0 && (
        <select
          className="text-sm border rounded px-2 py-1 bg-white"
          onChange={(e) => {
            if (e.target.value) onDelete(e.target.value);
            e.target.value = '';
          }}
          defaultValue=""
        >
          <option value="" disabled>
            🗑 删除
          </option>
          {slots.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      )}
      <button className="px-2 py-1 text-sm rounded border hover:bg-slate-50" onClick={onExport}>
        📤 导出
      </button>
      <button className="px-2 py-1 text-sm rounded border hover:bg-slate-50" onClick={onImportClick}>
        📥 导入
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={onImportFile}
      />
    </div>
  );
}
