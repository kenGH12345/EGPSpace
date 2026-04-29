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
): Point {
  const kindEntry = table[component.kind];
  const offset = kindEntry?.[portName];
  if (!offset) {
    return { x: component.anchor.x, y: component.anchor.y };
  }
  return {
    x: component.anchor.x + offset.dx,
    y: component.anchor.y + offset.dy,
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
): Point {
  return canvasToScreen(getPortCanvasPos(component, portName, table), camera);
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
): { componentId: string; portName: string; distance: number } | null {
  let best: { componentId: string; portName: string; distance: number } | null = null;
  for (const c of components) {
    const portTable = table[c.kind];
    if (!portTable) continue;
    for (const portName of Object.keys(portTable)) {
      const portScreen = getPortScreenPos(c, portName, table, camera);
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
