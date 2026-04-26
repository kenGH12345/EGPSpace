/**
 * Knowledge Graph: Initial Dataset
 *
 * Seed data connecting key concepts across subjects.
 * Built from ExperimentSchema keyConcepts and cross-disciplinary links.
 *
 * Format:
 *   Each node's ID prefix: chem-|phy-|bio-|math-|geo-
 *   Status defaults to 'unlearned'
 */

import type { KnowledgeNode, KnowledgeEdge } from './types';

export const INITIAL_NODES: KnowledgeNode[] = [
  /* ─── Chemistry ─── */
  { id: 'chem-ph-001', label: 'pH值', subject: 'chemistry', topic: 'acid-base', progress: 0, x: 0, y: 0, status: 'unlearned' },
  { id: 'chem-ph-002', label: '酸碱中和', subject: 'chemistry', topic: 'acid-base', progress: 0, x: 80, y: -50, status: 'unlearned' },
  { id: 'chem-ph-003', label: '缓冲溶液', subject: 'chemistry', topic: 'acid-base', progress: 0, x: 160, y: 0, status: 'unlearned' },
  { id: 'chem-ind-001', label: '指示剂', subject: 'chemistry', topic: 'acid-base', progress: 0, x: 80, y: 60, status: 'unlearned' },
  { id: 'chem-mol-001', label: '物质的量', subject: 'chemistry', topic: 'stoichiometry', progress: 0, x: 240, y: -60, status: 'unlearned' },
  { id: 'chem-conc-001', label: '浓度计算', subject: 'chemistry', topic: 'stoichiometry', progress: 0, x: 320, y: 0, status: 'unlearned' },
  { id: 'chem-elec-001', label: '电解质', subject: 'chemistry', topic: 'solutions', progress: 0, x: -80, y: 60, status: 'unlearned' },

  /* ─── Physics ─── */
  { id: 'phy-flo-001', label: '浮力', subject: 'physics', topic: 'mechanics', progress: 0, x: -200, y: -100, status: 'unlearned' },
  { id: 'phy-flo-002', label: '阿基米德原理', subject: 'physics', topic: 'mechanics', progress: 0, x: -280, y: -50, status: 'unlearned' },
  { id: 'phy-den-001', label: '密度', subject: 'physics', topic: 'mechanics', progress: 0, x: -200, y: 0, status: 'unlearned' },
  { id: 'phy-for-001', label: '力的平衡', subject: 'physics', topic: 'mechanics', progress: 0, x: -160, y: 80, status: 'unlearned' },
  { id: 'phy-pres-001', label: '压强', subject: 'physics', topic: 'mechanics', progress: 0, x: -120, y: -120, status: 'unlearned' },

  /* ─── Biology ─── */
  { id: 'bio-osm-001', label: '渗透作用', subject: 'biology', topic: 'cells', progress: 0, x: 200, y: 150, status: 'unlearned' },
  { id: 'bio-osm-002', label: '半透膜', subject: 'biology', topic: 'cells', progress: 0, x: 280, y: 180, status: 'unlearned' },
  { id: 'bio-enzy-001', label: '酶催化', subject: 'biology', topic: 'biochemistry', progress: 0, x: 360, y: 120, status: 'unlearned' },

  /* ─── Math ─── */
  { id: 'math-fn-001', label: '函数图像', subject: 'math', topic: 'functions', progress: 0, x: -300, y: 100, status: 'unlearned' },
  { id: 'math-fn-002', label: '导数', subject: 'math', topic: 'calculus', progress: 0, x: -350, y: 50, status: 'unlearned' },

  /* ─── Geo ─── */
  { id: 'geo-plate-001', label: '板块构造', subject: 'geography', topic: 'geology', progress: 0, x: 100, y: -180, status: 'unlearned' },
];

export const INITIAL_EDGES: KnowledgeEdge[] = [
  /* Chemistry links */
  { id: 'e1', source: 'chem-ph-001', target: 'chem-ph-002', relationType: 'related', weight: 0.9 },
  { id: 'e2', source: 'chem-ph-002', target: 'chem-ph-003', relationType: 'extends', weight: 0.7 },
  { id: 'e3', source: 'chem-ph-001', target: 'chem-ind-001', relationType: 'application', weight: 0.8 },
  { id: 'e4', source: 'chem-mol-001', target: 'chem-conc-001', relationType: 'related', weight: 0.9 },
  { id: 'e5', source: 'chem-ph-002', target: 'chem-mol-001', relationType: 'prerequisite', weight: 0.8 },
  { id: 'e6', source: 'chem-elec-001', target: 'chem-ph-001', relationType: 'prerequisite', weight: 0.6 },

  /* Physics links */
  { id: 'e10', source: 'phy-flo-001', target: 'phy-flo-002', relationType: 'related', weight: 0.9 },
  { id: 'e11', source: 'phy-flo-001', target: 'phy-den-001', relationType: 'prerequisite', weight: 0.8 },
  { id: 'e12', source: 'phy-den-001', target: 'phy-for-001', relationType: 'related', weight: 0.6 },
  { id: 'e13', source: 'phy-pres-001', target: 'phy-flo-001', relationType: 'related', weight: 0.7 },

  /* Cross-disciplinary: chem ↔ physics */
  { id: 'e20', source: 'chem-ph-001', target: 'phy-den-001', relationType: 'related', weight: 0.5 },
  { id: 'e21', source: 'chem-conc-001', target: 'phy-den-001', relationType: 'related', weight: 0.4 },

  /* Cross-disciplinary: bio ↔ chem */
  { id: 'e30', source: 'bio-osm-001', target: 'chem-elec-001', relationType: 'related', weight: 0.6 },
  { id: 'e31', source: 'bio-osm-002', target: 'bio-osm-001', relationType: 'prerequisite', weight: 0.8 },
  { id: 'e32', source: 'bio-enzy-001', target: 'chem-ph-001', relationType: 'related', weight: 0.5 },

  /* Cross-disciplinary: math ↔ physics */
  { id: 'e40', source: 'math-fn-001', target: 'math-fn-002', relationType: 'related', weight: 0.8 },
  { id: 'e41', source: 'math-fn-002', target: 'phy-for-001', relationType: 'application', weight: 0.5 },

  /* Cross-disciplinary: geo ↔ physics */
  { id: 'e50', source: 'geo-plate-001', target: 'phy-pres-001', relationType: 'application', weight: 0.5 },
];
