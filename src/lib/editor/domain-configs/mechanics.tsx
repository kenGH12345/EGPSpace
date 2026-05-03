import type { EditorDomainConfig } from '../editor-config';

export const mechanicsEditorConfig: EditorDomainConfig<'mechanics'> = {
  domain: 'mechanics',
  displayName: '力学 Mechanics',
  description: '原子化力学元件实验：浮力、杠杆等。',
  snapGrid: 20,
  palette: [
    {
      kind: 'beaker',
      displayName: '烧杯',
      icon: '🫙',
      defaultProps: { volume: 500 },
      propSchema: [{ key: 'volume', label: '容积', type: 'number', unit: 'mL' }],
      hintSize: { width: 60, height: 80 },
    },
    {
      kind: 'block',
      displayName: '物块',
      icon: '🧊',
      defaultProps: { mass: 2, volume: 100 },
      propSchema: [
        { key: 'mass', label: '质量', type: 'number', unit: 'kg' },
        { key: 'volume', label: '体积', type: 'number', unit: 'cm³' },
      ],
      hintSize: { width: 50, height: 50 },
    },
    {
      kind: 'force_meter',
      displayName: '测力计',
      icon: '📏',
      defaultProps: {},
      propSchema: [],
      hintSize: { width: 30, height: 100 },
    },
    {
      kind: 'pivot',
      displayName: '支点',
      icon: '△',
      defaultProps: {},
      propSchema: [],
      hintSize: { width: 40, height: 40 },
    },
    {
      kind: 'beam',
      displayName: '杠杆',
      icon: '➖',
      defaultProps: { length: 100 },
      propSchema: [{ key: 'length', label: '长度', type: 'number', unit: 'cm' }],
      hintSize: { width: 200, height: 10 },
    },
    {
      kind: 'weight',
      displayName: '砝码',
      icon: '⚖️',
      defaultProps: { mass: 5 },
      propSchema: [{ key: 'mass', label: '质量', type: 'number', unit: 'g' }],
      hintSize: { width: 30, height: 40 },
    },
  ],
  portLayout: {
    beaker: {},
    block: {},
    force_meter: {},
    pivot: {},
    beam: {},
    weight: {},
  },
  drawers: {
    beaker: (ctx, comp, values, selected) => {
      ctx.fillStyle = 'rgba(0,150,255,0.2)';
      ctx.fillRect(-30, -40, 60, 80);
      if (selected) { ctx.strokeStyle = '#3B82F6'; ctx.strokeRect(-30, -40, 60, 80); }
    },
    block: (ctx, comp, values, selected) => {
      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(-25, -25, 50, 50);
      if (selected) { ctx.strokeStyle = '#3B82F6'; ctx.strokeRect(-25, -25, 50, 50); }
    },
    force_meter: (ctx, comp, values, selected) => {
      ctx.fillStyle = '#E2E8F0';
      ctx.fillRect(-15, -50, 30, 100);
      if (selected) { ctx.strokeStyle = '#3B82F6'; ctx.strokeRect(-15, -50, 30, 100); }
    },
    pivot: (ctx, comp, values, selected) => {
      ctx.fillStyle = '#94A3B8';
      ctx.beginPath();
      ctx.moveTo(0, -20);
      ctx.lineTo(20, 20);
      ctx.lineTo(-20, 20);
      ctx.closePath();
      ctx.fill();
      if (selected) { ctx.strokeStyle = '#3B82F6'; ctx.stroke(); }
    },
    beam: (ctx, comp, values, selected) => {
      ctx.fillStyle = '#CBD5E1';
      ctx.fillRect(-100, -5, 200, 10);
      if (selected) { ctx.strokeStyle = '#3B82F6'; ctx.strokeRect(-100, -5, 200, 10); }
    },
    weight: (ctx, comp, values, selected) => {
      ctx.fillStyle = '#334155';
      ctx.fillRect(-15, -20, 30, 40);
      if (selected) { ctx.strokeStyle = '#3B82F6'; ctx.strokeRect(-15, -20, 30, 40); }
    },
  },
  connection: {
    stroke: '#0F172A',
    strokeWidth: 2,
  },
  validateBundle: () => [],
};
