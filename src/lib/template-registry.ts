/**
 * Template Registry — metadata approval guard.
 *
 * Central registry of HTML experiment templates approved for production use.
 * LLM-returned templateIds MUST pass through getTemplate() validation —
 * unregistered or unapproved templates are rejected, preventing LLM hallucinations
 * from reaching the rendering layer.
 *
 * See: docs/external-reference-policy.md
 *      output/architecture.md (TemplateRegistry metadata guard)
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
  /**
   * Atomization version.
   * - `v1-legacy` (or omitted): self-contained HTML (inline formulas, own drawing, hand-written controls).
   * - `v2-atomic`: uses L3 shared atoms (ui-core.js/physics-draw.js/...) and delegates
   *   compute to L1 engines via postMessage compute_request protocol.
   * Used for gradual migration tracking — does not change rendering path.
   */
  atomVersion?: 'v1-legacy' | 'v2-atomic' | 'v3-component';
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
    atomVersion: 'v3-component',
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
    atomVersion: 'v3-component',
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
    atomVersion: 'v3-component',
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
    atomVersion: 'v3-component',
  },









  // Chemistry templates
  'chemistry/acid-base-titration': {
    id: 'chemistry/acid-base-titration',
    subject: 'chemistry',
    title: '酸碱中和滴定',
    description: '用 NaOH 标准溶液滴定 HCl，观察 pH 变化和指示剂变色',
    icon: '🧪',
    gradient: 'from-purple-500 to-indigo-600',
    templatePath: 'chemistry/acid-base-titration.html',
    parameters: [
      { name: 'acidConc', label: '酸浓度', unit: 'mol/L', min: 0.01, max: 1.0, defaultValue: 0.1, step: 0.01 },
      { name: 'baseConc', label: '碱浓度', unit: 'mol/L', min: 0.01, max: 1.0, defaultValue: 0.1, step: 0.01 },
      { name: 'acidVolume', label: '酸体积', unit: 'mL', min: 10, max: 50, defaultValue: 25, step: 1 },
      { name: 'baseAdded', label: '已加碱体积', unit: 'mL', min: 0, max: 50, defaultValue: 0, step: 0.1 },
      { name: 'indicator', label: '指示剂', unit: '', min: 0, max: 2, defaultValue: 0, step: 1 },
      { name: 'temperature', label: '温度', unit: '°C', min: 10, max: 60, defaultValue: 25, step: 1 },
    ],
    auditStatus: 'approved',
    auditDocPath: 'docs/audits/chemistry-acid-base-titration.md',
    tags: ['acid-base', 'titration', 'pH', 'indicator'],
    atomVersion: 'v3-component',
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
    atomVersion: 'v3-component',
  },
  'chemistry/metal-acid-reaction': {
    id: 'chemistry/metal-acid-reaction',
    subject: 'chemistry',
    title: '金属置换反应 · Zn + H₂SO₄',
    description: '活泼金属置换稀酸产生氢气：Zn + H₂SO₄ → ZnSO₄ + H₂↑ · 组件化可视反应事件',
    icon: '💥',
    gradient: 'from-emerald-500 to-green-600',
    templatePath: 'chemistry/metal-acid-reaction.html',
    parameters: [
      { name: 'acidConcentration', label: 'H₂SO₄ 浓度', unit: 'mol/L', min: 0.1, max: 5, defaultValue: 2, step: 0.1 },
      { name: 'znMass', label: 'Zn 粒质量', unit: 'g', min: 0.1, max: 10, defaultValue: 1, step: 0.1 },
    ],
    auditStatus: 'approved',
    auditDocPath: 'docs/audits/chemistry-metal-acid-reaction.md',
    tags: ['metal-acid', 'displacement', 'hydrogen', 'reaction', 'component-based'],
    atomVersion: 'v3-component',
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
    atomVersion: 'v3-component',
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
    atomVersion: 'v3-component',
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
 * Check if a template ID is approved by registry metadata.
 * Convenience helper for validation paths.
 */
export function isApprovedTemplate(id: string | null | undefined): boolean {
  return getTemplate(id) !== null;
}

/**
 * Validate template HTML content for structural correctness.
 * Returns an array of error messages (empty if valid).
 *
 * Checks:
 *  - DOCTYPE declaration
 *  - <html> tag
 *  - <head> tag
 *  - <body> tag
 *  - Proper closing tags
 *  - <template-metadata> block (optional but recommended)
 */
export function validateTemplateFile(content: string): string[] {
  const errors: string[] = [];

  if (!content || typeof content !== 'string') {
    errors.push('Template content is empty or not a string');
    return errors;
  }

  const trimmed = content.trim();

  // Check DOCTYPE
  if (!/<!DOCTYPE\s+html/i.test(trimmed)) {
    errors.push('Missing or invalid <!DOCTYPE html> declaration');
  }

  // Check <html> tag
  if (!/<html[\s>]/i.test(trimmed)) {
    errors.push('Missing <html> tag');
  }

  // Check </html> closing tag
  if (!/<\/html>/i.test(trimmed)) {
    errors.push('Missing </html> closing tag');
  }

  // Check <head> tag
  if (!/<head[\s>]/i.test(trimmed)) {
    errors.push('Missing <head> tag');
  }

  // Check </head> closing tag
  if (!/<\/head>/i.test(trimmed)) {
    errors.push('Missing </head> closing tag');
  }

  // Check <body> tag
  if (!/<body[\s>]/i.test(trimmed)) {
    errors.push('Missing <body> tag');
  }

  // Check </body> closing tag
  if (!/<\/body>/i.test(trimmed)) {
    errors.push('Missing </body> closing tag');
  }

  // Check template-metadata (optional but recommended)
  if (!/<template-metadata>/i.test(trimmed)) {
    errors.push('Missing <template-metadata> block (optional but recommended)');
  }

  return errors;
}

// ── Subject-level registry exports (T-3: capability atomization) ────────────
/** Extract physics templates from the unified registry */
export const PHYSICS_REGISTRY = Object.fromEntries(
  Object.entries(REGISTRY).filter(([, v]) => v.subject === 'physics')
);

/** Extract chemistry templates from the unified registry */
export const CHEMISTRY_REGISTRY = Object.fromEntries(
  Object.entries(REGISTRY).filter(([, v]) => v.subject === 'chemistry')
);

/** Extract biology templates from the unified registry */
export const BIOLOGY_REGISTRY = Object.fromEntries(
  Object.entries(REGISTRY).filter(([, v]) => v.subject === 'biology')
);

/** Extract geography templates from the unified registry */
export const GEOGRAPHY_REGISTRY = Object.fromEntries(
  Object.entries(REGISTRY).filter(([, v]) => v.subject === 'geography')
);

/** Extract math templates from the unified registry */
export const MATH_REGISTRY = Object.fromEntries(
  Object.entries(REGISTRY).filter(([, v]) => v.subject === 'math')
);

/** All subject registries combined (same as REGISTRY, but explicit for T-5 integration) */
export const ALL_SUBJECT_REGISTRIES: Record<string, Record<string, TemplateMetadata>> = {
  physics: PHYSICS_REGISTRY,
  chemistry: CHEMISTRY_REGISTRY,
  biology: BIOLOGY_REGISTRY,
  geography: GEOGRAPHY_REGISTRY,
  math: MATH_REGISTRY,
};

// 示例占位 & 兜底
