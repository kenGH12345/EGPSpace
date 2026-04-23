'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Position, CanvasState } from '@/lib/types';

interface InfiniteCanvasProps {
  children: React.ReactNode;
  onCanvasClick?: (position: Position) => void;
  className?: string;
}

export default function InfiniteCanvas({
  children,
  onCanvasClick,
  className = '',
}: InfiniteCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<CanvasState>({
    offset: { x: 0, y: 0 },
    scale: 1,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);

  // 处理鼠标滚轮缩放
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // 计算缩放
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newScale = Math.min(Math.max(state.scale * delta, 0.1), 3);

      // 计算新的偏移量，使鼠标位置保持不变
      const scaleFactor = newScale / state.scale;
      const newOffsetX = mouseX - (mouseX - state.offset.x) * scaleFactor;
      const newOffsetY = mouseY - (mouseY - state.offset.y) * scaleFactor;

      setState({
        offset: { x: newOffsetX, y: newOffsetY },
        scale: newScale,
      });
    },
    [state]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  // 处理鼠标按下
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 1 || (e.button === 0 && e.altKey)) {
        // 中键或Alt+左键开始平移
        e.preventDefault();
        setIsPanning(true);
        setDragStart({ x: e.clientX - state.offset.x, y: e.clientY - state.offset.y });
      } else if (e.button === 0 && e.target === containerRef.current) {
        // 左键点击空白区域
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          const x = (e.clientX - rect.left - state.offset.x) / state.scale;
          const y = (e.clientY - rect.top - state.offset.y) / state.scale;
          onCanvasClick?.({ x, y });
        }
      }
    },
    [state, onCanvasClick]
  );

  // 处理鼠标移动
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning) {
        setState((prev) => ({
          ...prev,
          offset: {
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y,
          },
        }));
      }
    },
    [isPanning, dragStart]
  );

  // 处理鼠标释放
  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    setIsDragging(false);
  }, []);

  // 双击重置视图
  const handleDoubleClick = useCallback(() => {
    setState({
      offset: { x: 0, y: 0 },
      scale: 1,
    });
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden cursor-grab ${className} ${
        isPanning ? 'cursor-grabbing' : ''
      }`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDoubleClick={handleDoubleClick}
    >
      {/* 网格背景 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)
          `,
          backgroundSize: `${20 * state.scale}px ${20 * state.scale}px`,
          backgroundPosition: `${state.offset.x}px ${state.offset.y}px`,
        }}
      />
      
      {/* 可变换的内容层 */}
      <div
        className="absolute origin-top-left"
        style={{
          transform: `translate(${state.offset.x}px, ${state.offset.y}px) scale(${state.scale})`,
        }}
      >
        {children}
      </div>

      {/* 缩放指示器 */}
      <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm border rounded-lg px-3 py-1.5 text-xs text-muted-foreground">
        {Math.round(state.scale * 100)}%
      </div>

      {/* 提示 */}
      <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm border rounded-lg px-3 py-1.5 text-xs text-muted-foreground">
        <span className="hidden sm:inline">滚轮缩放 | Alt+拖拽平移 | 双击重置</span>
        <span className="sm:hidden">手势缩放 | 双指平移</span>
      </div>
    </div>
  );
}

export { type CanvasState, type Position };
