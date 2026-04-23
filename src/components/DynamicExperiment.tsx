'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Message } from 'coze-coding-dev-sdk';
import type { ExperimentSchema } from '@/lib/experiment-schema';
import { computePhysics } from '@/lib/physics-engine';
import { renderCanvas } from '@/lib/declarative-renderer';
import { buildPresetElements } from '@/lib/preset-templates';

// Convert ExperimentSchema to legacy ExperimentConfig for backward compatibility
export function experimentSchemaToLegacy(schema: ExperimentSchema): ExperimentConfig {
  const physicsConfig = schema.physics;

  return {
    name: schema.meta.name,
    subject: schema.meta.subject,
    topic: schema.meta.topic,
    icon: schema.meta.icon,
    gradient: schema.meta.gradient,
    teaching: schema.teaching as ExperimentConfig['teaching'],
    experiment: {
      type: 'canvas',
      rules: {
        type: (physicsConfig.engine === 'wave' ? 'generic' : physicsConfig.engine) as PhysicsRules['type'],
        formula: physicsConfig.equations[0]?.expression ?? '',
        variables: schema.params
          .filter(p => p.category === 'input')
          .map(p => ({
            name: p.name,
            label: p.label,
            min: p.min,
            max: p.max,
            default: p.defaultValue,
            unit: p.unit,
            description: p.description,
          })),
        calculate: (params: Record<string, number>) => {
          const result = computePhysics(physicsConfig, params);
          return {
            results: result.results,
            state: result.state as 'floating' | 'sinking' | 'suspended' | 'balanced' | 'unbalanced' | 'normal',
            explanation: result.explanation,
            visualization: result.visualization ?? {},
          };
        },
      },
    },
  };
}

// LLM 生成的实验配置类型
export interface ExperimentConfig {
  name: string;
  subject: string;
  topic: string;
  icon: string;
  gradient: string;
  teaching?: {
    understanding?: {
      concept?: string;
      principles?: string[];
      formulas?: string[];
      historicalCase?: string;
      lifeApplication?: string;
    };
    reasoning?: {
      independent?: string;
      dependent?: string;
      controlled?: string[];
      hypothesis?: string;
    };
    design?: {
      coreQuestion?: string;
      steps?: string[];
      observationPoints?: string[];
      recordPoints?: string[];
      discussionPoints?: string[];
    };
    errors?: {
      operation?: string[];
      concept?: string[];
      calculation?: string[];
    };
    evaluation?: {
      formative?: string;
      summative?: string;
      extension?: string;
    };
  };
  experiment?: {
    type: string;
    code?: string;
    rules?: PhysicsRules;
  };
}

// 物理规则类型
export interface PhysicsRules {
  type: 'buoyancy' | 'refraction' | 'lever' | 'circuit' | 'pendulum' | 'generic';
  formula: string;
  variables: {
    name: string;
    label: string;
    min: number;
    max: number;
    default: number;
    unit: string;
    description?: string;
  }[];
  calculate: (params: Record<string, number>) => {
    results: Record<string, number>;
    state: 'floating' | 'sinking' | 'suspended' | 'balanced' | 'unbalanced' | 'normal';
    explanation: string;
    visualization: {
      objectY?: number;
      objectImmersionRatio?: number;
      forceArrows?: { direction: 'up' | 'down'; magnitude: number; label: string }[];
    };
  };
}

// Type guard to detect ExperimentSchema
function isExperimentSchema(config: ExperimentConfig | ExperimentSchema): config is ExperimentSchema {
  return 'meta' in config && 'physicsType' in (config as ExperimentSchema).meta;
}

// 通用物理渲染器
export function UniversalPhysicsRenderer({ config }: { config: ExperimentConfig | ExperimentSchema }) {
  // Normalize to legacy format for unified rendering
  const legacyConfig: ExperimentConfig = isExperimentSchema(config)
    ? experimentSchemaToLegacy(config)
    : config;
  const schema: ExperimentSchema | null = isExperimentSchema(config) ? config : null;

  const [params, setParams] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    if (legacyConfig.experiment?.rules?.variables) {
      for (const v of legacyConfig.experiment.rules.variables) {
        initial[v.name] = v.default;
      }
    }
    return initial;
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 获取物理规则
  const rules = legacyConfig.experiment?.rules;
  
  // 计算结果
  const calculation = rules?.calculate(params);

  // 绘制可视化
  useEffect(() => {
    if (!canvasRef.current || !calculation || !rules) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const viz = calculation.visualization ?? {};
    const computed: Record<string, number> = {
      ...(calculation.results ?? {}),
      ...(Object.fromEntries(
        Object.entries(viz).filter(([, v]) => typeof v === 'number')
      ) as Record<string, number>),
      state: calculation.state === 'floating' ? 1 : calculation.state === 'sinking' ? -1 : 0,
    };

    const layout = schema?.canvas?.layout ?? { width: canvas.width, height: canvas.height, background: '#ffffff' };

    const elements = schema?.canvas?.elements?.length
      ? schema.canvas.elements
      : buildPresetElements(rules.type, layout, params, computed);

    renderCanvas(ctx, elements, layout, params, computed);
  }, [params, calculation, rules, schema]);

  // 更新参数
  const updateParam = useCallback((name: string, value: number) => {
    setParams(prev => ({ ...prev, [name]: value }));
  }, []);

  if (!rules) {
    // 如果没有规则，显示提示
    return (
      <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
        <p className="text-amber-800">此实验类型的可视化渲染器开发中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 结果卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {calculation && Object.entries(calculation.results).map(([key, value]) => (
          <div key={key} className="bg-white rounded-xl p-4 border">
            <p className="text-sm text-gray-500 capitalize">{key}</p>
            <p className="text-2xl font-bold text-blue-600">{typeof value === 'number' ? value.toFixed(2) : value}</p>
          </div>
        ))}
        {calculation && (
          <div className="bg-white rounded-xl p-4 border">
            <p className="text-sm text-gray-500">状态</p>
            <p className={`text-lg font-bold ${
              calculation.state === 'floating' || calculation.state === 'balanced' ? 'text-green-600' :
              calculation.state === 'sinking' || calculation.state === 'unbalanced' ? 'text-red-600' : 'text-blue-600'
            }`}>
              {calculation.state === 'floating' ? '↑ 上浮' :
               calculation.state === 'sinking' ? '↓ 下沉' :
               calculation.state === 'suspended' ? '○ 悬浮' :
               calculation.state === 'balanced' ? '⚖ 平衡' :
               calculation.state === 'unbalanced' ? '⊥ 不平衡' : '● 正常'}
            </p>
          </div>
        )}
      </div>

      {/* 可视化画布 */}
      <div className="bg-white rounded-xl p-4 border">
        <canvas ref={canvasRef} width={560} height={280} className="w-full" />
      </div>

      {/* 物理说明 */}
      {calculation && (
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <p className="text-sm text-blue-800">{calculation.explanation}</p>
        </div>
      )}

      {/* 参数控制 */}
      <div className="bg-white rounded-xl p-5 border">
        <h3 className="font-bold text-gray-800 mb-4">参数调节</h3>
        <div className="space-y-4">
          {rules.variables.map((v) => (
            <div key={v.name}>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">{v.label}</span>
                <span className="font-medium text-blue-600">
                  {params[v.name]?.toFixed(v.max > 100 ? 0 : 3)} {v.unit}
                </span>
              </div>
              <input
                type="range"
                min={v.min}
                max={v.max}
                step={Math.max(0.001, (v.max - v.min) / 200)}
                value={params[v.name] ?? v.default}
                onChange={(e) => updateParam(v.name, Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              {v.description && (
                <p className="text-xs text-gray-400 mt-1">{v.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 公式卡片 */}
      {rules.formula && (
        <div className="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl p-5 border border-blue-200">
          <h3 className="font-bold text-blue-800 mb-2 text-center">核心公式</h3>
          <div className="bg-white/60 rounded-xl p-3 text-center">
            <span className="text-lg font-mono font-bold text-blue-700">{rules.formula}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// 预定义的浮力实验规则
export function createBuoyancyRules(): PhysicsRules {
  return {
    type: 'buoyancy',
    formula: 'F浮 = ρ液 × g × V排',
    variables: [
      {
        name: 'rho_object',
        label: '物体密度 (ρ物)',
        min: 200,
        max: 2000,
        default: 800,
        unit: 'kg/m³',
        description: '物体本身的密度，决定浮沉状态'
      },
      {
        name: 'rho_liquid',
        label: '液体密度 (ρ液)',
        min: 800,
        max: 13600,
        default: 1000,
        unit: 'kg/m³',
        description: '液体密度（水/盐水/汞等）'
      }
    ],
    calculate: (params) => {
      // 灵活的参数提取，支持 LLM 返回的不同变量名
      // 物体密度：可能是 objectDensity, object_density, rho_object, density 等
      const rawObjectDensity = params.objectDensity ?? params.object_density ?? params.rho_object ?? params.density 
        ?? (params.objectGravity ? params.objectGravity / 9.8 / (params.objectVolume ?? params.V_object ?? 0.0001) : null)
        ?? 800;
      const objectDensity = typeof rawObjectDensity === 'number' ? rawObjectDensity : 800;
      
      // 液体密度：可能是 liquidDensity, liquid_density, rho_liquid, liquidDensity
      const liquidDensity = params.liquidDensity ?? params.liquid_density ?? params.rho_liquid ?? params.liquidDensity ?? 1000;
      
      // 重力加速度
      const g = params.g ?? 9.8;
      
      // 物体体积：可能是 objectVolume, object_volume, V_object, volume
      const objectVolume = params.objectVolume ?? params.object_volume ?? params.V_object ?? params.volume ?? 0.0001;
      
      // 浸入比例：可能是 immersionRatio, immersion_ratio, immersion, immersedRatio 等
      const userImmersionRatio = params.immersionRatio ?? params.immersion_ratio ?? params.immersion 
        ?? params.immersedRatio ?? params.immersed_ratio ?? params.immersed ?? null;

      // 浮沉判断 - 核心物理规律
      const densityRatio = objectDensity / liquidDensity;
      const isFloating = densityRatio < 1;
      const isSinking = densityRatio > 1;
      const isSuspended = Math.abs(densityRatio - 1) < 0.01;

      // 浸入比例由物理规律决定，而非用户设置！
      // 上浮物体：浸入比例 = 密度比（自动平衡位置）
      // 下沉物体：浸入比例 = 100%（完全浸没）
      // 悬浮物体：浸入比例 = 100%（完全浸没）
      let immersionRatio: number;
      if (userImmersionRatio !== null && userImmersionRatio !== undefined) {
        immersionRatio = Math.max(0, Math.min(1, Number(userImmersionRatio)));
      } else if (isFloating) {
        immersionRatio = densityRatio;
      } else if (isSuspended) {
        immersionRatio = 1;
      } else {
        immersionRatio = 1; // 下沉物体完全浸没
      }
      immersionRatio = Math.max(0, Math.min(1, immersionRatio));

      // 浮力计算
      const buoyantForce = liquidDensity * g * objectVolume * immersionRatio;
      const gravityForce = objectDensity * g * objectVolume;
      const netForce = buoyantForce - gravityForce;

      // 状态判断
      let state: 'floating' | 'sinking' | 'suspended' | 'balanced' = 'suspended';
      if (isFloating) state = 'floating';
      if (isSinking) state = 'sinking';
      if (isSuspended) state = 'suspended';
      if (Math.abs(netForce) < 0.001) state = 'balanced';

      // 物理说明
      let explanation = '';
      if (state === 'floating') {
        explanation = `物体密度(${objectDensity.toFixed(0)}kg/m³) < 液体密度(${liquidDensity.toFixed(0)}kg/m³)，物体上浮至平衡位置。`;
        explanation += ` 浸入比例由密度比自动决定：ρ物/ρ液 = ${densityRatio.toFixed(2)}，即 ${(densityRatio * 100).toFixed(1)}% 浸入。`;
      } else if (state === 'sinking') {
        explanation = `物体密度(${objectDensity.toFixed(0)}kg/m³) > 液体密度(${liquidDensity.toFixed(0)}kg/m³)，物体下沉。`;
        explanation += ` 浮力(${buoyantForce.toFixed(3)}N) < 重力(${gravityForce.toFixed(3)}N)。`;
      } else if (state === 'suspended') {
        explanation = `物体密度 ≈ 液体密度，物体悬浮在任意位置。`;
      } else {
        explanation = `物体处于平衡状态，浮力 ≈ 重力。`;
      }

      return {
        results: {
          buoyantForce: buoyantForce * 1000, // 转换为 mN
          gravity: gravityForce * 1000,
          densityRatio: densityRatio * 100,
          immersionRatio: immersionRatio * 100,
          netForce: netForce * 1000
        },
        state,
        explanation,
        visualization: {
          objectImmersionRatio: immersionRatio
        }
      };
    }
  };
}
