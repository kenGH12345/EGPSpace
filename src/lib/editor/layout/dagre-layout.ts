import dagre from 'dagre';
import type { LayoutInput, LayoutOutput, Position } from './types';
import { centerAt } from './types';

export function dagreLayout(input: LayoutInput): LayoutOutput {
  const g = new dagre.graphlib.Graph();
  g.setGraph({
    rankdir: 'TB', // Top to Bottom, fits typical circuits well
    nodesep: 100,   // horizontal spacing
    ranksep: 100,   // vertical spacing
    marginx: 50,
    marginy: 50,
  });
  g.setDefaultEdgeLabel(() => ({}));

  for (const id of input.componentIds) {
    // We use a guessed bounding box. In real scenario we might lookup from config.palette
    // but 100x80 is a reasonable default for dagre spacing
    g.setNode(id, { width: 100, height: 80 }); 
  }

  for (const conn of input.connections) {
    g.setEdge(conn.from, conn.to);
  }

  dagre.layout(g);

  const positions: Record<string, Position> = {};
  for (const id of input.componentIds) {
    const node = g.node(id);
    if (node) {
      // dagre gives center coordinates; we offset them to get top-left
      positions[id] = {
        x: node.x - node.width / 2,
        y: node.y - node.height / 2,
      };
    } else {
      positions[id] = { x: 0, y: 0 };
    }
  }

  const bounds = input.bounds ?? { width: 800, height: 600 };
  const centered = centerAt(positions, bounds.width / 2, bounds.height / 2);

  return { positions: centered };
}
