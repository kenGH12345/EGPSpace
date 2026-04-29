/**
 * @module editor
 *
 * Pure TypeScript data layer for the interactive experiment editor.
 *
 * Design (B-2 · zero React):
 *   Every file under this module MUST be free of React imports. React UI
 *   components consume this module, never the other way around. This lets us
 *   unit-test state logic in plain Node/jest.
 */

// ── State ────────────────────────────────────────────────────────────────
export type {
  PlacedComponent,
  EditorSelection,
  DraftWire,
  EditorCamera,
  EditorState,
} from './editor-state';
export { emptyEditorState, cloneEditorState } from './editor-state';

// ── Reducer ──────────────────────────────────────────────────────────────
export type { EditorAction } from './editor-state-reducer';
export { applyEditorAction } from './editor-state-reducer';

// ── Port layout / coordinate utilities ───────────────────────────────────
export type { Point, PortOffset, PortLayoutTable, ComponentBounds, PaletteHintEntry } from './port-layout';
export {
  screenToCanvas,
  canvasToScreen,
  getPortCanvasPos,
  getPortScreenPos,
  findPortAtScreen,
  componentAnchorPoint,
  pointToAnchor,
  componentBounds,
  isPointInBounds,
  snapToGrid,
  snapPointToGrid,
} from './port-layout';

// ── Bundle export ────────────────────────────────────────────────────────
export { bundleFromState } from './bundle-from-state';

// ── Persistence ──────────────────────────────────────────────────────────
export type { SaveResult, LoadResult } from './persistence';
export {
  STORAGE_PREFIX,
  storageKey,
  saveBundle,
  loadBundle,
  listSlots,
  removeSlot,
  exportBundleJson,
  importBundleJson,
} from './persistence';

// ── Editor config (pluggable per-domain) ─────────────────────────────────
export type {
  PaletteEntry,
  PropSchema,
  CanvasDrawer,
  ConnectionSpec,
  EditorDomainConfig,
} from './editor-config';
export { PORT_RADIUS_PX, PORT_HIT_RADIUS_PX } from './editor-config';
export {
  EDITOR_DOMAIN_CONFIGS,
  getAvailableDomains,
  getDomainConfig,
  circuitEditorConfig,
  chemistryEditorConfig,
} from './domain-configs';

// ── Engine dispatch ──────────────────────────────────────────────────────
export type { EngineComputeResult, RunBundleResult } from './engine-dispatch';
export { runEditorBundle, extractPerComponent } from './engine-dispatch';

// ── Layout (C 阶段) ──────────────────────────────────────────────────────
export type { LayoutAlgorithm, LayoutInput, LayoutOutput, Position } from './layout';
export {
  autoLayout,
  gridLayout,
  forceLayout,
  mulberry32,
  seedFromIds,
  boundingBox,
  centerAt,
} from './layout';

// ── History (C 阶段) ─────────────────────────────────────────────────────
export type {
  HistoryState,
  HistoryAction,
  HistoryControlAction,
  SquashOptions,
  HistoryOptions,
} from './history';
export { emptyHistory, withHistory, canUndo, canRedo } from './history';
