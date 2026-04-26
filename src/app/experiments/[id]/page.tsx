'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ExperimentKnowledgePanel } from '@/components/ExperimentKnowledgePanel';
import {
  ExperimentRenderer,
  resolveTemplateId,
  type PresetExperiment,
  type GeneratedConfig,
} from '@/components/ExperimentRenderer';
import { ExperimentChatPanel } from '@/components/ExperimentChatPanel';
import type { ExperimentSchema } from '@/lib/experiment-schema';

// 实验配置映射
const experiments: Record<string, PresetExperiment & { component: 'buoyancy' | 'lever' | 'refraction' | 'circuit' | 'acid-base' }> = {
  buoyancy: {
    name: '浮力原理',
    icon: '🌊', gradient: 'from-blue-400 to-cyan-500', color: 'blue', subject: '物理',
    component: 'buoyancy', templateId: 'physics/buoyancy',
    defaultKnowledge: ['阿基米德原理', '物体的浮沉条件', '公式：F浮 = ρ液 × g × V排', '浸入体积比 = ρ物 / ρ液'],
    steps: ['拖动"物体密度"滑块，观察物体浮沉状态变化', '调整"液体密度"滑块，比较不同液体中的浮力', '改变"物体体积"，观察浮力数值变化', '当物体下沉时，尝试施加"外力"观察浸入深度变化'],
  },
  lever: {
    name: '杠杆原理',
    icon: '⚖️', gradient: 'from-amber-500 to-orange-500', color: 'amber', subject: '物理',
    component: 'lever', templateId: 'physics/lever',
    defaultKnowledge: ['杠杆平衡条件', '动力×动力臂 = 阻力×阻力臂'],
  },
  refraction: {
    name: '光的折射',
    icon: '💡', gradient: 'from-cyan-500 to-blue-500', color: 'cyan', subject: '物理',
    component: 'refraction', templateId: 'physics/refraction',
    defaultKnowledge: ['折射定律', '光从空气射入水中时折射角小于入射角'],
  },
  circuit: {
    name: '电路串并联',
    icon: '⚡', gradient: 'from-emerald-500 to-teal-500', color: 'emerald', subject: '物理',
    component: 'circuit', templateId: 'physics/circuit',
    defaultKnowledge: ['欧姆定律 I=U/R', '串联分压不分流', '并联分流不分压', '公式：I = U/R', '串联：R总 = R1 + R2', '并联：1/R总 = 1/R1 + 1/R2'],
    steps: ['调整"电源电压"滑块，观察电流表示数变化', '改变"电阻 R₁"阻值，观察各支路电流分配', '切换"电阻 R₂"阻值，对比串并联电路差异', '观察电压表读数，验证串联分压、并联等压规律'],
  },
  'acid-base': {
    name: '酸碱滴定',
    icon: '🧪', gradient: 'from-red-500 to-orange-500', color: 'red', subject: '化学',
    component: 'acid-base', templateId: 'chemistry/acid-base-titration',
    defaultKnowledge: ['酸碱中和反应', '指示剂变色原理', '滴定终点判断', '公式：HCl + NaOH → NaCl + H₂O', '等当点：C酸V酸 = C碱V碱'],
    steps: ['设置酸浓度、碱浓度和酸体积参数', '选择一种指示剂（酚酞/甲基橙/石蕊）', '拖动"已加碱体积"滑块模拟滴定过程', '观察 pH 变化和溶液颜色变化，找到等当点'],
  },
  'acid-base-titration': {
    name: '酸碱中和滴定',
    icon: '🧪', gradient: 'from-purple-500 to-indigo-600', color: 'purple', subject: '化学',
    component: 'acid-base', templateId: 'chemistry/acid-base-titration',
  },
  'iron-rusting': {
    name: '铁生锈条件探究',
    icon: '🔩', gradient: 'from-orange-500 to-red-600', color: 'orange', subject: '化学',
    component: 'acid-base', templateId: 'chemistry/iron-rusting',
  },
  'electrolysis': {
    name: '电解水实验',
    icon: '⚡', gradient: 'from-cyan-500 to-teal-600', color: 'cyan', subject: '化学',
    component: 'acid-base', templateId: 'chemistry/electrolysis',
  },
  'reaction-rate': {
    name: '化学反应速率',
    icon: '⏱️', gradient: 'from-emerald-500 to-green-600', color: 'emerald', subject: '化学',
    component: 'acid-base', templateId: 'chemistry/reaction-rate',
  },
  'combustion-conditions': {
    name: '燃烧条件探究',
    icon: '🔥', gradient: 'from-red-500 to-orange-500', color: 'red', subject: '化学',
    component: 'acid-base', templateId: 'chemistry/combustion-conditions',
  },
};

const ID_TO_CONCEPT: Record<string, string> = {
  electrolyte: '电解原理', combustion: '燃烧反应',
  cell: '细胞结构', photosynthesis: '光合作用', inheritance: '遗传规律',
  function: '函数图像', geometry: '几何证明', calculus: '微积分入门',
  plate: '板块运动', atmosphere: '大气环流', water: '水循环',
  generic: '物理实验',
};

export default function ExperimentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const exp = experiments[id] ?? null;

  const [aiConfig, setAiConfig] = useState<GeneratedConfig | null>(null);
  const [aiSchema, setAiSchema] = useState<ExperimentSchema | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  // 客户端挂载后从 sessionStorage 加载配置
  useEffect(() => {
    const stored = sessionStorage.getItem('eureka_experiment_config');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
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
    setIsLoaded(true);
  }, []);

  // Auto-generate experiment when no preset and no AI config
  useEffect(() => {
    if (!isLoaded || exp || aiConfig || aiSchema || isGenerating) return;
    const concept = ID_TO_CONCEPT[id] || id;
    setIsGenerating(true);
    setGenError(null);
    fetch('/api/generate', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ concept }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.success && data.schema) {
          const schema = data.schema;
          if (typeof data.templateId === 'string' && data.templateId) {
            (schema as ExperimentSchema & { _templateId?: string })._templateId = data.templateId;
          }
          if (schema?.meta?.physicsType !== undefined) setAiSchema(schema);
          else setAiConfig(schema);
        } else {
          setGenError(data.error || '生成失败');
        }
      })
      .catch(err => setGenError(err instanceof Error ? err.message : '生成失败，请重试'))
      .finally(() => setIsGenerating(false));
  }, [isLoaded, exp, aiConfig, aiSchema, isGenerating, id]);

  const displayName = aiSchema?.meta?.name || aiConfig?.name || exp?.name || '实验';
  const displayIcon = aiSchema?.meta?.icon || aiConfig?.icon || exp?.icon || '🔬';
  const displayGradient = aiSchema?.meta?.gradient || aiConfig?.gradient || exp?.gradient || 'from-amber-500 to-orange-500';
  const isHex = displayGradient.startsWith('#');
  const gradientStyle = isHex
    ? { background: `linear-gradient(135deg, ${displayGradient.replace('#', '').split('-').map(c => '#' + c).join(', ')})` }
    : undefined;

  // 教学数据提取
  const legacy = aiConfig?.teaching;
  const coreQuestion = legacy?.design?.coreQuestion;
  const variableInfo = legacy?.reasoning;
  const errorInfo = legacy?.errors;
  const discussion = legacy?.design?.discussionPoints;
  const fallbackKnowledge = exp?.defaultKnowledge || ['实验知识点'];
  const displayKnowledge = aiSchema?.teaching?.understanding?.keyConcepts ?? aiConfig?.teaching?.understanding?.principles ?? fallbackKnowledge;

  const backendTid = (aiSchema as (ExperimentSchema & { _templateId?: string }) | null)?._templateId || null;
  const resolvedTemplateId = resolveTemplateId(aiSchema, aiConfig, exp, backendTid);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #FFF8F0 0%, #FFF5E6 100%)' }}>
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isGenerating) {
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

  if (!exp && !aiConfig && !aiSchema) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #FFF8F0 0%, #FFF5E6 100%)' }}>
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-4xl">🔍</span>
          </div>
          {genError ? (
            <>
              <h2 className="text-xl font-bold text-gray-800 mb-2">生成失败</h2>
              <p className="text-gray-600 mb-4">{genError}</p>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-gray-800 mb-2">实验未找到</h2>
              <p className="text-gray-600 mb-4">抱歉，找不到 ID 为 &quot;{id}&quot; 的实验</p>
            </>
          )}
          <Link href="/" className="px-6 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors">返回首页</Link>
        </div>
      </div>
    );
  }

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
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isHex ? '' : 'bg-gradient-to-br ' + displayGradient}`} style={gradientStyle}>
                <span className="text-xl">{displayIcon}</span>
              </div>
              <div>
                <h1 className="font-bold text-gray-800">{displayName}</h1>
                <p className="text-sm text-gray-500">{aiConfig?.subject || exp?.subject}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 主体内容 */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 左侧知识区 */}
          <ExperimentKnowledgePanel
            coreQuestion={coreQuestion}
            variables={variableInfo ? {
              independent: variableInfo.independent,
              dependent: variableInfo.dependent,
              controlled: variableInfo.controlled,
            } : undefined}
            errors={errorInfo ? { concept: errorInfo.concept } : undefined}
            discussion={discussion}
            knowledge={displayKnowledge}
            steps={exp?.steps}
          />

          {/* 右侧实验区 */}
          <div className="lg:col-span-3">
            <ExperimentWithChat experimentName={displayName} experimentTopic={aiConfig?.topic ?? exp?.subject}>
              <ExperimentRenderer experiment={exp} aiSchema={aiSchema} aiConfig={aiConfig} resolvedTemplateId={resolvedTemplateId} />
            </ExperimentWithChat>
          </div>
        </div>
      </div>
    </div>
  );
}

// Wrapper that adds AI teaching assistant button to any experiment
function ExperimentWithChat({ children, experimentName, experimentTopic }: { children: React.ReactNode; experimentName: string; experimentTopic?: string }) {
  const [chatOpen, setChatOpen] = useState(false);
  return (
    <div className="space-y-4">
      {children}
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
          <ExperimentChatPanel experimentName={experimentName} experimentTopic={experimentTopic} onClose={() => setChatOpen(false)} />
        </div>
      )}
    </div>
  );
}
