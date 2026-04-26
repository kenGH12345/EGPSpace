/**
 * Knowledge Graph: Data Types
 *
 * Defines the graph model for educational knowledge visualization.
 *
 * Design decisions:
 * - Node subject maps to SubjectDomain (physics/chemistry/biology/math/geography)
 * - Node status tracks learning progression
 * - Edge weight represents strength of relationship (0-1)
 * - Node position is managed by graph-engine.ts, stored here for persistence
 */

import type { SubjectDomain } from '../../experiment-schema';

/* ─── Node ─── */

export type NodeStatus = 'unlearned' | 'learning' | 'mastered' | 'review';

export interface KnowledgeNode {
  id: string;                // Unique ID (e.g. "chem-ph-012")
  label: string;            // Human-readable label
  subject: SubjectDomain;    // Discipline
  topic: string;            // Sub-topic (e.g. "acid-base", "mechanics")
  description?: string;

  status: NodeStatus;
  progress: number;          // 0-100 completion percentage

  x: number;                // Layout position (managed by layout engine)
  y: number;
  vx?: number;              // Velocity (for force-directed simulation)
  vy?: number;

  tags?: string[];
}

/* ─── Edge ─── */

export interface KnowledgeEdge {
  id: string;
  source: string;            // Source node ID
  target: string;            // Target node ID
  label?: string;
  relationType: 'prerequisite' | 'related' | 'extends' | 'application';
  weight: number;            // 0-1, strength of relationship
}

/* ─── View Config ─── */

export interface ViewConfig {
  showLabels: boolean;
  showStatuses: boolean;
  filterSubjects: SubjectDomain[];
  colorBySubject: Record<SubjectDomain, string>;
  nodeRadius: number;
  edgeOpacity: number;
}

export const DEFAULT_VIEW_CONFIG: ViewConfig = {
  showLabels: true,
  showStatuses: true,
  filterSubjects: ['physics', 'chemistry', 'biology', 'math', 'geography'],
  colorBySubject: {
    physics: '#3B82F6',      // blue-500
    chemistry: '#10B981',    // emerald-500
    biology: '#F59E0B',      // amber-500
    math: '#8B5CF6',         // violet-500
    geography: '#EF4444',    // red-500
  },
  nodeRadius: 24,
  edgeOpacity: 0.6,
};

/* ─── Graph State ─── */

export interface GraphState {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
  centeredNode?: string;     // Currently focused node ID
  zoom: number;
  panX: number;
  panY: number;
}

/* ─── Interaction Types ─── */

export type GraphInteraction =
  | { type: 'select'; nodeId: string }
  | { type: 'hover'; nodeId: string }
  | { type: 'drag'; nodeId: string; dx: number; dy: number }
  | { type: 'zoom'; delta: number }
  | { type: 'pan'; dx: number; dy: number }
  | { type: 'filter'; subject: SubjectDomain | 'all' };
