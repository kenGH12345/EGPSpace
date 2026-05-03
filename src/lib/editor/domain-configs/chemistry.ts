/**
 * Chemistry domain editor config.
 *
 * Chemistry components have a 60×60 nominal bounding box and each exposes
 * one port ("contents" for flasks, "in" for reagents/bubbles/solids/indicators).
 * Port visual hotspot sits at top-center (x=30, y=0).
 */

import type { EditorDomainConfig, PortLayoutTable } from '../editor-config';
import {
  flaskDrawer,
  reagentDrawer,
  bubbleDrawer,
  solidDrawer,
  indicatorDrawer,
  alcoholLampDrawer,
  igniterDrawer,
} from '../drawers/chemistry-drawers';

const TOP_CENTER = { dx: 30, dy: 0 };
const BOTTOM_CENTER = { dx: 30, dy: 60 };

const portLayout: PortLayoutTable = {
  flask: { contents: BOTTOM_CENTER },
  reagent: { in: TOP_CENTER },
  bubble: { in: TOP_CENTER },
  solid: { in: TOP_CENTER },
  indicator: { in: TOP_CENTER },
  'alcohol-lamp': { in: TOP_CENTER },
  igniter: { in: TOP_CENTER },
};

export const chemistryEditorConfig: EditorDomainConfig<'chemistry'> = {
  domain: 'chemistry',
  displayName: '化学 Chemistry',
  description: '拖放烧瓶、试剂、金属块等，连线表示"加入烧瓶"关系，运行观察反应。',
  snapGrid: 20,
  palette: [
    {
      kind: 'flask',
      displayName: '烧瓶',
      icon: '🧪',
      defaultProps: { volumeML: 100, shape: 'beaker' },
      propSchema: [
        { key: 'volumeML', label: '容积', type: 'number', unit: 'mL', min: 10, max: 1000, step: 10 },
        {
          key: 'shape',
          label: '形状',
          type: 'select',
          options: [
            { value: 'beaker', label: '烧杯' },
            { value: 'flask', label: '锥形瓶' },
          ],
        },
      ],
      hintSize: { width: 60, height: 60 },
    },
    {
      kind: 'alcohol-lamp',
      displayName: '酒精灯',
      icon: '🔥',
      defaultProps: { isLit: false },
      propSchema: [
        { key: 'isLit', label: '已点燃', type: 'boolean' },
      ],
      hintSize: { width: 60, height: 60 },
    },
    {
      kind: 'igniter',
      displayName: '点火器',
      icon: '🧨',
      defaultProps: {},
      propSchema: [],
      hintSize: { width: 60, height: 60 },
    },
    {
      kind: 'reagent',
      displayName: '试剂',
      icon: '🧫',
      defaultProps: { formula: 'H2SO4', moles: 0.1, phase: 'aq', concentration: 1 },
      propSchema: [
        { key: 'formula', label: '分子式', type: 'string' },
        { key: 'moles', label: '摩尔数', type: 'number', unit: 'mol', min: 0, max: 10, step: 0.01 },
        {
          key: 'phase',
          label: '相态',
          type: 'select',
          options: [
            { value: 'aq', label: '水溶液' },
            { value: 'l', label: '液体' },
            { value: 's', label: '固体' },
            { value: 'g', label: '气体' },
          ],
        },
        { key: 'concentration', label: '浓度', type: 'number', unit: 'mol/L', min: 0, max: 20, step: 0.1 },
      ],
      hintSize: { width: 60, height: 60 },
    },
    {
      kind: 'solid',
      displayName: '固体',
      icon: '🪨',
      defaultProps: { formula: 'Zn', massG: 1, state: 'intact' },
      propSchema: [
        { key: 'formula', label: '分子式', type: 'string' },
        { key: 'massG', label: '质量', type: 'number', unit: 'g', min: 0.01, max: 100, step: 0.1 },
      ],
      hintSize: { width: 60, height: 60 },
    },
    {
      kind: 'bubble',
      displayName: '气泡（产物）',
      icon: '💨',
      description: '通常由反应自动生成；不建议手动放置。',
      defaultProps: { gas: 'H2', rateMolPerTick: 0.1, accumulatedMoles: 0 },
      propSchema: [{ key: 'gas', label: '气体', type: 'string' }],
      hintSize: { width: 60, height: 60 },
    },
    {
      kind: 'indicator',
      displayName: '指示剂',
      icon: '🌡️',
      defaultProps: { dyeType: 'phenolphthalein' },
      propSchema: [
        {
          key: 'dyeType',
          label: '类型',
          type: 'select',
          options: [
            { value: 'phenolphthalein', label: '酚酞' },
            { value: 'methyl-orange', label: '甲基橙' },
            { value: 'litmus', label: '石蕊' },
          ],
        },
      ],
      hintSize: { width: 60, height: 60 },
    },
  ],
  portLayout,
  drawers: {
    flask: flaskDrawer,
    reagent: reagentDrawer,
    bubble: bubbleDrawer,
    solid: solidDrawer,
    indicator: indicatorDrawer,
    'alcohol-lamp': alcoholLampDrawer,
    igniter: igniterDrawer,
  },
  connection: {
    stroke: '#0369A1',
    strokeWidth: 1.5,
    dash: [6, 3],
  },
  clickToggle: {
    'alcohol-lamp': { propKey: 'isLit', type: 'boolean' },
  },
  validateBundle: (placedCount, connectionCount) => {
    const errors: string[] = [];
    if (placedCount === 0) errors.push('画布为空');
    if (placedCount > 0 && connectionCount === 0)
      errors.push('没有连接；至少连接一个试剂到烧瓶');
    return errors;
  },
};
