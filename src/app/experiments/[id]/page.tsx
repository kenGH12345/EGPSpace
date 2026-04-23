'use client';

import React, { useState, useRef, useEffect, use } from 'react';
import Link from 'next/link';
import { UniversalPhysicsRenderer, createBuoyancyRules, PhysicsRules, ExperimentConfig, experimentSchemaToLegacy } from '@/components/DynamicExperiment';

// AI生成的实验配置类型
interface GeneratedConfig {
  name: string;
  subject: string;
  topic: string;
  description?: string;
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
    type?: string;
    rules?: PhysicsRules;
    code?: string;
  };
}

// 实验配置映射
const experiments: Record<string, {
  name: string;
  icon: string;
  gradient: string;
  color: string;
  subject: string;
  component: 'buoyancy' | 'lever' | 'refraction' | 'circuit' | 'acid-base';
}> = {
  buoyancy: {
    name: '浮力原理',
    icon: '🌊',
    gradient: 'from-blue-400 to-cyan-500',
    color: 'blue',
    subject: '物理',
    component: 'buoyancy',
  },
  'lever': {
    name: '杠杆原理',
    icon: '⚖️',
    gradient: 'from-amber-500 to-orange-500',
    color: 'amber',
    subject: '物理',
    component: 'lever',
  },
  'refraction': {
    name: '光的折射',
    icon: '💡',
    gradient: 'from-cyan-500 to-blue-500',
    color: 'cyan',
    subject: '物理',
    component: 'refraction',
  },
  'circuit': {
    name: '电路串并联',
    icon: '⚡',
    gradient: 'from-emerald-500 to-teal-500',
    color: 'emerald',
    subject: '物理',
    component: 'circuit',
  },
  'acid-base': {
    name: '酸碱滴定',
    icon: '🧪',
    gradient: 'from-red-500 to-orange-500',
    color: 'red',
    subject: '化学',
    component: 'acid-base',
  },
};

// 浮力实验组件
function BuoyancyExperiment() {
  const [objectVolume, setObjectVolume] = useState(50);
  const [objectDensity, setObjectDensity] = useState(800); // 默认小于水密度，上浮
  const [liquidDensity, setLiquidDensity] = useState(1000); // 默认水密度
  const [externalForce, setExternalForce] = useState(0); // 外力（按压）
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 计算浮力 (F浮 = ρ液 * g * V排)
  const g = 9.8;
  
  // 浮沉判断
  const densityRatio = objectDensity / liquidDensity;
  const isFloating = densityRatio < 1; // 密度比小于1，上浮
  const isSinking = densityRatio > 1; // 密度比大于1，下沉
  const isSuspended = Math.abs(densityRatio - 1) < 0.01; // 密度相等，悬浮

  const objectMass = objectVolume * objectDensity;
  const gravityForce = objectMass * g;
  
  // 物理计算：根据物理规律自动计算浸入状态
  // 对于上浮物体：浸入比例 = 密度比，物体自动平衡
  // 对于下沉/悬浮物体：需要外力才能部分浸入
  const equilibriumImmersionRatio = isFloating ? densityRatio : 1; // 平衡时浸入比
  const actualImmersionRatio = isFloating 
    ? equilibriumImmersionRatio // 上浮物体：自动处于平衡位置
    : Math.min(1, (gravityForce - externalForce) / (liquidDensity * g * objectVolume) || 1); // 需外力
  
  // 实际浸入体积和浮力计算
  const immersedVolume = objectVolume * Math.max(0, Math.min(1, actualImmersionRatio));
  const buoyantForce = liquidDensity * g * immersedVolume;
  const netForce = buoyantForce + externalForce - gravityForce;

  const getStatus = () => {
    if (isFloating) return { text: '↑ 上浮', color: 'text-green-600', bg: 'bg-green-100' };
    if (isSinking) return { text: '↓ 下沉', color: 'text-red-600', bg: 'bg-red-100' };
    return { text: '○ 悬浮', color: 'text-blue-600', bg: 'bg-blue-100' };
  };
  const status = getStatus();
  const immersionDepth = Math.round(actualImmersionRatio * 100);

  // 绘制可视化
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const liquidLevel = height * 0.6;

    ctx.clearRect(0, 0, width, height);

    // 绘制液体
    ctx.fillStyle = liquidDensity > 2000 ? '#1E40AF' : liquidDensity > 1500 ? '#0891B2' : liquidDensity > 1000 ? '#06B6D4' : '#67E8F9';
    ctx.globalAlpha = 0.5;
    ctx.fillRect(0, liquidLevel, width, height - liquidLevel);
    ctx.globalAlpha = 1;

    // 绘制液面
    ctx.strokeStyle = '#0EA5E9';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, liquidLevel);
    ctx.lineTo(width, liquidLevel);
    ctx.stroke();
    ctx.setLineDash([]);

    // 计算物体位置
    const objectWidth = 60;
    const objectHeight = Math.min(objectVolume * 0.8, 150); // 限制最大高度
    const containerBottom = height - 20; // 容器底部
    const objectX = width / 2 - objectWidth / 2;
    let objectY: number;

    if (isFloating) {
      // 上浮：物体部分浸入，浸入比例由密度比自动决定
      // 物体顶部位置 = 液面 - 物体高度 * 密度比
      objectY = liquidLevel - objectHeight * densityRatio;
    } else if (isSinking) {
      // 下沉：物体沉到容器底部
      objectY = containerBottom - objectHeight;
    } else {
      // 悬浮：物体完全浸没，顶部在液面处
      objectY = liquidLevel;
    }

    // 限制物体在合理范围内
    objectY = Math.max(liquidLevel - objectHeight, Math.min(objectY, containerBottom - objectHeight));

    // 物体颜色：密度小于液体绿色（上浮），大于液体红色（下沉），相等蓝色（悬浮）
    let objectColor: string;
    if (isFloating) {
      objectColor = '#10B981'; // 绿色
    } else if (isSinking) {
      objectColor = '#EF4444'; // 红色
    } else {
      objectColor = '#3B82F6'; // 蓝色
    }
    ctx.fillStyle = objectColor;
    ctx.fillRect(objectX, objectY, objectWidth, objectHeight);

    // 绘制物体轮廓
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.strokeRect(objectX, objectY, objectWidth, objectHeight);

    // 绘制浸入部分（水下）
    const immersedHeight = Math.max(0, Math.min(objectHeight, liquidLevel - objectY));
    if (immersedHeight > 0) {
      ctx.fillStyle = objectColor;
      ctx.globalAlpha = 0.3;
      ctx.fillRect(objectX, objectY + objectHeight - immersedHeight, objectWidth, immersedHeight);
      ctx.globalAlpha = 1;
    }

    // 绘制浮力箭头
    if (buoyantForce > 0) {
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(objectX + objectWidth / 2, objectY + 10);
      ctx.lineTo(objectX + objectWidth / 2, objectY - buoyantForce / 5);
      ctx.stroke();
      
      // 箭头
      ctx.beginPath();
      ctx.moveTo(objectX + objectWidth / 2, objectY - buoyantForce / 5 + 10);
      ctx.lineTo(objectX + objectWidth / 2 - 8, objectY - buoyantForce / 5 + 20);
      ctx.lineTo(objectX + objectWidth / 2 + 8, objectY - buoyantForce / 5 + 20);
      ctx.closePath();
      ctx.fillStyle = '#3B82F6';
      ctx.fill();
    }

    // 绘制重力箭头
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(objectX + objectWidth / 2, objectY + objectHeight - 10);
    ctx.lineTo(objectX + objectWidth / 2, objectY + objectHeight + gravityForce / 5);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(objectX + objectWidth / 2, objectY + objectHeight - 10);
    ctx.lineTo(objectX + objectWidth / 2 - 8, objectY + objectHeight - 20);
    ctx.lineTo(objectX + objectWidth / 2 + 8, objectY + objectHeight - 20);
    ctx.closePath();
    ctx.fillStyle = '#EF4444';
    ctx.fill();

    // 标注
    ctx.font = 'bold 14px system-ui';
    ctx.fillStyle = '#3B82F6';
    ctx.fillText(`F浮 = ${buoyantForce.toFixed(1)}N`, objectX + objectWidth + 10, objectY + objectHeight / 2 - 20);
    ctx.fillStyle = '#EF4444';
    ctx.fillText(`G = ${gravityForce.toFixed(1)}N`, objectX + objectWidth + 10, objectY + objectHeight / 2 + 20);

    // 显示浸入比例
    if (isFloating) {
      ctx.font = 'bold 12px system-ui';
      ctx.fillStyle = '#059669';
      ctx.fillText(`浸入比例: ${(densityRatio * 100).toFixed(0)}%`, objectX, objectY - 10);
    }

  }, [objectVolume, objectDensity, liquidDensity, externalForce, buoyantForce, gravityForce, isFloating, isSinking, isSuspended, densityRatio, actualImmersionRatio]);

  return (
    <div className="space-y-4">
      {/* 状态卡片 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">浮力</p>
          <p className="text-2xl font-bold text-blue-600">{buoyantForce.toFixed(1)} N</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">重力</p>
          <p className="text-2xl font-bold text-red-600">{gravityForce.toFixed(1)} N</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">状态</p>
          <p className={`text-lg font-bold ${status.color}`}>
            {status.text}
          </p>
        </div>
      </div>

      {/* 可视化 */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200">
        <canvas ref={canvasRef} width={560} height={280} className="w-full" />
        <div className="text-center mt-2">
          <span className={`px-4 py-1 rounded-full text-sm font-medium ${status.bg} ${status.color}`}>
            {isFloating ? '✓ 物体上浮（密度 < 液体）' : isSinking ? '✗ 物体下沉（密度 > 液体）' : '○ 物体悬浮（密度 = 液体）'}
          </span>
        </div>
      </div>

      {/* 参数控制 */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200">
        <h3 className="font-bold text-gray-800 mb-4">参数调节</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">物体体积</span>
              <span className="font-medium text-blue-600">{objectVolume} cm³</span>
            </div>
            <input type="range" min="10" max="200" value={objectVolume} onChange={(e) => setObjectVolume(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">物体密度 (ρ物)</span>
              <span className="font-medium text-blue-600">{objectDensity} kg/m³</span>
            </div>
            <input type="range" min="200" max="2000" step="50" value={objectDensity} onChange={(e) => setObjectDensity(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500" />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>200 (软木)</span>
              <span>1000 (水)</span>
              <span>2000 (金属)</span>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">液体密度 (ρ液)</span>
              <span className="font-medium text-blue-600">{liquidDensity} kg/m³</span>
            </div>
            <input type="range" min="800" max="13600" step="100" value={liquidDensity} onChange={(e) => setLiquidDensity(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500" />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>800 (油)</span>
              <span>1000 (水)</span>
              <span>13600 (汞)</span>
            </div>
          </div>
          {!isFloating && (
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">外力 (按压)</span>
                <span className="font-medium text-blue-600">{externalForce.toFixed(1)} N</span>
              </div>
              <input type="range" min="0" max="10" step="0.1" value={externalForce} onChange={(e) => setExternalForce(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500" />
              <p className="text-xs text-gray-400 mt-1">对下沉物体施加外力可改变浸入深度</p>
            </div>
          )}
          {isFloating && (
            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <p className="text-sm text-green-700">
                物体密度 &lt; 液体密度，自动上浮至平衡位置
              </p>
              <p className="text-xs text-green-600 mt-1">
                浸入比例 = ρ物/ρ液 = {objectDensity}/{liquidDensity} = {(densityRatio * 100).toFixed(1)}%
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 公式卡片 */}
      <div className="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-2xl p-5 border border-blue-200">
        <h3 className="font-bold text-blue-800 mb-3 text-center">阿基米德原理</h3>
        <div className="bg-white/60 rounded-xl p-3 text-center">
          <span className="text-lg font-mono font-bold text-blue-700">F浮 = ρ液 × g × V排</span>
        </div>
        <p className="text-center text-sm text-blue-700 mt-3">
          浮力 = 液体密度 × 重力加速度 × 排开液体体积
        </p>
      </div>
    </div>
  );
}

export default function ExperimentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const experiment = experiments[id];
  
  // 使用 state 存储 AI 配置，避免 hydration mismatch
  const [aiConfig, setAiConfig] = useState<GeneratedConfig | null>(null);
  const [aiSchema, setAiSchema] = useState<import('@/lib/experiment-schema').ExperimentSchema | null>(null);
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);

  // 客户端挂载后从 sessionStorage 加载配置
  useEffect(() => {
    const storedConfig = sessionStorage.getItem('eureka_experiment_config');
    if (storedConfig) {
      try {
        const parsed = JSON.parse(storedConfig);
        // 检测是否为新格式 ExperimentSchema（有 meta.physicsType 字段）
        if (parsed?.meta?.physicsType !== undefined) {
          setAiSchema(parsed);
        } else {
          setAiConfig(parsed);
        }
        sessionStorage.removeItem('eureka_experiment_config');
      } catch (e) {
        console.error('Failed to parse stored config:', e);
      }
    }
    setIsConfigLoaded(true);
  }, []);

  // 使用AI配置或默认配置（优先使用新格式 aiSchema）
  const displayName = aiSchema?.meta?.name || aiConfig?.name || experiment?.name || '实验';
  const displayIcon = aiSchema?.meta?.icon || aiConfig?.icon || experiment?.icon || '🔬';
  const displayGradient = aiSchema?.meta?.gradient || aiConfig?.gradient || experiment?.gradient || 'from-amber-500 to-orange-500';
  // 解析 gradient：支持 #hex-hex 和 from-x to-y 两种格式
  const isHexGradient = displayGradient.startsWith('#');
  const gradientStyle = isHexGradient 
    ? { background: `linear-gradient(135deg, ${displayGradient.replace('#', '').split('-').map(c => '#' + c).join(', ')})` }
    : undefined;
  const displayKnowledge = aiSchema?.teaching?.understanding?.keyConcepts || aiConfig?.teaching?.understanding?.principles || ['阿基米德原理', '物体的浮沉条件'];
  const displayCoreQuestion = aiConfig?.teaching?.design?.coreQuestion;
  const displayVariables = aiConfig?.teaching?.reasoning;
  const displayErrors = aiConfig?.teaching?.errors;
  const displayDiscussion = aiConfig?.teaching?.design?.discussionPoints;

  if (!experiment) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #FFF8F0 0%, #FFF5E6 100%)' }}>
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-4xl">🔍</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">实验未找到</h2>
          <p className="text-gray-600 mb-4">抱歉，找不到 ID 为 &quot;{id}&quot; 的实验</p>
          <Link href="/" className="px-6 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  // 如果有 AI 生成的实验规则，使用通用渲染器
  const hasAIRules = aiConfig?.experiment?.rules;
  
  const renderExperiment = () => {
    // 优先：如果有新格式 ExperimentSchema，直接转换并渲染
    if (aiSchema) {
      const legacyConfig = experimentSchemaToLegacy(aiSchema);
      return <UniversalPhysicsRenderer config={legacyConfig} />;
    }

    // 如果有 AI 生成的规则，使用通用物理渲染器
    if (hasAIRules && aiConfig) {
      let rules = aiConfig.experiment?.rules;
      
      // 使用统一Schema补全系统替代手动规则补全
      if (rules && !('calculate' in rules)) {
        const rawRules = rules as Record<string, unknown>;
        const physicsType = (rawRules.physicsType as string | undefined)?.toLowerCase() || 'generic';
        
        // 构建 partial ExperimentSchema 并用 enrichSchema 自动补全
        const partial: Partial<import('@/lib/experiment-schema').ExperimentSchema> = {
          meta: {
            name: aiConfig.name ?? '实验',
            subject: 'physics',
            topic: ((aiConfig as unknown) as Record<string, unknown>).topic as string ?? '',
            description: aiConfig.description ?? `${aiConfig.name ?? '实验'} - 探索物理规律`,
            icon: aiConfig.icon ?? '🔬',
            gradient: aiConfig.gradient ?? 'from-blue-500 to-purple-500',
            physicsType: physicsType as import('@/lib/experiment-schema').PhysicsEngineType,
          },
          params: ((rawRules.variables as Array<Record<string, unknown>>) ?? []).map(v => ({
            name: (v.name as string) ?? '',
            label: (v.label as string) ?? '',
            unit: (v.unit as string) ?? '',
            defaultValue: (v.default as number) ?? (v.defaultValue as number) ?? 0,
            min: (v.min as number) ?? 0,
            max: (v.max as number) ?? 100,
            step: (v.step as number) ?? 1,
            category: 'input' as const,
            description: (v.description as string) ?? `${v.label as string ?? ''}参数`,
          })),
          formulas: (rawRules.formula as string) ? [{
            name: '核心公式',
            expression: rawRules.formula as string,
            description: `${aiConfig.name ?? '实验'}的核心计算公式`,
            variables: ((rawRules.variables as Array<Record<string, unknown>>) ?? []).map(v => v.name as string),
            resultVariable: 'result',
          }] : [],
        };
        
        const { enrichSchema } = require('@/lib/schema-enricher') as typeof import('@/lib/schema-enricher');
        const fullSchema = enrichSchema(partial);
        const correctConfig = experimentSchemaToLegacy(fullSchema);
        return <UniversalPhysicsRenderer config={correctConfig} />;
      }
      
      // 如果有完整规则，渲染通用物理渲染器
      if (rules && 'calculate' in rules) {
        const aiConfigTopic = (aiConfig as GeneratedConfig).topic;
        const correctConfig: ExperimentConfig = {
          name: aiConfig.name,
          subject: aiConfig.subject,
          topic: aiConfigTopic || experiment.name,
          icon: aiConfig.icon,
          gradient: aiConfig.gradient,
          teaching: aiConfig.teaching,
          experiment: {
            type: aiConfig.experiment?.type || 'canvas',
            rules: rules as PhysicsRules
          }
        };
        return <UniversalPhysicsRenderer config={correctConfig} />;
      }
    }
    
    // 否则使用预定义组件
    switch (experiment.component) {
      case 'buoyancy':
        return <BuoyancyExperiment />;
      case 'lever':
        return <LeverExperimentPlaceholder />;
      case 'refraction':
        return <RefractionExperimentPlaceholder />;
      case 'circuit':
        return <CircuitExperimentPlaceholder />;
      case 'acid-base':
        return <AcidBaseExperimentPlaceholder />;
      default:
        return <BuoyancyExperiment />;
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #FFF8F0 0%, #FFF5E6 100%)' }}>
      {/* 顶部导航 */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-500 hover:text-gray-700 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
              </svg>
              返回
            </Link>
            <div className="w-px h-6 bg-gray-300" />
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isHexGradient ? '' : 'bg-gradient-to-br ' + displayGradient}`} style={gradientStyle}>
                <span className="text-xl">{displayIcon}</span>
              </div>
              <div>
                <h1 className="font-bold text-gray-800">{displayName}</h1>
                <p className="text-sm text-gray-500">{aiConfig?.subject || experiment?.subject}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 左侧知识区 */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            {/* 核心问题 */}
            {displayCoreQuestion && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-200">
                <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
                  <span className="text-xl">🎯</span>
                  核心问题
                </h3>
                <p className="text-sm text-amber-900 leading-relaxed">
                  {displayCoreQuestion}
                </p>
              </div>
            )}

            {/* 变量分析 */}
            {displayVariables && (
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 border border-blue-200">
                <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                  <span className="text-xl">📊</span>
                  变量分析
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-red-500 font-medium">自变量:</span>
                    <span className="text-gray-700">{displayVariables?.independent}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-500 font-medium">因变量:</span>
                    <span className="text-gray-700">{displayVariables?.dependent}</span>
                  </div>
                  {displayVariables?.controlled && displayVariables.controlled.length > 0 && (
                    <div className="flex items-start gap-2">
                      <span className="text-gray-500 font-medium">控制量:</span>
                      <span className="text-gray-700">{displayVariables.controlled.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 常见错误 */}
            {displayErrors?.concept && displayErrors.concept.length > 0 && (
              <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-5 border border-red-200">
                <h3 className="font-bold text-red-800 mb-3 flex items-center gap-2">
                  <span className="text-xl">⚠️</span>
                  常见错误
                </h3>
                <ul className="space-y-1">
                  {displayErrors.concept.map((mistake, i) => (
                    <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                      <span>•</span>
                      <span>{mistake}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 观察讨论点 */}
            {displayDiscussion && (
              <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-5 border border-purple-200">
                <h3 className="font-bold text-purple-800 mb-3 flex items-center gap-2">
                  <span className="text-xl">💡</span>
                  观察与讨论
                </h3>
                {displayDiscussion && displayDiscussion.length > 0 && (
                  <ul className="space-y-1">
                    {displayDiscussion.map((item, i) => (
                      <li key={i} className="text-xs text-gray-600">• {item}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* 核心知识点（备用） */}
            {!displayCoreQuestion && displayKnowledge.length > 0 && (
              <div className="bg-white rounded-2xl p-5 border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs">知</span>
                  核心知识点
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  {displayKnowledge.map((k, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-purple-500 mt-1">•</span>
                      <span>{k}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* 右侧实验区 */}
          <div className="lg:col-span-2">
            {renderExperiment()}
          </div>
        </div>
      </div>
    </div>
  );
}

// Placeholder组件 - 这些会从各自的页面导入
function LeverExperimentPlaceholder() {
  return <div className="text-center py-20 text-gray-500">杠杆原理实验 - 请访问 <Link href="/experiments/lever" className="text-amber-500">完整版</Link></div>;
}

function RefractionExperimentPlaceholder() {
  return <div className="text-center py-20 text-gray-500">光的折射实验 - 请访问 <Link href="/experiments/refraction" className="text-cyan-500">完整版</Link></div>;
}

function CircuitExperimentPlaceholder() {
  return <div className="text-center py-20 text-gray-500">电路实验 - 请访问 <Link href="/experiments/circuit" className="text-emerald-500">完整版</Link></div>;
}

function AcidBaseExperimentPlaceholder() {
  return <div className="text-center py-20 text-gray-500">酸碱滴定实验 - 请访问 <Link href="/experiments/acid-base" className="text-red-500">完整版</Link></div>;
}
