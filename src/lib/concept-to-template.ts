/**
 * Concept-to-Template Router
 *
 * Maps natural-language concepts (from user input or LLM output) to deterministic
 * template IDs. This is the Triple-Lock Architecture's Lock 2: Routing Dispatch.
 *
 * The mapping uses keyword matching with priority ordering — more specific
 * keywords take precedence over generic ones (e.g. "光的折射" matches refraction
 * before "光" alone matches a generic optics template).
 *
 * Flow:
 *   user input / LLM concept → conceptToTemplateId() → whitelist check → render
 *
 * If no mapping found, returns null. Callers should degrade gracefully
 * (e.g. show text-only lesson without experiment visualization).
 *
 * See: src/lib/template-registry.ts (Lock 3: Whitelist)
 *      output/architecture.md (Triple-Lock design)
 */

import { isApprovedTemplate } from './template-registry';

/**
 * Concept keyword → Template ID mapping.
 * Ordered by specificity (most specific first). First match wins.
 *
 * When adding new concepts:
 * 1. Put multi-word specific phrases BEFORE single-word generic ones
 * 2. The target template ID MUST exist in template-registry.ts
 * 3. Both Chinese and English keywords supported
 */
const CONCEPT_MAPPINGS: Array<{ keywords: string[]; templateId: string }> = [
  // Physics - Mechanics
  {
    keywords: ['浮力', '阿基米德', '排水', '浮沉', 'buoyancy', 'archimedes', 'floating', 'sinking'],
    templateId: 'physics/buoyancy',
  },
  {
    keywords: ['杠杆', '力矩', '平衡', '省力', '费力', 'lever', 'torque', 'fulcrum'],
    templateId: 'physics/lever',
  },

  // Physics - Optics
  {
    keywords: ['光的折射', '折射', '折射率', '斯涅尔', 'refraction', 'snell', 'refractive-index'],
    templateId: 'physics/refraction',
  },

  // Physics - Electricity
  {
    keywords: ['电路', '串联', '并联', '欧姆定律', '电阻', '电流', 'circuit', 'ohm', 'series', 'parallel', 'resistance'],
    templateId: 'physics/circuit',
  },

  // Physics - Kinematics
  {
    keywords: ['匀变速直线运动', '运动学', '位移', '速度', '加速度', '初速度', '末速度', 'v-t图', 's-t图', '运动图像', 'kinematics', 'uniformly accelerated', 'displacement', 'velocity', 'acceleration'],
    templateId: 'physics/motion',
  },

  // Physics - Energy Conservation
  {
    keywords: ['机械能守恒', '动能', '势能', '单摆', '能量守恒', '机械能', '重力势能', '弹性势能', 'energy conservation', 'kinetic energy', 'potential energy', 'pendulum'],
    templateId: 'physics/energy',
  },

  // Physics - Mechanical Waves
  {
    keywords: ['机械波', '波', '波长', '振幅', '频率', '波速', '波的叠加', '干涉', '横波', '纵波', '机械振动', 'wave', 'wavelength', 'amplitude', 'frequency', 'interference', 'superposition'],
    templateId: 'physics/waves',
  },

  // Physics - Electromagnetism
  {
    keywords: ['电磁感应', '感应电流', '法拉第定律', '楞次定律', '磁通量', '切割磁感线', '发电机', '电磁感应现象', 'electromagnetic induction', "faraday's law", 'lenz law', 'magnetic flux'],
    templateId: 'physics/electromagnetism',
  },

  // Phase 3 Templates
  {
    keywords: ['光/反射', '光的反射', '反射定律', '平面镜成像', '平面镜', '入射角'],
    templateId: 'physics/reflection',
  },
  {
    keywords: ['光/凸透镜成像', '凸透镜', '焦距', '放大镜', '透镜成像规律', '像距', '物距'],
    templateId: 'physics/lens',
  },
  {
    keywords: ['热/比热容', '比热容', '热传递', '升温对比', 'Q=cmΔT', '热量计算'],
    templateId: 'physics/heat',
  },
  {
    keywords: ['声/音调', '声波', '音调', '响度', '音色', '声波传播', '声音的特性'],
    templateId: 'physics/sound',
  },
];

/**
 * Normalize a concept string for matching.
 * Lowercase + trim + collapse whitespace.
 */
function normalizeConcept(concept: string): string {
  return concept.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Map a natural-language concept to an approved template ID.
 *
 * @param concept User input or LLM-generated concept name
 * @param includePending When true, includes templates with auditStatus='pending' (dev/test only)
 * @returns Template ID if a match found AND the template is approved; null otherwise
 *
 * @example
 *   conceptToTemplateId('浮力原理')          // 'physics/buoyancy'
 *   conceptToTemplateId('Archimedes')         // 'physics/buoyancy'
 *   conceptToTemplateId('未知概念')            // null
 *   conceptToTemplateId('电磁感应', true)      // 'physics/electromagnetism' (dev-only)
 */
export function conceptToTemplateId(
  concept: string | null | undefined,
  includePending: boolean = false
): string | null {
  if (!concept || typeof concept !== 'string') return null;

  const normalized = normalizeConcept(concept);
  if (!normalized) return null;

  for (const mapping of CONCEPT_MAPPINGS) {
    for (const keyword of mapping.keywords) {
      if (normalized.includes(keyword.toLowerCase())) {
        // Verify the target template is approved (or includePending=true) before returning
        if (includePending || isApprovedTemplate(mapping.templateId)) {
          return mapping.templateId;
        }
        // Template exists in mapping but not yet approved — continue searching
        // This handles the case where we list a concept but the template audit is pending
        break; // move to next mapping instead of trying other keywords for same template
      }
    }
  }

  return null;
}

/**
 * Bulk concept resolution for UI filters / search.
 * Returns all concepts that resolve to the given templateId.
 */
export function templateIdToConceptKeywords(templateId: string): string[] {
  const mapping = CONCEPT_MAPPINGS.find(m => m.templateId === templateId);
  return mapping ? [...mapping.keywords] : [];
}

/**
 * List all concept keywords that have registered mappings.
 * Useful for autocomplete and typeahead features.
 */
export function listAllMappedConcepts(): string[] {
  const all: string[] = [];
  for (const m of CONCEPT_MAPPINGS) {
    all.push(...m.keywords);
  }
  return all;
}
