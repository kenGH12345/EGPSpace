/**
 * port-layout — coordinate helpers.
 *
 * Single entry point for all screen ↔ canvas coordinate transformations
 * (mitigates R-A coordinate-system drift).
 */

import type { ComponentAnchor } from '@/lib/framework';
import type { EditorCamera, PlacedComponent } from './editor-state';

/** 2D point. */
export interface Point {
  x: number;
  y: number;
}

/**
 * Convert a screen (client) coordinate to canvas logical coordinate,
 * accounting for camera offset and zoom.
 *
 *   canvas = (screen - cameraOffset) / zoom
 */
export function screenToCanvas(screen: Point, camera: EditorCamera): Point {
  return {
    x: (screen.x - camera.offset.x) / camera.zoom,
    y: (screen.y - camera.offset.y) / camera.zoom,
  };
}

/**
 * Convert a canvas logical coordinate to screen (client) coordinate.
 *
 *   screen = canvas * zoom + cameraOffset
 */
export function canvasToScreen(canvas: Point, camera: EditorCamera): Point {
  return {
    x: canvas.x * camera.zoom + camera.offset.x,
    y: canvas.y * camera.zoom + camera.offset.y,
  };
}

/** Port offset from a component's anchor (domain-config provided). */
export interface PortOffset {
  dx: number;
  dy: number;
}

/** Port layout lookup: kind → portName → offset. */
export type PortLayoutTable = Record<string, Record<string, PortOffset>>;

/**
 * Compute a port's position in canvas coordinates.
 * Returns the component anchor if portName is unknown (graceful fallback).
 */
export function getPortCanvasPos(
  component: Pick<PlacedComponent, 'kind' | 'anchor'>,
  portName: string,
  table: PortLayoutTable,
  palette: readonly PaletteHintEntry[] = [],
): Point {
  const kindEntry = table[component.kind];
  const offset = kindEntry?.[portName];
  if (!offset) {
    return { x: component.anchor.x, y: component.anchor.y };
  }
  
  let dx = offset.dx;
  let dy = offset.dy;
  
  const rotation = component.anchor.rotation || 0;
  if (rotation !== 0) {
    const entry = palette.find((p) => p.kind === component.kind);
    const size = entry?.hintSize ?? { width: 50, height: 40 };
    const cx = size.width / 2;
    const cy = size.height / 2;
    
    const angle = (rotation * Math.PI) / 180;
    const px = dx - cx;
    const py = dy - cy;
    dx = cx + px * Math.cos(angle) - py * Math.sin(angle);
    dy = cy + px * Math.sin(angle) + py * Math.cos(angle);
  }
  
  return {
    x: component.anchor.x + dx,
    y: component.anchor.y + dy,
  };
}

/**
 * Compute a port's position in screen coordinates (convenience).
 */
export function getPortScreenPos(
  component: Pick<PlacedComponent, 'kind' | 'anchor'>,
  portName: string,
  table: PortLayoutTable,
  camera: EditorCamera,
  palette: readonly PaletteHintEntry[] = [],
): Point {
  return canvasToScreen(getPortCanvasPos(component, portName, table, palette), camera);
}

/**
 * Hit-test: given a screen-space click, find the nearest port within `radiusPx`.
 * Returns `{componentId, portName, distance}` or null if none within radius.
 */
export function findPortAtScreen(
  screen: Point,
  components: PlacedComponent[],
  table: PortLayoutTable,
  camera: EditorCamera,
  radiusPx: number = 12,
  palette: readonly PaletteHintEntry[] = [],
): { componentId: string; portName: string; distance: number } | null {
  let best: { componentId: string; portName: string; distance: number } | null = null;
  for (const c of components) {
    const portTable = table[c.kind];
    if (!portTable) continue;
    for (const portName of Object.keys(portTable)) {
      const portScreen = getPortScreenPos(c, portName, table, camera, palette);
      const dx = portScreen.x - screen.x;
      const dy = portScreen.y - screen.y;
      const distance = Math.hypot(dx, dy);
      if (distance <= radiusPx && (best === null || distance < best.distance)) {
        best = { componentId: c.id, portName, distance };
      }
    }
  }
  return best;
}

/** Return the axis-aligned canvas-space anchor of a component, with placeholder rotation. */
export function componentAnchorPoint(component: PlacedComponent): Point {
  return { x: component.anchor.x, y: component.anchor.y };
}

/** Create a ComponentAnchor from a bare Point. */
export function pointToAnchor(p: Point): ComponentAnchor {
  return { x: p.x, y: p.y };
}

// ── D 阶段 · 元件几何边界（单点真相） ─────────────────────────────────────

/** Axis-aligned bounding box of a placed component, in canvas coords. */
export interface ComponentBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Minimal palette shape consumed by `componentBounds` (avoids config↔layout cycle). */
export interface PaletteHintEntry {
  kind: string;
  hintSize?: { width: number; height: number };
}

/** Default fallback size when palette entry missing or hintSize undefined. */
const DEFAULT_BOUNDS_SIZE = { width: 50, height: 40 } as const;

/**
 * Compute a component's AABB via its palette `hintSize`.
 * Falls back to 50×40 when kind not found or hintSize undefined — this keeps
 * legacy behavior for domains that haven't declared sizes yet.
 */
export function componentBounds(
  component: Pick<PlacedComponent, 'kind' | 'anchor'>,
  palette: readonly PaletteHintEntry[],
): ComponentBounds {
  const entry = palette.find((p) => p.kind === component.kind);
  const size = entry?.hintSize ?? DEFAULT_BOUNDS_SIZE;
  
  let width = size.width;
  let height = size.height;
  
  const rotation = component.anchor.rotation || 0;
  if (rotation % 180 !== 0) {
    width = size.height;
    height = size.width;
  }
  
  const cx = component.anchor.x + size.width / 2;
  const cy = component.anchor.y + size.height / 2;
  
  return {
    x: cx - width / 2,
    y: cy - height / 2,
    width,
    height,
  };
}

/**
 * Test whether a canvas-space point lies inside a component's AABB.
 */
export function isPointInBounds(point: Point, bounds: ComponentBounds): boolean {
  return (
    point.x >= bounds.x &&
    point.x <= bounds.x + bounds.width &&
    point.y >= bounds.y &&
    point.y <= bounds.y + bounds.height
  );
}

// ── D 阶段 · 网格对齐 ───────────────────────────────────────────────────

/**
 * Snap a scalar value to the nearest multiple of `grid`.
 * Returns value unchanged when `grid <= 0` (disabled) or non-finite.
 */
export function snapToGrid(value: number, grid: number): number {
  if (!Number.isFinite(grid) || grid <= 0) return value;
  return Math.round(value / grid) * grid;
}

/** Apply `snapToGrid` to both x and y of a point. */
export function snapPointToGrid(point: Point, grid: number): Point {
  return { x: snapToGrid(point.x, grid), y: snapToGrid(point.y, grid) };
}
