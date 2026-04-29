'use client';

import React from 'react';
import type {
  EditorAction,
  EditorState,
  EditorDomainConfig,
  PropSchema,
  PaletteEntry,
} from '@/lib/editor';

export interface PropertyPanelProps {
  state: EditorState;
  config: EditorDomainConfig;
  dispatch: React.Dispatch<EditorAction>;
  runResult?: Record<string, Record<string, unknown>>;
}

/**
 * Right-side inspector. Shows props for the selected component and a live
 * panel of solved values (after a Run).
 */
export function PropertyPanel({ state, config, dispatch, runResult }: PropertyPanelProps) {
  const sel = state.selection;

  if (sel.kind === 'component') {
    const placed = state.placed.find((p) => p.id === sel.id);
    const entry = placed ? config.palette.find((e) => e.kind === placed.kind) : undefined;
    if (!placed || !entry) {
      return (
        <div className="p-4 text-sm text-slate-500">
          <p>选中的元件不存在，请重新选择。</p>
        </div>
      );
    }
    return (
      <div className="p-4 space-y-3">
        <header>
          <div className="text-xs uppercase text-slate-400">元件属性</div>
          <div className="text-sm font-medium text-slate-800">
            {entry.icon} {entry.displayName}
          </div>
          <div className="text-xs text-slate-500">id: {placed.id}</div>
        </header>

        <div className="space-y-2">
          {(entry.propSchema ?? []).map((schema) => (
            <PropInput
              key={schema.key}
              schema={schema}
              value={placed.props[schema.key]}
              onChange={(v) => dispatch({ type: 'updateProp', id: placed.id, key: schema.key, value: v })}
            />
          ))}
          {(!entry.propSchema || entry.propSchema.length === 0) && (
            <p className="text-xs text-slate-400">该元件无可编辑属性。</p>
          )}
        </div>

        <LiveValues runValues={runResult?.[placed.id]} />

        <div className="pt-3 border-t">
          <button
            className="w-full text-xs px-2 py-1.5 border border-red-300 text-red-600 rounded hover:bg-red-50"
            onClick={() => dispatch({ type: 'deleteSelection' })}
          >
            删除元件 (Del)
          </button>
        </div>

        <AnchorPreview anchor={placed.anchor} />
      </div>
    );
  }

  if (sel.kind === 'connection') {
    const conn = state.connections[sel.index];
    if (!conn) {
      return (
        <div className="p-4 text-sm text-slate-500">
          <p>连线不存在。</p>
        </div>
      );
    }
    return (
      <div className="p-4 space-y-3">
        <header>
          <div className="text-xs uppercase text-slate-400">连线</div>
          <div className="text-sm font-medium text-slate-800">连接 #{sel.index}</div>
        </header>
        <table className="text-xs text-slate-600 w-full">
          <tbody>
            <tr>
              <td className="font-medium pr-2 py-0.5">From</td>
              <td>{conn.from.componentId}.{conn.from.portName}</td>
            </tr>
            <tr>
              <td className="font-medium pr-2 py-0.5">To</td>
              <td>{conn.to.componentId}.{conn.to.portName}</td>
            </tr>
          </tbody>
        </table>
        <button
          className="w-full text-xs px-2 py-1.5 border border-red-300 text-red-600 rounded hover:bg-red-50"
          onClick={() => dispatch({ type: 'deleteSelection' })}
        >
          删除连线 (Del)
        </button>
      </div>
    );
  }

  // No selection — show info / hints
  return (
    <div className="p-4 space-y-3 text-sm text-slate-600">
      <header className="text-xs uppercase text-slate-400">未选中</header>
      <p className="text-xs leading-relaxed">
        从左侧拖拽元件到画布。选中元件后可在此编辑属性、删除元件。
      </p>
      <OverviewSummary
        palette={config.palette}
        placed={state.placed}
      />
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────

function PropInput({
  schema,
  value,
  onChange,
}: {
  schema: PropSchema;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  if (schema.type === 'number') {
    return (
      <label className="block">
        <span className="text-xs text-slate-500">{schema.label}{schema.unit ? ` (${schema.unit})` : ''}</span>
        <input
          type="number"
          value={typeof value === 'number' ? value : ''}
          min={schema.min}
          max={schema.max}
          step={schema.step}
          onChange={(e) => {
            const v = e.target.value === '' ? 0 : Number(e.target.value);
            onChange(Number.isFinite(v) ? v : 0);
          }}
          className="mt-0.5 w-full border rounded px-2 py-1 text-sm"
        />
      </label>
    );
  }
  if (schema.type === 'boolean') {
    return (
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={!!value}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="text-sm text-slate-700">{schema.label}</span>
      </label>
    );
  }
  if (schema.type === 'select') {
    return (
      <label className="block">
        <span className="text-xs text-slate-500">{schema.label}</span>
        <select
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          className="mt-0.5 w-full border rounded px-2 py-1 text-sm"
        >
          {(schema.options ?? []).map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>
    );
  }
  // fallback: string
  return (
    <label className="block">
      <span className="text-xs text-slate-500">{schema.label}</span>
      <input
        type="text"
        value={String(value ?? '')}
        onChange={(e) => onChange(e.target.value)}
        className="mt-0.5 w-full border rounded px-2 py-1 text-sm"
      />
    </label>
  );
}

function LiveValues({ runValues }: { runValues?: Record<string, unknown> }) {
  if (!runValues) {
    return (
      <div className="p-2 bg-slate-50 rounded text-xs text-slate-400">
        运行后显示实时数值
      </div>
    );
  }
  const entries = Object.entries(runValues);
  if (entries.length === 0) return null;
  return (
    <div className="p-2 bg-emerald-50 border border-emerald-100 rounded">
      <div className="text-xs uppercase text-emerald-700 mb-1">运行结果</div>
      <table className="text-xs text-slate-700 w-full">
        <tbody>
          {entries.map(([k, v]) => (
            <tr key={k}>
              <td className="font-mono pr-2 py-0.5 text-slate-500">{k}</td>
              <td className="font-mono">{formatValue(v)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatValue(v: unknown): string {
  if (typeof v === 'number') {
    if (Number.isInteger(v)) return v.toString();
    return v.toFixed(3);
  }
  if (v === null || v === undefined) return '—';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

function AnchorPreview({ anchor }: { anchor: { x: number; y: number } }) {
  return (
    <div className="text-xs text-slate-400 font-mono">
      anchor: ({Math.round(anchor.x)}, {Math.round(anchor.y)})
    </div>
  );
}

function OverviewSummary({
  palette,
  placed,
}: {
  palette: PaletteEntry[];
  placed: Array<{ kind: string }>;
}) {
  const counts = new Map<string, number>();
  for (const p of placed) counts.set(p.kind, (counts.get(p.kind) ?? 0) + 1);
  if (counts.size === 0) return null;
  return (
    <div className="space-y-1">
      <div className="text-xs uppercase text-slate-400 mt-3">画布统计</div>
      {palette.map((e) => {
        const c = counts.get(e.kind);
        if (!c) return null;
        return (
          <div key={e.kind} className="flex justify-between text-xs">
            <span>{e.icon} {e.displayName}</span>
            <span className="font-mono text-slate-500">{c}</span>
          </div>
        );
      })}
    </div>
  );
}
