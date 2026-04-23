'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import {
  ExperimentConfig,
  Position,
  DrawElement,
} from '@/lib/experiment-types';
import type { ExperimentSchema } from '@/lib/experiment-schema';
import { computePhysics } from '@/lib/physics-engine';
import { experimentSchemaToLegacy } from './DynamicExperiment';
import { calculateValue } from '@/lib/calculations-browser';

interface ExperimentCanvasProps {
  experiment: ExperimentConfig | ExperimentSchema;
  params: Record<string, number>;
  width?: number;
  height?: number;
  scale?: number;
  offset?: Position;
  showGrid?: boolean;
  onInteraction?: (type: string, data: Record<string, unknown>) => void;
  className?: string;
}

function isExperimentSchema(config: unknown): config is ExperimentSchema {
  return typeof config === 'object' && config !== null &&
    'meta' in config && typeof (config as Record<string, unknown>).meta === 'object' &&
    (config as Record<string, unknown>).meta !== null &&
    'physicsType' in ((config as Record<string, unknown>).meta as Record<string, unknown>);
}

// 安全获取实验标识符（兼容旧 ExperimentConfig 和新 ExperimentSchema）
function getExperimentId(experiment: ExperimentConfig | ExperimentSchema): string {
  if ('id' in experiment && typeof experiment.id === 'string') {
    return experiment.id;
  }
  // 对于 ExperimentSchema，使用 meta.topic 作为标识
  return (experiment as ExperimentSchema).meta?.topic ?? 'unknown';
}

// 默认颜色
const COLORS = {
  primary: '#6366F1',
  secondary: '#10B981',
  accent: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
  grid: '#E5E7EB',
  text: '#1F2937',
  background: '#FAFAFA',
  surface: '#FFFFFF',
  lens: 'rgba(99, 102, 241, 0.1)',
};

const ExperimentCanvas: React.FC<ExperimentCanvasProps> = ({
  experiment,
  params,
  width = 800,
  height = 500,
  scale = 1,
  offset = { x: 0, y: 0 },
  showGrid = true,
  onInteraction,
  className = '',
}) => {
  // Normalize: convert ExperimentSchema to legacy ExperimentConfig
  const normalizedExperiment: ExperimentConfig = (isExperimentSchema(experiment)
    ? experimentSchemaToLegacy(experiment)
    : experiment) as ExperimentConfig;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [animationTime, setAnimationTime] = useState(0);
  const animationRef = useRef<number | undefined>(undefined);

  // 获取当前参数值
  const getValue = useCallback(
    (key: string, defaultVal: number = 0): number => {
      return params[key] ?? defaultVal;
    },
    [params]
  );

  // 根据实验类型生成绘制元素
  const generateElements = useCallback((): DrawElement[] => {
    const elements: DrawElement[] = [];
    const cx = width / 2;
    const cy = height / 2;

    switch (getExperimentId(experiment)) {
      case 'convex-lens-imaging': {
        const objectDistance = getValue('objectDistance', 15);
        const focalLength = getValue('focalLength', 10);
        const objectHeight = getValue('objectHeight', 4);

        // 透镜位置
        const lensX = cx;

        // 物体位置
        const objectX = cx - objectDistance;
        const objectY = cy;

        // 计算像的位置
        let imageX = cx + 100; // 默认
        let imageY = cy;
        let showImage = true;

        if (objectDistance > focalLength) {
          // 实像
          imageX = cx + (focalLength * objectDistance) / (objectDistance - focalLength);
          const magnification = -imageX / objectDistance;
          imageY = cy + objectHeight * magnification;
        } else {
          // 虚像
          showImage = false;
        }

        // 主光轴
        elements.push({
          id: 'main-axis',
          kind: 'line',
          x1: 0,
          y1: cy,
          x2: width,
          y2: cy,
          style: { stroke: COLORS.grid, strokeWidth: 1 },
        });

        // 透镜
        elements.push({
          id: 'lens',
          kind: 'line',
          x1: lensX,
          y1: cy - 100,
          x2: lensX,
          y2: cy + 100,
          style: { stroke: COLORS.primary, strokeWidth: 3 },
        });

        // 透镜标注
        elements.push({
          id: 'lens-label',
          kind: 'text',
          x: lensX + 10,
          y: cy - 110,
          text: '凸透镜',
          fontSize: 12,
          style: { fill: COLORS.primary },
        });

        // 焦点
        elements.push({
          id: 'focal-point-left',
          kind: 'circle',
          cx: lensX - focalLength,
          cy: cy,
          r: 3,
          style: { fill: COLORS.accent },
        });

        elements.push({
          id: 'focal-point-right',
          kind: 'circle',
          cx: lensX + focalLength,
          cy: cy,
          r: 3,
          style: { fill: COLORS.accent },
        });

        elements.push({
          id: 'f-label',
          kind: 'text',
          x: lensX - focalLength - 15,
          y: cy + 10,
          text: 'F',
          fontSize: 10,
          style: { fill: COLORS.accent },
        });

        // 物体 (箭头)
        elements.push({
          id: 'object',
          kind: 'arrow',
          x1: objectX,
          y1: objectY,
          x2: objectX,
          y2: objectY - objectHeight * 5,
          style: { stroke: COLORS.secondary, strokeWidth: 3 },
        });

        elements.push({
          id: 'object-label',
          kind: 'text',
          x: objectX - 10,
          y: objectY + 10,
          text: '物体',
          fontSize: 11,
          style: { fill: COLORS.secondary },
        });

        // 物距标注
        elements.push({
          id: 'object-distance',
          kind: 'text',
          x: (lensX + objectX) / 2 - 20,
          y: cy + 20,
          text: `u=${objectDistance}cm`,
          fontSize: 10,
          style: { fill: COLORS.text },
        });

        // 成像光线
        if (objectDistance > focalLength) {
          // 光线1: 经过光心
          elements.push({
            id: 'ray1',
            kind: 'line',
            x1: objectX,
            y1: objectY - objectHeight * 5,
            x2: imageX,
            y2: imageY,
            style: { stroke: COLORS.info, strokeWidth: 1.5 },
          });

          // 光线2: 平行光轴
          elements.push({
            id: 'ray2',
            kind: 'line',
            x1: objectX,
            y1: objectY - objectHeight * 5,
            x2: lensX,
            y2: objectY - objectHeight * 5,
            style: { stroke: COLORS.info, strokeWidth: 1.5 },
          });

          // 光线2折射
          elements.push({
            id: 'ray2-refract',
            kind: 'line',
            x1: lensX,
            y1: objectY - objectHeight * 5,
            x2: imageX,
            y2: imageY,
            style: { stroke: COLORS.info, strokeWidth: 1.5 },
          });

          // 实像 (倒立箭头)
          elements.push({
            id: 'image',
            kind: 'arrow',
            x1: imageX,
            y1: cy,
            x2: imageX,
            y2: imageY,
            style: { stroke: COLORS.danger, strokeWidth: 3 },
          });

          elements.push({
            id: 'image-label',
            kind: 'text',
            x: imageX + 10,
            y: imageY + 10,
            text: '像',
            fontSize: 11,
            style: { fill: COLORS.danger },
          });

          // 像距标注
          elements.push({
            id: 'image-distance',
            kind: 'text',
            x: (lensX + imageX) / 2 - 15,
            y: cy - 20,
            text: `v=${Math.round(imageX - lensX)}cm`,
            fontSize: 10,
            style: { fill: COLORS.text },
          });
        } else {
          // 虚像 (虚线延长)
          const virtualEndX = cx - 50;
          elements.push({
            id: 'ray-extend',
            kind: 'line',
            x1: objectX,
            y1: objectY - objectHeight * 5,
            x2: virtualEndX,
            y2: cy + (objectY - objectHeight * 5 - cy) * ((cx - virtualEndX) / (cx - objectX)),
            style: { stroke: COLORS.info, strokeWidth: 1.5, dash: [5, 5] },
          });

          // 虚像位置
          const virtualImageX = cx - (focalLength * objectDistance) / (focalLength - objectDistance);
          const virtualImageY = cy - objectHeight * 5 * (focalLength / (focalLength - objectDistance));

          elements.push({
            id: 'virtual-image',
            kind: 'arrow',
            x1: virtualImageX,
            y1: cy,
            x2: virtualImageX,
            y2: virtualImageY,
            style: { stroke: COLORS.danger, strokeWidth: 2, dash: [3, 3] },
          });

          elements.push({
            id: 'virtual-image-label',
            kind: 'text',
            x: virtualImageX - 20,
            y: virtualImageY - 10,
            text: '虚像',
            fontSize: 11,
            style: { fill: COLORS.danger },
          });
        }

        // 光心标注
        elements.push({
          id: 'optical-center',
          kind: 'text',
          x: lensX - 5,
          y: cy + 120,
          text: 'O',
          fontSize: 12,
          style: { fill: COLORS.text },
        });
        break;
      }

      case 'light-refraction': {
        const incidentAngle = getValue('incidentAngle', 30);
        const n1 = getValue('n1', 1.0);
        const n2 = getValue('n2', 1.5);

        const surfaceY = cy;
        const incidentX = cx - 150;
        const incidentY = cy - 100;

        // 界面
        elements.push({
          id: 'surface',
          kind: 'line',
          x1: 0,
          y1: surfaceY,
          x2: width,
          y2: surfaceY,
          style: { stroke: COLORS.text, strokeWidth: 2 },
        });

        // 法线
        elements.push({
          id: 'normal',
          kind: 'line',
          x1: incidentX,
          y1: surfaceY - 120,
          x2: incidentX,
          y2: surfaceY + 120,
          style: { stroke: COLORS.grid, strokeWidth: 1 },
        });

        // 入射光线
        const incidentAngleRad = (incidentAngle * Math.PI) / 180;
        elements.push({
          id: 'incident-ray',
          kind: 'line',
          x1: incidentX,
          y1: surfaceY,
          x2: incidentX - 120 * Math.sin(incidentAngleRad),
          y2: surfaceY - 120 * Math.cos(incidentAngleRad),
          style: { stroke: COLORS.accent, strokeWidth: 2 },
        });

        // 入射角弧
        elements.push({
          id: 'incident-angle-arc',
          kind: 'arc',
          cx: incidentX,
          cy: surfaceY,
          r: 40,
          startAngle: -90,
          endAngle: -90 + incidentAngle,
          style: { stroke: COLORS.accent, strokeWidth: 1 },
        });

        // 入射角标注
        elements.push({
          id: 'incident-angle-label',
          kind: 'text',
          x: incidentX - 60,
          y: surfaceY - 50,
          text: `θ₁=${incidentAngle.toFixed(0)}°`,
          fontSize: 11,
          style: { fill: COLORS.accent },
        });

        // 计算折射角
        const sinRefraction = (n1 * Math.sin(incidentAngleRad)) / n2;
        let refractionAngle = 0;
        let isTotalReflection = false;

        if (Math.abs(sinRefraction) > 1) {
          isTotalReflection = true;
          const criticalAngle = Math.asin(n2 / n1) * (180 / Math.PI);
          elements.push({
            id: 'critical-angle-label',
            kind: 'text',
            x: incidentX + 40,
            y: surfaceY - 20,
            text: `全反射! 临界角=${criticalAngle.toFixed(1)}°`,
            fontSize: 11,
            style: { fill: COLORS.danger },
          });
        } else {
          refractionAngle = Math.asin(sinRefraction) * (180 / Math.PI);
          const refractionAngleRad = (refractionAngle * Math.PI) / 180;

          // 折射光线
          elements.push({
            id: 'refracted-ray',
            kind: 'line',
            x1: incidentX,
            y1: surfaceY,
            x2: incidentX + 120 * Math.sin(refractionAngleRad),
            y2: surfaceY + 120 * Math.cos(refractionAngleRad),
            style: { stroke: COLORS.info, strokeWidth: 2 },
          });

          // 折射角弧
          elements.push({
            id: 'refraction-angle-arc',
            kind: 'arc',
            cx: incidentX,
            cy: surfaceY,
            r: 40,
            startAngle: 90,
            endAngle: 90 - refractionAngle,
            style: { stroke: COLORS.info, strokeWidth: 1 },
          });

          // 折射角标注
          elements.push({
            id: 'refraction-angle-label',
            kind: 'text',
            x: incidentX + 50,
            y: surfaceY + 40,
            text: `θ₂=${refractionAngle.toFixed(1)}°`,
            fontSize: 11,
            style: { fill: COLORS.info },
          });
        }

        // 介质标注
        elements.push({
          id: 'medium1-label',
          kind: 'text',
          x: 50,
          y: surfaceY - 30,
          text: `介质1 (n=${n1})`,
          fontSize: 12,
          style: { fill: COLORS.text },
        });

        elements.push({
          id: 'medium2-label',
          kind: 'text',
          x: 50,
          y: surfaceY + 50,
          text: `介质2 (n=${n2})`,
          fontSize: 12,
          style: { fill: COLORS.text },
        });

        // 法线标注
        elements.push({
          id: 'normal-label',
          kind: 'text',
          x: incidentX + 10,
          y: surfaceY - 130,
          text: '法线',
          fontSize: 10,
          style: { fill: COLORS.grid },
        });
        break;
      }

      case 'simple-pendulum': {
        const length = getValue('length', 1);
        const angle = getValue('angle', 15);
        const gravity = getValue('gravity', 9.8);

        const anchorX = cx;
        const anchorY = 80;
        const stringLength = length * 150;
        const angleRad = (angle * Math.PI) / 180;

        // 支架
        elements.push({
          id: 'support',
          kind: 'rect',
          x: anchorX - 60,
          y: anchorY - 20,
          width: 120,
          height: 20,
          style: { fill: '#666', stroke: '#444', strokeWidth: 1 },
        });

        // 悬挂点
        elements.push({
          id: 'pivot',
          kind: 'circle',
          cx: anchorX,
          cy: anchorY,
          r: 5,
          style: { fill: '#444' },
        });

        // 摆线
        const bobX = anchorX + stringLength * Math.sin(angleRad);
        const bobY = anchorY + stringLength * Math.cos(angleRad);

        elements.push({
          id: 'string',
          kind: 'line',
          x1: anchorX,
          y1: anchorY,
          x2: bobX,
          y2: bobY,
          style: { stroke: COLORS.text, strokeWidth: 2 },
        });

        // 摆球
        elements.push({
          id: 'bob',
          kind: 'circle',
          cx: bobX,
          cy: bobY,
          r: 20,
          style: { fill: COLORS.primary, stroke: COLORS.info, strokeWidth: 2 },
        });

        // 角度弧
        elements.push({
          id: 'angle-arc',
          kind: 'arc',
          cx: anchorX,
          cy: anchorY,
          r: 50,
          startAngle: 0,
          endAngle: angle,
          style: { stroke: COLORS.accent, strokeWidth: 1 },
        });

        // 角度标注
        elements.push({
          id: 'angle-label',
          kind: 'text',
          x: anchorX + 70,
          y: anchorY + 30,
          text: `θ=${angle}°`,
          fontSize: 11,
          style: { fill: COLORS.accent },
        });

        // 平衡位置虚线
        elements.push({
          id: 'equilibrium',
          kind: 'line',
          x1: anchorX,
          y1: anchorY,
          x2: anchorX,
          y2: anchorY + stringLength + 30,
          style: { stroke: COLORS.grid, strokeWidth: 1, dash: [5, 5] },
        });

        // 摆长标注
        elements.push({
          id: 'length-label',
          kind: 'text',
          x: anchorX + stringLength / 2 + 10,
          y: anchorY + stringLength / 2,
          text: `L=${length}m`,
          fontSize: 11,
          style: { fill: COLORS.text },
        });

        // 重力方向
        elements.push({
          id: 'gravity-arrow',
          kind: 'arrow',
          x1: bobX,
          y1: bobY,
          x2: bobX,
          y2: bobY + 40,
          style: { stroke: COLORS.danger, strokeWidth: 2 },
        });

        elements.push({
          id: 'gravity-label',
          kind: 'text',
          x: bobX + 10,
          y: bobY + 35,
          text: 'g',
          fontSize: 12,
          style: { fill: COLORS.danger },
        });
        break;
      }

      case 'spring-mass-oscillator': {
        const mass = getValue('mass', 0.5);
        const springConstant = getValue('springConstant', 10);
        const displacement = getValue('displacement', 0.1);

        const springTop = 60;
        const springBottom = springTop + 150;
        const equilibriumY = springBottom + mass * 50;
        const bobY = equilibriumY + displacement * 200;

        // 天花板
        elements.push({
          id: 'ceiling',
          kind: 'rect',
          x: cx - 80,
          y: springTop - 10,
          width: 160,
          height: 10,
          style: { fill: '#666' },
        });

        // 弹簧
        const springCoils = 10;
        const springWidth = 30;
        const springLength = springBottom - springTop;
        const coilHeight = springLength / springCoils;

        elements.push({
          id: 'spring-coils',
          kind: 'spring',
          x: cx,
          y: springTop,
          length: springBottom - springTop + displacement * 200,
          coils: springCoils,
          style: { stroke: COLORS.primary, strokeWidth: 2 },
        });

        // 质量块
        elements.push({
          id: 'mass',
          kind: 'rect',
          x: cx - 30,
          y: bobY,
          width: 60,
          height: 30,
          radius: 3,
          style: { fill: COLORS.secondary, stroke: COLORS.info, strokeWidth: 2 },
        });

        // 质量标注
        elements.push({
          id: 'mass-label',
          kind: 'text',
          x: cx,
          y: bobY + 18,
          text: `m=${mass}kg`,
          fontSize: 11,
          fontWeight: 'bold',
          style: { fill: COLORS.surface },
          textAlign: 'center',
        });

        // 平衡位置线
        elements.push({
          id: 'equilibrium-line',
          kind: 'line',
          x1: cx + 50,
          y1: equilibriumY + 15,
          x2: cx + 50,
          y2: bobY + 15,
          style: { stroke: COLORS.accent, strokeWidth: 1 },
        });

        elements.push({
          id: 'displacement-label',
          kind: 'text',
          x: cx + 55,
          y: (equilibriumY + bobY) / 2 + 15,
          text: `x=${(displacement * 100).toFixed(0)}cm`,
          fontSize: 10,
          style: { fill: COLORS.accent },
        });

        // 劲度系数标注
        elements.push({
          id: 'k-label',
          kind: 'text',
          x: cx + 60,
          y: springTop + 50,
          text: `k=${springConstant}N/m`,
          fontSize: 10,
          style: { fill: COLORS.primary },
        });

        // 恢复力箭头
        const restoringForce = -springConstant * displacement;
        const arrowDirection = restoringForce > 0 ? 1 : -1;
        elements.push({
          id: 'restoring-force',
          kind: 'arrow',
          x1: cx,
          y1: bobY + 15,
          x2: cx,
          y2: bobY + 15 + arrowDirection * 30,
          style: { stroke: COLORS.danger, strokeWidth: 2 },
        });

        elements.push({
          id: 'force-label',
          kind: 'text',
          x: cx + 10,
          y: bobY + (arrowDirection > 0 ? 40 : 0),
          text: 'F',
          fontSize: 12,
          style: { fill: COLORS.danger },
        });
        break;
      }

      case 'force-composition': {
        const force1 = getValue('force1', 8);
        const angle1 = getValue('angle1', 30);
        const force2 = getValue('force2', 6);
        const angle2 = getValue('angle2', -45);

        const centerX = cx;
        const centerY = cy;

        // 坐标轴
        elements.push({
          id: 'x-axis',
          kind: 'line',
          x1: 100,
          y1: centerY,
          x2: width - 100,
          y2: centerY,
          style: { stroke: COLORS.grid, strokeWidth: 1 },
        });

        elements.push({
          id: 'y-axis',
          kind: 'line',
          x1: centerX,
          y1: 50,
          x2: centerX,
          y2: height - 50,
          style: { stroke: COLORS.grid, strokeWidth: 1 },
        });

        // 计算力的端点
        const angle1Rad = (angle1 * Math.PI) / 180;
        const angle2Rad = (angle2 * Math.PI) / 180;

        const force1EndX = centerX + force1 * 8 * Math.cos(angle1Rad);
        const force1EndY = centerY - force1 * 8 * Math.sin(angle1Rad);

        const force2EndX = centerX + force2 * 8 * Math.cos(angle2Rad);
        const force2EndY = centerY - force2 * 8 * Math.sin(angle2Rad);

        // 力F1
        elements.push({
          id: 'force1-arrow',
          kind: 'arrow',
          x1: centerX,
          y1: centerY,
          x2: force1EndX,
          y2: force1EndY,
          color: COLORS.primary,
        });

        elements.push({
          id: 'force1-label',
          kind: 'text',
          x: force1EndX + 10,
          y: force1EndY - 10,
          text: `F₁=${force1}N`,
          fontSize: 11,
          style: { fill: COLORS.primary },
        });

        // 力F2
        elements.push({
          id: 'force2-arrow',
          kind: 'arrow',
          x1: centerX,
          y1: centerY,
          x2: force2EndX,
          y2: force2EndY,
          color: COLORS.secondary,
        });

        elements.push({
          id: 'force2-label',
          kind: 'text',
          x: force2EndX + 10,
          y: force2EndY,
          text: `F₂=${force2}N`,
          fontSize: 11,
          style: { fill: COLORS.secondary },
        });

        // 平行四边形（使用虚线样式）
        elements.push({
          id: 'parallelogram-1',
          kind: 'line',
          x1: force1EndX,
          y1: force1EndY,
          x2: force1EndX + force2EndX - centerX,
          y2: force1EndY + force2EndY - centerY,
          style: { stroke: COLORS.grid, strokeWidth: 1, dash: [3, 3] },
        });

        elements.push({
          id: 'parallelogram-2',
          kind: 'line',
          x1: force2EndX,
          y1: force2EndY,
          x2: force1EndX + force2EndX - centerX,
          y2: force1EndY + force2EndY - centerY,
          style: { stroke: COLORS.grid, strokeWidth: 1, dash: [3, 3] },
        });

        // 合力
        const rx = force1 * Math.cos(angle1Rad) + force2 * Math.cos(angle2Rad);
        const ry = -(force1 * Math.sin(angle1Rad) + force2 * Math.sin(angle2Rad));
        const resultForce = Math.sqrt(rx * rx + ry * ry);
        const resultAngle = Math.atan2(-ry, rx) * (180 / Math.PI);

        const resultEndX = centerX + rx * 8;
        const resultEndY = centerY + ry * 8;

        elements.push({
          id: 'resultant-arrow',
          kind: 'arrow',
          x1: centerX,
          y1: centerY,
          x2: resultEndX,
          y2: resultEndY,
          color: COLORS.danger,
        });

        elements.push({
          id: 'resultant-label',
          kind: 'text',
          x: resultEndX + 10,
          y: resultEndY + 10,
          text: `F=${resultForce.toFixed(1)}N`,
          fontSize: 12,
          fontWeight: 'bold',
          style: { fill: COLORS.danger },
        });

        // 角度标注
        elements.push({
          id: 'angle1-label',
          kind: 'text',
          x: centerX + 60,
          y: centerY - 20,
          text: `θ₁=${angle1}°`,
          fontSize: 10,
          style: { fill: COLORS.primary },
        });

        elements.push({
          id: 'angle2-label',
          kind: 'text',
          x: centerX + 60,
          y: centerY + 20,
          text: `θ₂=${angle2}°`,
          fontSize: 10,
          style: { fill: COLORS.secondary },
        });

        // 原点
        elements.push({
          id: 'origin',
          kind: 'circle',
          cx: centerX,
          cy: centerY,
          r: 5,
          style: { fill: COLORS.text },
        });
        break;
      }

      case 'chemical-reaction-rate': {
        const temperature = getValue('temperature', 25);
        const concentration = getValue('concentration', 0.5);
        const catalyst = getValue('catalyst', 0);

        const beakerX = cx - 80;
        const beakerY = height - 200;
        const beakerWidth = 160;
        const beakerHeight = 150;
        const fillLevel = 60 + (temperature - 20) * 0.3 + concentration * 10;

        // 烧杯
        elements.push({
          id: 'beaker',
          kind: 'beaker',
          x: beakerX,
          y: beakerY,
          width: beakerWidth,
          height: beakerHeight,
          fillLevel: fillLevel,
          liquidColor: temperature > 60 ? '#FF6B6B' : temperature > 40 ? '#FFA94D' : COLORS.info,
          showMeasurements: true,
        });

        // 分子动画
        const moleculeCount = Math.floor(concentration * 10);
        for (let i = 0; i < moleculeCount; i++) {
          const mx = beakerX + 20 + Math.random() * (beakerWidth - 40);
          const my = beakerY + beakerHeight - 30 - Math.random() * (fillLevel * beakerHeight / 100 * 0.8);
          elements.push({
            id: `molecule-${i}`,
            kind: 'circle',
            cx: mx,
            cy: my,
            r: 5 + catalyst * 2,
            style: {
              fill: catalyst > 0 ? COLORS.accent : COLORS.primary,
              stroke: COLORS.surface,
              strokeWidth: 1,
            },
          });
        }

        // 温度计
        elements.push({
          id: 'thermometer',
          kind: 'rect',
          x: beakerX + beakerWidth + 20,
          y: beakerY + 20,
          width: 15,
          height: 100,
          radius: 7,
          style: { fill: '#FFF', stroke: '#CCC', strokeWidth: 1 },
        });

        // 温度计液柱
        const tempHeight = 20 + ((temperature - 20) / 80) * 80;
        elements.push({
          id: 'temp-liquid',
          kind: 'rect',
          x: beakerX + beakerWidth + 23,
          y: beakerY + 20 + (100 - tempHeight),
          width: 9,
          height: tempHeight,
          radius: 4,
          style: { fill: COLORS.danger },
        });

        // 温度标注
        elements.push({
          id: 'temp-label',
          kind: 'text',
          x: beakerX + beakerWidth + 20,
          y: beakerY + 130,
          text: `${temperature}°C`,
          fontSize: 12,
          fontWeight: 'bold',
          style: { fill: COLORS.danger },
        });

        // 催化剂
        if (catalyst > 0) {
          elements.push({
            id: 'catalyst-label',
            kind: 'text',
            x: beakerX + 10,
            y: beakerY + beakerHeight + 30,
            text: `催化剂: ${catalyst}g`,
            fontSize: 11,
            style: { fill: COLORS.accent },
          });
        }

        // 浓度标注
        elements.push({
          id: 'conc-label',
          kind: 'text',
          x: beakerX - 60,
          y: beakerY + beakerHeight - 20,
          text: `[A] = ${concentration} mol/L`,
          fontSize: 11,
          style: { fill: COLORS.text },
        });
        break;
      }
    }

    return elements;
  }, [experiment, params, width, height, getValue]);

  // 绘制画布
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清空画布
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, width, height);

    // 绘制网格
    if (showGrid) {
      ctx.strokeStyle = COLORS.grid;
      ctx.lineWidth = 0.5;
      const gridSize = 20 * scale;

      for (let x = offset.x % gridSize; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let y = offset.y % gridSize; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }

    // 绘制元素
    const elements = generateElements();
    elements.forEach((element) => {
      if (element.visible === false) return;

      const x = offset.x;
      const y = offset.y;
      const s = scale;

      // 应用样式
      if (element.style) {
        ctx.fillStyle = element.style.fill || 'transparent';
        ctx.strokeStyle = element.style.stroke || '#000';
        ctx.lineWidth = element.style.strokeWidth || 1;
        ctx.globalAlpha = element.style.opacity ?? 1;
      }

      // 绘制
      const drawValue = (val: number | string, def = 0): number => {
        if (typeof val === 'number') return val;
        if (typeof val === 'string' && val.startsWith('${')) {
          const match = val.match(/\$\{(\w+)\}/);
          if (match) {
            return params[match[1]] ?? def;
          }
        }
        return parseFloat(String(val)) || def;
      };

      switch (element.kind) {
        case 'line': {
          ctx.beginPath();
          ctx.moveTo(drawValue(element.x1) * s + x, drawValue(element.y1) * s + y);
          ctx.lineTo(drawValue(element.x2) * s + x, drawValue(element.y2) * s + y);
          ctx.stroke();
          break;
        }

        case 'rect': {
          const rx = drawValue(element.x) * s + x;
          const ry = drawValue(element.y) * s + y;
          const rw = drawValue(element.width) * s;
          const rh = drawValue(element.height) * s;

          if (element.radius) {
            ctx.beginPath();
            ctx.roundRect(rx, ry, rw, rh, drawValue(element.radius) * s);
            if (element.style?.fill && element.style.fill !== 'transparent') {
              ctx.fill();
            }
            if (element.style?.stroke) {
              ctx.stroke();
            }
          } else {
            if (element.style?.fill && element.style.fill !== 'transparent') {
              ctx.fillRect(rx, ry, rw, rh);
            }
            if (element.style?.stroke) {
              ctx.strokeRect(rx, ry, rw, rh);
            }
          }
          break;
        }

        case 'circle': {
          ctx.beginPath();
          ctx.arc(
            drawValue(element.cx) * s + x,
            drawValue(element.cy) * s + y,
            drawValue(element.r) * s,
            0,
            Math.PI * 2
          );
          if (element.style?.fill && element.style.fill !== 'transparent') {
            ctx.fill();
          }
          if (element.style?.stroke) {
            ctx.stroke();
          }
          break;
        }

        case 'arrow': {
          const ax1 = drawValue(element.x1) * s + x;
          const ay1 = drawValue(element.y1) * s + y;
          const ax2 = drawValue(element.x2) * s + x;
          const ay2 = drawValue(element.y2) * s + y;
          const headLength = 12 * s;
          const headAngle = Math.PI / 6;

          const angle = Math.atan2(ay2 - ay1, ax2 - ax1);

          ctx.strokeStyle = element.color || COLORS.primary;
          ctx.fillStyle = element.color || COLORS.primary;
          ctx.lineWidth = 3;

          ctx.beginPath();
          ctx.moveTo(ax1, ay1);
          ctx.lineTo(ax2, ay2);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(ax2, ay2);
          ctx.lineTo(
            ax2 - headLength * Math.cos(angle - headAngle),
            ay2 - headLength * Math.sin(angle - headAngle)
          );
          ctx.lineTo(
            ax2 - headLength * Math.cos(angle + headAngle),
            ay2 - headLength * Math.sin(angle + headAngle)
          );
          ctx.closePath();
          ctx.fill();
          break;
        }

        case 'text': {
          const tx = drawValue(element.x) * s + x;
          const ty = drawValue(element.y) * s + y;

          ctx.fillStyle = element.style?.fill || COLORS.text;
          ctx.font = `${element.fontWeight || 'normal'} ${(element.fontSize || 14) * s}px sans-serif`;
          ctx.textAlign = (element.textAlign as CanvasTextAlign) || 'left';
          ctx.textBaseline = (element.textBaseline as CanvasTextBaseline) || 'top';
          ctx.fillText(element.text, tx, ty);
          break;
        }

        case 'arc': {
          ctx.beginPath();
          ctx.arc(
            drawValue(element.cx) * s + x,
            drawValue(element.cy) * s + y,
            drawValue(element.r) * s,
            (drawValue(element.startAngle) * Math.PI) / 180,
            (drawValue(element.endAngle) * Math.PI) / 180
          );
          ctx.stroke();
          break;
        }

        case 'beaker': {
          const bkX = drawValue(element.x) * s + x;
          const bkY = drawValue(element.y) * s + y;
          const bkW = drawValue(element.width) * s;
          const bkH = drawValue(element.height) * s;
          const fillLevel = drawValue(element.fillLevel || 60);

          // 烧杯外框
          ctx.strokeStyle = '#888';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(bkX, bkY);
          ctx.lineTo(bkX - 5 * s, bkY + bkH);
          ctx.lineTo(bkX + bkW + 5 * s, bkY + bkH);
          ctx.lineTo(bkX + bkW, bkY);
          ctx.stroke();

          // 液面
          const liquidH = (bkH * fillLevel) / 100;
          const liquidY = bkY + bkH - liquidH;
          ctx.fillStyle = element.liquidColor || COLORS.info;
          ctx.globalAlpha = 0.6;
          ctx.beginPath();
          ctx.moveTo(bkX + 2 * s, liquidY);
          ctx.lineTo(bkX - 3 * s, bkY + bkH - 2 * s);
          ctx.lineTo(bkX + bkW + 3 * s, bkY + bkH - 2 * s);
          ctx.lineTo(bkX + bkW - 2 * s, liquidY);
          ctx.closePath();
          ctx.fill();
          ctx.globalAlpha = 1;

          // 刻度
          if (element.showMeasurements) {
            ctx.fillStyle = COLORS.text;
            ctx.font = `${10 * s}px sans-serif`;
            for (let i = 0; i <= 4; i++) {
              const my = bkY + bkH - (i * bkH) / 4;
              ctx.fillText(`${100 - i * 25}%`, bkX + bkW + 5, my + 3);
              ctx.beginPath();
              ctx.moveTo(bkX + bkW, my);
              ctx.lineTo(bkX + bkW + 5 * s, my);
              ctx.stroke();
            }
          }
          break;
        }

        case 'spring': {
          const spX = drawValue(element.x) * s + x;
          const spY = drawValue(element.y) * s + y;
          const spLength = drawValue(element.length) * s;
          const coils = element.coils || 8;

          ctx.strokeStyle = element.style?.stroke || COLORS.primary;
          ctx.lineWidth = 2;

          ctx.beginPath();
          const coilHeight = spLength / coils;
          const amplitude = 10 * s;
          ctx.moveTo(spX, spY);

          for (let i = 0; i < coils; i++) {
            const y1 = spY + i * coilHeight + coilHeight / 4;
            const y2 = spY + i * coilHeight + (3 * coilHeight) / 4;
            ctx.lineTo(spX + (i % 2 === 0 ? amplitude : -amplitude), y1);
            ctx.lineTo(spX + (i % 2 === 0 ? -amplitude : amplitude), y2);
          }
          ctx.lineTo(spX, spY + spLength);
          ctx.stroke();
          break;
        }
      }

      ctx.globalAlpha = 1;
    });
  }, [experiment, params, width, height, scale, offset, showGrid, generateElements]);

  // 动画循环
  useEffect(() => {
    const startTime = Date.now();

    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      setAnimationTime(elapsed);
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="border border-gray-200 rounded-lg shadow-sm bg-white"
        style={{ touchAction: 'none' }}
      />
    </div>
  );
};

export default ExperimentCanvas;
