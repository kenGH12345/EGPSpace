import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Message } from 'coze-coding-dev-sdk';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import type { ExperimentSchema, PhysicsEngineType, ParamDefinition, FormulaDefinition, TeachingDesign, ExperimentScene, SubjectDomain, UnderstandingDesign, ReasoningDesign, ExperimentDesign, ErrorDesign, EvaluationDesign } from '@/lib/experiment-schema';
import { validateSchema, createDefaultSchema } from '@/lib/experiment-schema';
import { enrichSchema } from '@/lib/schema-enricher';
import { validateWithKnowledge } from '@/lib/schema-validator';
import { conceptToTemplateId } from '@/lib/concept-to-template';
import { getTemplate } from '@/lib/template-registry';

const client = new LLMClient();

// Skill 目录路径（跨学科）
const SKILL_DIR = '/workspace/projects/experiment-design-skill';

/**
 * 加载学科知识库
 */
function loadSubjectKnowledge(subject: string): string {
  const subjectMap: Record<string, string[]> = {
    '物理': ['physics/knowledge.md'],
    '化学': ['chemistry/knowledge.md'],
    '生物': ['biology/knowledge.md'],
    '地理': ['geography/knowledge.md'],
  };
  
  const files = subjectMap[subject] || ['physics/knowledge.md'];
  let content = '';
  
  for (const file of files) {
    const filePath = join(SKILL_DIR, 'references', file);
    if (existsSync(filePath)) {
      content += `\n## ${file.split('/')[0].toUpperCase()} 知识库\n`;
      content += readFileSync(filePath, 'utf-8');
    }
  }
  
  return content || '';
}

/**
 * Teaching guidelines per stage (derived from EurekaFinder behavior observation).
 * Each stage adjusts language complexity, formula depth, and example style.
 */
const STAGE_GUIDELINES: Record<string, { label: string; ageRange: string; guideline: string }> = {
  preschool: {
    label: '学前',
    ageRange: '3-6岁',
    guideline: '用拟人化语言，避免数学符号和公式，每句话不超过15字，多用"就像...一样"类比。',
  },
  primary: {
    label: '小学',
    ageRange: '6-12岁',
    guideline: '从生活现象引入，使用简单公式，优先举例，避免复杂推导，语言活泼有趣。',
  },
  junior: {
    label: '初中',
    ageRange: '12-15岁',
    guideline: '使用正规术语并附白话解释，给出公式和例题，适当引入推导过程。',
  },
  senior: {
    label: '高中',
    ageRange: '15-18岁',
    guideline: '严谨定义，完整推导，多角度理解，可引入微积分思想，注重逻辑严密性。',
  },
  adult: {
    label: '成人',
    ageRange: '18岁以上',
    guideline: '直入核心，跨学科类比，高信息密度，可引用前沿研究，假设读者有高中物理基础。',
  },
};

/**
 * 构建跨学科 System Prompt
 */
function buildSystemPrompt(subject?: string, stage?: string): string {
  // 加载主 Skill 文件
  const skillPath = join(SKILL_DIR, 'SKILL.md');
  let skillContent = '';
  if (existsSync(skillPath)) {
    skillContent = readFileSync(skillPath, 'utf-8');
  }
  
  // 加载学科知识库
  const subjectKnowledge = subject ? loadSubjectKnowledge(subject) : '';

  // 加载组装规范（拓扑实验）
  const assemblySkillPath = join(SKILL_DIR, 'assembly-skill.md');
  const assemblySkill = existsSync(assemblySkillPath) ? readFileSync(assemblySkillPath, 'utf-8') : '';
  
  // Stage-aware teaching guideline
  const stageInfo = stage ? STAGE_GUIDELINES[stage] : null;
  const stageSection = stageInfo
    ? `\n## 目标学段：${stageInfo.label}（${stageInfo.ageRange}）\n\n讲解风格要求：${stageInfo.guideline}\n\n请确保实验描述、teaching 字段的语言难度和例子选择符合此学段特征。\n`
    : '';

  return `你是「Eureka」实验教学平台的 AI 实验设计专家。${stageSection}

## 核心设计理念

**自主推理 vs 规则灌输**：
- ❌ 不要死板套用规则
- ✅ 先理解概念本质，再自主设计实验
- ✅ 参考知识库，但要有自己的理解和判断

## 设计流程：STEP 框架

### S - Study（学习理解）
在设计实验前，先完成以下思考：
1. 核心概念是什么？
2. 相关原理/定律有哪些？
3. 历史案例或经典实验？
4. 生活应用场景？

### T - Think（推理分析）
完成概念理解后，分析：
1. 实验变量设计
2. 可能出现的错误/误解
3. 误差来源

### E - Experiment（实验设计）
基于以上分析，设计具体实验

### P - Practice（实践反馈）
设计评价与拓展

${subjectKnowledge ? `## 学科知识库参考\n${subjectKnowledge}` : ''}

${assemblySkill ? `## 实验扩展与组装约束\n${assemblySkill}` : ''}

## 重要原则

1. **科学严谨性**：所有参数必须符合学科规律
2. **先理解后设计**：不要急于输出，先思考
3. **融入历史**：结合科学家故事激发兴趣
4. **联系生活**：用身边现象引入

## 输出要求

必须返回 JSON 格式，遵循统一的 ExperimentSchema 结构。
系统会根据 physicsType 自动补全 canvas/physics/interactions，你只需关注核心层。

{
  "meta": {
    "name": "实验名称",
    "subject": "physics|chemistry|biology|geography|math",
    "topic": "具体主题",
    "description": "一句话描述",
    "icon": "emoji",
    "gradient": "from-xxx-500 to-xxx-500",
    "physicsType": "buoyancy|lever|refraction|circuit|pendulum|wave|generic"
  },
  "params": [
    {
      "name": "变量名(英文)",
      "label": "中文标签",
      "unit": "单位",
      "defaultValue": 默认值,
      "min": 最小值,
      "max": 最大值,
      "step": 步长,
      "category": "input",
      "description": "说明"
    }
  ],
  "formulas": [
    {
      "name": "公式名称",
      "expression": "公式表达式",
      "description": "公式说明",
      "variables": ["变量1", "变量2"],
      "resultVariable": "结果变量名"
    }
  ],
  "teaching": {
    "understanding": {
      "objective": "学习目标",
      "keyConcepts": ["核心概念"],
      "prerequisites": ["前置知识"]
    },
    "reasoning": {
      "hypothesis": "实验假设",
      "variables": ["实验变量"],
      "controlMethod": "控制方法"
    },
    "design": {
      "steps": ["实验步骤"],
      "dataCollection": "数据收集方法",
      "analysisMethod": "分析方法"
    },
    "errors": {
      "common": ["常见错误"],
      "prevention": ["预防措施"]
    },
    "evaluation": {
      "questions": ["评价问题"],
      "criteria": ["评价标准"]
    }
  },
  "scenes": [
    {
      "name": "场景名称",
      "description": "场景描述",
      "params": { "变量名": 值 }
    }
  ],
  "components": [
    { "id": "组件id", "kind": "类型", "props": {} }
  ],
  "connections": [
    { "from": "A", "fromPort": "out", "to": "B", "toPort": "in" }
  ]
}

关键规则：
1. 必须生成 components 和 connections 数组，描述实验的原子元件和拓扑结构。
2. 你无需生成 formulas 字段，底层的拓扑物理引擎会自动根据 components 的种类和 connections 连线来推导业务结果。
3. params 依然可以保留，作为可调节输入参数，但重点是让物理元件真实组装（例如电池、导线、开关、灯泡）。
4. 保证参数和拓扑结构的科学合理性。

## 🚫 严格禁止

- ❌ 不要输出任何 HTML / CSS / JavaScript 代码片段。
- ❌ 不要输出 interactions 字段的 hit-testing 逻辑。
- ✅ 你只负责：概念讲解、参数设计、拓扑设计（元件和连线）、教学设计。

只返回 JSON，不要其他内容！`;
}
/**
 * 识别学科
 */
function identifySubject(concept: string): string {
  const subjectKeywords: Record<string, string[]> = {
    '物理': ['力', '能', '热', '光', '电', '磁', '运动', '速度', '加速度', '质量', '密度', '浮力', '折射', '反射', '电路', '杠杆', '摆', '波', '振动', '压强', '功率', '动能', '势能', '摩擦'],
    '化学': ['反应', '酸', '碱', '盐', '元素', '分子', '原子', '离子', '氧化', '还原', '燃烧', '中和', '滴定', 'PH', '催化', '溶液', '浓度', '摩尔', '化合', '分解', '置换'],
    '生物': ['细胞', '光合', '呼吸', '遗传', '变异', 'DNA', 'RNA', '蛋白质', '酶', '激素', '生态', '种群', '进化', '消化', '循环', '神经', '免疫', '基因', '染色体', '有丝分裂'],
    '地理': ['地球', '气候', '地形', '地貌', '板块', '运动', '经纬度', '天气', '降水', '温度', '季风', '洋流', '人口', '城市', '地震', '火山', '大气', '水循环'],
    '数学': ['函数', '方程', '不等式', '导数', '积分', '概率', '统计', '向量', '矩阵', '几何', '三角', '数列', '极限', '微分', '面积', '体积', '坐标', '图像', '抛物线', '圆', '椭圆', '双曲线'],
  };
  
  for (const [subject, keywords] of Object.entries(subjectKeywords)) {
    if (keywords.some(k => concept.includes(k))) {
      return subject;
    }
  }
  
  return '物理'; // 默认物理
}

export async function POST(request: NextRequest) {
  try {
    const { concept, stage } = await request.json();

    if (!concept || typeof concept !== 'string') {
      return NextResponse.json(
        { error: '请输入有效的概念名称' },
        { status: 400 }
      );
    }

    // 自动识别学科
    const subject = identifySubject(concept);
    
    // 构建 prompt（含学段感知）
    const systemPrompt = buildSystemPrompt(subject, stage);

    const messages: Message[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `请为「${concept}」设计一个交互实验。\n\n学科：${subject}${stage ? `\n目标学段：${STAGE_GUIDELINES[stage]?.label ?? stage}` : ''}\n\n请按照 STEP 框架，先理解概念，再设计实验。` }
    ];

    const response = await client.invoke(messages, {
      temperature: 0.7,
    });

    const content = response.content;
    
    // 提取 JSON（更宽松的匹配）
    let rawJson: Record<string, unknown> | null = null;
    
    const jsonPatterns = [
      /```json\s*([\s\S]*?)\s*```/,
      /```\s*([\s\S]*?)\s*```/,
      /(\{[\s\S]*\})/,
    ];
    
    for (const pattern of jsonPatterns) {
      const match = content.match(pattern);
      if (match) {
        try {
          rawJson = JSON.parse(match[1].trim());
          break;
        } catch {
          try {
            const cleaned = match[1].replace(/```json|```/g, '').trim();
            rawJson = JSON.parse(cleaned);
            break;
          } catch {
            continue;
          }
        }
      }
    }
    
    // Transform to Schema
    let schema: ExperimentSchema;

    let validationReport = null;

    if (rawJson) {
      // 🔒 Triple-Lock defensive sanitization: strip any canvas/interactions/code
      //    fields that LLM may have emitted despite the prompt ban.
      //    Template visuals are only rendered when registry metadata approves
      //    the resolved templateId.
      sanitizeLLMOutput(rawJson);

      const partial = transformToSchema(rawJson, subject);
      schema = enrichSchema(partial);
      
      const validation = validateSchema(schema);
      if (!validation.valid) {
        console.log('[Generate] Schema validation warnings:', validation.errors);
      }

      // Knowledge-based validation layer
      const validationOutput = validateWithKnowledge(schema, concept);
      schema = validationOutput.schema;
      validationReport = {
        validationPassed: validationOutput.report.criticalCount === 0,
        fallbackUsed: validationOutput.report.fallbackUsed,
        fallbackReason: validationOutput.report.fallbackReason,
        criticalCount: validationOutput.report.criticalCount,
        errorCount: validationOutput.report.errorCount,
        warningCount: validationOutput.report.warningCount,
        checks: validationOutput.report.checks,
      };

      if (validationOutput.report.fallbackUsed) {
        console.log('[Generate] Validation fallback triggered:', validationOutput.report.fallbackReason);
      }
    } else {
      console.log('[Generate] JSON 解析失败，使用 fallback schema');
      schema = createFallbackSchema(concept, subject);
    }

    // 🔒 Triple-Lock template routing (Lock 2 + Lock 3):
    //    Resolve concept → templateId → registry metadata guard.
    //    Frontend will prefer iframe template over Canvas rendering when available.
    const candidateId =
      conceptToTemplateId(concept) ||
      conceptToTemplateId(schema.meta?.topic || '') ||
      conceptToTemplateId(schema.meta?.name || '');
    const templateId = candidateId && getTemplate(candidateId) ? candidateId : null;

    return NextResponse.json({
      success: true,
      concept,
      subject,
      schema,
      /** Approved template ID (may be null if no matching template). Frontend
       *  must still validate via getTemplate() — registry metadata is authoritative. */
      templateId,
      validationReport,
    });
  } catch (error) {
    console.error('Generate API Error:', error);
    return NextResponse.json(
      { error: '生成实验失败，请重试' },
      { status: 500 }
    );
  }
}

// Transform LLM output (old or new format) to ExperimentSchema partial
/**
 * 🔒 Triple-Lock defensive sanitizer.
 *
 * Strips any fields the LLM may have emitted despite the Prompt ban
 * (Lock 1). This protects against prompt-injection and model drift by ensuring
 * no LLM-generated drawing/interaction/code reaches the renderer.
 *
 * Mutates `raw` in place, removing:
 *   - canvas / canvasConfig / interactions / graphics / shapes / elements
 *   - code / html / css / javascript / script
 *   - recursively from `experiment.*` if present (legacy format)
 */
function sanitizeLLMOutput(raw: Record<string, unknown>): void {
  const FORBIDDEN_TOP = ['canvas', 'canvasConfig', 'interactions', 'graphics', 'shapes', 'elements', 'code', 'html', 'css', 'javascript', 'script', 'ui'];
  const removed: string[] = [];

  for (const key of FORBIDDEN_TOP) {
    if (key in raw) {
      delete raw[key];
      removed.push(key);
    }
  }

  // Legacy format: experiment.{canvas|rules.code|...}
  if (raw.experiment && typeof raw.experiment === 'object') {
    const exp = raw.experiment as Record<string, unknown>;
    for (const key of FORBIDDEN_TOP) {
      if (key in exp) {
        delete exp[key];
        removed.push(`experiment.${key}`);
      }
    }
    if (exp.rules && typeof exp.rules === 'object') {
      const rules = exp.rules as Record<string, unknown>;
      if ('code' in rules) {
        delete rules.code;
        removed.push('experiment.rules.code');
      }
      if ('draw' in rules) {
        delete rules.draw;
        removed.push('experiment.rules.draw');
      }
    }
  }

  if (removed.length > 0) {
    console.log('[Generate] 🔒 Sanitized forbidden LLM fields:', removed);
  }
}

function transformToSchema(raw: Record<string, unknown>, subject: string): Partial<ExperimentSchema> {
  // Detect old format: has top-level "experiment" key
  if (raw.experiment && typeof raw.experiment === 'object') {
    const exp = raw.experiment as Record<string, unknown>;
    const rules = (exp.rules ?? {}) as Record<string, unknown>;
    const variables = (rules.variables ?? []) as Array<Record<string, unknown>>;
    const meta = raw as Record<string, unknown>;
    const teaching = (raw.teaching ?? {}) as Record<string, unknown>;

    return {
      meta: {
        name: (meta.name as string) ?? '未命名实验',
        subject: mapSubjectToEnum(meta.subject as string ?? subject),
        topic: (meta.topic as string) ?? (meta.name as string) ?? '',
        description: (meta.description as string) ?? '',
        icon: (meta.icon as string) ?? '🔬',
        gradient: (meta.gradient as string) ?? 'from-blue-500 to-purple-500',
        physicsType: (rules.physicsType as PhysicsEngineType) ?? 'generic',
      },
      params: variables.map(v => ({
        name: (v.name as string) ?? '',
        label: (v.label as string) ?? '',
        unit: (v.unit as string) ?? '',
        defaultValue: (v.default as number) ?? (v.defaultValue as number) ?? 0,
        min: (v.min as number) ?? 0,
        max: (v.max as number) ?? 100,
        step: (v.step as number) ?? 1,
        category: 'input' as const,
        description: (v.description as string) ?? '',
      })),
      formulas: (rules.formula as string) ? [{
        name: '核心公式',
        expression: rules.formula as string,
        description: '',
        variables: variables.map(v => v.name as string),
        resultVariable: 'result',
      }] : [],
      teaching: {
        understanding: (teaching.understanding ?? undefined) as UnderstandingDesign | undefined,
        reasoning: (teaching.reasoning ?? undefined) as ReasoningDesign | undefined,
        design: (teaching.design ?? undefined) as ExperimentDesign | undefined,
        errors: (teaching.errors ?? undefined) as ErrorDesign | undefined,
        evaluation: (teaching.evaluation ?? undefined) as EvaluationDesign | undefined,
      },
    };
  }

  // New format: has top-level "meta" key
  const meta = (raw.meta ?? {}) as Record<string, unknown>;
  return {
    meta: {
      name: (meta.name as string) ?? '未命名实验',
      subject: mapSubjectToEnum(meta.subject as string ?? subject),
      topic: (meta.topic as string) ?? '',
      description: (meta.description as string) ?? '',
      icon: (meta.icon as string) ?? '🔬',
      gradient: (meta.gradient as string) ?? 'from-blue-500 to-purple-500',
      physicsType: (meta.physicsType as PhysicsEngineType) ?? 'generic',
    },
    params: (raw.params as ParamDefinition[]) ?? [],
    formulas: (raw.formulas as FormulaDefinition[]) ?? [],
    teaching: (raw.teaching as TeachingDesign) ?? {},
    scenes: (raw.scenes as ExperimentScene[]) ?? [],
    components: raw.components as any,
    connections: raw.connections as any,
  };
}

function mapSubjectToEnum(subject: string): SubjectDomain {
  const map: Record<string, SubjectDomain> = {
    '物理': 'physics', '化学': 'chemistry', '生物': 'biology', '地理': 'geography', '数学': 'math',
  };
  return map[subject] ?? 'physics';
}

function createFallbackSchema(concept: string, subject: string): ExperimentSchema {
  const subjectEnum = mapSubjectToEnum(subject);

  // Subject-specific fallback configurations
  const subjectDefaults: Record<string, {
    icon: string;
    gradient: string;
    physicsType: PhysicsEngineType;
    params: ParamDefinition[];
    formulas: FormulaDefinition[];
  }> = {
    '化学': {
      icon: '⚗️',
      gradient: 'from-green-500 to-emerald-500',
      physicsType: 'acid_base',
      params: [
        { name: 'concentration', label: '浓度', unit: 'mol/L', defaultValue: 0.1, min: 0.001, max: 10, step: 0.001, category: 'input', description: '溶液浓度' },
        { name: 'volume', label: '体积', unit: 'mL', defaultValue: 100, min: 1, max: 1000, step: 1, category: 'input', description: '溶液体积' },
      ],
      formulas: [{ name: '物质的量', expression: 'n = c × V', description: '物质的量等于浓度乘体积', variables: ['concentration', 'volume'], resultVariable: 'moles' }],
    },
    '生物': {
      icon: '🌿',
      gradient: 'from-lime-500 to-green-500',
      physicsType: 'photosynthesis',
      params: [
        { name: 'lightIntensity', label: '光照强度', unit: 'lux', defaultValue: 1000, min: 0, max: 10000, step: 100, category: 'input', description: '光照强度影响光合速率' },
        { name: 'co2Concentration', label: 'CO₂浓度', unit: '%', defaultValue: 0.04, min: 0.01, max: 5, step: 0.01, category: 'input', description: '二氧化碳浓度' },
      ],
      formulas: [{ name: '光合速率', expression: 'P = k × I × CO₂', description: '光合速率与光照强度和CO₂浓度正相关', variables: ['lightIntensity', 'co2Concentration'], resultVariable: 'photosynthesisRate' }],
    },
    '数学': {
      icon: '📐',
      gradient: 'from-violet-500 to-purple-500',
      physicsType: 'function_graph',
      params: [
        { name: 'a', label: '系数 a', unit: '', defaultValue: 1, min: -10, max: 10, step: 0.1, category: 'input', description: '函数系数 a' },
        { name: 'b', label: '系数 b', unit: '', defaultValue: 0, min: -10, max: 10, step: 0.1, category: 'input', description: '函数系数 b' },
        { name: 'x', label: '自变量 x', unit: '', defaultValue: 1, min: -10, max: 10, step: 0.1, category: 'input', description: '自变量 x 的值' },
      ],
      formulas: [{ name: '函数值', expression: 'y = a × x + b', description: '线性函数', variables: ['a', 'x', 'b'], resultVariable: 'y' }],
    },
  };

  const defaults = subjectDefaults[subject] ?? {
    icon: '🔬',
    gradient: 'from-blue-500 to-purple-500',
    physicsType: 'generic' as PhysicsEngineType,
    params: [{
      name: 'parameter',
      label: '实验参数',
      unit: '',
      defaultValue: 50,
      min: 0,
      max: 100,
      step: 1,
      category: 'input' as const,
      description: '可调节的实验参数',
    }],
    formulas: [{
      name: '基础公式',
      expression: 'result = parameter',
      description: '参数与结果的关系',
      variables: ['parameter'],
      resultVariable: 'result',
    }],
  };

  const partial: Partial<ExperimentSchema> = {
    meta: {
      name: `${concept}探究实验`,
      subject: subjectEnum,
      topic: concept,
      description: `探索${concept}的基本规律`,
      icon: defaults.icon,
      gradient: defaults.gradient,
      physicsType: defaults.physicsType,
    },
    params: defaults.params,
    formulas: defaults.formulas,
    teaching: {
      understanding: {
        objective: `理解${concept}的基本概念`,
        keyConcepts: [concept],
        prerequisites: [],
      },
    },
  };

  return enrichSchema(partial);
}
