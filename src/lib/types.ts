// 知识图谱类型定义

export interface Position {
  x: number;
  y: number;
}

export interface Node {
  id: string;
  label: string;
  description?: string;
  position: Position;
  color?: string;
  icon?: string;
  children?: string[];
  expanded?: boolean;
}

export interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  label?: string;
  color?: string;
}

export interface KnowledgeGraph {
  nodes: Node[];
  connections: Connection[];
}

export interface CanvasState {
  offset: Position;
  scale: number;
}

export interface NodeColors {
  [key: string]: string;
}

export const DEFAULT_NODE_COLORS: NodeColors = {
  concept: '#3b82f6',    // 蓝色 - 概念
  person: '#8b5cf6',     // 紫色 - 人物
  event: '#f59e0b',      // 橙色 - 事件
  location: '#10b981',   // 绿色 - 地点
  organization: '#ec4899', // 粉色 - 组织
  custom: '#6b7280',     // 灰色 - 自定义
};

export const NODE_COLORS_LIST = Object.values(DEFAULT_NODE_COLORS);
