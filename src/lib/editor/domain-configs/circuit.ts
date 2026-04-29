/**
 * Circuit domain editor config.
 *
 * Single source of truth for:
 *   - what components appear in the palette
 *   - where each port sits relative to component anchor (D-4)
 *   - which TS drawer renders each kind (R-B two-sided mirror of JS)
 *   - default props when placing
 *   - property-panel schema for prop editing
 *
 * Port layout convention:
 *   Battery / Wire / Switch / Resistor / Bulb / Ammeter / Voltmeter body is
 *   50×40 with left lead at x=0,y=20 and right lead at x=50,y=20.
 */

import type { EditorDomainConfig, PortLayoutTable } from '../editor-config';
import {
  batteryDrawer,
  wireDrawer,
  switchDrawer,
  resistorDrawer,
  bulbDrawer,
  ammeterDrawer,
  voltmeterDrawer,
} from '../drawers/circuit-drawers';

const LEFT = { dx: 0, dy: 20 };
const RIGHT = { dx: 50, dy: 20 };

const portLayout: PortLayoutTable = {
  battery: { negative: LEFT, positive: RIGHT },
  wire: { a: LEFT, b: RIGHT },
  switch: { in: LEFT, out: RIGHT },
  resistor: { a: LEFT, b: RIGHT },
  bulb: { a: LEFT, b: RIGHT },
  burnt_bulb: { a: LEFT, b: RIGHT },
  ammeter: { in: LEFT, out: RIGHT },
  voltmeter: { a: LEFT, b: RIGHT },
};

export const circuitEditorConfig: EditorDomainConfig<'circuit'> = {
  domain: 'circuit',
  displayName: '电路 Circuit',
  description: '拖放电池、电阻、灯泡等元件，点击端口连线，运行后显示电流/电压。',
  palette: [
    {
      kind: 'battery',
      displayName: '电池',
      icon: '🔋',
      defaultProps: { voltage: 6 },
      propSchema: [{ key: 'voltage', label: '电压', type: 'number', unit: 'V', min: 0, max: 48, step: 0.5 }],
      hintSize: { width: 50, height: 40 },
    },
    {
      kind: 'resistor',
      displayName: '电阻',
      icon: '🔳',
      defaultProps: { resistance: 10 },
      propSchema: [{ key: 'resistance', label: '阻值', type: 'number', unit: 'Ω', min: 0.1, max: 1000, step: 0.1 }],
      hintSize: { width: 50, height: 40 },
    },
    {
      kind: 'bulb',
      displayName: '灯泡',
      icon: '💡',
      defaultProps: { ratedPower: 2, ratedVoltage: 6 },
      propSchema: [
        { key: 'ratedPower', label: '额定功率', type: 'number', unit: 'W', min: 0.1, max: 100, step: 0.1 },
        { key: 'ratedVoltage', label: '额定电压', type: 'number', unit: 'V', min: 0.5, max: 48, step: 0.5 },
      ],
      hintSize: { width: 50, height: 40 },
    },
    {
      kind: 'switch',
      displayName: '开关',
      icon: '🔘',
      defaultProps: { closed: true },
      propSchema: [{ key: 'closed', label: '闭合', type: 'boolean' }],
      hintSize: { width: 50, height: 40 },
    },
    {
      kind: 'wire',
      displayName: '导线',
      icon: '➖',
      defaultProps: {},
      propSchema: [],
      hintSize: { width: 50, height: 40 },
    },
    {
      kind: 'ammeter',
      displayName: '电流表',
      icon: 'Ⓐ',
      defaultProps: {},
      propSchema: [],
      hintSize: { width: 50, height: 40 },
    },
    {
      kind: 'voltmeter',
      displayName: '电压表',
      icon: 'Ⓥ',
      defaultProps: {},
      propSchema: [],
      hintSize: { width: 50, height: 40 },
    },
  ],
  portLayout,
  drawers: {
    battery: batteryDrawer,
    wire: wireDrawer,
    switch: switchDrawer,
    resistor: resistorDrawer,
    bulb: bulbDrawer,
    ammeter: ammeterDrawer,
    voltmeter: voltmeterDrawer,
  },
  connection: {
    stroke: '#0F172A',
    strokeWidth: 1.5,
  },
  validateBundle: (placedCount, connectionCount) => {
    const errors: string[] = [];
    if (placedCount === 0) errors.push('画布为空，请至少放一个元件');
    if (placedCount > 0 && connectionCount === 0) errors.push('没有连线，无法形成电路');
    return errors;
  },
};
