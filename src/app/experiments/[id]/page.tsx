'use client';

import React, { useState, useRef, useEffect, use } from 'react';
import Link from 'next/link';
import { UniversalPhysicsRenderer, PhysicsRules, ExperimentConfig, experimentSchemaToLegacy } from '@/components/DynamicExperiment';
import { ExperimentChatPanel } from '@/components/ExperimentChatPanel';
import { IframeExperiment } from '@/components/IframeExperiment';
import { conceptToTemplateId } from '@/lib/concept-to-template';
import { getTemplate } from '@/lib/template-registry';
import { enrichSchema } from '@/lib/schema-enricher';

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
  /** Triple-lock: approved HTML template ID. If set and approved, iframe is used. */
  templateId?: string;
  /** Default knowledge for preset experiments */
  defaultKnowledge?: string[];
}> = {
  buoyancy: {
    name: '浮力原理',
    icon: '🌊',
    gradient: 'from-blue-400 to-cyan-500',
    color: 'blue',
    subject: '物理',
    component: 'buoyancy',
    templateId: 'physics/buoyancy',
    defaultKnowledge: ['阿基米德原理', '物体的浮沉条件'],
  },
  'lever': {
    name: '杠杆原理',
    icon: '⚖️',
    gradient: 'from-amber-500 to-orange-500',
    color: 'amber',
    subject: '物理',
    component: 'lever',
    templateId: 'physics/lever',
    defaultKnowledge: ['杠杆平衡条件', '动力×动力臂 = 阻力×阻力臂'],
  },
  'refraction': {
    name: '光的折射',
    icon: '💡',
    gradient: 'from-cyan-500 to-blue-500',
    color: 'cyan',
    subject: '物理',
    component: 'refraction',
    templateId: 'physics/refraction',
    defaultKnowledge: ['折射定律', '光从空气射入水中时折射角小于入射角'],
  },
  'circuit': {
    name: '电路串并联',
    icon: '⚡',
    gradient: 'from-emerald-500 to-teal-500',
    color: 'emerald',
    subject: '物理',
    component: 'circuit',
    templateId: 'physics/circuit',
    defaultKnowledge: ['欧姆定律 I=U/R', '串联分压不分流', '并联分流不分压'],
  },
  'acid-base': {
    name: '酸碱滴定',
    icon: '🧪',
    gradient: 'from-red-500 to-orange-500',
    color: 'red',
    subject: '化学',
    component: 'acid-base',
    templateId: 'chemistry/acid-base-titration',
    defaultKnowledge: ['酸碱中和反应', '指示剂变色原理', '滴定终点判断'],
  },
  'acid-base-titration': {
    name: '酸碱中和滴定',
    icon: '🧪',
    gradient: 'from-purple-500 to-indigo-600',
    color: 'purple',
    subject: '化学',
    component: 'acid-base',
    templateId: 'chemistry/acid-base-titration',
  },
  'iron-rusting': {
    name: '铁生锈条件探究',
    icon: '🔩',
    gradient: 'from-orange-500 to-red-600',
    color: 'orange',
    subject: '化学',
    component: 'acid-base',
    templateId: 'chemistry/iron-rusting',
  },
  'electrolysis': {
    name: '电解水实验',
    icon: '⚡',
    gradient: 'from-cyan-500 to-teal-600',
    color: 'cyan',
    subject: '化学',
    component: 'acid-base',
    templateId: 'chemistry/electrolysis',
  },
  'reaction-rate': {
    name: '化学反应速率',
    icon: '⏱️',
    gradient: 'from-emerald-500 to-green-600',
    color: 'emerald',
    subject: '化学',
    component: 'acid-base',
    templateId: 'chemistry/reaction-rate',
  },
  'combustion-conditions': {
    name: '燃烧条件探究',
    icon: '🔥',
    gradient: 'from-red-500 to-orange-600',
    color: 'red',
    subject: '化学',
    component: 'acid-base',
    templateId: 'chemistry/combustion-conditions',
  },
};

// 预设实验 fallback：尝试 iframe 模板，否则显示占位符
function PresetExperimentFallback({ experimentId, templateId }: { experimentId: string; templateId?: string }) {
  if (templateId) {
    return <IframeExperiment templateId={templateId} height={560} />;
  }
  return (
    <div className="text-center py-20 text-gray-500">
      {experimentId} 实验正在准备中...
    </div>
  );
}

// Map non-preset experiment IDs to concept names for LLM auto-generation
const ID_TO_CONCEPT: Record<string, string> = {
  electrolyte: '电解原理', combustion: '燃烧反应',
  cell: '细胞结构', photosynthesis: '光合作用', inheritance: '遗传规律',
  function: '函数图像', geometry: '几何证明', calculus: '微积分入门',
  plate: '板块运动', atmosphere: '大气环流', water: '水循环',
  generic: '物理实验',
};

export default function ExperimentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const experiment = experiments[id];
  
  // 使用 state 存储 AI 配置，避免 hydration mismatch
  const [aiConfig, setAiConfig] = useState<GeneratedConfig | null>(null);
  const [aiSchema, setAiSchema] = useState<import('@/lib/experiment-schema').ExperimentSchema | null>(null);
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);
  const [autoGenError, setAutoGenError] = useState<string | null>(null);

  // 客户端挂载后从 sessionStorage 加载配置
  useEffect(() => {
    const storedConfig = sessionStorage.getItem('eureka_experiment_config');
    if (storedConfig) {
      try {
        const parsed = JSON.parse(storedConfig);
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

  // Auto-generate experiment via LLM when no preset and no AI config
  useEffect(() => {
    if (!isConfigLoaded) return;
    if (experiment) return;
    if (aiConfig || aiSchema) return;
    if (isAutoGenerating) return;

    const concept = ID_TO_CONCEPT[id] || id;
    setIsAutoGenerating(true);
    setAutoGenError(null);

    fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ concept }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.schema) {
          const schema = data.schema;
          // Triple-Lock: if backend resolved a whitelisted templateId, remember it
          // on the schema so downstream renderer can prefer iframe over Canvas.
          if (typeof data.templateId === 'string' && data.templateId) {
            schema._templateId = data.templateId;
          }
          if (schema?.meta?.physicsType !== undefined) {
            setAiSchema(schema);
          } else {
            setAiConfig(schema);
          }
        } else {
          setAutoGenError(data.error || '生成失败');
        }
      })
      .catch(err => {
        setAutoGenError(err instanceof Error ? err.message : '生成失败，请重试');
      })
      .finally(() => {
        setIsAutoGenerating(false);
      });
  }, [isConfigLoaded, experiment, aiConfig, aiSchema, isAutoGenerating, id]);

  // 使用AI配置或默认配置（优先使用新格式 aiSchema）
  const displayName = aiSchema?.meta?.name || aiConfig?.name || experiment?.name || '实验';
  const displayIcon = aiSchema?.meta?.icon || aiConfig?.icon || experiment?.icon || '🔬';
  const displayGradient = aiSchema?.meta?.gradient || aiConfig?.gradient || experiment?.gradient || 'from-amber-500 to-orange-500';
  // 解析 gradient：支持 #hex-hex 和 from-x to-y 两种格式
  const isHexGradient = displayGradient.startsWith('#');
  const gradientStyle = isHexGradient 
    ? { background: `linear-gradient(135deg, ${displayGradient.replace('#', '').split('-').map(c => '#' + c).join(', ')})` }
    : undefined;
  const displayKnowledge = aiSchema?.teaching?.understanding?.keyConcepts || aiConfig?.teaching?.understanding?.principles || experiment?.defaultKnowledge || ['实验知识点'];
  const displayCoreQuestion = aiConfig?.teaching?.design?.coreQuestion;
  const displayVariables = aiConfig?.teaching?.reasoning;
  const displayErrors = aiConfig?.teaching?.errors;
  const displayDiscussion = aiConfig?.teaching?.design?.discussionPoints;

  // 等待配置加载完成
  if (!isConfigLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #FFF8F0 0%, #FFF5E6 100%)' }}>
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Auto-generating experiment via LLM
  if (isAutoGenerating) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #FFF8F0 0%, #FFF5E6 100%)' }}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">正在生成实验...</h2>
          <p className="text-gray-600">AI 正在为您创建「{ID_TO_CONCEPT[id] || id}」实验</p>
        </div>
      </div>
    );
  }

  // Only show "not found" when no preset, no AI config, and not generating
  if (!experiment && !aiConfig && !aiSchema && !isAutoGenerating) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #FFF8F0 0%, #FFF5E6 100%)' }}>
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-4xl">🔍</span>
          </div>
          {autoGenError ? (
            <>
              <h2 className="text-xl font-bold text-gray-800 mb-2">生成失败</h2>
              <p className="text-gray-600 mb-4">{autoGenError}</p>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-gray-800 mb-2">实验未找到</h2>
              <p className="text-gray-600 mb-4">抱歉，找不到 ID 为 &quot;{id}&quot; 的实验</p>
            </>
          )}
          <Link href="/" className="px-6 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  // 如果有 AI 生成的实验规则，使用通用渲染器
  const hasAIRules = aiConfig?.experiment?.rules;

  // Triple-Lock routing: resolve the best approved HTML template for this experiment.
  // Priority:
  //   1. AI-generated schema topic → conceptToTemplateId → whitelist
  //   2. AI-generated legacy config name → conceptToTemplateId → whitelist
  //   3. Preset experiment's pre-declared templateId (buoyancy/lever/refraction/circuit)
  // If any of them resolve to an approved template, iframe takes precedence over Canvas.
  const resolvedTemplateId: string | null = (() => {
    // 0. Prefer backend-resolved templateId (already whitelist-verified)
    const backendTid = (aiSchema as (import('@/lib/experiment-schema').ExperimentSchema & { _templateId?: string }) | null)?._templateId;
    if (backendTid && getTemplate(backendTid)) return backendTid;

    // Try AI concept routing first
    const aiConcept =
      aiSchema?.meta?.topic ||
      aiSchema?.meta?.name ||
      (aiConfig as GeneratedConfig | null)?.topic ||
      aiConfig?.name ||
      null;
    if (aiConcept) {
      const tid = conceptToTemplateId(aiConcept);
      if (tid) return tid;
    }
    // Fall back to preset experiment's declared templateId
    if (experiment?.templateId && getTemplate(experiment.templateId)) {
      return experiment.templateId;
    }
    return null;
  })();

  const renderExperiment = () => {
    // PRIMARY PATH (Triple-Lock approved template) — deterministic, audited, safe
    if (resolvedTemplateId) {
      return <IframeExperiment templateId={resolvedTemplateId} height={560} />;
    }

    // 优先：如果有新格式 ExperimentSchema，直接转换并渲染
    if (aiSchema) {
      const legacyConfig = experimentSchemaToLegacy(aiSchema);
      return <UniversalPhysicsRenderer config={legacyConfig} />;
    }

    // 如果有 AI 生成的规则，使用通用物理渲染器
    if (hasAIRules && aiConfig) {
      const rules = aiConfig.experiment?.rules;
      
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
    
    // Fallback: use iframe template if available, otherwise placeholder
    return (
      <PresetExperimentFallback
        experimentId={experiment.component}
        templateId={experiment.templateId}
      />
    );
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
            <ExperimentWithChat
              experimentName={displayName}
              experimentTopic={aiConfig?.topic ?? experiment?.subject}
            >
              {renderExperiment()}
            </ExperimentWithChat>
          </div>
        </div>
      </div>
    </div>
  );
}

// Wrapper that adds AI teaching assistant button to any experiment
function ExperimentWithChat({
  children,
  experimentName,
  experimentTopic,
}: {
  children: React.ReactNode;
  experimentName: string;
  experimentTopic?: string;
}) {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="space-y-4">
      {children}
      {/* AI Teaching Assistant toggle */}
      <div className="flex justify-end">
        <button
          onClick={() => setChatOpen(v => !v)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-sm"
        >
          <span>🤖</span>
          {chatOpen ? '关闭助手' : 'AI 教学助手'}
        </button>
      </div>
      {chatOpen && (
        <div className="h-[480px]">
          <ExperimentChatPanel
            experimentName={experimentName}
            experimentTopic={experimentTopic}
            onClose={() => setChatOpen(false)}
          />
        </div>
      )}
    </div>
  );
}

// All preset experiments now use iframe templates via PresetExperimentFallback.
