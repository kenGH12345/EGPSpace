import type { CanvasElement } from './experiment-schema';

export type PresetTemplateType = 'buoyancy' | 'lever' | 'refraction' | 'circuit';

export function buildPresetElements(
  type: string,
  layout: { width: number; height: number },
  params: Record<string, number>,
  computed: Record<string, number>
): CanvasElement[] {
  switch (type) {
    case 'buoyancy': return buildBuoyancyElements(layout, params, computed);
    case 'lever': return buildLeverElements(layout, params, computed);
    case 'refraction': return buildRefractionElements(layout, params, computed);
    case 'circuit': return buildCircuitElements(layout, params, computed);
    default: return [];
  }
}

function buildBuoyancyElements(
  layout: { width: number; height: number },
  params: Record<string, number>,
  computed: Record<string, number>
): CanvasElement[] {
  const { width, height } = layout;
  const liquidLevel = height * 0.6;
  const objectX = width / 2 - 30;
  const objectWidth = 60;
  const objectHeight = 80;

  const immersionRatio = computed['objectImmersionRatio'] ?? computed['immersionRatio'] ?? 0.8;
  const objectY = liquidLevel - objectHeight * immersionRatio;

  const stateNum = computed['state'] ?? 0;
  const stateColor = stateNum === 1 ? '#10B981' : stateNum === -1 ? '#EF4444' : '#3B82F6';

  const buoyantForce = computed['buoyantForce'] ?? 0;
  const gravity = computed['gravity'] ?? 0;
  const arrowUpLen = Math.min(buoyantForce / 2, 60);
  const arrowDownLen = Math.min(gravity / 2, 60);

  const elements: CanvasElement[] = [
    // Liquid background
    {
      id: 'liquid-bg',
      type: 'rect',
      x: 0,
      y: liquidLevel,
      width,
      height: height - liquidLevel,
      fill: '#06B6D4',
      opacity: 0.3,
    },
    // Liquid surface dashed line
    {
      id: 'liquid-surface',
      type: 'line',
      x: 0,
      y: liquidLevel,
      x2: width,
      y2: liquidLevel,
      stroke: '#0EA5E9',
      strokeWidth: 2,
    },
    // Object body
    {
      id: 'object-body',
      type: 'rect',
      x: objectX,
      y: objectY,
      width: objectWidth,
      height: objectHeight,
      fill: stateColor,
      stroke: '#333',
      strokeWidth: 2,
    },
    // Immersion ratio label
    {
      id: 'immersion-label',
      type: 'text',
      x: objectX - 10,
      y: objectY - 10,
      text: `浸入比例: ${(immersionRatio * 100).toFixed(0)}%`,
      fill: '#059669',
      fontSize: 12,
    },
  ];

  // Buoyancy force arrow (upward)
  if (buoyantForce > 0) {
    elements.push({
      id: 'buoyancy-arrow',
      type: 'forceArrow',
      x: objectX + objectWidth / 2,
      y: objectY,
      angle: -90,
      magnitude: arrowUpLen,
      stroke: '#3B82F6',
      fill: '#3B82F6',
      strokeWidth: 3,
      label: 'F浮',
    });
  }

  // Gravity arrow (downward)
  elements.push({
    id: 'gravity-arrow',
    type: 'forceArrow',
    x: objectX + objectWidth / 2,
    y: objectY + objectHeight,
    angle: 90,
    magnitude: arrowDownLen,
    stroke: '#EF4444',
    fill: '#EF4444',
    strokeWidth: 3,
    label: 'G',
  });

  return elements;
}

function buildLeverElements(
  layout: { width: number; height: number },
  params: Record<string, number>,
  computed: Record<string, number>
): CanvasElement[] {
  const { width, height } = layout;
  const fulcrumY = height * 0.6;
  const fulcrumX = width / 2;
  const leverLength = 400;
  const leverHeight = 10;

  const leftArm = params['leftArm'] ?? 20;
  const rightArm = params['rightArm'] ?? 20;
  const leftMass = params['leftMass'] ?? 2;
  const rightMass = params['rightMass'] ?? 2;

  const isBalanced = computed['isBalanced'] === 1 || Math.abs((leftArm * leftMass) - (rightArm * rightMass)) < 0.01;
  const leftHeavier = leftArm * leftMass > rightArm * rightMass;

  const leftX = fulcrumX - leftArm * 2;
  const rightX = fulcrumX + rightArm * 2;

  const elements: CanvasElement[] = [
    // Fulcrum triangle
    {
      id: 'fulcrum',
      type: 'polygon',
      x: 0,
      y: 0,
      points: [
        { x: fulcrumX, y: fulcrumY - 20 },
        { x: fulcrumX - 15, y: fulcrumY + 10 },
        { x: fulcrumX + 15, y: fulcrumY + 10 },
      ],
      fill: '#6B7280',
    },
    // Lever beam
    {
      id: 'lever-beam',
      type: 'rect',
      x: fulcrumX - leverLength / 2,
      y: fulcrumY - leverHeight / 2,
      width: leverLength,
      height: leverHeight,
      fill: '#F59E0B',
      stroke: '#D97706',
      strokeWidth: 2,
    },
    // Left weight
    {
      id: 'left-weight',
      type: 'rect',
      x: leftX - 15,
      y: fulcrumY - leverHeight / 2 - 50,
      width: 30,
      height: 50,
      fill: !isBalanced && leftHeavier ? '#EF4444' : '#3B82F6',
    },
    // Left weight label
    {
      id: 'left-weight-label',
      type: 'text',
      x: leftX - 10,
      y: fulcrumY - leverHeight / 2 - 55,
      text: `${leftMass}kg`,
      fill: '#fff',
      fontSize: 12,
    },
    // Right weight
    {
      id: 'right-weight',
      type: 'rect',
      x: rightX - 15,
      y: fulcrumY - leverHeight / 2 - 50,
      width: 30,
      height: 50,
      fill: !isBalanced && !leftHeavier ? '#EF4444' : '#3B82F6',
    },
    // Right weight label
    {
      id: 'right-weight-label',
      type: 'text',
      x: rightX - 10,
      y: fulcrumY - leverHeight / 2 - 55,
      text: `${rightMass}kg`,
      fill: '#fff',
      fontSize: 12,
    },
    // Left arm label
    {
      id: 'left-arm-label',
      type: 'text',
      x: leftX - 25,
      y: fulcrumY - leverHeight / 2 + 30,
      text: `左力臂: ${leftArm}cm`,
      fill: '#6B7280',
      fontSize: 12,
    },
    // Right arm label
    {
      id: 'right-arm-label',
      type: 'text',
      x: rightX - 20,
      y: fulcrumY - leverHeight / 2 + 30,
      text: `右力臂: ${rightArm}cm`,
      fill: '#6B7280',
      fontSize: 12,
    },
    // Scale ticks
    ...Array.from({ length: 11 }, (_, i) => {
      const idx = i - 5;
      const tx = fulcrumX + idx * 40;
      return [
        {
          id: `tick-${i}`,
          type: 'rect' as const,
          x: tx - 1,
          y: fulcrumY + leverHeight / 2,
          width: 2,
          height: 5,
          fill: '#9CA3AF',
        },
        {
          id: `tick-label-${i}`,
          type: 'text' as const,
          x: tx - 10,
          y: fulcrumY + leverHeight / 2 + 15,
          text: `${idx * 10}cm`,
          fill: '#9CA3AF',
          fontSize: 10,
        },
      ];
    }).flat(),
    // Balance state label
    {
      id: 'state-label',
      type: 'text',
      x: width / 2 - 30,
      y: 50,
      text: isBalanced ? '⚖ 平衡！' : leftHeavier ? '⊥ ← 左倾' : '⊥ 右倾 →',
      fill: isBalanced ? '#10B981' : '#EF4444',
      fontSize: 14,
    },
  ];

  return elements;
}

function buildRefractionElements(
  layout: { width: number; height: number },
  params: Record<string, number>,
  computed: Record<string, number>
): CanvasElement[] {
  const { width, height } = layout;
  const interfaceY = height * 0.5;
  const centerX = width / 2;

  const isTotalReflection = (computed['isTotalReflection'] ?? 0) > 0;
  const rayLength = 120;

  const incidentDeg = params['incidentAngle'] ?? 30;
  const refractionDeg = computed['refractionAngle'] ?? 20;

  const elements: CanvasElement[] = [
    // Air region
    {
      id: 'air-region',
      type: 'rect',
      x: 0,
      y: 0,
      width,
      height: interfaceY,
      fill: '#F3F4F6',
    },
    // Medium region
    {
      id: 'medium-region',
      type: 'rect',
      x: 0,
      y: interfaceY,
      width,
      height: height - interfaceY,
      fill: '#93C5FD',
      opacity: 0.5,
    },
    // Interface line
    {
      id: 'interface-line',
      type: 'line',
      x: 0,
      y: interfaceY,
      x2: width,
      y2: interfaceY,
      stroke: '#374151',
      strokeWidth: 2,
    },
    // Normal line (dashed — rendered as line with opacity trick)
    {
      id: 'normal-line',
      type: 'line',
      x: centerX,
      y: interfaceY - 100,
      x2: centerX,
      y2: interfaceY + 100,
      stroke: '#6B7280',
      strokeWidth: 1,
      opacity: 0.6,
    },
    // Incident ray
    {
      id: 'incident-ray',
      type: 'lightRay',
      x: centerX,
      y: interfaceY,
      angle: -(90 - incidentDeg),
      length: rayLength,
      stroke: '#F59E0B',
      strokeWidth: 3,
    },
    // Incident angle arc
    {
      id: 'incident-arc',
      type: 'arc',
      x: centerX,
      y: interfaceY,
      radius: 30,
      startAngle: -90,
      endAngle: -90 + incidentDeg,
      stroke: '#F59E0B',
      strokeWidth: 1,
    },
    // Incident angle label
    {
      id: 'incident-label',
      type: 'text',
      x: centerX + 35,
      y: interfaceY - 15,
      text: `${incidentDeg}°`,
      fill: '#F59E0B',
      fontSize: 12,
    },
    // Air / medium labels
    {
      id: 'air-label',
      type: 'text',
      x: 20,
      y: interfaceY - 10,
      text: '空气',
      fill: '#374151',
      fontSize: 12,
    },
    {
      id: 'medium-label',
      type: 'text',
      x: 20,
      y: interfaceY + 30,
      text: '介质',
      fill: '#374151',
      fontSize: 12,
    },
  ];

  if (isTotalReflection) {
    elements.push({
      id: 'total-reflection-ray',
      type: 'lightRay',
      x: centerX,
      y: interfaceY,
      angle: 90 - incidentDeg,
      length: rayLength,
      stroke: '#EF4444',
      strokeWidth: 3,
    });
    elements.push({
      id: 'total-reflection-label',
      type: 'text',
      x: centerX + 50,
      y: interfaceY + 20,
      text: '全反射',
      fill: '#EF4444',
      fontSize: 12,
    });
  } else {
    elements.push({
      id: 'refraction-ray',
      type: 'lightRay',
      x: centerX,
      y: interfaceY,
      angle: 90 - refractionDeg,
      length: rayLength,
      stroke: '#10B981',
      strokeWidth: 3,
    });
    elements.push({
      id: 'refraction-arc',
      type: 'arc',
      x: centerX,
      y: interfaceY,
      radius: 30,
      startAngle: 90 - refractionDeg,
      endAngle: 90,
      stroke: '#10B981',
      strokeWidth: 1,
    });
    elements.push({
      id: 'refraction-label',
      type: 'text',
      x: centerX + 35,
      y: interfaceY + 20,
      text: `${refractionDeg.toFixed(1)}°`,
      fill: '#10B981',
      fontSize: 12,
    });
  }

  return elements;
}

function buildCircuitElements(
  layout: { width: number; height: number },
  params: Record<string, number>,
  computed: Record<string, number>
): CanvasElement[] {
  const { width, height } = layout;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = 80;

  const voltage = computed['voltage'] ?? params['voltage'] ?? 12;
  const current = computed['current'] ?? 0;
  const resistance = params['resistance'] ?? 10;

  return [
    // Battery
    {
      id: 'battery',
      type: 'rect',
      x: centerX - 100,
      y: centerY - 15,
      width: 30,
      height: 30,
      fill: '#F59E0B',
    },
    {
      id: 'battery-label',
      type: 'text',
      x: centerX - 93,
      y: centerY + 5,
      text: 'E',
      fill: '#fff',
      fontSize: 12,
    },
    // Resistor
    {
      id: 'resistor',
      type: 'rect',
      x: centerX + 70,
      y: centerY - 15,
      width: 30,
      height: 30,
      fill: '#6B7280',
    },
    {
      id: 'resistor-label',
      type: 'text',
      x: centerX + 78,
      y: centerY + 5,
      text: 'R',
      fill: '#fff',
      fontSize: 12,
    },
    // Top wire
    {
      id: 'wire-top-left',
      type: 'line',
      x: centerX - 70,
      y: centerY - 15,
      x2: centerX - 70,
      y2: centerY - radius,
      stroke: '#374151',
      strokeWidth: 3,
    },
    {
      id: 'wire-top',
      type: 'line',
      x: centerX - 70,
      y: centerY - radius,
      x2: centerX + 70,
      y2: centerY - radius,
      stroke: '#374151',
      strokeWidth: 3,
    },
    {
      id: 'wire-top-right',
      type: 'line',
      x: centerX + 70,
      y: centerY - radius,
      x2: centerX + 70,
      y2: centerY - 15,
      stroke: '#374151',
      strokeWidth: 3,
    },
    // Bottom wire
    {
      id: 'wire-bottom-left',
      type: 'line',
      x: centerX - 70,
      y: centerY + 15,
      x2: centerX - 70,
      y2: centerY + radius,
      stroke: '#374151',
      strokeWidth: 3,
    },
    {
      id: 'wire-bottom',
      type: 'line',
      x: centerX - 70,
      y: centerY + radius,
      x2: centerX + 70,
      y2: centerY + radius,
      stroke: '#374151',
      strokeWidth: 3,
    },
    {
      id: 'wire-bottom-right',
      type: 'line',
      x: centerX + 70,
      y: centerY + radius,
      x2: centerX + 70,
      y2: centerY + 15,
      stroke: '#374151',
      strokeWidth: 3,
    },
    // Current arrows
    {
      id: 'current-arrow-top',
      type: 'text',
      x: centerX - 20,
      y: centerY - radius + 25,
      text: '→',
      fill: '#3B82F6',
      fontSize: 12,
    },
    {
      id: 'current-arrow-bottom',
      type: 'text',
      x: centerX - 20,
      y: centerY + radius - 15,
      text: '→',
      fill: '#3B82F6',
      fontSize: 12,
    },
    // Value labels
    {
      id: 'voltage-label',
      type: 'text',
      x: 20,
      y: 30,
      text: `U = ${voltage.toFixed(1)}V`,
      fill: '#374151',
      fontSize: 14,
    },
    {
      id: 'current-label',
      type: 'text',
      x: 20,
      y: 55,
      text: `I = ${current.toFixed(2)}A`,
      fill: '#374151',
      fontSize: 14,
    },
    {
      id: 'resistance-label',
      type: 'text',
      x: 20,
      y: 80,
      text: `R = ${resistance}Ω`,
      fill: '#374151',
      fontSize: 14,
    },
  ];
}
