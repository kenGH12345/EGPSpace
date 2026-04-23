'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export default function AcidBasePage() {
  const [acidType, setAcidType] = useState<'hcl' | 'h2so4'>('hcl');
  const [baseType, setBaseType] = useState<'naoh' | 'koh'>('naoh');
  const [acidVolume, setAcidVolume] = useState(25);
  const [baseVolume, setBaseVolume] = useState(0);
  const [baseConcentration, setBaseConcentration] = useState(0.1);
  const [indicator, setIndicator] = useState<'phenol' | 'methyl' | 'bromothymol'>('phenol');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const acidData = {
    hcl: { name: '盐酸 (HCl)', concentration: 0.1, color: '#86EFAC' },
    h2so4: { name: '硫酸 (H₂SO₄)', concentration: 0.05, color: '#FDA4AF' },
  };

  const baseData = {
    naoh: { name: '氢氧化钠 (NaOH)', color: '#93C5FD' },
    koh: { name: '氢氧化钾 (KOH)', color: '#C4B5FD' },
  };

  const indicatorData = {
    phenol: { name: '酚酞', acidColor: '#FFFFFF', baseColor: '#EC4899', range: '8.2-10.0' },
    methyl: { name: '甲基橙', acidColor: '#EF4444', baseColor: '#FACC15', range: '3.1-4.4' },
    bromothymol: { name: '溴百里酚蓝', acidColor: '#FACC15', baseColor: '#3B82F6', range: '6.0-7.6' },
  };

  // 计算pH值和滴定终点
  const acidMoles = acidData[acidType].concentration * acidVolume / 1000;
  const baseMoles = baseConcentration * baseVolume / 1000;
  const molesDiff = acidMoles - baseMoles;
  const totalVolume = (acidVolume + baseVolume) / 1000;
  
  // 简化pH计算
  let pH: number;
  let isEndPoint = false;
  if (baseVolume === 0) {
    pH = -Math.log10(acidData[acidType].concentration);
  } else if (Math.abs(molesDiff) < 0.0001) {
    pH = 7; // 终点
    isEndPoint = true;
  } else if (molesDiff > 0) {
    const HConcentration = molesDiff / totalVolume;
    pH = -Math.log10(HConcentration);
  } else {
    const OHConcentration = -molesDiff / totalVolume;
    const POH = -Math.log10(OHConcentration);
    pH = 14 - POH;
  }

  const currentIndicator = indicatorData[indicator];
  const indicatorColor = pH < 7 ? currentIndicator.acidColor : currentIndicator.baseColor;

  // 绘制滴定曲线
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;

    ctx.clearRect(0, 0, width, height);

    // 绘制坐标轴
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(padding, padding);
    ctx.stroke();

    // 绘制滴定曲线（改进：考虑等当点附近 pH 突变）
    ctx.strokeStyle = '#8B5CF6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    const points: { x: number; y: number }[] = [];
    const maxVolume = 50;
    const Kw = 1e-14; // 水的离子积
    for (let v = 0; v <= maxVolume; v += 0.5) {
      const m = acidData[acidType].concentration * acidVolume / 1000;
      const bm = baseConcentration * v / 1000;
      const diff = m - bm;
      const tv = (acidVolume + v) / 1000;
      let ph: number;
      
      // 等当点判断：酸碱物质的量相等
      const acidEquivalent = acidData[acidType].concentration * acidVolume;
      const baseEquivalent = baseConcentration * v;
      const isAtEquivalence = Math.abs(acidEquivalent - baseEquivalent) < 0.001 * Math.max(acidEquivalent, 0.001);
      
      if (isAtEquivalence && v > 0) {
        // 等当点附近：强酸强碱滴定 pH ≈ 7
        // 但由于水的自电离，会有微小偏差
        // 简化处理：等当点 pH = 7
        ph = 7;
      } else if (diff > 0) {
        // 酸剩余：精确计算，考虑水的贡献
        const H = diff / tv;
        if (H > 1e-6) {
          // 酸过量明显，直接用 H 计算
          ph = -Math.log10(H);
        } else {
          // 酸过量很少，考虑水的自电离
          const H_water = Kw / 1e-7; // 近似
          ph = -Math.log10(H + Kw / H);
        }
      } else {
        // 碱剩余：精确计算
        const OH = -diff / tv;
        if (OH > 1e-6) {
          const pOH = -Math.log10(OH);
          ph = 14 - pOH;
        } else {
          const H = Kw / OH;
          ph = -Math.log10(H);
        }
      }
      ph = Math.max(0, Math.min(14, ph));
      const x = padding + (v / maxVolume) * (width - 2 * padding);
      const y = height - padding - ((ph - 0) / 14) * (height - 2 * padding);
      points.push({ x, y });
    }

    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();

    // 标记当前点
    const currentX = padding + (baseVolume / maxVolume) * (width - 2 * padding);
    const currentTV = (acidVolume + baseVolume) / 1000;
    const currentPHValue = pH;
    const currentY = height - padding - ((currentPHValue - 0) / 14) * (height - 2 * padding);
    
    ctx.fillStyle = '#EC4899';
    ctx.beginPath();
    ctx.arc(currentX, currentY, 8, 0, Math.PI * 2);
    ctx.fill();

    // 标注
    ctx.font = '12px system-ui';
    ctx.fillStyle = '#666';
    ctx.fillText('0', padding - 15, height - padding + 20);
    ctx.fillText('7', padding - 15, height - padding - (7 / 14) * (height - 2 * padding) + 4);
    ctx.fillText('14', padding - 20, padding + 4);
    ctx.fillText('滴定剂体积 (mL)', width / 2 - 40, height - 10);
    
    // pH轴标签
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('pH', 0, 0);
    ctx.restore();

  }, [acidType, baseVolume, baseConcentration, acidVolume, pH]);

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
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                <span className="text-xl">🧪</span>
              </div>
              <div>
                <h1 className="font-bold text-gray-800">酸碱滴定</h1>
                <p className="text-sm text-gray-500">化学实验</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容 */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧知识区 */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-gray-200">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs">知</span>
                核心知识点
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-1">•</span>
                  <span>酸碱指示剂原理</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-1">•</span>
                  <span>滴定曲线绘制</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-1">•</span>
                  <span>终点与计量点</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-1">•</span>
                  <span>c₁V₁ = c₂V₂</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-200">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">标</span>
                学习目标
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                理解酸碱滴定原理，掌握指示剂选择方法，能绘制滴定曲线并确定终点
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-200">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs">坑</span>
                避坑提示
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-amber-500">⚠️</span>
                  <span>指示剂变色范围需包含终点pH</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500">⚠️</span>
                  <span>强酸强碱滴定曲线关于pH=7对称</span>
                </li>
              </ul>
            </div>
          </div>

          {/* 右侧实验区 */}
          <div className="lg:col-span-2 space-y-4">
            {/* 状态卡片 */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl p-4 border border-gray-200">
                <p className="text-sm text-gray-500 mb-1">当前pH</p>
                <p className={`text-2xl font-bold ${isEndPoint ? 'text-green-600' : pH < 7 ? 'text-red-500' : 'text-blue-600'}`}>
                  {pH.toFixed(1)}
                </p>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-gray-200">
                <p className="text-sm text-gray-500 mb-1">溶液颜色</p>
                <div 
                  className="w-full h-10 rounded-lg border border-gray-300"
                  style={{ backgroundColor: indicatorColor }}
                />
              </div>
              <div className="bg-white rounded-2xl p-4 border border-gray-200">
                <p className="text-sm text-gray-500 mb-1">滴定状态</p>
                <p className={`text-lg font-bold ${isEndPoint ? 'text-green-600' : pH < 7 ? 'text-red-500' : 'text-blue-600'}`}>
                  {isEndPoint ? '✓ 终点' : pH < 7 ? '酸过量' : '碱过量'}
                </p>
              </div>
            </div>

            {/* 滴定曲线 */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200">
              <canvas ref={canvasRef} width={560} height={280} className="w-full" />
            </div>

            {/* 参数控制 */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200">
              <h3 className="font-bold text-gray-800 mb-4">参数调节</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">酸</span>
                    <div className="flex gap-2 mt-1">
                      {(['hcl', 'h2so4'] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => setAcidType(type)}
                          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                            acidType === type ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {acidData[type].name.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">碱</span>
                    <div className="flex gap-2 mt-1">
                      {(['naoh', 'koh'] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => setBaseType(type)}
                          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                            baseType === type ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {baseData[type].name.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">碱液体积 (滴定剂)</span>
                    <span className="font-medium text-blue-600">{baseVolume} mL</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={baseVolume}
                    onChange={(e) => setBaseVolume(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">碱液浓度</span>
                    <span className="font-medium text-blue-600">{baseConcentration} mol/L</span>
                  </div>
                  <input
                    type="range"
                    min="0.01"
                    max="0.2"
                    step="0.01"
                    value={baseConcentration}
                    onChange={(e) => setBaseConcentration(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>

                <div>
                  <span className="text-sm text-gray-600">指示剂</span>
                  <div className="flex gap-2 mt-2">
                    {(['phenol', 'methyl', 'bromothymol'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setIndicator(type)}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                          indicator === type ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {indicatorData[type].name}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    变色范围: {indicatorData[indicator].range}
                  </p>
                </div>
              </div>
            </div>

            {/* 公式卡片 */}
            <div className="bg-gradient-to-r from-red-100 to-blue-100 rounded-2xl p-5 border border-gray-200">
              <h3 className="font-bold text-gray-800 mb-3 text-center">滴定计算公式</h3>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-white/60 rounded-xl p-3">
                  <div className="text-lg font-mono font-bold text-gray-800">c₁ × V₁ = c₂ × V₂</div>
                  <div className="text-xs text-gray-500 mt-1">酸碱中和计量关系</div>
                </div>
                <div className="bg-white/60 rounded-xl p-3">
                  <div className="text-lg font-mono font-bold text-gray-800">pH = -log[H⁺]</div>
                  <div className="text-xs text-gray-500 mt-1">pH定义</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
