import type { PhysicsEngineType } from './experiment-schema';

// Parameter range rule for a single param
export interface ParamRangeRule {
  aliases: string[];       // all known names for this param
  min: number;             // physically valid minimum
  max: number;             // physically valid maximum
  unit?: string;           // expected SI unit
  dimension?: string;      // physical dimension (e.g. 'mass', 'length')
  criticalIfNegative?: boolean; // negative value is physically impossible
}

// Formula knowledge entry
export interface FormulaKnowledge {
  name: string;
  keyVariables: string[];  // required variable names (order-independent)
  resultVariable: string;
  canonicalExpression: string;
}

// Dimension rule: unit string → dimension category
export interface DimensionRule {
  unit: string;
  dimension: string;
  expectedFor?: string[];  // param names that should use this dimension
}

// ── Param Range Rules ──────────────────────────────────────────────────────

const BUOYANCY_RULES: ParamRangeRule[] = [
  {
    aliases: ['rho_object', 'density', 'objectDensity', 'rho_obj', 'densityObject'],
    min: 1, max: 22590,
    unit: 'kg/m³', dimension: 'density',
    criticalIfNegative: true,
  },
  {
    aliases: ['rho_liquid', 'liquidDensity', 'rho_liq', 'densityLiquid', 'fluidDensity'],
    min: 500, max: 21450,
    unit: 'kg/m³', dimension: 'density',
    criticalIfNegative: true,
  },
  {
    aliases: ['volume', 'V_object', 'objectVolume', 'vol'],
    min: 0.000001, max: 1000,
    unit: 'm³', dimension: 'volume',
    criticalIfNegative: true,
  },
];

const LEVER_RULES: ParamRangeRule[] = [
  {
    aliases: ['leftArm', 'left_arm', 'armLeft', 'L1'],
    min: 1, max: 500,
    unit: 'cm', dimension: 'length',
    criticalIfNegative: true,
  },
  {
    aliases: ['rightArm', 'right_arm', 'armRight', 'L2'],
    min: 1, max: 500,
    unit: 'cm', dimension: 'length',
    criticalIfNegative: true,
  },
  {
    aliases: ['leftMass', 'left_mass', 'massLeft', 'F1', 'm1'],
    min: 0.01, max: 1000,
    unit: 'kg', dimension: 'mass',
    criticalIfNegative: true,
  },
  {
    aliases: ['rightMass', 'right_mass', 'massRight', 'F2', 'm2'],
    min: 0.01, max: 1000,
    unit: 'kg', dimension: 'mass',
    criticalIfNegative: true,
  },
];

const REFRACTION_RULES: ParamRangeRule[] = [
  {
    aliases: ['incidentAngle', 'incident_angle', 'theta1', 'angle1', 'angleIn'],
    min: 0, max: 89,
    unit: '°', dimension: 'angle',
  },
  {
    aliases: ['n1', 'refractiveIndex1', 'indexMedium1', 'n_1'],
    min: 1.0, max: 3.0,
    unit: '', dimension: 'refractive_index',
    criticalIfNegative: true,
  },
  {
    aliases: ['n2', 'refractiveIndex2', 'indexMedium2', 'n_2'],
    min: 1.0, max: 3.0,
    unit: '', dimension: 'refractive_index',
    criticalIfNegative: true,
  },
];

const CIRCUIT_RULES: ParamRangeRule[] = [
  {
    aliases: ['voltage', 'U', 'V', 'emf', 'volt'],
    min: 0, max: 1000,
    unit: 'V', dimension: 'voltage',
  },
  {
    aliases: ['resistance', 'R', 'ohm', 'resistor'],
    min: 0.001, max: 10000000,
    unit: 'Ω', dimension: 'resistance',
    criticalIfNegative: true,
  },
  {
    aliases: ['current', 'I', 'ampere', 'amp'],
    min: 0, max: 1000,
    unit: 'A', dimension: 'current',
  },
];

// ── Chemistry Rules ───────────────────────────────────────────────────────

const ACID_BASE_RULES: ParamRangeRule[] = [
  {
    aliases: ['pH', 'ph', 'pH_value', 'acidity'],
    min: 0, max: 14,
    unit: '', dimension: 'pH',
    criticalIfNegative: true,
  },
  {
    aliases: ['concentration', 'c', 'molarity', 'conc'],
    min: 0.0001, max: 20,
    unit: 'mol/L', dimension: 'concentration',
    criticalIfNegative: true,
  },
  {
    aliases: ['temperature', 'T', 'temp', 'celsius'],
    min: -273.15, max: 1000,
    unit: '°C', dimension: 'temperature',
  },
];

const REACTION_RATE_RULES: ParamRangeRule[] = [
  {
    aliases: ['temperature', 'T', 'temp', 'celsius'],
    min: 0, max: 500,
    unit: '°C', dimension: 'temperature',
  },
  {
    aliases: ['concentration', 'c', 'molarity', 'conc', 'reactantConc'],
    min: 0.001, max: 10,
    unit: 'mol/L', dimension: 'concentration',
    criticalIfNegative: true,
  },
  {
    aliases: ['pressure', 'P', 'atm', 'kPa'],
    min: 0.001, max: 1000,
    unit: 'kPa', dimension: 'pressure',
    criticalIfNegative: true,
  },
];

const ELECTROLYSIS_RULES: ParamRangeRule[] = [
  {
    aliases: ['voltage', 'U', 'V', 'emf', 'volt'],
    min: 0, max: 100,
    unit: 'V', dimension: 'voltage',
  },
  {
    aliases: ['current', 'I', 'ampere', 'amp'],
    min: 0, max: 50,
    unit: 'A', dimension: 'current',
  },
  {
    aliases: ['time', 't', 'duration', 'seconds'],
    min: 1, max: 86400,
    unit: 's', dimension: 'time',
    criticalIfNegative: true,
  },
];

const TITRATION_RULES: ParamRangeRule[] = [
  {
    aliases: ['volume', 'V', 'vol', 'volumeAdded', 'titrantVolume'],
    min: 0, max: 100,
    unit: 'mL', dimension: 'volume',
    criticalIfNegative: true,
  },
  {
    aliases: ['concentration', 'c', 'molarity', 'conc', 'titrantConc'],
    min: 0.001, max: 10,
    unit: 'mol/L', dimension: 'concentration',
    criticalIfNegative: true,
  },
];

// ── Biology Rules ──────────────────────────────────────────────────────────

const OSMOSIS_RULES: ParamRangeRule[] = [
  {
    aliases: ['soluteConc', 'concentration', 'c', 'osmolarity', 'externalConc'],
    min: 0, max: 5,
    unit: 'mol/L', dimension: 'concentration',
    criticalIfNegative: true,
  },
  {
    aliases: ['cellConc', 'internalConc', 'cytoplasm'],
    min: 0, max: 5,
    unit: 'mol/L', dimension: 'concentration',
    criticalIfNegative: true,
  },
  {
    aliases: ['temperature', 'T', 'temp'],
    min: 0, max: 45,
    unit: '°C', dimension: 'temperature',
  },
];

const ENZYME_RULES: ParamRangeRule[] = [
  {
    aliases: ['temperature', 'T', 'temp', 'celsius'],
    min: 0, max: 100,
    unit: '°C', dimension: 'temperature',
  },
  {
    aliases: ['pH', 'ph', 'pH_value'],
    min: 0, max: 14,
    unit: '', dimension: 'pH',
    criticalIfNegative: true,
  },
  {
    aliases: ['substrateConc', 'substrate', 'S', 'concentration'],
    min: 0.001, max: 100,
    unit: 'mmol/L', dimension: 'concentration',
    criticalIfNegative: true,
  },
];

const POPULATION_RULES: ParamRangeRule[] = [
  {
    aliases: ['initialPopulation', 'N0', 'N', 'population'],
    min: 1, max: 1000000000,
    unit: '个', dimension: 'count',
    criticalIfNegative: true,
  },
  {
    aliases: ['growthRate', 'r', 'birthRate', 'lambda'],
    min: -1, max: 10,
    unit: '', dimension: 'rate',
  },
  {
    aliases: ['carryingCapacity', 'K', 'maxPopulation'],
    min: 1, max: 1000000000,
    unit: '个', dimension: 'count',
    criticalIfNegative: true,
  },
];

const PHOTOSYNTHESIS_RULES: ParamRangeRule[] = [
  {
    aliases: ['lightIntensity', 'light', 'lux', 'irradiance'],
    min: 0, max: 100000,
    unit: 'lux', dimension: 'illuminance',
    criticalIfNegative: true,
  },
  {
    aliases: ['CO2Concentration', 'co2', 'CO2', 'carbonDioxide'],
    min: 0, max: 5,
    unit: '%', dimension: 'percentage',
    criticalIfNegative: true,
  },
  {
    aliases: ['temperature', 'T', 'temp'],
    min: 0, max: 50,
    unit: '°C', dimension: 'temperature',
  },
];

// ── Math Rules ─────────────────────────────────────────────────────────────

const FUNCTION_GRAPH_RULES: ParamRangeRule[] = [
  {
    aliases: ['xMin', 'x_min', 'domainMin', 'rangeStart'],
    min: -1000, max: 0,
    unit: '', dimension: 'dimensionless',
  },
  {
    aliases: ['xMax', 'x_max', 'domainMax', 'rangeEnd'],
    min: 0, max: 1000,
    unit: '', dimension: 'dimensionless',
  },
  {
    aliases: ['amplitude', 'A', 'amp'],
    min: 0.001, max: 1000,
    unit: '', dimension: 'dimensionless',
    criticalIfNegative: true,
  },
  {
    aliases: ['frequency', 'f', 'freq', 'omega'],
    min: 0.001, max: 1000,
    unit: 'Hz', dimension: 'frequency',
    criticalIfNegative: true,
  },
];

const GEOMETRY_RULES: ParamRangeRule[] = [
  {
    aliases: ['angle', 'theta', 'alpha', 'beta', 'angleA', 'angleB', 'angleC'],
    min: 0, max: 360,
    unit: '°', dimension: 'angle',
    criticalIfNegative: true,
  },
  {
    aliases: ['sideLength', 'side', 'a', 'b', 'c', 'length', 'width', 'height'],
    min: 0.001, max: 10000,
    unit: 'cm', dimension: 'length',
    criticalIfNegative: true,
  },
  {
    aliases: ['radius', 'r', 'R'],
    min: 0.001, max: 10000,
    unit: 'cm', dimension: 'length',
    criticalIfNegative: true,
  },
];

const PROBABILITY_RULES: ParamRangeRule[] = [
  {
    aliases: ['probability', 'p', 'P', 'prob', 'chance'],
    min: 0, max: 1,
    unit: '', dimension: 'probability',
    criticalIfNegative: true,
  },
  {
    aliases: ['trials', 'n', 'sampleSize', 'count'],
    min: 1, max: 1000000,
    unit: '次', dimension: 'count',
    criticalIfNegative: true,
  },
];

const STATISTICS_RULES: ParamRangeRule[] = [
  {
    aliases: ['sampleSize', 'n', 'count', 'N'],
    min: 1, max: 1000000,
    unit: '个', dimension: 'count',
    criticalIfNegative: true,
  },
  {
    aliases: ['mean', 'average', 'mu', 'xBar'],
    min: -1000000, max: 1000000,
    unit: '', dimension: 'dimensionless',
  },
  {
    aliases: ['stdDev', 'sigma', 'std', 'standardDeviation'],
    min: 0, max: 1000000,
    unit: '', dimension: 'dimensionless',
    criticalIfNegative: true,
  },
];

export const PARAM_RANGE_RULES: Record<PhysicsEngineType, ParamRangeRule[]> = {
  // Physics
  buoyancy: BUOYANCY_RULES,
  lever: LEVER_RULES,
  refraction: REFRACTION_RULES,
  circuit: CIRCUIT_RULES,
  pendulum: [],
  wave: [],
  // Chemistry
  acid_base: ACID_BASE_RULES,
  electrolysis: ELECTROLYSIS_RULES,
  reaction_rate: REACTION_RATE_RULES,
  titration: TITRATION_RULES,
  combustion: [],
  // Biology
  osmosis: OSMOSIS_RULES,
  enzyme: ENZYME_RULES,
  population: POPULATION_RULES,
  photosynthesis: PHOTOSYNTHESIS_RULES,
  // Math
  function_graph: FUNCTION_GRAPH_RULES,
  geometry: GEOMETRY_RULES,
  probability: PROBABILITY_RULES,
  statistics: STATISTICS_RULES,
  // Fallback
  generic: [],
};

// ── Formula Knowledge ──────────────────────────────────────────────────────

export const FORMULA_KNOWLEDGE: Record<PhysicsEngineType, FormulaKnowledge[]> = {
  // ── Physics ──
  buoyancy: [
    { name: '阿基米德原理', keyVariables: ['rho_liquid', 'g', 'V_displaced'], resultVariable: 'buoyantForce', canonicalExpression: 'F = ρ液 × g × V排' },
    { name: '重力公式', keyVariables: ['rho_object', 'g', 'V_object'], resultVariable: 'gravity', canonicalExpression: 'G = ρ物 × g × V物' },
  ],
  lever: [
    { name: '杠杆平衡条件', keyVariables: ['leftMass', 'leftArm', 'rightMass', 'rightArm'], resultVariable: 'torqueBalance', canonicalExpression: 'F1 × L1 = F2 × L2' },
  ],
  refraction: [
    { name: '斯涅尔定律', keyVariables: ['n1', 'incidentAngle', 'n2'], resultVariable: 'refractionAngle', canonicalExpression: 'n1 × sin(θ1) = n2 × sin(θ2)' },
  ],
  circuit: [
    { name: '欧姆定律', keyVariables: ['voltage', 'resistance'], resultVariable: 'current', canonicalExpression: 'I = U / R' },
    { name: '功率公式', keyVariables: ['voltage', 'current'], resultVariable: 'power', canonicalExpression: 'P = U × I' },
  ],
  pendulum: [],
  wave: [],
  // ── Chemistry ──
  acid_base: [
    { name: '水的离子积', keyVariables: ['H_concentration', 'OH_concentration'], resultVariable: 'ionProduct', canonicalExpression: 'Kw = [H⁺][OH⁻] = 1×10⁻¹⁴' },
    { name: 'pH定义', keyVariables: ['H_concentration'], resultVariable: 'pH', canonicalExpression: 'pH = -lg[H⁺]' },
  ],
  electrolysis: [
    { name: '法拉第电解定律', keyVariables: ['current', 'time', 'molarMass', 'electrons'], resultVariable: 'mass', canonicalExpression: 'm = (I × t × M) / (n × F)' },
  ],
  reaction_rate: [
    { name: '反应速率定义', keyVariables: ['concentration', 'time'], resultVariable: 'reactionRate', canonicalExpression: 'v = Δc / Δt' },
    { name: '阿伦尼乌斯方程', keyVariables: ['activationEnergy', 'temperature'], resultVariable: 'rateConstant', canonicalExpression: 'k = A × e^(-Ea/RT)' },
  ],
  titration: [
    { name: '中和反应', keyVariables: ['concentration', 'volume'], resultVariable: 'moles', canonicalExpression: 'n = c × V' },
    { name: '滴定终点', keyVariables: ['titrantConc', 'titrantVolume', 'analyteVolume'], resultVariable: 'analyteConc', canonicalExpression: 'c₁V₁ = c₂V₂' },
  ],
  combustion: [],
  // ── Biology ──
  osmosis: [
    { name: '渗透压公式', keyVariables: ['concentration', 'temperature'], resultVariable: 'osmoticPressure', canonicalExpression: 'π = iMRT' },
  ],
  enzyme: [
    { name: '米氏方程', keyVariables: ['substrateConc', 'Km', 'Vmax'], resultVariable: 'reactionVelocity', canonicalExpression: 'v = Vmax × [S] / (Km + [S])' },
  ],
  population: [
    { name: 'J型增长', keyVariables: ['initialPopulation', 'growthRate', 'time'], resultVariable: 'population', canonicalExpression: 'Nt = N0 × e^(rt)' },
    { name: 'S型增长', keyVariables: ['initialPopulation', 'growthRate', 'carryingCapacity', 'time'], resultVariable: 'population', canonicalExpression: 'Nt = K / (1 + ((K-N0)/N0) × e^(-rt))' },
  ],
  photosynthesis: [
    { name: '光合速率', keyVariables: ['lightIntensity', 'CO2Concentration'], resultVariable: 'photosynthesisRate', canonicalExpression: 'P = Pmax × I / (Ik + I)' },
  ],
  // ── Math ──
  function_graph: [
    { name: '正弦函数', keyVariables: ['amplitude', 'frequency', 'phase'], resultVariable: 'y', canonicalExpression: 'y = A × sin(ωx + φ)' },
    { name: '二次函数', keyVariables: ['a', 'b', 'c'], resultVariable: 'y', canonicalExpression: 'y = ax² + bx + c' },
  ],
  geometry: [
    { name: '三角形面积', keyVariables: ['sideLength', 'height'], resultVariable: 'area', canonicalExpression: 'S = (1/2) × b × h' },
    { name: '勾股定理', keyVariables: ['a', 'b'], resultVariable: 'c', canonicalExpression: 'c² = a² + b²' },
    { name: '圆面积', keyVariables: ['radius'], resultVariable: 'area', canonicalExpression: 'S = π × r²' },
  ],
  probability: [
    { name: '古典概率', keyVariables: ['favorableOutcomes', 'totalOutcomes'], resultVariable: 'probability', canonicalExpression: 'P = m / n' },
    { name: '二项分布', keyVariables: ['trials', 'probability'], resultVariable: 'expectedValue', canonicalExpression: 'E(X) = n × p' },
  ],
  statistics: [
    { name: '算术平均数', keyVariables: ['sum', 'sampleSize'], resultVariable: 'mean', canonicalExpression: 'x̄ = Σxi / n' },
    { name: '标准差', keyVariables: ['mean', 'sampleSize'], resultVariable: 'stdDev', canonicalExpression: 'σ = √(Σ(xi-x̄)² / n)' },
  ],
  // Fallback
  generic: [],
};

// ── Dimension Rules ────────────────────────────────────────────────────────

export const DIMENSION_RULES: DimensionRule[] = [
  // Physics
  { unit: 'kg', dimension: 'mass', expectedFor: ['mass', 'leftMass', 'rightMass'] },
  { unit: 'g', dimension: 'mass' },
  { unit: 'm', dimension: 'length' },
  { unit: 'cm', dimension: 'length', expectedFor: ['leftArm', 'rightArm'] },
  { unit: 'mm', dimension: 'length' },
  { unit: 'm³', dimension: 'volume' },
  { unit: 'cm³', dimension: 'volume' },
  { unit: 'mL', dimension: 'volume', expectedFor: ['volume', 'titrantVolume'] },
  { unit: 'L', dimension: 'volume' },
  { unit: 'kg/m³', dimension: 'density', expectedFor: ['rho_object', 'rho_liquid'] },
  { unit: 'g/cm³', dimension: 'density' },
  { unit: 'N', dimension: 'force' },
  { unit: 'J', dimension: 'energy' },
  { unit: 'W', dimension: 'power' },
  { unit: 'V', dimension: 'voltage', expectedFor: ['voltage'] },
  { unit: 'A', dimension: 'current', expectedFor: ['current'] },
  { unit: 'Ω', dimension: 'resistance', expectedFor: ['resistance'] },
  { unit: '°', dimension: 'angle', expectedFor: ['incidentAngle', 'angle', 'theta'] },
  { unit: 'rad', dimension: 'angle' },
  { unit: 's', dimension: 'time', expectedFor: ['time', 'duration'] },
  { unit: 'min', dimension: 'time' },
  { unit: 'h', dimension: 'time' },
  { unit: 'm/s', dimension: 'velocity' },
  { unit: 'm/s²', dimension: 'acceleration' },
  { unit: 'Hz', dimension: 'frequency', expectedFor: ['frequency'] },
  { unit: 'K', dimension: 'temperature' },
  { unit: '°C', dimension: 'temperature', expectedFor: ['temperature', 'temp'] },
  // Chemistry
  { unit: 'mol/L', dimension: 'concentration', expectedFor: ['concentration', 'molarity', 'titrantConc'] },
  { unit: 'mmol/L', dimension: 'concentration', expectedFor: ['substrateConc'] },
  { unit: 'mol', dimension: 'amount' },
  { unit: 'kPa', dimension: 'pressure', expectedFor: ['pressure'] },
  { unit: 'Pa', dimension: 'pressure' },
  { unit: 'atm', dimension: 'pressure' },
  { unit: 'kJ/mol', dimension: 'molarEnergy' },
  // Biology
  { unit: 'lux', dimension: 'illuminance', expectedFor: ['lightIntensity'] },
  { unit: '%', dimension: 'percentage', expectedFor: ['CO2Concentration'] },
  { unit: 'μmol/(m²·s)', dimension: 'photosynthesisRate' },
  // Math
  { unit: 'cm²', dimension: 'area' },
  { unit: 'm²', dimension: 'area' },
];

// ── Query Functions ────────────────────────────────────────────────────────

export function getParamRules(physicsType: PhysicsEngineType): ParamRangeRule[] {
  return PARAM_RANGE_RULES[physicsType] ?? [];
}

export function getFormulaKnowledge(physicsType: PhysicsEngineType): FormulaKnowledge[] {
  return FORMULA_KNOWLEDGE[physicsType] ?? [];
}

export function getDimensionRule(unit: string): DimensionRule | undefined {
  return DIMENSION_RULES.find(r => r.unit === unit);
}

export function findParamRule(paramName: string, physicsType: PhysicsEngineType): ParamRangeRule | undefined {
  const rules = getParamRules(physicsType);
  return rules.find(r => r.aliases.some(alias => alias.toLowerCase() === paramName.toLowerCase()));
}
