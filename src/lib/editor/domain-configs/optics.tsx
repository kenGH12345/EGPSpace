import type { EditorDomainConfig } from '../editor-config';

export const opticsEditorConfig: EditorDomainConfig<'optics'> = {
  domain: 'optics',
  displayName: '光学 Optics',
  description: '原子化光学元件实验：折射、反射等。',
  snapGrid: 20,
  palette: [
    {
      kind: 'laser',
      displayName: '激光笔',
      icon: '🔦',
      defaultProps: {},
      propSchema: [],
      hintSize: { width: 60, height: 20 },
    },
    {
      kind: 'glass_block',
      displayName: '玻璃砖',
      icon: '🧊',
      defaultProps: { refractiveIndex: 1.5 },
      propSchema: [{ key: 'refractiveIndex', label: '折射率', type: 'number', step: 0.1 }],
      hintSize: { width: 100, height: 60 },
    },
  ],
  portLayout: {
    laser: {},
    glass_block: {},
  },
  drawers: {
    laser: (ctx, comp, values, selected) => {
      ctx.fillStyle = '#EF4444';
      ctx.fillRect(-30, -10, 60, 20);
      if (selected) { ctx.strokeStyle = '#3B82F6'; ctx.strokeRect(-30, -10, 60, 20); }
      
      // Draw ray placeholder
      ctx.beginPath();
      ctx.setLineDash([4, 2]);
      ctx.moveTo(30, 0);
      ctx.lineTo(70, 0);
      ctx.strokeStyle = '#EF4444';
      ctx.stroke();
      ctx.setLineDash([]);
    },
    glass_block: (ctx, comp, values, selected) => {
      ctx.fillStyle = 'rgba(14,165,233,0.3)';
      ctx.fillRect(-50, -30, 100, 60);
      if (selected) { ctx.strokeStyle = '#3B82F6'; ctx.strokeRect(-50, -30, 100, 60); }
    },
  },
  connection: {
    stroke: '#0F172A',
    strokeWidth: 2,
  },
  validateBundle: () => [],
};
