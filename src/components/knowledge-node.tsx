'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Node, Position } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Sparkles, GripVertical, Trash2, Edit2, X, Check } from 'lucide-react';

interface KnowledgeNodeProps {
  node: Node;
  isSelected?: boolean;
  onSelect?: () => void;
  onDrag?: (position: Position) => void;
  onDragEnd?: (position: Position) => void;
  onDelete?: () => void;
  onUpdate?: (node: Node) => void;
  scale?: number;
}

export default function KnowledgeNode({
  node,
  isSelected = false,
  onSelect,
  onDrag,
  onDragEnd,
  onDelete,
  onUpdate,
  scale = 1,
}: KnowledgeNodeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(node.label);
  const [editDescription, setEditDescription] = useState(node.description || '');
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const nodeRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 || isEditing) return;
    e.stopPropagation();
    onSelect?.();
    
    const rect = nodeRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - node.position.x,
        y: e.clientY - node.position.y,
      });
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const newPosition = {
      x: (e.clientX - dragOffset.x),
      y: (e.clientY - dragOffset.y),
    };
    onDrag?.(newPosition);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const rect = nodeRef.current?.getBoundingClientRect();
    if (rect) {
      onDragEnd?.({
        x: rect.left,
        y: rect.top,
      });
    }
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  const handleSave = () => {
    onUpdate?.({
      ...node,
      label: editLabel,
      description: editDescription,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditLabel(node.label);
    setEditDescription(node.description || '');
    setIsEditing(false);
  };

  return (
    <div
      ref={nodeRef}
      className={cn(
        'absolute select-none transition-shadow duration-200',
        isSelected && 'z-50'
      )}
      style={{
        left: node.position.x,
        top: node.position.y,
        transform: `scale(${1 / scale})`,
        transformOrigin: 'top left',
      }}
    >
      {isEditing ? (
        <div className="bg-background border-2 border-primary rounded-xl p-4 shadow-lg min-w-[200px] max-w-[300px]">
          <input
            ref={inputRef}
            type="text"
            value={editLabel}
            onChange={(e) => setEditLabel(e.target.value)}
            className="w-full font-semibold text-sm bg-transparent border-b outline-none mb-2"
            placeholder="节点标题"
          />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className="w-full text-xs bg-transparent border outline-none rounded p-2 resize-none mb-2"
            rows={3}
            placeholder="描述..."
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={handleCancel}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={handleSave}
              className="p-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onMouseDown={handleMouseDown}
          className={cn(
            'group relative bg-background border-2 rounded-xl p-4 shadow-md cursor-move transition-all duration-200 min-w-[150px] max-w-[250px]',
            isSelected
              ? 'border-primary shadow-lg ring-2 ring-primary/20'
              : 'border-transparent hover:border-primary/50',
            isDragging && 'shadow-xl scale-105'
          )}
        >
          {/* 拖拽手柄 */}
          <div className="absolute -left-1 -top-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-muted rounded p-1">
              <GripVertical className="w-3 h-3 text-muted-foreground" />
            </div>
          </div>

          {/* 节点图标 */}
          {node.icon && (
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center mb-2"
              style={{ backgroundColor: node.color || '#3b82f6' }}
            >
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          )}

          {/* 节点标题 */}
          <h3 className="font-semibold text-sm mb-1 line-clamp-2">{node.label}</h3>

          {/* 节点描述 */}
          {node.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {node.description}
            </p>
          )}

          {/* 颜色指示器 */}
          {node.color && !node.icon && (
            <div
              className="absolute -bottom-0.5 left-4 right-4 h-1 rounded-full"
              style={{ backgroundColor: node.color }}
            />
          )}

          {/* 操作按钮 */}
          {isSelected && (
            <div className="absolute -right-2 -top-2 flex gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                className="p-1.5 bg-background border rounded-lg shadow-md hover:bg-muted transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.();
                }}
                className="p-1.5 bg-background border rounded-lg shadow-md hover:bg-destructive hover:text-destructive-foreground transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
