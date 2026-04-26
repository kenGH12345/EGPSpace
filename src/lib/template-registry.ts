/**
 * Template Registry — Triple-Lock Architecture (Lock 3: Whitelist)
 *
 * Central registry of HTML experiment templates approved for production use.
 * LLM-returned templateIds MUST pass through getTemplate() validation —
 * unregistered or unapproved templates are rejected, preventing LLM hallucinations
 * from reaching the rendering layer.
 *
 * See: docs/external-reference-policy.md
 *      output/architecture.md (Triple-Lock design)
 */

export type AuditStatus = 'pending' | 'approved' | 'deprecated';

export type SubjectKey = 'physics' | 'chemistry' | 'biology' | 'geography' | 'math';

export interface TemplateParameter {
  name: string;
  label: string;
  unit?: string;
  min: number;
  max: number;
  defaultValue: number;
  step?: number;
}

export interface TemplateMetadata {
  /** Unique template identifier — used by LLM and URL routing */
  id: string;
  /** Subject domain (physics/chemistry/etc.) */
  subject: SubjectKey;
  /** Human-readable name */
  title: string;
  /** One-line description for UI cards */
  description: string;
  /** Icon/emoji for UI */
  icon: string;
  /** Gradient classes for UI cards */
  gradient: string;
  /** Relative path from /public/templates/ (e.g. "physics/buoyancy.html") */
  templatePath: string;
  /** Parameters the template accepts via postMessage */
  parameters: TemplateParameter[];
  /** Audit status — ONLY 'approved' templates may be served */
  auditStatus: AuditStatus;
  /** Path to audit document (relative to repo root) */
  auditDocPath?: string;
  /** ISO date string of last audit */
  lastAuditedAt?: string;
  /** Free-form tags for search/filter */
  tags?: string[];
}

/**
 * First-batch physics templates (Slice-1 + Slice-2 of execution plan).
 * All entries start as `pending` and are flipped to `approved` only after
 * human audit + audit doc creation.
 */
const REGISTRY: Record<string, TemplateMetadata> = {
  'physics/buoyancy': {
    id: 'physics/buoyancy',
    subject: 'physics',
    title: '浮力原理',
    description: '探索阿基米德原理：浮力 = 液体密度 × 重力加速度 × 排开液体体积',
    icon: '🌊',
    gradient: 'from-blue-400 to-cyan-500',
    templatePath: 'physics/buoyancy.html',
    parameters: [
      { name: 'objectDensity', label: '物体密度', unit: 'kg/m³', min: 200, max: 3000, defaultValue: 800, step: 50 },
      { name: 'liquidDensity', label: '液体密度', unit: 'kg/m³', min: 800, max: 13600, defaultValue: 1000, step: 100 },
      { name: 'volume', label: '物体体积', unit: 'L', min: 0.001, max: 0.05, defaultValue: 0.01, step: 0.001 },
      { name: 'gravity', label: '重力加速度', unit: 'm/s²', min: 1, max: 20, defaultValue: 9.8, step: 0.1 },
    ],
    auditStatus: 'approved',
    auditDocPath: 'docs/audits/physics-buoyancy.md',
    lastAuditedAt: '2026-04-24',
    tags: ['mechanics', 'fluid', 'archimedes'],
  },
  'physics/pressure': {
    id: 'physics/pressure',
    subject: 'physics',
    title: '压强',
    description: '探索压强公式：P = F/A',
    icon: '압',
    gradient: 'from-blue-400 to-cyan-500',
    templatePath: 'physics/pressure.html',
    parameters: [
      { name: 'force', label: '力', unit: 'N', min: 1, max: 1000, defaultValue: 100, step: 1 },
      { name: 'area', label: '面积', unit: 'm²', min: 0.001, max: 10, defaultValue: 1, step: 0.001 },
    ],
    auditStatus: 'approved',
    auditDocPath: 'docs/audits/physics-pressure.md',
    lastAuditedAt: '2026-04-24',
    tags: ['mechanics', 'pressure'],
  },
  'physics/density': {
    id: 'physics/density',
    subject: 'physics',
    title: '密度',
    description: '探索密度公式：ρ = m/V',
    icon: ' плотность',
    gradient: 'from-blue-400 to-cyan-500',
    templatePath: 'physics/density.html',
    parameters: [
      { name: 'mass', label: '质量', unit: 'kg', min: 0.1, max: 1000, defaultValue: 100, step: 0.1 },
      { name: 'volume', label: '体积', unit: 'm³', min: 0.001, max: 10, defaultValue: 1, step: 0.001 },
    ],
    auditStatus: 'approved',
    auditDocPath: 'docs/audits/physics-density.md',
    lastAuditedAt: '2026-04-24',
    tags: ['mechanics', 'density'],
  },
  'physics/work-power': {
    id: 'physics/work-power',
    subject: 'physics',
    title: '功和功率',
    description: '探索功和功率公式：W = Fd, P = W/t',
    icon: '💪',
    gradient: 'from-blue-400 to-cyan-500',
    templatePath: 'physics/work-power.html',
    parameters: [
      { name: 'force', label: '力', unit: 'N', min: 1, max: 1000, defaultValue: 100, step: 1 },
      { name: 'distance', label: '距离', unit: 'm', min: 0.1, max: 100, defaultValue: 10, step: 0.1 },
      { name: 'time', label: '时间', unit: 's', min: 1, max: 100, defaultValue: 5, step: 1 },
    ],
    auditStatus: 'approved',
    auditDocPath: 'docs/audits/physics-work-power.md',
    lastAuditedAt: '2026-04-24',
    tags: ['mechanics', 'work', 'power'],
  },
  'physics/friction': {
    id: 'physics/friction',
    subject: 'physics',
    title: '摩擦力',
    description: '探索摩擦力公式：F = μN',
    icon: ' トラクション',
    gradient: 'from-blue-400 to-cyan-500',
    templatePath: 'physics/friction.html',
    parameters: [
      { name: 'normalForce', label: '法向力', unit: 'N', min: 1, max: 1000, defaultValue: 100, step: 1 },
      { name: 'coefficientOfFriction', label: '摩擦系数', unit: '', min: 0, max: 1, defaultValue: 0.5, step: 0.01 },
    ],
    auditStatus: 'approved',
    auditDocPath: 'docs/audits/physics-friction.md',
    lastAuditedAt: '2026-04-24',
    tags: ['mechanics', 'friction'],
  },
  'physics/phase-change': {
    id: 'physics/phase-change',
    subject: 'physics',
    title: '相变',
    description: '探索相变过程：熔化、凝固、汽化、液化',
    icon: '🌡️',
    gradient: 'from-blue-400 to-cyan-500',
    templatePath: 'physics/phase-change.html',
    parameters: [
      { name: 'temperature', label: '温度', unit: '°C', min: -50, max: 150, defaultValue: 100, step: 1 },
      { name: 'substance', label: '物质', unit: '', min: 0, max: 1, defaultValue: 0, step: 1 },
    ],
    auditStatus: 'approved',
    auditDocPath: 'docs/audits/physics-phase-change.md',
    lastAuditedAt: '2026-04-24',
    tags: ['thermodynamics', 'phase-change'],
  },
  'physics/lever': {
    id: 'physics/lever',
    subject: 'physics',
    title: '杠杆原理',
    description: '探索力矩平衡：F1 × L1 = F2 × L2',
    icon: '⚖️',
    gradient: 'from-amber-500 to-orange-500',
    templatePath: 'physics/lever.html',
    parameters: [
      { name: 'leftForce', label: '左侧力', unit: 'N', min: 1, max: 100, defaultValue: 10, step: 1 },
      { name: 'rightForce', label: '右侧力', unit: 'N', min: 1, max: 100, defaultValue: 10, step: 1 },
      { name: 'leftArm', label: '左侧臂长', unit: 'cm', min: 10, max: 100, defaultValue: 50, step: 1 },
      { name: 'rightArm', label: '右侧臂长', unit: 'cm', min: 10, max: 100, defaultValue: 50, step: 1 },
    ],
    auditStatus: 'approved',
    auditDocPath: 'docs/audits/physics-lever.md',
    lastAuditedAt: '2026-04-24',
    tags: ['mechanics', 'torque', 'simple-machines'],
  },
  'physics/refraction': {
    id: 'physics/refraction',
    subject: 'physics',
    title: '光的折射',
    description: '探索斯涅尔定律：n1 × sin(θ1) = n2 × sin(θ2)',
    icon: '💡',
    gradient: 'from-cyan-500 to-blue-500',
    templatePath: 'physics/refraction.html',
    parameters: [
      { name: 'incidentAngle', label: '入射角', unit: '°', min: 0, max: 89, defaultValue: 30, step: 1 },
      { name: 'n1', label: '介质1折射率', unit: '', min: 1, max: 2.5, defaultValue: 1.0, step: 0.01 },
      { name: 'n2', label: '介质2折射率', unit: '', min: 1, max: 2.5, defaultValue: 1.33, step: 0.01 },
    ],
    auditStatus: 'approved',
    auditDocPath: 'docs/audits/physics-refraction.md',
    lastAuditedAt: '2026-04-24',
    tags: ['optics', 'snell', 'refraction'],
  },
  'physics/circuit': {
    id: 'physics/circuit',
    subject: 'physics',
    title: '电路串并联',
    description: '探索欧姆定律及串并联电路：I = U/R, R串 = R1+R2, 1/R并 = 1/R1 + 1/R2',
    icon: '⚡',
    gradient: 'from-emerald-500 to-teal-500',
    templatePath: 'physics/circuit.html',
    parameters: [
      { name: 'voltage', label: '电源电压', unit: 'V', min: 1, max: 24, defaultValue: 6, step: 0.1 },
      { name: 'r1', label: '电阻R1', unit: 'Ω', min: 0.5, max: 100, defaultValue: 10, step: 0.5 },
      { name: 'r2', label: '电阻R2', unit: 'Ω', min: 0.5, max: 100, defaultValue: 10, step: 0.5 },
      { name: 'topology', label: '拓扑', unit: '0=串1=并', min: 0, max: 1, defaultValue: 0, step: 1 },
    ],
    auditStatus: 'approved',
    auditDocPath: 'docs/audits/physics-circuit.md',
    lastAuditedAt: '2026-04-24',
    tags: ['electricity', 'ohm', 'circuit'],
  },
  'physics/motion': {
    id: 'physics/motion',
    subject: 'physics',
    title: '匀变速直线运动',
    description: '运动学实验，展示速度、加速度与时间的关系，包含 v-t 和 s-t 图像',
    icon: '🏃',
    gradient: 'from-violet-500 to-purple-500',
    templatePath: 'physics/motion.html',
    parameters: [
      { name: 'v0', label: '初速度', unit: 'm/s', min: 0, max: 50, defaultValue: 10, step: 1 },
      { name: 'acceleration', label: '加速度', unit: 'm/s²', min: -10, max: 10, defaultValue: 2, step: 0.5 },
      { name: 'time', label: '时间', unit: 's', min: 0, max: 20, defaultValue: 5, step: 0.5 },
      { name: 'mass', label: '质量', unit: 'kg', min: 0.1, max: 10, defaultValue: 1, step: 0.1 },
    ],
    auditStatus: 'pending',
    auditDocPath: 'docs/audits/physics-motion.md',
    tags: ['kinematics', 'displacement', 'velocity', 'acceleration'],
  },
  'physics/energy': {
    id: 'physics/energy',
    subject: 'physics',
    title: '机械能守恒',
    description: '单摆运动展示动能、势能和总机械能的转换与守恒',
    icon: '🔋',
    gradient: 'from-emerald-400 to-green-600',
    templatePath: 'physics/energy.html',
    parameters: [
      { name: 'mass', label: '摆球质量', unit: 'kg', min: 0.1, max: 5, defaultValue: 1, step: 0.1 },
      { name: 'length', label: '摆线长', unit: 'm', min: 0.3, max: 2.0, defaultValue: 1.0, step: 0.05 },
      { name: 'angle', label: '释放角', unit: '°', min: 5, max: 60, defaultValue: 30, step: 1 },
      { name: 'g', label: '重力加速度', unit: 'm/s²', min: 1, max: 20, defaultValue: 9.8, step: 0.1 },
    ],
    auditStatus: 'pending',
    auditDocPath: 'docs/audits/physics-energy.md',
    tags: ['mechanics', 'energy-conservation', 'pendulum'],
  },
  'physics/waves': {
    id: 'physics/waves',
    subject: 'physics',
    title: '机械波的形成与传播',
    description: '横波传播动画，支持两列波叠加演示干涉现象',
    icon: '🌊',
    gradient: 'from-blue-400 to-indigo-500',
    templatePath: 'physics/waves.html',
    parameters: [
      { name: 'A1', label: '波1振幅', unit: 'cm', min: 0.5, max: 3, defaultValue: 1, step: 0.1 },
      { name: 'lam1', label: '波1波长', unit: 'm', min: 0.2, max: 2, defaultValue: 0.8, step: 0.05 },
      { name: 'f1', label: '波1频率', unit: 'Hz', min: 0.2, max: 5, defaultValue: 1, step: 0.1 },
      { name: 'A2', label: '波2振幅', unit: 'cm', min: 0.5, max: 3, defaultValue: 1, step: 0.1 },
      { name: 'lam2', label: '波2波长', unit: 'm', min: 0.2, max: 2, defaultValue: 0.8, step: 0.05 },
      { name: 'f2', label: '波2频率', unit: 'Hz', min: 0.2, max: 5, defaultValue: 1, step: 0.1 },
    ],
    auditStatus: 'pending',
    auditDocPath: 'docs/audits/physics-waves.md',
    tags: ['waves', 'superposition', 'interference'],
  },
  'physics/electromagnetism': {
    id: 'physics/electromagnetism',
    subject: 'physics',
    title: '电磁感应',
    description: '法拉第电磁感应定律演示，磁通量变化与感应电流方向',
    icon: '🔌',
    gradient: 'from-amber-400 to-red-400',
    templatePath: 'physics/electromagnetism.html',
    parameters: [
      { name: 'B', label: '磁感应强度', unit: 'T', min: 0.01, max: 2, defaultValue: 0.5, step: 0.01 },
      { name: 'area', label: '线圈面积', unit: 'm²', min: 0.001, max: 0.1, defaultValue: 0.01, step: 0.001 },
      { name: 'speed', label: '磁铁速度', unit: 'm/s', min: 0.1, max: 5, defaultValue: 1, step: 0.1 },
      { name: 'turns', label: '线圈匝数', unit: '', min: 1, max: 200, defaultValue: 10, step: 1 },
    ],
    auditStatus: 'pending',
    auditDocPath: 'docs/audits/physics-electromagnetism.md',
    tags: ['electromagnetism', 'faraday', 'lenz'],
  },
  'physics/reflection': {
    id: 'physics/reflection',
    subject: 'physics',
    title: '光的反射',
    description: '光的反射定律演示：入射角等于反射角，平面镜成像原理',
    icon: '🪞',
    gradient: 'from-yellow-400 to-amber-500',
    templatePath: 'physics/reflection.html',
    parameters: [
      { name: 'angleOfIncidence', label: '入射角', unit: '°', min: 0, max: 89, defaultValue: 45, step: 1 },
    ],
    auditStatus: 'pending',
    auditDocPath: 'docs/audits/physics-reflection.md',
    tags: ['optics', 'reflection', 'mirror'],
  },
  'physics/lens': {
    id: 'physics/lens',
    subject: 'physics',
    title: '凸透镜成像',
    description: '凸透镜成像规律：物距、像距与焦距的关系，实像与虚像',
    icon: '🔍',
    gradient: 'from-sky-400 to-blue-600',
    templatePath: 'physics/lens.html',
    parameters: [
      { name: 'focalLength', label: '焦距', unit: 'cm', min: 5, max: 40, defaultValue: 15, step: 1 },
      { name: 'objectDistance', label: '物距', unit: 'cm', min: 10, max: 100, defaultValue: 40, step: 1 },
    ],
    auditStatus: 'pending',
    auditDocPath: 'docs/audits/physics-lens.md',
    tags: ['optics', 'lens', 'refraction', 'image-formation'],
  },
  'physics/heat': {
    id: 'physics/heat',
    subject: 'physics',
    title: '比热容',
    description: '比热容比较实验：不同物质的升温差异，Q = cmΔT',
    icon: '🔥',
    gradient: 'from-red-400 to-orange-500',
    templatePath: 'physics/heat.html',
    parameters: [
      { name: 'specificHeatA', label: '物质A比热容', unit: 'J/g°C', min: 0.2, max: 2.5, defaultValue: 0.84, step: 0.01 },
      { name: 'specificHeatB', label: '物质B比热容', unit: 'J/g°C', min: 0.2, max: 2.5, defaultValue: 4.18, step: 0.01 },
      { name: 'mass', label: '质量', unit: 'g', min: 50, max: 500, defaultValue: 200, step: 10 },
      { name: 'heatingPower', label: '加热功率', unit: 'W', min: 50, max: 1000, defaultValue: 400, step: 10 },
      { name: 'timeElapsed', label: '加热时间', unit: 's', min: 0, max: 300, defaultValue: 0, step: 1 },
    ],
    auditStatus: 'pending',
    auditDocPath: 'docs/audits/physics-heat.md',
    tags: ['thermodynamics', 'heat-capacity', 'specific-heat'],
  },
  'physics/sound': {
    id: 'physics/sound',
    subject: 'physics',
    title: '声学基础',
    description: '声波频率与振幅可视化，展示音调与响度的物理本质',
    icon: '🎵',
    gradient: 'from-pink-400 to-rose-500',
    templatePath: 'physics/sound.html',
    parameters: [
      { name: 'frequency', label: '频率', unit: 'Hz', min: 20, max: 2000, defaultValue: 440, step: 1 },
      { name: 'amplitude', label: '振幅', unit: '', min: 0.1, max: 2.0, defaultValue: 1.0, step: 0.05 },
    ],
    auditStatus: 'pending',
    auditDocPath: 'docs/audits/physics-sound.md',
    tags: ['acoustics', 'sound-waves', 'frequency', 'amplitude'],
  },
  // Chemistry templates
  'chemistry/acid-base-titration': {
    id: 'chemistry/acid-base-titration',
    subject: 'chemistry',
    title: '酸碱中和滴定',
    description: 'NaOH 滴定 HCl，实时 pH 曲线与指示剂变色可视化',
    icon: '🧪',
    gradient: 'from-purple-500 to-indigo-600',
    templatePath: 'chemistry/acid-base-titration.html',
    parameters: [
      { name: 'acidConc', label: '酸浓度', unit: 'M', min: 0.01, max: 1.0, defaultValue: 0.1, step: 0.01 },
      { name: 'baseConc', label: '碱浓度', unit: 'M', min: 0.01, max: 1.0, defaultValue: 0.1, step: 0.01 },
      { name: 'acidVolume', label: '酸体积', unit: 'mL', min: 10, max: 50, defaultValue: 25, step: 1 },
      { name: 'baseAdded', label: '已加碱体积', unit: 'mL', min: 0, max: 50, defaultValue: 0, step: 0.1 },
      { name: 'indicator', label: '指示剂', unit: '', min: 0, max: 2, defaultValue: 0, step: 1 },
      { name: 'temperature', label: '温度', unit: '°C', min: 10, max: 60, defaultValue: 25, step: 1 },
    ],
    auditStatus: 'approved',
    auditDocPath: 'docs/audits/chemistry-acid-base-titration.md',
    tags: ['acid-base', 'titration', 'pH', 'indicator'],
  },
  'chemistry/iron-rusting': {
    id: 'chemistry/iron-rusting',
    subject: 'chemistry',
    title: '铁生锈条件探究',
    description: '对比干燥空气、水、盐水三种条件下铁钉的锈蚀程度',
    icon: '🔩',
    gradient: 'from-orange-500 to-red-600',
    templatePath: 'chemistry/iron-rusting.html',
    parameters: [
      { name: 'days', label: '天数', unit: '天', min: 0, max: 30, defaultValue: 7, step: 1 },
      { name: 'oxygenConcentration', label: '氧气浓度', unit: '%', min: 0, max: 100, defaultValue: 21, step: 1 },
      { name: 'hasWater', label: '加水', unit: '', min: 0, max: 1, defaultValue: 1, step: 1 },
      { name: 'hasSalt', label: '加盐', unit: '', min: 0, max: 1, defaultValue: 0, step: 1 },
      { name: 'temperature', label: '温度', unit: '°C', min: 10, max: 60, defaultValue: 25, step: 1 },
    ],
    auditStatus: 'approved',
    auditDocPath: 'docs/audits/chemistry-iron-rusting.md',
    tags: ['corrosion', 'oxidation', 'iron', 'rust'],
  },
  'chemistry/electrolysis': {
    id: 'chemistry/electrolysis',
    subject: 'chemistry',
    title: '电解水实验',
    description: '电解水产生氢气与氧气，验证 2H₂O → 2H₂↑ + O₂↑',
    icon: '⚡',
    gradient: 'from-cyan-500 to-teal-600',
    templatePath: 'chemistry/electrolysis.html',
    parameters: [
      { name: 'current', label: '电流', unit: 'A', min: 0.1, max: 2.0, defaultValue: 0.5, step: 0.1 },
      { name: 'time', label: '通电时间', unit: 's', min: 0, max: 600, defaultValue: 60, step: 10 },
      { name: 'electrolyteConc', label: '电解质浓度', unit: 'M', min: 0.1, max: 1.0, defaultValue: 0.5, step: 0.1 },
      { name: 'electrodeMaterial', label: '电极材料', unit: '', min: 0, max: 1, defaultValue: 0, step: 1 },
    ],
    auditStatus: 'approved',
    auditDocPath: 'docs/audits/chemistry-electrolysis.md',
    tags: ['electrolysis', 'gas-collection', 'faraday'],
  },
  'chemistry/reaction-rate': {
    id: 'chemistry/reaction-rate',
    subject: 'chemistry',
    title: '化学反应速率',
    description: '探究浓度、温度、催化剂对反应速率的影响',
    icon: '⏱️',
    gradient: 'from-emerald-500 to-green-600',
    templatePath: 'chemistry/reaction-rate.html',
    parameters: [
      { name: 'initialConcentration', label: '初始浓度', unit: 'M', min: 0.1, max: 2.0, defaultValue: 1.0, step: 0.1 },
      { name: 'temperature', label: '温度', unit: '°C', min: 0, max: 100, defaultValue: 25, step: 1 },
      { name: 'catalyst', label: '催化剂', unit: '', min: 0, max: 1, defaultValue: 0, step: 1 },
      { name: 'time', label: '反应时间', unit: 's', min: 0, max: 120, defaultValue: 10, step: 1 },
    ],
    auditStatus: 'approved',
    auditDocPath: 'docs/audits/chemistry-reaction-rate.md',
    tags: ['kinetics', 'activation-energy', 'catalyst'],
  },
  'chemistry/combustion-conditions': {
    id: 'chemistry/combustion-conditions',
    subject: 'chemistry',
    title: '燃烧条件探究',
    description: '验证燃烧三条件：可燃物、助燃物、达到着火点',
    icon: '🔥',
    gradient: 'from-red-500 to-orange-600',
    templatePath: 'chemistry/combustion-conditions.html',
    parameters: [
      { name: 'temperature', label: '环境温度', unit: '°C', min: -20, max: 200, defaultValue: 25, step: 1 },
      { name: 'oxygenLevel', label: '氧气浓度', unit: '%', min: 0, max: 100, defaultValue: 21, step: 1 },
      { name: 'hasFuel', label: '有可燃物', unit: '', min: 0, max: 1, defaultValue: 1, step: 1 },
      { name: 'ignitionTemp', label: '着火点', unit: '°C', min: 100, max: 500, defaultValue: 233, step: 1 },
    ],
    auditStatus: 'approved',
    auditDocPath: 'docs/audits/chemistry-combustion-conditions.md',
    tags: ['combustion', 'fire-triangle', 'safety'],
  },
};

/**
 * Get template metadata by ID.
 * Returns null if template does not exist OR is not approved.
 *
 * This is the CORE guard — all consumer code must go through this function.
 * Never access REGISTRY directly from outside this module.
 */
export function getTemplate(id: string | null | undefined): TemplateMetadata | null {
  if (!id || typeof id !== 'string') return null;
  const entry = REGISTRY[id];
  if (!entry) return null;
  if (entry.auditStatus !== 'approved') return null;
  const whitelist = new Set([
    // existing paths
    "physics/ohms-law",
    "physics/lever",
    "physics/refraction",
    "physics/pulley",
    "physics/convex-lens",
    "physics/force-composition",
    "physics/buoyancy",
    "physics/circuit",
    "chemistry/acid-base-titration",
    "chemistry/iron-rusting",
    "biology/photosynthesis",
    "biology/stomatal-movement",
    "geography/solar-term",
    // newly added
    "physics/pressure",
    "physics/density",
    "physics/work-power",
    "physics/friction",
    "physics/phase-change",
    // chemistry templates
    "chemistry/acid-base-titration",
    "chemistry/iron-rusting",
    "chemistry/electrolysis",
    "chemistry/reaction-rate",
    "chemistry/combustion-conditions",
  ]);
  if (!whitelist.has(id)) return null;
  return entry;
}

/**
 * Get template metadata regardless of audit status.
 * Only for internal use (admin pages, audit tooling).
 */
export function getTemplateUnsafe(id: string): TemplateMetadata | null {
  return REGISTRY[id] ?? null;
}

/**
 * List all approved templates, optionally filtered by subject.
 */
export function listApprovedTemplates(subject?: SubjectKey): TemplateMetadata[] {
  return Object.values(REGISTRY).filter(t => {
    if (t.auditStatus !== 'approved') return false;
    if (subject && t.subject !== subject) return false;
    return true;
  });
}

/**
 * List all registered templates regardless of audit status (admin only).
 */
export function listAllTemplates(): TemplateMetadata[] {
  return Object.values(REGISTRY);
}

/**
 * Resolve a template ID to its full public URL.
 * Returns null for unapproved templates — same as getTemplate.
 */
export function getTemplateUrl(id: string): string | null {
  const meta = getTemplate(id);
  if (!meta) return null;
  return `/templates/${meta.templatePath}`;
}

/**
 * Check if a template ID is in the approved whitelist.
 * Convenience helper for validation paths.
 */
export function isApprovedTemplate(id: string | null | undefined): boolean {
  return getTemplate(id) !== null;
}
