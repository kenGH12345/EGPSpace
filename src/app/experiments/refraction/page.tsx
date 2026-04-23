'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';

function CriticalAngleCalc({ mediumN }: { mediumN: number }) {
  const criticalAngle = useMemo(() => {
    return Math.asin(1 / mediumN) * (180 / Math.PI);
  }, [mediumN]);
  
  return (
    <p className="text-center text-sm text-cyan-700 mt-3">
      临界角 = {criticalAngle.toFixed(1)} 度
    </p>
  );
}

export default function RefractionExperimentPage() {
  const [incidentAngle, setIncidentAngle] = useState(45);
  const [mediumType, setMediumType] = useState<'water' | 'glass' | 'diamond'>('water');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const mediumData = {
    water: { n: 1.33, name: '水', color: '#3498DB', alpha: 0.3 },
    glass: { n: 1.50, name: '玻璃', color: '#9B59B6', alpha: 0.3 },
    diamond: { n: 2.42, name: '金刚石', color: '#00CED1', alpha: 0.3 },
  };

  const currentMedium = mediumData[mediumType];

  // 计算折射角 (斯涅尔定律: n1 * sin(θ1) = n2 * sin(θ2))
  const incidentRad = (incidentAngle * Math.PI) / 180;
  const sinRefracted = Math.sin(incidentRad) / currentMedium.n;
  const refractedAngle = sinRefracted <= 1 ? Math.asin(sinRefracted) * (180 / Math.PI) : 90;

  // 绘制折射光路图
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const interfaceY = height / 2;

    ctx.clearRect(0, 0, width, height);

    // 绘制上半部分 (空气)
    ctx.fillStyle = '#FFF8E7';
    ctx.fillRect(0, 0, width, interfaceY);

    // 绘制下半部分 (介质)
    ctx.fillStyle = currentMedium.color;
    ctx.globalAlpha = currentMedium.alpha;
    ctx.fillRect(0, interfaceY, width, height - interfaceY);
    ctx.globalAlpha = 1;

    // 绘制分界面
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, interfaceY);
    ctx.lineTo(width, interfaceY);
    ctx.stroke();

    // 绘制法线 (虚线)
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();
    ctx.setLineDash([]);

    // 绘制入射光线
    const rayLength = 120;
    const incidentEndX = centerX - rayLength * Math.sin(incidentRad);
    const incidentEndY = interfaceY - rayLength * Math.cos(incidentRad);
    
    ctx.strokeStyle = '#E74C3C';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(incidentEndX, incidentEndY);
    ctx.lineTo(centerX, interfaceY);
    ctx.stroke();

    // 绘制折射光线
    if (sinRefracted <= 1) {
      const refractedRad = (refractedAngle * Math.PI) / 180;
      const refractedEndX = centerX + rayLength * Math.sin(refractedRad);
      const refractedEndY = interfaceY + rayLength * Math.cos(refractedRad);
      
      ctx.strokeStyle = '#27AE60';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(centerX, interfaceY);
      ctx.lineTo(refractedEndX, refractedEndY);
      ctx.stroke();
    } else {
      // 全反射
      ctx.strokeStyle = '#27AE60';
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 5]);
      ctx.beginPath();
      ctx.moveTo(centerX, interfaceY);
      ctx.lineTo(width, interfaceY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 绘制箭头 (入射)
    const arrowSize = 10;
    const arrowAngle1 = Math.atan2(interfaceY - incidentEndY, centerX - incidentEndX);
    ctx.fillStyle = '#E74C3C';
    ctx.beginPath();
    ctx.moveTo(centerX, interfaceY);
    ctx.lineTo(
      centerX - arrowSize * Math.cos(arrowAngle1 - Math.PI / 6),
      interfaceY - arrowSize * Math.sin(arrowAngle1 - Math.PI / 6)
    );
    ctx.lineTo(
      centerX - arrowSize * Math.cos(arrowAngle1 + Math.PI / 6),
      interfaceY - arrowSize * Math.sin(arrowAngle1 + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();

    // 绘制角度弧
    ctx.strokeStyle = '#E74C3C';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, interfaceY, 40, -Math.PI / 2, -incidentRad - Math.PI / 2, true);
    ctx.stroke();

    if (sinRefracted <= 1) {
      const refractedRad = (refractedAngle * Math.PI) / 180;
      ctx.strokeStyle = '#27AE60';
      ctx.beginPath();
      ctx.arc(centerX, interfaceY, 50, Math.PI / 2 - refractedRad, Math.PI / 2);
      ctx.stroke();
    }

    // 标注
    ctx.font = 'bold 14px system-ui';
    ctx.fillStyle = '#E74C3C';
    ctx.fillText(`入射角: ${incidentAngle}°`, incidentEndX + 10, incidentEndY + 20);
    
    if (sinRefracted <= 1) {
      ctx.fillStyle = '#27AE60';
      ctx.fillText(`折射角: ${refractedAngle.toFixed(1)}°`, centerX + 60, interfaceY + 40);
    } else {
      ctx.fillStyle = '#E74C3C';
      ctx.fillText('全反射!', centerX + 60, interfaceY + 40);
    }

    // 介质标注
    ctx.font = '12px system-ui';
    ctx.fillStyle = '#333';
    ctx.fillText(`上方: 空气 (n=1.0)`, 20, 30);
    ctx.fillStyle = currentMedium.color;
    ctx.fillText(`下方: ${currentMedium.name} (n=${currentMedium.n})`, 20, interfaceY + 30);

  }, [incidentAngle, mediumType, incidentRad, refractedAngle, sinRefracted, currentMedium]);

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #FFF8F0 0%, #FFF5E6 100%)' }}>
      {/* 顶部导航 */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-500 hover:text-gray-700 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>
              返回
            </Link>
            <div className="w-px h-6 bg-gray-300" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
                <span className="text-xl">🔮</span>
              </div>
              <div>
                <h1 className="font-bold text-gray-800">光的折射</h1>
                <p className="text-sm text-gray-500">交互模拟</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>收藏 0</span>
            <span>|</span>
            <span>Lv.2</span>
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
                  <span>折射定律 (斯涅尔定律)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-1">•</span>
                  <span>折射率的概念</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-1">•</span>
                  <span>光疏介质与光密介质</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-1">•</span>
                  <span>全反射现象</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-200">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">标</span>
                学习目标
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                理解光的折射现象，掌握斯涅尔定律 n1·sinθ1 = n2·sinθ2，能计算折射角并理解全反射
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
                  <span>角度是相对于法线，不是界面</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500">⚠️</span>
                  <span>光从空气射入介质时 sinθ2 = sinθ1/n</span>
                </li>
              </ul>
            </div>
          </div>

          {/* 右侧实验区 */}
          <div className="lg:col-span-2 space-y-4">
            {/* 状态卡片 */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl p-4 border border-gray-200">
                <p className="text-sm text-gray-500 mb-1">入射角 θ1</p>
                <p className="text-2xl font-bold text-red-500">{incidentAngle}°</p>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-gray-200">
                <p className="text-sm text-gray-500 mb-1">折射角 θ2</p>
                <p className="text-2xl font-bold text-green-600">
                  {sinRefracted <= 1 ? `${refractedAngle.toFixed(1)}°` : '全反射'}
                </p>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-gray-200">
                <p className="text-sm text-gray-500 mb-1">介质折射率</p>
                <p className="text-2xl font-bold text-cyan-600">{currentMedium.n}</p>
              </div>
            </div>

            {/* 光路可视化 */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200">
              <canvas
                ref={canvasRef}
                width={560}
                height={320}
                className="w-full"
              />
              <div className="flex justify-center mt-2">
                <span className={`px-4 py-1 rounded-full text-sm font-medium ${
                  sinRefracted > 1
                    ? 'bg-red-100 text-red-700'
                    : refractedAngle < incidentAngle
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-green-100 text-green-700'
                }`}>
                  {sinRefracted > 1 ? '⚡ 全反射' : '✓ 正常折射'}
                </span>
              </div>
            </div>

            {/* 参数控制 */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200">
              <h3 className="font-bold text-gray-800 mb-4">参数调节</h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">入射角</span>
                    <span className="font-medium text-red-500">{incidentAngle}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="89"
                    value={incidentAngle}
                    onChange={(e) => setIncidentAngle(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500"
                  />
                </div>

                <div>
                  <span className="text-gray-600 text-sm">折射介质</span>
                  <div className="flex gap-3 mt-2">
                    {(['water', 'glass', 'diamond'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setMediumType(type)}
                        className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                          mediumType === type
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <div className="text-lg mb-1">
                          {type === 'water' ? '💧' : type === 'glass' ? '🪟' : '💎'}
                        </div>
                        <div className="text-xs">
                          {mediumData[type].name}
                          <br />
                          <span className="opacity-70">n={mediumData[type].n}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 公式卡片 */}
            <div className="bg-gradient-to-r from-cyan-100 to-blue-100 rounded-2xl p-5 border border-cyan-200">
              <h3 className="font-bold text-cyan-800 mb-3 text-center">斯涅尔定律</h3>
              <div className="flex justify-around text-center">
                <div className="bg-white/50 rounded-xl px-4 py-2">
                  <span className="text-xl font-mono font-bold text-cyan-700">n1 * sin(t1) = n2 * sin(t2)</span>
                </div>
              </div>
              <CriticalAngleCalc mediumN={currentMedium.n} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
