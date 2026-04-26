/**
 * Knowledge Graph: Canvas Renderer
 *
 * Renders nodes (circles with labels) and edges (lines with labels)
 * onto a 2D canvas context.
 *
 * Supports:
 * - Subject-specific colors
 * - Progress ring (status indicator)
 * - Selection highlight
 * - Edge relation labels
 */

import type { KnowledgeNode, KnowledgeEdge, ViewConfig } from './types';

export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
  config: ViewConfig;
  selectedNodeId?: string;
  hoveredNodeId?: string;
  zoom: number;
  panX: number;
  panY: number;
}

/* ─── Colors ─── */

const STATUS_COLORS: Record<string, string> = {
  unlearned: '#94a3b8',  // slate-400
  learning: '#f59e0b',   // amber-500
  mastered: '#10b981',   // emerald-500
  review: '#3b82f6',     // blue-500
};

const STATUS_LABELS: Record<string, string> = {
  unlearned: '未学',
  learning: '学习中',
  mastered: '已掌握',
  review: '需复习',
};

export function renderGraph(ctx: CanvasRenderingContext2D, rc: RenderContext): void {
  const { nodes, edges, config, zoom, panX, panY } = rc;
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;

  ctx.clearRect(0, 0, w, h);
  ctx.save();

  // Transform to world space + centering
  ctx.translate(w / 2 + panX, h / 2 + panY);
  ctx.scale(zoom, zoom);

  // Draw edges first (under nodes)
  edges.forEach(e => {
    const src = nodes.find(n => n.id === e.source);
    const tgt = nodes.find(n => n.id === e.target);
    if (src && tgt) drawEdge(ctx, src, tgt, e, config);
  });

  // Draw nodes
  nodes.forEach(n => {
    const isSelected = n.id === rc.selectedNodeId;
    const isHovered = n.id === rc.hoveredNodeId;
    drawNode(ctx, n, isSelected, isHovered, config);
  });

  ctx.restore();
}

/* ─── Node Rendering ─── */

function drawNode(
  ctx: CanvasRenderingContext2D,
  node: KnowledgeNode,
  selected: boolean,
  hovered: boolean,
  config: ViewConfig
): void {
  const r = config.nodeRadius + (hovered ? 4 : 0);
  const cx = node.x;
  const cy = node.y;
  const color = config.colorBySubject[node.subject] ?? '#64748b';

  // Selection glow
  if (selected) {
    ctx.beginPath();
    ctx.arc(cx, cy, r + 8, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
    ctx.lineWidth = 4;
    ctx.stroke();
  }

  // Progress arc (status background)
  const statusColor = STATUS_COLORS[node.status] ?? STATUS_COLORS.unlearned;
  ctx.beginPath();
  ctx.arc(cx, cy, r + 4, 0, Math.PI * 2);
  ctx.strokeStyle = statusColor;
  ctx.lineWidth = 3;
  ctx.stroke();

  // Fill circle
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  // Inner highlight
  ctx.beginPath();
  ctx.arc(cx - r * 0.3, cy - r * 0.3, r * 0.35, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fill();

  // Subject icon (first letter)
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${r * 0.5}px ui-sans-serif, system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const subjectLetter = node.subject[0].toUpperCase();
  ctx.fillText(subjectLetter, cx, cy - 1);

  // Label below node
  if (config.showLabels) {
    ctx.fillStyle = '#334155';
    ctx.font = '13px ui-sans-serif, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(node.label, cx, cy + r + 16);
  }

  // Status badge
  if (config.showStatuses && node.status !== 'unlearned') {
    const badgeR = 7;
    const bx = cx + r * 0.7;
    const by = cy - r * 0.7;
    ctx.beginPath();
    ctx.arc(bx, by, badgeR, 0, Math.PI * 2);
    ctx.fillStyle = statusColor;
    ctx.fill();
  }
}

/* ─── Edge Rendering ─── */

function drawEdge(
  ctx: CanvasRenderingContext2D,
  src: KnowledgeNode,
  tgt: KnowledgeNode,
  edge: KnowledgeEdge,
  config: ViewConfig
): void {
  const dx = tgt.x - src.x;
  const dy = tgt.y - src.y;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const r = config.nodeRadius + 4;

  // Line start/end (avoid node overlap)
  const x1 = src.x + (dx / dist) * r;
  const y1 = src.y + (dy / dist) * r;
  const x2 = tgt.x - (dx / dist) * r;
  const y2 = tgt.y - (dy / dist) * r;

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);

  // Style based on relation type
  ctx.strokeStyle = `rgba(100, 116, 139, ${config.edgeOpacity})`;
  ctx.lineWidth = 1 + edge.weight * 2;

  if (edge.relationType === 'prerequisite') {
    ctx.setLineDash([6, 4]);
  } else {
    ctx.setLineDash([]);
  }

  // Arrowhead
  const arrowSize = 8 + edge.weight * 4;
  const angle = Math.atan2(dy, dx);
  const ax = x2 - arrowSize * Math.cos(angle - Math.PI / 6);
  const ay = y2 - arrowSize * Math.sin(angle - Math.PI / 6);
  const bx2_ = x2 - arrowSize * Math.cos(angle + Math.PI / 6);
  const by2_ = y2 - arrowSize * Math.sin(angle + Math.PI / 6);

  ctx.moveTo(x2, y2);
  ctx.lineTo(ax, ay);
  ctx.lineTo(bx2_, by2_);
  ctx.lineTo(x2, y2);
  ctx.closePath();
  ctx.fillStyle = `rgba(100, 116, 139, ${config.edgeOpacity})`;
  ctx.fill();
  ctx.stroke();

  // Relation label (center)
  if (config.showLabels && edge.label) {
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    ctx.save();
    ctx.fillStyle = '#64748b';
    ctx.font = '10px ui-sans-serif, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(edge.label, mx, my);
    ctx.restore();
  }
}
