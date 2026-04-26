import type { CanvasElement } from './experiment-schema';

export type PresetTemplateType = 'buoyancy' | 'lever' | 'refraction' | 'circuit'
  | 'acid_base' | 'electrolysis' | 'reaction_rate' | 'combustion';

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
    // Chemistry experiments
    case 'acid_base': return buildAcidBaseTitrationElements(layout, params, computed);
    case 'electrolysis': return buildElectrolysisElements(layout, params, computed);
    case 'reaction_rate': return buildReactionRateElements(layout, params, computed);
    case 'combustion': return buildCombustionElements(layout, params, computed);
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

// ============ Chemistry Experiment Canvas Renderers ============

function buildAcidBaseTitrationElements(
  layout: { width: number; height: number },
  params: Record<string, number>,
  computed: Record<string, number>
): CanvasElement[] {
  const { width, height } = layout;
  const C_acid = params['C_acid'] ?? 0.1;
  const C_base = params['C_base'] ?? 0.1;
  const V_acid = params['V_acid'] ?? 25;
  const V_added = params['V_added'] ?? 0;

  const n_acid = computed['n_acid'] ?? C_acid * V_acid;
  const n_base = computed['n_base'] ?? C_base * V_added;
  const pH = computed['pH_value'] ?? 7.0;

  const buretteHeight = 120;
  const maxAdded = 50;
  const liquidRatio = Math.min(V_added / maxAdded, 1);
  const liquidHeight = buretteHeight * liquidRatio;
  const liquidY = 30 + buretteHeight - liquidHeight;

  const FLASK_X = width / 2 + 80;
  const FLASK_Y = 140;
  const FLASK_W = 70;
  const FLASK_H = 85;

  // pH color mapping
  const liquidColor = pH < 6.9 ? 'rgba(255,107,107,0.6)' : pH > 7.1 ? 'rgba(107,171,255,0.6)' : 'rgba(156,163,175,0.5)';

  const status = pH < 6.9 ? '酸性 (未中和)' : pH > 7.1 ? '碱性 (过量)' : '中性 (已中和)';
  const statusColor = pH < 6.9 ? '#ef4444' : pH > 7.1 ? '#3b82f6' : '#10b981';

  return [
    // Burette body
    {
      id: 'burette',
      type: 'rect',
      x: width / 2 - 30,
      y: 30,
      width: 18,
      height: 120,
      fill: 'rgba(200,220,255,0.5)',
      stroke: '#3b82f6',
      strokeWidth: 2,
    },
    // Burette liquid
    {
      id: 'burette-liquid',
      type: 'rect',
      x: width / 2 - 28,
      y: liquidY,
      width: 14,
      height: liquidHeight,
      fill: 'rgba(59,130,246,0.5)',
      stroke: 'none',
    },
    // Scale marks on burette
    ...Array.from({ length: 6 }, (_, i) => ({
      id: `burette-scale-${i}`,
      type: 'line' as const,
      x: width / 2 - 30,
      y: 30 + i * 20,
      x2: width / 2 - 12,
      y2: 30 + i * 20,
      stroke: '#3b82f6',
      strokeWidth: 1,
      opacity: 0.5,
    })),
    // Stopcock
    {
      id: 'stopcock',
      type: 'rect',
      x: width / 2 - 38,
      y: 148,
      width: 34,
      height: 10,
      fill: '#6b7280',
      stroke: '#4b5563',
      strokeWidth: 1,
    },
    // Burette tip
    {
      id: 'burette-tip',
      type: 'polygon',
      x: 0,
      y: 0,
      points: [
        { x: width / 2 - 30, y: 158 },
        { x: width / 2 - 12, y: 158 },
        { x: width / 2 - 21, y: 172 },
      ],
      fill: 'rgba(200,220,255,0.5)',
      stroke: '#3b82f6',
      strokeWidth: 1,
    },
    // Drip (shown when V_added is increasing)
    ...(V_added > 0 && V_added < maxAdded ? [{
      id: 'drip',
      type: 'circle' as const,
      x: width / 2 - 21,
      y: 175 + Math.sin(V_added * 10) * 15,
      radius: 2,
      fill: 'rgba(59,130,246,0.8)',
    }] : []),
    // Flask outline
    {
      id: 'flask',
      type: 'polygon',
      x: 0,
      y: 0,
      points: [
        { x: FLASK_X - FLASK_W / 2, y: FLASK_Y + FLASK_H / 2 },
        { x: FLASK_X + FLASK_W / 2, y: FLASK_Y + FLASK_H / 2 },
        { x: FLASK_X + 12, y: FLASK_Y - FLASK_H / 2 },
        { x: FLASK_X - 12, y: FLASK_Y - FLASK_H / 2 },
      ],
      fill: 'rgba(255,255,255,0.6)',
      stroke: '#94a3b8',
      strokeWidth: 2,
    },
    // Flask liquid
    {
      id: 'flask-liquid',
      type: 'polygon',
      x: 0,
      y: 0,
      points: [
        { x: FLASK_X - FLASK_W / 2 + 6, y: FLASK_Y + FLASK_H / 2 - 5 },
        { x: FLASK_X + FLASK_W / 2 - 6, y: FLASK_Y + FLASK_H / 2 - 5 },
        { x: FLASK_X + 9, y: FLASK_Y + 20 },
        { x: FLASK_X - 9, y: FLASK_Y + 20 },
      ],
      fill: liquidColor,
      stroke: 'none',
    },
    // Indicator label
    {
      id: 'indicator-label',
      type: 'text',
      x: FLASK_X - 30,
      y: FLASK_Y + FLASK_H / 2 + 15,
      text: '含酚酞指示剂',
      fill: '#6b7280',
      fontSize: 10,
    },
    // pH value
    {
      id: 'ph-value',
      type: 'text',
      x: FLASK_X + 40,
      y: FLASK_Y + 40,
      text: `pH: ${pH.toFixed(2)}`,
      fill: '#e11d48',
      fontSize: 15,
      fontWeight: 'bold',
    },
    // Status label
    {
      id: 'status-label',
      type: 'text',
      x: FLASK_X + 40,
      y: FLASK_Y + 65,
      text: status,
      fill: statusColor,
      fontSize: 12,
    },
    // Volume added label
    {
      id: 'volume-label',
      type: 'text',
      x: 20,
      y: 30,
      text: `已加入 ${V_added.toFixed(1)} mL NaOH`,
      fill: '#1f2937',
      fontSize: 13,
    },
    // Concentration info
    {
      id: 'conc-info',
      type: 'text',
      x: 20,
      y: 55,
      text: `HCl: ${C_acid.toFixed(2)} mol/L, NaOH: ${C_base.toFixed(2)} mol/L`,
      fill: '#4b5563',
      fontSize: 11,
    },
  ];
}

function buildElectrolysisElements(
  layout: { width: number; height: number },
  params: Record<string, number>,
  computed: Record<string, number>
): CanvasElement[] {
  const { width, height } = layout;
  const voltage = params['voltage'] ?? 12;
  const conductivity = params['conductivity'] ?? 5;
  const time = params['time'] ?? 5;

  const H2_volume = computed['H2_volume'] ?? 0;
  const O2_volume = computed['O2_volume'] ?? 0;

  const centerX = width / 2;
  const tankX = centerX - 80;
  const tankY = 70;
  const tankW = 160;
  const tankH = 140;

  // Bubble animation phase based on time
  const bubblePhase = time * 0.5;

  return [
    // Electrolysis tank
    {
      id: 'tank',
      type: 'rect',
      x: tankX,
      y: tankY,
      width: tankW,
      height: tankH,
      fill: 'rgba(200,235,255,0.3)',
      stroke: '#60a5fa',
      strokeWidth: 2,
    },
    // Electrolyte background
    {
      id: 'electrolyte',
      type: 'rect',
      x: tankX + 5,
      y: tankY + 30,
      width: tankW - 10,
      height: tankH - 35,
      fill: 'rgba(186,230,253,0.2)',
      stroke: 'none',
    },
    // Anode electrode (left, +)
    {
      id: 'anode',
      type: 'rect',
      x: tankX + 20,
      y: tankY + 15,
      width: 5,
      height: tankH - 20,
      fill: '#ef4444',
      stroke: '#b91c1c',
      strokeWidth: 1,
    },
    // Anode label
    {
      id: 'anode-label',
      type: 'text',
      x: tankX + 5,
      y: tankY + 10,
      text: '+ 阳极',
      fill: '#dc2626',
      fontSize: 11,
    },
    // Cathode electrode (right, -)
    {
      id: 'cathode',
      type: 'rect',
      x: tankX + tankW - 25,
      y: tankY + 15,
      width: 5,
      height: tankH - 20,
      fill: '#3b82f6',
      stroke: '#1d4ed8',
      strokeWidth: 1,
    },
    // Cathode label
    {
      id: 'cathode-label',
      type: 'text',
      x: tankX + tankW - 40,
      y: tankY + 10,
      text: '- 阴极',
      fill: '#2563eb',
      fontSize: 11,
    },
    // Wire connections
    {
      id: 'wire-left-top',
      type: 'line',
      x: tankX + 22,
      y: tankY + 15,
      x2: tankX + 22,
      y2: tankY - 20,
      stroke: '#6b7280',
      strokeWidth: 2,
    },
    {
      id: 'wire-right-top',
      type: 'line',
      x: tankX + tankW - 22,
      y: tankY + 15,
      x2: tankX + tankW - 22,
      y2: tankY - 20,
      stroke: '#6b7280',
      strokeWidth: 2,
    },
    {
      id: 'wire-top',
      type: 'line',
      x: tankX + 22,
      y: tankY - 20,
      x2: tankX + tankW - 22,
      y2: tankY - 20,
      stroke: '#6b7280',
      strokeWidth: 2,
    },
    // H₂ gas bubbles (left side, cathode)
    ...Array.from({ length: Math.min(Math.floor(H2_volume / 2) + 3, 20) }, (_, i) => {
      const bx = tankX + 30 + Math.sin(bubblePhase + i * 1.5) * 15;
      const by = tankY + 50 + ((i * 30 + bubblePhase * 20) % (tankH - 60));
      return {
        id: `h2-bubble-${i}`,
        type: 'circle' as const,
        x: bx,
        y: by,
        radius: 2 + Math.sin(i * 0.7) * 1.5,
        fill: 'rgba(186,230,253,0.7)',
        stroke: 'rgba(147,197,253,0.5)',
        strokeWidth: 1,
      };
    }),
    // O₂ gas bubbles (right side, anode)
    ...Array.from({ length: Math.min(Math.floor(O2_volume / 3) + 2, 12) }, (_, i) => {
      const bx = tankX + tankW - 30 + Math.cos(bubblePhase + i * 1.5) * 15;
      const by = tankY + 50 + ((i * 40 + bubblePhase * 25) % (tankH - 60));
      return {
        id: `o2-bubble-${i}`,
        type: 'circle' as const,
        x: bx,
        y: by,
        radius: 2 + Math.cos(i * 0.7) * 1.5,
        fill: 'rgba(254,202,202,0.7)',
        stroke: 'rgba(252,165,165,0.5)',
        strokeWidth: 1,
      };
    }),
    // H₂ volume label
    {
      id: 'h2-label',
      type: 'text',
      x: 30,
      y: 120,
      text: `H₂: ${H2_volume.toFixed(1)} mL`,
      fill: '#1d4ed8',
      fontSize: 13,
    },
    // O₂ volume label
    {
      id: 'o2-label',
      type: 'text',
      x: 30,
      y: 145,
      text: `O₂: ${O2_volume.toFixed(1)} mL`,
      fill: '#b91c1c',
      fontSize: 13,
    },
    // Ratio label
    {
      id: 'ratio-label',
      type: 'text',
      x: 30,
      y: 170,
      text: 'V(H₂) : V(O₂) ≈ 2 : 1',
      fill: '#3f6212',
      fontSize: 12,
    },
    // Control info
    {
      id: 'control-info',
      type: 'text',
      x: tankX + 10,
      y: 30,
      text: `电压: ${voltage.toFixed(1)}V | NaOH: ${conductivity}%`,
      fill: '#1f2937',
      fontSize: 11,
    },
  ];
}

function buildReactionRateElements(
  layout: { width: number; height: number },
  params: Record<string, number>,
  computed: Record<string, number>
): CanvasElement[] {
  const { width, height } = layout;
  const temperature = params['temperature'] ?? 25;
  const concentration = params['concentration'] ?? 0.1;
  const catalyst = params['catalyst'] ?? 1;

  const rate_constant = computed['rate_constant'] ?? 0.05;
  const reactionRate = computed['reaction_rate'] ?? 0.005;

  const vesselX = 30;
  const vesselY = 60;
  const vesselW = width - 180;
  const vesselH = 160;

  // Particle count based on rate
  const particleCount = Math.min(Math.floor(reactionRate * 200) + 3, 40);

  // Speed factor based on temperature
  const speedFactor = temperature / 25;

  return [
    // Reaction vessel
    {
      id: 'vessel',
      type: 'rect',
      x: vesselX,
      y: vesselY,
      width: vesselW,
      height: vesselH,
      fill: 'rgba(255,255,255,0.8)',
      stroke: '#94a3b8',
      strokeWidth: 2,
    },
    // Particles
    ...Array.from({ length: particleCount }, (_, i) => {
      const px = vesselX + 15 + Math.sin(i * 2.3 + reactionRate * 10) * (vesselW / 2 - 20);
      const py = vesselY + 20 + Math.cos(i * 1.7 + reactionRate * 8) * (vesselH / 2 - 20);
      return {
        id: `particle-${i}`,
        type: 'circle' as const,
        x: px,
        y: py,
        radius: 3 + catalyst * 0.5,
        fill: reactionRate > 0.1 ? '#dc2626' : reactionRate > 0.05 ? '#ea580c' : '#f97316',
      };
    }),
    // Speed indicator
    {
      id: 'speed-label',
      type: 'text',
      x: vesselX + 10,
      y: vesselY + vesselH + 20,
      text: `分子平均动能: ${speedFactor.toFixed(1)}x`,
      fill: '#7c3aed',
      fontSize: 11,
    },
    // Reaction rate display
    {
      id: 'rate-display',
      type: 'text',
      x: width - 140,
      y: 60,
      text: `v = ${reactionRate.toFixed(4)}`,
      fill: '#ea580c',
      fontSize: 15,
      fontWeight: 'bold',
    },
    // Rate unit
    {
      id: 'rate-unit',
      type: 'text',
      x: width - 140,
      y: 80,
      text: 'mol/(L·s)',
      fill: '#6b7280',
      fontSize: 11,
    },
    // Temperature display
    {
      id: 'temp-display',
      type: 'text',
      x: width - 140,
      y: 110,
      text: `T = ${temperature} °C`,
      fill: '#374151',
      fontSize: 12,
    },
    // Concentration display
    {
      id: 'conc-display',
      type: 'text',
      x: width - 140,
      y: 135,
      text: `C = ${concentration.toFixed(2)} mol/L`,
      fill: '#374151',
      fontSize: 12,
    },
    // Rate constant display
    {
      id: 'k-display',
      type: 'text',
      x: width - 140,
      y: 160,
      text: `k = ${rate_constant.toFixed(4)}`,
      fill: '#374151',
      fontSize: 12,
    },
    // Catalyst indicator
    ...(catalyst > 1 ? [{
      id: 'catalyst-label',
      type: 'text' as const,
      x: width - 140,
      y: 185,
      text: `催化剂: ${catalyst.toFixed(1)}x活性`,
      fill: '#84cc16',
      fontSize: 11,
    }] : []),
  ];
}

function buildCombustionElements(
  layout: { width: number; height: number },
  params: Record<string, number>,
  computed: Record<string, number>
): CanvasElement[] {
  const { width, height } = layout;
  const temperature = params['temperature'] ?? 25;
  const o2_percent = params['o2_percent'] ?? 21;
  const fuel_type = params['fuel_type'] ?? 1;

  const ignition_point = computed['ignition_point'] ?? 300;
  const isBurning = (computed['is_burning'] ?? 0) > 0;

  // Fuel colors
  const fuelColors: Record<number, string> = {
    1: '#92400e',
    2: '#d97706',
    3: '#60a5fa',
  };
  const fuelNames: Record<number, string> = {
    1: '木材(燃点300°C)',
    2: '纸张(燃点230°C)',
    3: '乙醇(燃点363°C)',
  };

  const fuelColor = fuelColors[fuel_type] ?? '#d1d5db';
  const fuelName = fuelNames[fuel_type] ?? '无可燃物';

  // Condition checks
  const hasFuel = fuel_type > 0;
  const enoughO2 = o2_percent > 10;
  const hotEnough = temperature >= ignition_point;

  // Flame flicker animation
  const flameHeight = isBurning ? 20 + Math.sin(temperature * 0.1) * 5 : 0;

  return [
    // === Zone 1: Fuel ===
    {
      id: 'zone1-bg',
      type: 'rect',
      x: 20,
      y: 30,
      width: 160,
      height: 100,
      fill: hasFuel ? 'rgba(254,242,199,0.5)' : 'rgba(229,231,235,0.3)',
      stroke: hasFuel ? '#fbbf24' : '#9ca3af',
      strokeWidth: 1,
    },
    {
      id: 'zone1-title',
      type: 'text',
      x: 30,
      y: 50,
      text: '条件1: 可燃物',
      fill: '#374151',
      fontSize: 12,
      fontWeight: 'bold',
    },
    {
      id: 'zone1-check',
      type: 'text',
      x: 30,
      y: 70,
      text: hasFuel ? '✅' : '❌',
      fill: hasFuel ? '#10b981' : '#ef4444',
      fontSize: 16,
    },
    {
      id: 'fuel-name',
      type: 'text',
      x: 55,
      y: 70,
      text: fuelName,
      fill: '#374151',
      fontSize: 10,
    },
    {
      id: 'fuel-visual',
      type: 'polygon',
      x: 0,
      y: 0,
      points: [
        { x: 40, y: 90 },
        { x: 80, y: 80 },
        { x: 90, y: 100 },
        { x: 50, y: 110 },
      ],
      fill: hasFuel ? fuelColor : '#d1d5db',
      stroke: hasFuel ? '#78350f' : 'none',
      strokeWidth: 1,
    },

    // === Zone 2: Oxygen ===
    {
      id: 'zone2-bg',
      type: 'rect',
      x: 200,
      y: 30,
      width: 160,
      height: 100,
      fill: enoughO2 ? 'rgba(219,234,254,0.5)' : 'rgba(229,231,235,0.3)',
      stroke: enoughO2 ? '#60a5fa' : '#9ca3af',
      strokeWidth: 1,
    },
    {
      id: 'zone2-title',
      type: 'text',
      x: 210,
      y: 50,
      text: '条件2: 助燃物',
      fill: '#374151',
      fontSize: 12,
      fontWeight: 'bold',
    },
    {
      id: 'zone2-check',
      type: 'text',
      x: 210,
      y: 70,
      text: enoughO2 ? '✅' : '❌',
      fill: enoughO2 ? '#10b981' : '#ef4444',
      fontSize: 16,
    },
    {
      id: 'o2-percent-label',
      type: 'text',
      x: 235,
      y: 70,
      text: `O₂: ${o2_percent}%`,
      fill: '#1e40af',
      fontSize: 11,
    },
    {
      id: 'o2-bar',
      type: 'rect',
      x: 210,
      y: 90,
      width: 130,
      height: 10,
      fill: '#e5e7eb',
    },
    {
      id: 'o2-bar-fill',
      type: 'rect',
      x: 210,
      y: 90,
      width: Math.max(1, (o2_percent / 100) * 130),
      height: 10,
      fill: enoughO2 ? '#3b82f6' : '#9ca3af',
    },

    // === Zone 3: Temperature ===
    {
      id: 'zone3-bg',
      type: 'rect',
      x: 380,
      y: 30,
      width: 160,
      height: 100,
      fill: hotEnough ? 'rgba(254,202,202,0.4)' : 'rgba(229,231,235,0.3)',
      stroke: hotEnough ? '#ef4444' : '#9ca3af',
      strokeWidth: 1,
    },
    {
      id: 'zone3-title',
      type: 'text',
      x: 390,
      y: 50,
      text: '条件3: 温度≥燃点',
      fill: '#374151',
      fontSize: 12,
      fontWeight: 'bold',
    },
    {
      id: 'zone3-check',
      type: 'text',
      x: 390,
      y: 70,
      text: hotEnough ? '✅' : '❌',
      fill: hotEnough ? '#10b981' : '#ef4444',
      fontSize: 16,
    },
    {
      id: 'temp-comparison',
      type: 'text',
      x: 415,
      y: 70,
      text: `${temperature}°C ≥ ${ignition_point}°C`,
      fill: '#374151',
      fontSize: 10,
    },
    // Thermometer visual
    {
      id: 'thermometer',
      type: 'rect',
      x: 440,
      y: 90,
      width: 8,
      height: 30,
      fill: 'rgba(255,255,255,0.8)',
      stroke: '#6b7280',
      strokeWidth: 1,
    },
    {
      id: 'mercury',
      type: 'rect',
      x: 442,
      y: 90 + 30 * (1 - Math.min(temperature / 500, 1)),
      width: 4,
      height: Math.max(2, 30 * Math.min(temperature / 500, 1)),
      fill: '#ef4444',
    },

    // === Result Area ===
    {
      id: 'result-bg',
      type: 'rect',
      x: 20,
      y: 150,
      width: width - 40,
      height: 80,
      fill: isBurning ? 'rgba(254,226,226,0.5)' : 'rgba(243,244,246,0.5)',
      stroke: isBurning ? '#ef4444' : '#9ca3af',
      strokeWidth: 2,
    },
    {
      id: 'result-title',
      type: 'text',
      x: 30,
      y: 175,
      text: '判断结果:',
      fill: '#374151',
      fontSize: 13,
      fontWeight: 'bold',
    },
    {
      id: 'result-status',
      type: 'text',
      x: 100,
      y: 175,
      text: isBurning ? '🔥 正在燃烧！' : '🚫 未燃烧',
      fill: isBurning ? '#dc2626' : '#6b7280',
      fontSize: 16,
      fontWeight: 'bold',
    },
    // Flame animation (only when burning)
    ...(isBurning ? [{
      id: 'flame1',
      type: 'polygon' as const,
      x: 0,
      y: 0,
      points: [
        { x: 220, y: 210 },
        { x: 230, y: 210 - flameHeight },
        { x: 240, y: 210 },
      ],
      fill: 'rgba(239,68,68,0.7)',
    }, {
      id: 'flame2',
      type: 'polygon' as const,
      x: 0,
      y: 0,
      points: [
        { x: 235, y: 210 },
        { x: 245, y: 210 - flameHeight * 0.7 },
        { x: 255, y: 210 },
      ],
      fill: 'rgba(251,146,60,0.6)',
    }, {
      id: 'warning-label',
      type: 'text' as const,
      x: 280,
      y: 205,
      text: '⚠ 请保持安全距离',
      fill: '#ef4444',
      fontSize: 11,
    }] : []),
  ];
}
