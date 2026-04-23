'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export default function LeverExperimentPage() {
  const [fulcrumPosition, setFulcrumPosition] = useState(50); // 0-100
  const [leftWeight, setLeftWeight] = useState(5);
  const [rightWeight, setRightWeight] = useState(5);
  const [leftArmLength, setLeftArmLength] = useState(5);
  const [rightArmLength, setRightArmLength] = useState(5);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 计算力矩平衡
  const leftTorque = leftWeight * leftArmLength;
  const rightTorque = rightWeight * rightArmLength;
  const isBalanced = Math.abs(leftTorque - rightTorque) < 0.1;
  const tiltAngle = Math.max(-15, Math.min(15, (rightTorque - leftTorque) * 0.5));

  // 绘制杠杆
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerY = height / 2;

    ctx.clearRect(0, 0, width, height);

    // 绘制背景网格
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 30) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }

    // 保存状态并旋转画布
    ctx.save();
    ctx.translate(width / 2, centerY);
    ctx.rotate((tiltAngle * Math.PI) / 180);

    // 绘制杠杆
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(-width / 2 + 20, -8, width - 40, 16);

    // 绘制支点
    const fulcrumX = (fulcrumPosition - 50) * 3;
    ctx.fillStyle = '#FFA500';
    ctx.beginPath();
    ctx.moveTo(fulcrumX - 15, -5);
    ctx.lineTo(fulcrumX + 15, -5);
    ctx.lineTo(fulcrumX, 25);
    ctx.closePath();
    ctx.fill();

    // 绘制左端点
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.arc(-width / 2 + 30, 0, 8, 0, Math.PI * 2);
    ctx.fill();

    // 绘制右端点
    ctx.beginPath();
    ctx.arc(width / 2 - 30, 0, 8, 0, Math.PI * 2);
    ctx.fill();

    // 绘制左砝码
    const leftX = -width / 2 + 30 + leftArmLength * 15;
    ctx.fillStyle = '#E74C3C';
    ctx.fillRect(leftX - 20, -30 - leftWeight * 3, 40, leftWeight * 3);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 14px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(`${leftWeight}kg`, leftX, -30 - leftWeight * 3 + 20);

    // 绘制右砝码
    const rightX = width / 2 - 30 - rightArmLength * 15;
    ctx.fillStyle = '#3498DB';
    ctx.fillRect(rightX - 20, -30 - rightWeight * 3, 40, rightWeight * 3);
    ctx.fillStyle = 'white';
    ctx.fillText(`${rightWeight}kg`, rightX, -30 - rightWeight * 3 + 20);

    // 绘制绳子
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(leftX, -30);
    ctx.lineTo(leftX, -30 - leftWeight * 3);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(rightX, -30);
    ctx.lineTo(rightX, -30 - rightWeight * 3);
    ctx.stroke();

    ctx.restore();

    // 绘制力臂标注
    ctx.fillStyle = '#666';
    ctx.font = '12px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(`动力臂: ${leftArmLength}m`, -80, centerY + 60);
    ctx.fillText(`阻力臂: ${rightArmLength}m`, 80, centerY + 60);

  }, [fulcrumPosition, leftWeight, rightWeight, leftArmLength, rightArmLength, tiltAngle]);

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
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                <span className="text-xl">⚖️</span>
              </div>
              <div>
                <h1 className="font-bold text-gray-800">杠杆原理</h1>
                <p className="text-sm text-gray-500">交互模拟</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>收藏 0</span>
            <span>|</span>
            <span>Lv.1</span>
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
                  <span>杠杆的定义与五要素</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-1">•</span>
                  <span>杠杆的平衡条件</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-1">•</span>
                  <span>省力杠杆与费力杠杆</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-1">•</span>
                  <span>等臂杠杆的应用</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-200">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">标</span>
                学习目标
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                理解杠杆平衡原理，掌握动力×动力臂=阻力×阻力臂的公式，能判断省力、费力、等臂杠杆
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
                  <span>力臂不是支点到力的作用点的距离</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500">⚠️</span>
                  <span>省力必定费距离</span>
                </li>
              </ul>
            </div>
          </div>

          {/* 右侧实验区 */}
          <div className="lg:col-span-2 space-y-4">
            {/* 状态卡片 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-4 border border-gray-200">
                <p className="text-sm text-gray-500 mb-1">动力臂 × 动力</p>
                <p className="text-2xl font-bold text-amber-600">{leftTorque.toFixed(1)} N·m</p>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-gray-200">
                <p className="text-sm text-gray-500 mb-1">阻力臂 × 阻力</p>
                <p className="text-2xl font-bold text-blue-600">{rightTorque.toFixed(1)} N·m</p>
              </div>
            </div>

            {/* 杠杆可视化 */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200">
              <canvas
                ref={canvasRef}
                width={560}
                height={200}
                className="w-full"
              />
              <div className="flex justify-center mt-2">
                <span className={`px-4 py-1 rounded-full text-sm font-medium ${
                  isBalanced
                    ? 'bg-green-100 text-green-700'
                    : tiltAngle > 0
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-red-100 text-red-700'
                }`}>
                  {isBalanced ? '⚖️ 平衡' : tiltAngle > 0 ? '↘️ 右倾' : '↙️ 左倾'}
                </span>
              </div>
            </div>

            {/* 参数控制 */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200">
              <h3 className="font-bold text-gray-800 mb-4">参数调节</h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">动力 (左侧)</span>
                    <span className="font-medium text-amber-600">{leftWeight} kg</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={leftWeight}
                    onChange={(e) => setLeftWeight(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">阻力 (右侧)</span>
                    <span className="font-medium text-blue-600">{rightWeight} kg</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={rightWeight}
                    onChange={(e) => setRightWeight(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">动力臂</span>
                    <span className="font-medium text-amber-600">{leftArmLength} m</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={leftArmLength}
                    onChange={(e) => setLeftArmLength(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">阻力臂</span>
                    <span className="font-medium text-blue-600">{rightArmLength} m</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={rightArmLength}
                    onChange={(e) => setRightArmLength(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* 公式卡片 */}
            <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-2xl p-5 border border-purple-200">
              <h3 className="font-bold text-purple-800 mb-3 text-center">核心公式</h3>
              <div className="flex justify-around text-center">
                <div className="bg-white/50 rounded-xl px-4 py-2">
                  <span className="text-xl font-mono font-bold text-purple-700">F1 x L1 = F2 x L2</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
