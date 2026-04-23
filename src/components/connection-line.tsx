'use client';

import React, { useMemo } from 'react';
import { Connection, Node } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ConnectionLineProps {
  connection: Connection;
  sourceNode: Node;
  targetNode: Node;
  isSelected?: boolean;
  onClick?: () => void;
  scale?: number;
}

export default function ConnectionLine({
  connection,
  sourceNode,
  targetNode,
  isSelected = false,
  onClick,
  scale = 1,
}: ConnectionLineProps) {
  // 计算连线位置
  const { path, midpoint, angle } = useMemo(() => {
    const sourceX = sourceNode.position.x + 100; // 节点中心
    const sourceY = sourceNode.position.y + 30;
    const targetX = targetNode.position.x + 100;
    const targetY = targetNode.position.y + 30;

    const midX = (sourceX + targetX) / 2;
    const midY = (sourceY + targetY) / 2;

    // 计算控制点以创建曲线
    const dx = targetX - sourceX;
    const dy = targetY - sourceY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const curvature = Math.min(distance * 0.2, 50);

    // 垂直曲线的控制点（基于连接ID确定方向，避免随机性）
    const direction = connection.id.charCodeAt(0) % 2 === 0 ? 1 : -1;
    const ctrlX = midX + curvature * direction;
    const ctrlY = midY;

    const pathD = `M ${sourceX} ${sourceY} Q ${ctrlX} ${ctrlY} ${targetX} ${targetY}`;
    const angleRad = Math.atan2(targetY - sourceY, targetX - sourceX);

    return {
      path: pathD,
      midpoint: { x: midX, y: midY },
      angle: (angleRad * 180) / Math.PI,
    };
  }, [sourceNode.position, targetNode.position]);

  const color = connection.color || '#94a3b8';

  return (
    <g
      className={cn('transition-all duration-200', isSelected && 'z-50')}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      {/* 鼠标悬停区域（更大的透明线） */}
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        className="cursor-pointer"
      />
      
      {/* 实际连线 */}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={isSelected ? 3 : 2}
        strokeLinecap="round"
        className={cn(
          'transition-all duration-200',
          onClick && 'cursor-pointer hover:stroke-[3]'
        )}
        style={{ strokeDasharray: 'none' }}
      />

      {/* 箭头 */}
      <g transform={`translate(${midpoint.x}, ${midpoint.y}) rotate(${angle})`}>
        <circle r={4} fill={color} />
      </g>

      {/* 标签 */}
      {connection.label && (
        <text
          x={midpoint.x}
          y={midpoint.y - 10}
          textAnchor="middle"
          className="fill-muted-foreground text-[10px] pointer-events-none select-none"
        >
          {connection.label}
        </text>
      )}
    </g>
  );
}

interface ConnectionsLayerProps {
  connections: Connection[];
  nodes: Node[];
  selectedConnectionId?: string;
  onConnectionClick?: (id: string) => void;
  scale?: number;
}

export function ConnectionsLayer({
  connections,
  nodes,
  selectedConnectionId,
  onConnectionClick,
  scale = 1,
}: ConnectionsLayerProps) {
  const nodeMap = useMemo(() => {
    const map = new Map<string, Node>();
    nodes.forEach((node) => map.set(node.id, node));
    return map;
  }, [nodes]);

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
      }}
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
        </marker>
      </defs>
      <g className="pointer-events-auto">
        {connections.map((conn) => {
          const sourceNode = nodeMap.get(conn.sourceId);
          const targetNode = nodeMap.get(conn.targetId);
          if (!sourceNode || !targetNode) return null;

          return (
            <ConnectionLine
              key={conn.id}
              connection={conn}
              sourceNode={sourceNode}
              targetNode={targetNode}
              isSelected={selectedConnectionId === conn.id}
              onClick={() => onConnectionClick?.(conn.id)}
              scale={scale}
            />
          );
        })}
      </g>
    </svg>
  );
}
