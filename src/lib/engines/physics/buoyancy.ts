/**
 * Physics: Buoyancy Engine
 *
 * Implements IExperimentEngine for the classic buoyancy experiment.
 * Wraps the existing imperative physics-engine.ts logic with the new
 * declarative interface, enabling registry-based dispatch.
 */

import type {
  IExperimentEngine,
  ComputationResult,
  ValidationResult,
  EngineMetadata,
} from '../interface';

export class BuoyancyEngine implements IExperimentEngine {
  metadata: EngineMetadata = {
    id: 'physics/buoyancy',
    subject: 'physics',
    displayName: '浮力原理',
    description: '探索阿基米德原理：浮力 = 液体密度 × 重力加速度 × 排开液体体积',
    version: '1.0.0',
    capabilities: ['compute', 'validate'],
    supportedElementTypes: ['rect', 'forceArrow', 'text'],
  };

  validate(params: Record<string, number>): ValidationResult {
    const errors: { field: string; message: string; severity: 'error' | 'warning' }[] = [];

    const rhoObj = params.rho_object ?? params.objectDensity ?? 800;
    const rhoLiq = params.rho_liquid ?? params.liquidDensity ?? 1000;
    const vol = params.vol ?? params.volume ?? 0.01;

    if (rhoObj <= 0) errors.push({ field: 'rho_object', message: '物体密度必须大于0', severity: 'error' });
    if (rhoLiq <= 0) errors.push({ field: 'rho_liquid', message: '液体密度必须大于0', severity: 'error' });
    if (vol <= 0) errors.push({ field: 'vol', message: '体积必须大于0', severity: 'error' });

    if (rhoLiq > 20000) errors.push({ field: 'rho_liquid', message: '液体密度异常（>20000 kg/m³）', severity: 'warning' });

    return { valid: errors.length === 0, errors };
  }

  compute(params: Record<string, number>): ComputationResult {
    const rhoObj = params.rho_object ?? params.objectDensity ?? 800;
    const rhoLiq = params.rho_liquid ?? params.liquidDensity ?? 1000;
    const g = params.g ?? 9.8;
    const vol = params.vol ?? params.volume ?? 0.01;

    const densityRatio = rhoObj / rhoLiq;
    const isFloating = densityRatio < 1;
    const isSuspended = Math.abs(densityRatio - 1) < 0.01;

    const immersionRatio = isFloating ? densityRatio : 1;
    const vDisplaced = vol * Math.max(0, Math.min(1, immersionRatio));
    const buoyantForce = rhoLiq * g * vDisplaced;
    const gravity = rhoObj * g * vol;
    const netForce = buoyantForce - gravity;

    let state = '悬浮';
    if (isFloating) state = '上浮';
    if (densityRatio > 1) state = '下沉';
    if (isSuspended) state = '悬浮';

    const objY = 40 + (1 - Math.max(0, Math.min(1, immersionRatio))) * 150;

    const mass = rhoObj * vol;
    
    // v3-component component graph output
    const components = [
      {
        id: 'Liquid1',
        kind: 'liquid-container',
        props: { rhoLiq, liquidDensity: rhoLiq }
      },
      {
        id: 'Block1',
        kind: 'block',
        props: { 
          rhoObj, 
          volume: vol, 
          immersionRatio, 
          floatState: state,
          buoyantForce,
          gravity,
          objY
        }
      }
    ];

    const perComponent = {
      'Liquid1': { rhoLiq },
      'Block1': { rhoObj, volume: vol, immersionRatio, floatState: state, buoyantForce, gravity }
    };

    let badgeKind: 'success' | 'danger' | 'info' = 'info';
    let badgeText = '物体悬浮（密度 = 液体）';
    if (isSuspended) {
      badgeKind = 'info';
      badgeText = '物体悬浮（密度 = 液体）';
    } else if (isFloating) {
      badgeKind = 'success';
      badgeText = '物体上浮（密度 < 液体）';
    } else {
      badgeKind = 'danger';
      badgeText = '物体下沉（密度 > 液体）';
    }

    return {
      values: {
        immersionRatio,
        vDisplaced,
        buoyantForce,
        gravity,
        netForce,
        floatState: state,
        objY,
        objColor: rhoObj < rhoLiq ? '#f97316' : rhoObj > rhoLiq ? '#6366f1' : '#a855f7',
        mass,
        components,
        perComponent,
        badgeKind,
        badgeText,
      },
      state,
      explanation: `物体密度 ${rhoObj} kg/m³，液体密度 ${rhoLiq} kg/m³。${state === '上浮' ? '漂浮' : state === '下沉' ? '沉入底部' : '悬浮在水中'}。浮力 ${buoyantForce.toFixed(2)} N，重力 ${gravity.toFixed(2)} N。`,
    };
  }
}

export default new BuoyancyEngine();
