/**
 * 更多预置实验配置
 * 扩展实验库：电磁学、力学、热学、化学等
 */

import { ExperimentConfig } from './experiment-types';

// ========== 7. 欧姆定律实验 ==========

export const ohmsLawExperiment: ExperimentConfig = {
  id: 'ohms-law',
  title: '欧姆定律实验',
  description: '探究电压、电流与电阻之间的关系',
  theory: '欧姆定律指出：通过导体的电流与导体两端的电压成正比，与导体的电阻成反比。公式：I = U/R',
  formula: 'I = U/R',
  formulaExplanation: 'I为电流，U为电压，R为电阻',
  params: [
    {
      key: 'voltage',
      name: '电压',
      unit: 'V',
      min: 0,
      max: 24,
      default: 12,
      step: 0.5,
      description: '电源电压',
      gestureControl: {
        finger: 'index',
        direction: 'vertical',
        sensitivity: 0.5,
      },
    },
    {
      key: 'resistance',
      name: '电阻',
      unit: 'Ω',
      min: 10,
      max: 1000,
      default: 100,
      step: 10,
      description: '定值电阻阻值',
    },
  ],
  statusItems: [
    {
      label: '电流',
      value: 0,
      unit: 'A',
      color: '#6366F1',
    },
    {
      label: '功率',
      value: 0,
      unit: 'W',
      color: '#10B981',
    },
    {
      label: '电路状态',
      value: '',
      unit: '',
      color: '#F59E0B',
    },
  ],
  tips: [
    {
      icon: 'info',
      text: '电流与电压成正比，与电阻成反比',
    },
    {
      icon: 'warning',
      text: '电压过高可能烧坏用电器',
    },
    {
      icon: 'success',
      text: '功率 P = UI',
    },
  ],
  examples: [
    {
      title: '观察电流变化',
      desc: '改变电压，观察电流表读数变化',
    },
    {
      title: '观察电阻影响',
      desc: '更换不同阻值的电阻，观察电流变化',
    },
  ],
};

// ========== 8. 自由落体实验 ==========

export const freeFallExperiment: ExperimentConfig = {
  id: 'free-fall',
  title: '自由落体运动实验',
  description: '探究自由落体运动的加速度与高度的关系',
  theory: '自由落体运动是物体只在重力作用下从静止开始下落的运动。在同一地点，所有物体的重力加速度相同，约为 g = 9.8 m/s²。',
  formula: 'h = ½gt², v = gt',
  formulaExplanation: 'h为下落高度，g为重力加速度，t为时间，v为速度',
  params: [
    {
      key: 'height',
      name: '高度',
      unit: 'm',
      min: 1,
      max: 50,
      default: 10,
      step: 1,
      description: '物体开始下落的高度',
      gestureControl: {
        finger: 'index',
        direction: 'vertical',
        sensitivity: 0.5,
      },
    },
    {
      key: 'gravity',
      name: '重力加速度',
      unit: 'm/s²',
      min: 1,
      max: 20,
      default: 9.8,
      step: 0.1,
      description: '当地的重力加速度',
    },
    {
      key: 'time',
      name: '时间',
      unit: 's',
      min: 0,
      max: 5,
      default: 0,
      step: 0.1,
      description: '从开始下落到现在的时间',
    },
  ],
  statusItems: [
    {
      label: '下落距离',
      value: 0,
      unit: 'm',
      color: '#6366F1',
    },
    {
      label: '瞬时速度',
      value: 0,
      unit: 'm/s',
      color: '#10B981',
    },
    {
      label: '下落时间',
      value: 0,
      unit: 's',
      color: '#EF4444',
    },
  ],
  tips: [
    {
      icon: 'info',
      text: '自由落体是匀加速直线运动',
    },
    {
      icon: 'warning',
      text: '忽略空气阻力影响',
    },
    {
      icon: 'success',
      text: '速度 v = gt，距离 h = ½gt²',
    },
  ],
  examples: [
    {
      title: '测量重力加速度',
      desc: '通过测量下落高度和时间计算 g',
    },
    {
      title: '观察速度变化',
      desc: '观察物体越落越快',
    },
  ],
};

// ========== 9. 波的干涉实验 ==========

export const waveInterferenceExperiment: ExperimentConfig = {
  id: 'wave-interference',
  title: '波的干涉实验',
  description: '探究波的干涉现象，理解波的叠加原理',
  theory: '两列相干波相遇时，某些点的振动始终加强（相长干涉），某些点的振动始终减弱（相消干涉），形成稳定的干涉图样。',
  formula: 'Δs = |s₁ - s₂| = kλ (加强), Δs = (2k+1)λ/2 (减弱)',
  formulaExplanation: 'Δs为路径差，λ为波长，k为整数',
  params: [
    {
      key: 'wavelength',
      name: '波长',
      unit: 'm',
      min: 0.1,
      max: 2,
      default: 0.5,
      step: 0.1,
      description: '波的波长',
      gestureControl: {
        finger: 'index',
        direction: 'horizontal',
        sensitivity: 0.5,
      },
    },
    {
      key: 'slitDistance',
      name: '双缝间距',
      unit: 'm',
      min: 0.01,
      max: 0.5,
      default: 0.1,
      step: 0.01,
      description: '两个波源之间的距离',
    },
    {
      key: 'screenDistance',
      name: '屏幕距离',
      unit: 'm',
      min: 0.5,
      max: 5,
      default: 2,
      step: 0.1,
      description: '到屏幕的距离',
    },
  ],
  statusItems: [
    {
      label: '干涉条纹间距',
      value: 0,
      unit: 'm',
      color: '#6366F1',
    },
    {
      label: '波速',
      value: 0,
      unit: 'm/s',
      color: '#10B981',
    },
    {
      label: '频率',
      value: 0,
      unit: 'Hz',
      color: '#F59E0B',
    },
  ],
  tips: [
    {
      icon: 'info',
      text: '只有相干波才能产生稳定干涉',
    },
    {
      icon: 'warning',
      text: '两列波频率必须相同',
    },
    {
      icon: 'success',
      text: '条纹间距 Δx = λD/d',
    },
  ],
  examples: [
    {
      title: '观察明暗相间条纹',
      desc: '观察屏幕上明暗相间的干涉条纹',
    },
    {
      title: '改变波长',
      desc: '改变波长观察条纹间距变化',
    },
  ],
};

// ========== 10. 理想气体状态方程实验 ==========

export const idealGasExperiment: ExperimentConfig = {
  id: 'ideal-gas-law',
  title: '理想气体状态方程实验',
  description: '探究理想气体压强、体积与温度的关系',
  theory: '理想气体状态方程描述了理想气体在平衡态下压强、体积、温度和物质的量之间的关系：PV = nRT',
  formula: 'PV = nRT',
  formulaExplanation: 'P为压强，V为体积，n为物质的量，R为气体常数，T为温度',
  params: [
    {
      key: 'pressure',
      name: '压强',
      unit: 'Pa',
      min: 10000,
      max: 500000,
      default: 101325,
      step: 1000,
      description: '气体压强',
      gestureControl: {
        finger: 'index',
        direction: 'horizontal',
        sensitivity: 0.5,
      },
    },
    {
      key: 'temperature',
      name: '温度',
      unit: 'K',
      min: 200,
      max: 500,
      default: 300,
      step: 10,
      description: '气体温度（开尔文）',
    },
    {
      key: 'moles',
      name: '物质的量',
      unit: 'mol',
      min: 0.1,
      max: 5,
      default: 1,
      step: 0.1,
      description: '气体的物质的量',
    },
  ],
  statusItems: [
    {
      label: '体积',
      value: 0,
      unit: 'L',
      color: '#6366F1',
    },
    {
      label: '分子数',
      value: 0,
      unit: '个',
      color: '#10B981',
    },
    {
      label: '状态',
      value: '',
      unit: '',
      color: '#F59E0B',
    },
  ],
  tips: [
    {
      icon: 'info',
      text: '温度必须使用绝对温度（开尔文）',
    },
    {
      icon: 'warning',
      text: '理想气体是理论模型，实际气体有偏差',
    },
    {
      icon: 'success',
      text: 'R = 8.314 J/(mol·K)',
    },
  ],
  examples: [
    {
      title: '等温变化',
      desc: '保持温度不变，观察压强与体积的关系',
    },
    {
      title: '等压变化',
      desc: '保持压强不变，观察体积与温度的关系',
    },
  ],
};

// ========== 11. 酸碱中和滴定实验 ==========

export const acidBaseTitrationExperiment: ExperimentConfig = {
  id: 'acid-base-titration',
  title: '酸碱中和滴定实验',
  description: '探究酸碱中和反应，测定未知酸的浓度',
  theory: '酸碱中和反应中，酸提供的 H⁺ 与碱提供的 OH⁻ 结合生成水。当恰好完全反应时称为滴定终点。',
  formula: 'CₐVₐ = CᵦVᵦ',
  formulaExplanation: 'Cₐ、Cᵦ为酸碱浓度，Vₐ、Vᵦ为体积',
  params: [
    {
      key: 'acidConcentration',
      name: '酸浓度',
      unit: 'mol/L',
      min: 0.01,
      max: 1,
      default: 0.1,
      step: 0.01,
      description: '盐酸的浓度',
      gestureControl: {
        finger: 'index',
        direction: 'vertical',
        sensitivity: 0.5,
      },
    },
    {
      key: 'baseVolume',
      name: '碱体积',
      unit: 'mL',
      min: 10,
      max: 50,
      default: 25,
      step: 1,
      description: '氢氧化钠溶液的体积',
    },
    {
      key: 'addedVolume',
      name: '加入酸体积',
      unit: 'mL',
      min: 0,
      max: 50,
      default: 0,
      step: 0.5,
      description: '滴加的盐酸体积',
    },
  ],
  statusItems: [
    {
      label: 'pH值',
      value: 7,
      unit: '',
      color: '#6366F1',
    },
    {
      label: '反应进程',
      value: 0,
      unit: '%',
      color: '#10B981',
    },
    {
      label: '滴定终点',
      value: '',
      unit: '',
      color: '#EF4444',
    },
  ],
  tips: [
    {
      icon: 'info',
      text: '酚酞指示剂在碱性环境中显红色',
    },
    {
      icon: 'warning',
      text: '接近终点时要慢滴',
    },
    {
      icon: 'success',
      text: 'pH = 7 时为中性',
    },
  ],
  examples: [
    {
      title: '测定未知酸浓度',
      desc: '用已知浓度的碱滴定未知酸',
    },
    {
      title: '观察pH突变',
      desc: '观察滴定终点附近pH的急剧变化',
    },
  ],
};

// ========== 12. 碰撞实验 ==========

export const collisionExperiment: ExperimentConfig = {
  id: 'collision',
  title: '碰撞与动量守恒实验',
  description: '探究碰撞过程中动量守恒定律',
  theory: '在不受外力或所受合外力为零的系统内，总动量保持不变。碰撞前后系统的总动量相等。',
  formula: 'm₁v₁ + m₂v₂ = m₁v₁\' + m₂v₂\'',
  formulaExplanation: 'm为质量，v为碰撞前速度，v\'为碰撞后速度',
  params: [
    {
      key: 'mass1',
      name: '物体1质量',
      unit: 'kg',
      min: 0.5,
      max: 5,
      default: 1,
      step: 0.1,
      description: '第一个物体的质量',
      gestureControl: {
        finger: 'index',
        direction: 'horizontal',
        sensitivity: 0.5,
      },
    },
    {
      key: 'velocity1',
      name: '物体1速度',
      unit: 'm/s',
      min: -10,
      max: 10,
      default: 5,
      step: 0.5,
      description: '物体1的初速度',
    },
    {
      key: 'mass2',
      name: '物体2质量',
      unit: 'kg',
      min: 0.5,
      max: 5,
      default: 1,
      step: 0.1,
      description: '第二个物体的质量',
    },
    {
      key: 'velocity2',
      name: '物体2速度',
      unit: 'm/s',
      min: -10,
      max: 10,
      default: 0,
      step: 0.5,
      description: '物体2的初速度',
    },
    {
      key: 'restitution',
      name: '恢复系数',
      unit: '',
      min: 0,
      max: 1,
      default: 0.8,
      step: 0.1,
      description: '碰撞类型：0为完全非弹性，1为完全弹性',
    },
  ],
  statusItems: [
    {
      label: '系统总动量',
      value: 0,
      unit: 'kg·m/s',
      color: '#6366F1',
    },
    {
      label: '碰撞后速度1',
      value: 0,
      unit: 'm/s',
      color: '#10B981',
    },
    {
      label: '碰撞后速度2',
      value: 0,
      unit: 'm/s',
      color: '#EF4444',
    },
    {
      label: '动能损失',
      value: 0,
      unit: 'J',
      color: '#F59E0B',
    },
  ],
  tips: [
    {
      icon: 'info',
      text: '动量守恒定律适用于所有碰撞',
    },
    {
      icon: 'warning',
      text: '完全弹性碰撞动能也守恒',
    },
    {
      icon: 'success',
      text: '恢复系数 e = (v₂\' - v₁\')/(v₁ - v₂)',
    },
  ],
  examples: [
    {
      title: '完全非弹性碰撞',
      desc: '设置恢复系数为0，两物体粘在一起',
    },
    {
      title: '完全弹性碰撞',
      desc: '设置恢复系数为1，观察动能守恒',
    },
  ],
};

// ========== 13. 多普勒效应实验 ==========

export const dopplerEffectExperiment: ExperimentConfig = {
  id: 'doppler-effect',
  title: '多普勒效应实验',
  description: '探究波源或观察者运动时接收频率的变化',
  theory: '当波源或观察者相对介质运动时，观察者接收到的频率会发生变化，这种现象称为多普勒效应。',
  formula: "f' = f × (v ± v_observer)/(v ∓ v_source)",
  formulaExplanation: "f'为观察频率，f为原始频率，v为波速",
  params: [
    {
      key: 'sourceFrequency',
      name: '波源频率',
      unit: 'Hz',
      min: 100,
      max: 2000,
      default: 440,
      step: 10,
      description: '波源发出的频率',
      gestureControl: {
        finger: 'index',
        direction: 'horizontal',
        sensitivity: 0.5,
      },
    },
    {
      key: 'waveSpeed',
      name: '波速',
      unit: 'm/s',
      min: 100,
      max: 500,
      default: 340,
      step: 10,
      description: '波在介质中的传播速度',
    },
    {
      key: 'observerVelocity',
      name: '观察者速度',
      unit: 'm/s',
      min: -50,
      max: 50,
      default: 0,
      step: 1,
      description: '观察者相对介质的速度（正向远离）',
    },
    {
      key: 'sourceVelocity',
      name: '波源速度',
      unit: 'm/s',
      min: -50,
      max: 50,
      default: 0,
      step: 1,
      description: '波源相对介质的速度（正向远离）',
    },
  ],
  statusItems: [
    {
      label: '接收频率',
      value: 0,
      unit: 'Hz',
      color: '#6366F1',
    },
    {
      label: '频率变化',
      value: 0,
      unit: 'Hz',
      color: '#10B981',
    },
    {
      label: '相对运动',
      value: '',
      unit: '',
      color: '#F59E0B',
    },
  ],
  tips: [
    {
      icon: 'info',
      text: '观察者靠近波源，频率升高',
    },
    {
      icon: 'warning',
      text: '波源靠近观察者，频率也升高',
    },
    {
      icon: 'success',
      text: '声波多普勒效应可产生警车呼啸声',
    },
  ],
  examples: [
    {
      title: '救护车效应',
      desc: '模拟救护车经过时音调的变化',
    },
    {
      title: '雷达测速',
      desc: '理解雷达测速原理',
    },
  ],
};

// ========== 14. 电磁感应实验 ==========

export const electromagneticInductionExperiment: ExperimentConfig = {
  id: 'electromagnetic-induction',
  title: '电磁感应实验',
  description: '探究磁通量变化产生感应电动势的现象',
  theory: '法拉第电磁感应定律：闭合回路中磁通量变化时，会产生感应电动势，其大小与磁通量变化率成正比。',
  formula: 'ε = -N × dΦ/dt',
  formulaExplanation: 'ε为感应电动势，N为线圈匝数，Φ为磁通量',
  params: [
    {
      key: 'magneticField',
      name: '磁感应强度',
      unit: 'T',
      min: 0.1,
      max: 2,
      default: 0.5,
      step: 0.1,
      description: '磁场强度',
      gestureControl: {
        finger: 'index',
        direction: 'horizontal',
        sensitivity: 0.5,
      },
    },
    {
      key: 'coilArea',
      name: '线圈面积',
      unit: 'cm²',
      min: 10,
      max: 100,
      default: 50,
      step: 5,
      description: '线圈横截面积',
    },
    {
      key: 'coilTurns',
      name: '线圈匝数',
      unit: '匝',
      min: 10,
      max: 500,
      default: 100,
      step: 10,
      description: '线圈的匝数',
    },
    {
      key: 'changeRate',
      name: '变化率',
      unit: '%/s',
      min: 0,
      max: 100,
      default: 50,
      step: 5,
      description: '磁感应强度变化快慢',
    },
  ],
  statusItems: [
    {
      label: '磁通量',
      value: 0,
      unit: 'Wb',
      color: '#6366F1',
    },
    {
      label: '感应电动势',
      value: 0,
      unit: 'V',
      color: '#10B981',
    },
    {
      label: '感应电流',
      value: 0,
      unit: 'A',
      color: '#EF4444',
    },
  ],
  tips: [
    {
      icon: 'info',
      text: '磁通量变化越快，感应电动势越大',
    },
    {
      icon: 'warning',
      text: '感应电流的磁场阻碍原磁场变化',
    },
    {
      icon: 'success',
      text: '楞次定律：增反减同',
    },
  ],
  examples: [
    {
      title: '发电机原理',
      desc: '观察线圈旋转产生交流电',
    },
    {
      title: '变压器原理',
      desc: '理解互感现象',
    },
  ],
};

// ========== 15. 向心力实验 ==========

export const centripetalForceExperiment: ExperimentConfig = {
  id: 'centripetal-force',
  title: '向心力与圆周运动实验',
  description: '探究做圆周运动物体所受向心力与各物理量的关系',
  theory: '做匀速圆周运动的物体需要受到指向圆心的向心力，其大小 F = mv²/r = mω²r',
  formula: 'F = mv²/r = mω²r',
  formulaExplanation: 'm为质量，v为线速度，r为半径，ω为角速度',
  params: [
    {
      key: 'mass',
      name: '质量',
      unit: 'kg',
      min: 0.1,
      max: 2,
      default: 0.5,
      step: 0.1,
      description: '物体质量',
      gestureControl: {
        finger: 'index',
        direction: 'horizontal',
        sensitivity: 0.5,
      },
    },
    {
      key: 'radius',
      name: '半径',
      unit: 'm',
      min: 0.1,
      max: 1,
      default: 0.5,
      step: 0.05,
      description: '圆周运动半径',
    },
    {
      key: 'angularVelocity',
      name: '角速度',
      unit: 'rad/s',
      min: 1,
      max: 20,
      default: 5,
      step: 0.5,
      description: '旋转的角速度',
    },
  ],
  statusItems: [
    {
      label: '向心力',
      value: 0,
      unit: 'N',
      color: '#6366F1',
    },
    {
      label: '线速度',
      value: 0,
      unit: 'm/s',
      color: '#10B981',
    },
    {
      label: '周期',
      value: 0,
      unit: 's',
      color: '#EF4444',
    },
  ],
  tips: [
    {
      icon: 'info',
      text: '向心力方向始终指向圆心',
    },
    {
      icon: 'warning',
      text: '向心力是效果力，不是新的力',
    },
    {
      icon: 'success',
      text: '卫星绕地球运动就是向心力提供万有引力',
    },
  ],
  examples: [
    {
      title: '汽车转弯',
      desc: '理解汽车转弯时需要的向心力来源',
    },
    {
      title: '过山车',
      desc: '分析过山车在最高点、最低点的受力',
    },
  ],
};

// ========== 16. 溶解度实验 ==========

export const solubilityExperiment: ExperimentConfig = {
  id: 'solubility',
  title: '物质溶解度实验',
  description: '探究温度对物质溶解度的影响',
  theory: '溶解度是指在一定温度下，某种物质在100g溶剂中达到饱和状态时所溶解的质量。多数固体物质的溶解度随温度升高而增大。',
  formula: 'S = (m溶质/m溶剂) × 100g',
  formulaExplanation: 'S为溶解度，m为质量',
  params: [
    {
      key: 'temperature',
      name: '温度',
      unit: '°C',
      min: 0,
      max: 100,
      default: 25,
      step: 5,
      description: '溶液温度',
      gestureControl: {
        finger: 'index',
        direction: 'horizontal',
        sensitivity: 0.5,
      },
    },
    {
      key: 'solventMass',
      name: '溶剂质量',
      unit: 'g',
      min: 50,
      max: 200,
      default: 100,
      step: 10,
      description: '水的质量',
    },
    {
      key: 'soluteType',
      name: '溶质类型',
      unit: '',
      min: 1,
      max: 4,
      default: 1,
      step: 1,
      description: '1: NaCl, 2: KNO₃, 3: NH₄Cl, 4: CaSO₄',
    },
  ],
  statusItems: [
    {
      label: '溶解度',
      value: 0,
      unit: 'g/100g水',
      color: '#6366F1',
    },
    {
      label: '已溶解质量',
      value: 0,
      unit: 'g',
      color: '#10B981',
    },
    {
      label: '溶液状态',
      value: '',
      unit: '',
      color: '#F59E0B',
    },
  ],
  tips: [
    {
      icon: 'info',
      text: '温度升高，大多数固体溶解度增大',
    },
    {
      icon: 'warning',
      text: '超过溶解度的部分会析出晶体',
    },
    {
      icon: 'success',
      text: '气体溶解度随温度升高而减小',
    },
  ],
  examples: [
    {
      title: '硝酸钾溶解',
      desc: '观察硝酸钾随温度变化的溶解情况',
    },
    {
      title: '海水晒盐',
      desc: '理解蒸发结晶的原理',
    },
  ],
};

// ========== 导出所有新增实验 ==========

export const additionalExperiments: ExperimentConfig[] = [
  ohmsLawExperiment,
  freeFallExperiment,
  waveInterferenceExperiment,
  idealGasExperiment,
  acidBaseTitrationExperiment,
  collisionExperiment,
  dopplerEffectExperiment,
  electromagneticInductionExperiment,
  centripetalForceExperiment,
  solubilityExperiment,
];

export default additionalExperiments;
