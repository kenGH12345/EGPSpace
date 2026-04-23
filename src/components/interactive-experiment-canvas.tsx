'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import {
  DrawElement,
  ExperimentParameter,
  StatusItem,
  Position,
} from '@/lib/experiment-types';
import { calculateValue, getExperimentResults } from '@/lib/calculations-browser';

interface InteractiveExperimentCanvasProps {
  experimentId: string;
  params: Record<string, number>;
  elements: DrawElement[];
  statusItems: StatusItem[];
  width?: number;
  height?: number;
  scale?: number;
  offset?: Position;
  showGrid?: boolean;
  gridSize?: number;
  backgroundColor?: string;
  onParamChange?: (key: string, value: number) => void;
  className?: string;
}

// 颜色预设
const COLORS = {
  primary: '#6366F1',
  secondary: '#10B981',
  accent: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
  grid: '#E5E7EB',
  text: '#1F2937',
};

const InteractiveExperimentCanvas: React.FC<InteractiveExperimentCanvasProps> = ({
  experimentId,
  params,
  elements,
  statusItems,
  width = 800,
  height = 600,
  scale = 1,
  offset = { x: 0, y: 0 },
  showGrid = true,
  gridSize = 20,
  backgroundColor = '#FFFFFF',
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [animationFrame, setAnimationFrame] = useState(0);

  // 计算实验结果
  const results = getExperimentResults(experimentId, params);

  // 绘制网格背景
  const drawGrid = useCallback(
    (ctx: CanvasRenderingContext2D, canvasOffset: Position, canvasScale: number) => {
      if (!showGrid) return;

      ctx.strokeStyle = COLORS.grid;
      ctx.lineWidth = 0.5;

      const scaledGridSize = gridSize * canvasScale;

      // 垂直线
      const startX = (canvasOffset.x % scaledGridSize) - scaledGridSize;
      for (let x = startX; x < width; x += scaledGridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // 水平线
      const startY = (canvasOffset.y % scaledGridSize) - scaledGridSize;
      for (let y = startY; y < height; y += scaledGridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    },
    [showGrid, gridSize, width, height]
  );

  // 主动画循环
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const startTime = Date.now();

    // 绘制单个元素的函数（内部定义，不依赖外部变量）
    const drawSingleElement = (
      context: CanvasRenderingContext2D,
      element: DrawElement,
      currentParams: Record<string, number>,
      currentOffset: Position,
      currentScale: number,
      time: number
    ) => {
      const x = currentOffset.x;
      const y = currentOffset.y;
      const s = currentScale;

      // 应用样式
      if (element.style) {
        context.fillStyle = element.style.fill || 'transparent';
        context.strokeStyle = element.style.stroke || '#000';
        context.lineWidth = element.style.strokeWidth || 1;
        context.globalAlpha = element.style.opacity ?? 1;
      }

      // 基础绘制
      switch (element.kind) {
        case 'rect': {
          const rectX = calculateValue(element.x, currentParams, 0) * s + x;
          const rectY = calculateValue(element.y, currentParams, 0) * s + y;
          const w = calculateValue(element.width, currentParams, 100) * s;
          const h = calculateValue(element.height, currentParams, 50) * s;

          if (element.radius) {
            const r = calculateValue(element.radius, currentParams, 0) * s;
            context.beginPath();
            context.roundRect(rectX, rectY, w, h, r);
            if (element.style?.fill && element.style.fill !== 'transparent') {
              context.fill();
            }
            if (element.style?.stroke) {
              context.stroke();
            }
          } else {
            if (element.style?.fill && element.style.fill !== 'transparent') {
              context.fillRect(rectX, rectY, w, h);
            }
            if (element.style?.stroke) {
              context.strokeRect(rectX, rectY, w, h);
            }
          }
          break;
        }

        case 'circle': {
          const cx = calculateValue(element.cx, currentParams, 0) * s + x;
          const cy = calculateValue(element.cy, currentParams, 0) * s + y;
          const r = calculateValue(element.r, currentParams, 20) * s;

          context.beginPath();
          context.arc(cx, cy, r, 0, Math.PI * 2);
          if (element.style?.fill && element.style.fill !== 'transparent') {
            context.fill();
          }
          if (element.style?.stroke) {
            context.stroke();
          }
          break;
        }

        case 'line': {
          const x1 = calculateValue(element.x1, currentParams, 0) * s + x;
          const y1 = calculateValue(element.y1, currentParams, 0) * s + y;
          const x2 = calculateValue(element.x2, currentParams, 100) * s + x;
          const y2 = calculateValue(element.y2, currentParams, 100) * s + y;

          context.beginPath();
          context.moveTo(x1, y1);
          context.lineTo(x2, y2);
          context.stroke();
          break;
        }

        case 'arrow': {
          const ax1 = calculateValue(element.x1, currentParams, 0) * s + x;
          const ay1 = calculateValue(element.y1, currentParams, 0) * s + y;
          const ax2 = calculateValue(element.x2, currentParams, 100) * s + x;
          const ay2 = calculateValue(element.y2, currentParams, 100) * s + y;
          const headLength = (element.headLength || 10) * s;
          const headAngle = element.headAngle || Math.PI / 6;

          const angle = Math.atan2(ay2 - ay1, ax2 - ax1);

          context.beginPath();
          context.moveTo(ax1, ay1);
          context.lineTo(ax2, ay2);
          context.stroke();

          // 箭头头部
          context.beginPath();
          context.moveTo(ax2, ay2);
          context.lineTo(
            ax2 - headLength * Math.cos(angle - headAngle),
            ay2 - headLength * Math.sin(angle - headAngle)
          );
          context.lineTo(
            ax2 - headLength * Math.cos(angle + headAngle),
            ay2 - headLength * Math.sin(angle + headAngle)
          );
          context.closePath();
          context.fill();
          break;
        }

        case 'text': {
          const tx = calculateValue(element.x, currentParams, 0) * s + x;
          const ty = calculateValue(element.y, currentParams, 0) * s + y;

          context.fillStyle = element.style?.fill || COLORS.text;
          context.font = `${element.fontWeight || 'normal'} ${(element.fontSize || 14) * s}px ${
            element.fontFamily || 'sans-serif'
          }`;
          context.textAlign = (element.textAlign as CanvasTextAlign) || 'left';
          context.textBaseline = (element.textBaseline as CanvasTextBaseline) || 'top';
          context.fillText(element.text, tx, ty);
          break;
        }

        case 'spring': {
          const spX = calculateValue(element.x, currentParams, 0) * s + x;
          const spY = calculateValue(element.y, currentParams, 100) * s + y;
          const length = calculateValue(element.length, currentParams, 80) * s;
          const coils = element.coils || 8;

          context.strokeStyle = element.style?.stroke || COLORS.primary;
          context.lineWidth = 2;

          context.beginPath();
          const coilHeight = length / coils;
          const amplitude = 8 * s;
          context.moveTo(spX, spY);

          for (let i = 0; i < coils; i++) {
            const y1 = spY + i * coilHeight + coilHeight / 4;
            const y2 = spY + i * coilHeight + (3 * coilHeight) / 4;
            context.lineTo(spX + (i % 2 === 0 ? amplitude : -amplitude), y1);
            context.lineTo(spX + (i % 2 === 0 ? -amplitude : amplitude), y2);
          }
          context.lineTo(spX, spY + length);
          context.stroke();
          break;
        }

        case 'pendulum': {
          const penX = calculateValue(element.anchorX, currentParams, 200) * s + x;
          const penY = calculateValue(element.anchorY, currentParams, 50) * s + y;
          const len = calculateValue(element.length, currentParams, 150) * s;
          const angleDeg = calculateValue(element.angle, currentParams, 30);
          const angleRad = (angleDeg * Math.PI) / 180;
          const bobRadius = (element.bobRadius || 15) * s;

          // 悬挂点
          context.fillStyle = '#666';
          context.beginPath();
          context.arc(penX, penY, 5, 0, Math.PI * 2);
          context.fill();

          // 摆线
          context.strokeStyle = element.style?.stroke || COLORS.text;
          context.lineWidth = 2;
          const endX = penX + len * Math.sin(angleRad);
          const endY = penY + len * Math.cos(angleRad);
          context.beginPath();
          context.moveTo(penX, penY);
          context.lineTo(endX, endY);
          context.stroke();

          // 摆球
          context.fillStyle = element.style?.fill || COLORS.primary;
          context.beginPath();
          context.arc(endX, endY, bobRadius, 0, Math.PI * 2);
          context.fill();
          break;
        }

        case 'forceArrow': {
          const faX = calculateValue(element.x, currentParams, 0) * s + x;
          const faY = calculateValue(element.y, currentParams, 0) * s + y;
          const angleDeg = calculateValue(element.angle, currentParams, 0);
          const magnitude = calculateValue(element.magnitude, currentParams, 50) * s;
          const angleRad = (angleDeg * Math.PI) / 180;

          const endX = faX + magnitude * Math.cos(angleRad);
          const endY = faY + magnitude * Math.sin(angleRad);
          const color = element.color || COLORS.danger;

          context.strokeStyle = color;
          context.fillStyle = color;
          context.lineWidth = 3;

          // 箭头线
          context.beginPath();
          context.moveTo(faX, faY);
          context.lineTo(endX, endY);
          context.stroke();

          // 箭头头部
          const headLength = 15 * s;
          context.beginPath();
          context.moveTo(endX, endY);
          context.lineTo(
            endX - headLength * Math.cos(angleRad - Math.PI / 6),
            endY - headLength * Math.sin(angleRad - Math.PI / 6)
          );
          context.lineTo(
            endX - headLength * Math.cos(angleRad + Math.PI / 6),
            endY - headLength * Math.sin(angleRad + Math.PI / 6)
          );
          context.closePath();
          context.fill();

          // 标签
          if (element.label) {
            context.font = `${12 * s}px sans-serif`;
            context.fillText(element.label, endX + 10, endY);
          }
          break;
        }

        case 'lightRay': {
          const rayX = calculateValue(element.x1, currentParams, 0) * s + x;
          const rayY = calculateValue(element.y1, currentParams, 100) * s + y;
          const rayAngle = calculateValue(element.angle, currentParams, 45);
          const rayLength = calculateValue(element.length, currentParams, 100) * s;
          const rayAngleRad = (rayAngle * Math.PI) / 180;

          const endX = rayX + rayLength * Math.cos(rayAngleRad);
          const endY = rayY - rayLength * Math.sin(rayAngleRad);

          context.strokeStyle = element.color || COLORS.accent;
          context.lineWidth = 2;
          context.setLineDash([5 * s, 3 * s]);

          context.beginPath();
          context.moveTo(rayX, rayY);
          context.lineTo(endX, endY);
          context.stroke();

          context.setLineDash([]);

          // 法线
          if (element.showNormal) {
            context.strokeStyle = COLORS.grid;
            context.lineWidth = 1;
            context.beginPath();
            context.moveTo(rayX, rayY - 50 * s);
            context.lineTo(rayX, rayY + 50 * s);
            context.stroke();

            context.fillStyle = COLORS.text;
            context.font = `${10 * s}px sans-serif`;
            context.fillText('法线', rayX - 20, rayY - 55 * s);
          }

          // 角度标注
          if (element.showAngle) {
            context.strokeStyle = COLORS.info;
            context.lineWidth = 1;
            context.beginPath();
            context.arc(rayX, rayY, 30 * s, 0, -rayAngleRad, true);
            context.stroke();

            context.fillStyle = COLORS.info;
            context.fillText(`${rayAngle.toFixed(0)}°`, rayX + 35 * s, rayY - 15 * s);
          }
          break;
        }

        case 'beaker': {
          const bkX = calculateValue(element.x, currentParams, 100) * s + x;
          const bkY = calculateValue(element.y, currentParams, 100) * s + y;
          const bkW = calculateValue(element.width, currentParams, 80) * s;
          const bkH = calculateValue(element.height, currentParams, 120) * s;
          const fillLevel = calculateValue(element.fillLevel || 60, currentParams, 60);

          // 烧杯外框
          context.strokeStyle = '#888';
          context.lineWidth = 2;
          context.beginPath();
          context.moveTo(bkX, bkY);
          context.lineTo(bkX - 5 * s, bkY + bkH);
          context.lineTo(bkX + bkW + 5 * s, bkY + bkH);
          context.lineTo(bkX + bkW, bkY);
          context.stroke();

          // 液面
          const liquidH = (bkH * fillLevel) / 100;
          const liquidY = bkY + bkH - liquidH;
          context.fillStyle = element.liquidColor || COLORS.info;
          context.globalAlpha = 0.6;
          context.beginPath();
          context.moveTo(bkX + 2 * s, liquidY);
          context.lineTo(bkX - 3 * s, bkY + bkH - 2 * s);
          context.lineTo(bkX + bkW + 3 * s, bkY + bkH - 2 * s);
          context.lineTo(bkX + bkW - 2 * s, liquidY);
          context.closePath();
          context.fill();
          context.globalAlpha = 1;

          // 刻度
          if (element.showMeasurements) {
            context.fillStyle = COLORS.text;
            context.font = `${10 * s}px sans-serif`;
            for (let i = 0; i <= 4; i++) {
              const my = bkY + bkH - (i * bkH) / 4;
              context.fillText(`${100 - i * 25}%`, bkX + bkW + 5, my + 3);
              context.beginPath();
              context.moveTo(bkX + bkW, my);
              context.lineTo(bkX + bkW + 5 * s, my);
              context.stroke();
            }
          }
          break;
        }

        case 'bubble': {
          const bubX = calculateValue(element.x, currentParams, 200) * s + x;
          const bubY = calculateValue(element.y, currentParams, 300) * s + y;
          const bubR = calculateValue(element.radius, currentParams, 10) * s;
          const count = element.count || 5;
          const speed = element.speed || 2;

          context.strokeStyle = element.style?.stroke || 'rgba(100, 180, 255, 0.6)';
          context.lineWidth = 1;

          for (let i = 0; i < count; i++) {
            const offset = ((time * speed + i * 50) % 200) * s;
            context.beginPath();
            context.arc(
              bubX + (i % 3) * 20 * s,
              bubY - offset,
              bubR * (1 - i * 0.1),
              0,
              Math.PI * 2
            );
            context.stroke();
          }
          break;
        }

        case 'group': {
          const group = element as DrawElement & {
            elements: DrawElement[];
            transform?: {
              translateX?: number | string;
              translateY?: number | string;
              scale?: number | string;
              rotate?: number | string;
            };
          };

          context.save();
          if (group.transform) {
            const tx = calculateValue(group.transform.translateX || 0, currentParams, 0) * s + x;
            const ty = calculateValue(group.transform.translateY || 0, currentParams, 0) * s + y;
            context.translate(tx, ty);
            if (group.transform.scale) {
              context.scale(
                calculateValue(group.transform.scale, currentParams, 1),
                calculateValue(group.transform.scale, currentParams, 1)
              );
            }
            if (group.transform.rotate) {
              context.rotate(
                (calculateValue(group.transform.rotate, currentParams, 0) * Math.PI) / 180
              );
            }
          }
          // 递归绘制子元素
          group.elements.forEach((el) =>
            drawSingleElement(context, el, currentParams, currentOffset, currentScale, time)
          );
          context.restore();
          break;
        }
      }

      // 重置透明度
      context.globalAlpha = 1;
    };

    // 绘制所有元素的函数
    const drawElements = (
      context: CanvasRenderingContext2D,
      els: DrawElement[],
      currentParams: Record<string, number>,
      currentOffset: Position,
      currentScale: number,
      time: number
    ) => {
      els.forEach((element) => {
        if (element.visible !== false) {
          drawSingleElement(context, element, currentParams, currentOffset, currentScale, time);
        }
      });
    };

    const animate = () => {
      const time = (Date.now() - startTime) / 1000;
      setAnimationFrame(time);

      // 清空画布
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);

      // 绘制网格
      drawGrid(ctx, offset, scale);

      // 绘制所有元素
      drawElements(ctx, elements, params, offset, scale, time);

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [width, height, backgroundColor, elements, params, offset, scale, drawGrid]);

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="border border-gray-200 rounded-lg shadow-sm"
        style={{ touchAction: 'none' }}
      />

      {/* 状态显示 */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-md p-3 space-y-2">
        {statusItems.map((item, index) => {
          const resultValue = results[item.label];
          const displayValue =
            resultValue?.value !== undefined
              ? typeof resultValue.value === 'number'
                ? resultValue.value.toFixed(2)
                : resultValue.value
              : typeof item.value === 'number'
              ? item.value.toFixed(2)
              : item.value;

          return (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-gray-600">{item.label}:</span>
              <span className="font-semibold" style={{ color: item.color }}>
                {displayValue}
                {item.unit}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InteractiveExperimentCanvas;
