/**
 * EditorDomainConfig — pluggable per-domain configuration for the editor.
 *
 * Design (D-4):
 *   Each domain contributes one config file that aggregates:
 *     - palette: which kinds the user can drag onto the canvas
 *     - portLayout: where each port sits relative to the component anchor
 *     - drawers: how to render each kind on the canvas (TS mirror of JS drawers)
 *     - defaultProps: starting props for newly placed components
 *
 * Extensibility (AC-B7): adding a new domain requires ONLY creating a new
 * config file; the editor core (reducer, canvas, shell) does not change.
 */

import type { ComponentDomain } from '@/lib/framework';
import type { PortLayoutTable, PortOffset } from './port-layout';

export type { PortLayoutTable, PortOffset };

/** One palette entry — a kind the user can drag onto the canvas. */
export interface PaletteEntry {
  kind: string;
  displayName: string;
  /** Emoji or short unicode icon (kept text-only for SSR safety). */
  icon: string;
  description?: string;
  /** Starting props when placed. Missing values fall back to component-type defaults. */
  defaultProps: Record<string, unknown>;
  /** Optional schema for PropertyPanel to render appropriate inputs. */
  propSchema?: PropSchema[];
  /** Visual hint size (used by drawer + hit-test). */
  hintSize?: { width: number; height: number };
}

/** Describes one editable prop on PropertyPanel. */
export interface PropSchema {
  key: string;
  label: string;
  type: 'number' | 'string' | 'boolean' | 'select';
  /** Only for 'number' */
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  /** Only for 'select' */
  options?: Array<{ value: string; label: string }>;
}

/**
 * A canvas drawer function. Called per-frame (on state change) for each placed
 * component.
 *   - ctx: 2D rendering context
 *   - component: the placed component (has id, kind, props, anchor)
 *   - values: optional per-component solved values from the engine (e.g.
 *     current, voltage). Undefined when not running.
 *   - selected: whether this component is currently selected
 */
export type CanvasDrawer = (
  ctx: CanvasRenderingContext2D,
  component: { id: string; kind: string; props: Record<string, unknown>; anchor: { x: number; y: number; rotation?: number } },
  values: Record<string, unknown> | undefined,
  selected: boolean,
) => void;

/** A connection kind definition (visual style + validation). */
export interface ConnectionSpec {
  /** Stroke color in CSS notation. */
  stroke: string;
  /** Stroke width in canvas pixels. */
  strokeWidth: number;
  /** Optional dash pattern (e.g. [5,5]). */
  dash?: number[];
}

/** Full per-domain config. */
export interface EditorDomainConfig<D extends ComponentDomain = ComponentDomain> {
  domain: D;
  /** Kinds that appear in the palette, in display order. */
  palette: PaletteEntry[];
  /** Port offsets by kind → portName. */
  portLayout: PortLayoutTable;
  /** Drawers by kind. */
  drawers: Record<string, CanvasDrawer>;
  /** Default connection style for this domain. */
  connection: ConnectionSpec;
  /**
   * Optional bundle validator run before Engine.compute. Return an array of
   * error messages (empty = valid).
   */
  validateBundle?: (placedCount: number, connectionCount: number) => string[];
  /** Human-readable domain label for UI. */
  displayName: string;
  /** Optional description shown in the domain switcher. */
  description?: string;
}

/** Port radius in canvas pixels (used by PortHotspots). */
export const PORT_RADIUS_PX = 6;

/** Click tolerance for port hit-test, in screen pixels. */
export const PORT_HIT_RADIUS_PX = 12;
