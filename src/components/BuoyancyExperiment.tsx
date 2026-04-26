'use client';

import React, { useState, useRef, useEffect } from 'react';

/** 浮力原理实验 — 阿基米德定律可视化
 *
 * 核心公式: F浮 = ρ液 × g × V排
 * 物体密度与液体密度决定浮沉状态
 */
export function BuoyancyExperiment() {
  const [objectVolume, setObjectVolume] = useState(50);
  const [objectDensity, setObjectDensity] = useState(800); // 默认小于水密度，上浮
  const [liquidDensity, setLiquidDensity] = useState(1000); // 默认水密度
  const [externalForce, setExternalForce] = useState(0); // 外力（按压）
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 计算浮力 (F浮 = ρ液 * g * V排)
  const g = 9.8;

  // 浮沉判断
  const densityRatio = objectDensity / liquidDensity;
  const isFloating = densityRatio < 1;
  const isSinking = densityRatio > 1;
  const isSuspended = Math.abs(densityRatio - 1) < 0.01;

  const objectMass = objectVolume * objectDensity;
  const gravityForce = objectMass * g;

  // 物理计算：根据物理规律自动计算浸入状态
  const equilibriumImmersionRatio = isFloating ? densityRatio : 1;
  const actualImmersionRatio = isFloating
    ? equilibriumImmersionRatio
    : Math.min(1, (gravityForce - externalForce) / (liquidDensity * g * objectVolume) || 1);

  // 实际浸入体积和浮力计算
  const immersedVolume = objectVolume * Math.max(0, Math.min(1, actualImmersionRatio));
  const buoyantForce = liquidDensity * g * immersedVolume;

  const getStatus = () => {
    if (isFloating) return { text: '↑ 上浮', color: 'text-green-600', bg: 'bg-green-100' };
    if (isSinking) return { text: '↓ 下沉', color: 'text-red-600', bg: 'bg-red-100' };
    return { text: '○ 悬浮', color: 'text-blue-600', bg: 'bg-blue-100' };
  };
  const status = getStatus();

  // 绘制可视化
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const liquidLevel = height * 0.6;

    ctx.clearRect(0, 0, width, height);

    // 绘制液体
    ctx.fillStyle = liquidDensity > 2000 ? '#1E40AF' : liquidDensity > 1500 ? '#0891B2' : liquidDensity > 1000 ? '#06B6D4' : '#67E8F9';
    ctx.globalAlpha = 0.5;
    ctx.fillRect(0, liquidLevel, width, height - liquidLevel);
    ctx.globalAlpha = 1;

    // 绘制液面
    ctx.strokeStyle = '#0EA5E9';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, liquidLevel);
    ctx.lineTo(width, liquidLevel);
    ctx.stroke();
    ctx.setLineDash([]);

    // 计算物体位置
    const objectWidth = 60;
    const objectHeight = Math.min(objectVolume * 0.8, 150);
    const containerBottom = height - 20;
    const objectX = width / 2 - objectWidth / 2;
    let objectY: number;

    if (isFloating) {
      objectY = liquidLevel - objectHeight * densityRatio;
    } else if (isSinking) {
      objectY = containerBottom - objectHeight;
    } else {
      objectY = liquidLevel;
    }

    objectY = Math.max(liquidLevel - objectHeight, Math.min(objectY, containerBottom - objectHeight));

    // 物体颜色
    let objectColor: string;
    if (isFloating) { objectColor = '#10B981'; } // 绿色
    else if (isSinking) { objectColor = '#EF4444'; } // 红色
    else { objectColor = '#3B82F6'; } // 蓝色

    ctx.fillStyle = objectColor;
    ctx.fillRect(objectX, objectY, objectWidth, objectHeight);

    // 绘制物体轮廓
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.strokeRect(objectX, objectY, objectWidth, objectHeight);

    // 绘制浸入部分（水下）
    const immersedHeight = Math.max(0, Math.min(objectHeight, liquidLevel - objectY));
    if (immersedHeight > 0) {
      ctx.fillStyle = objectColor;
      ctx.globalAlpha = 0.3;
      ctx.fillRect(objectX, objectY + objectHeight - immersedHeight, objectWidth, immersedHeight);
      ctx.globalAlpha = 1;
    }

    // 绘制浮力箭头
    if (buoyantForce > 0) {
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(objectX + objectWidth / 2, objectY + 10);
      ctx.lineTo(objectX + objectWidth / 2, objectY - buoyantForce / 5);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(objectX + objectWidth / 2, objectY - buoyantForce / 5 + 10);
      ctx.lineTo(objectX + objectWidth / 2 - 8, objectY - buoyantForce / 5 + 20);
      ctx.lineTo(objectX + objectWidth / 2 + 8, objectY - buoyantForce / 5 + 20);
      ctx.closePath();
      ctx.fillStyle = '#3B82F6';
      ctx.fill();
    }

    // 绘制重力箭头
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(objectX + objectWidth / 2, objectY + objectHeight - 10);
    ctx.lineTo(objectX + objectWidth / 2, objectY + objectHeight + gravityForce / 5);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(objectX + objectWidth / 2, objectY + objectHeight - 10);
    ctx.lineTo(objectX + objectWidth / 2 - 8, objectY + objectHeight - 20);
    ctx.lineTo(objectX + objectWidth / 2 + 8, objectY + objectHeight - 20);
    ctx.closePath();
    ctx.fillStyle = '#EF4444';
    ctx.fill();

    // 标注
    ctx.font = 'bold 14px system-ui';
    ctx.fillStyle = '#3B82F6';
    ctx.fillText(`F浮 = ${buoyantForce.toFixed(1)}N`, objectX + objectWidth + 10, objectY + objectHeight / 2 - 20);
    ctx.fillStyle = '#EF4444';
    ctx.fillText(`G = ${gravityForce.toFixed(1)}N`, objectX + objectWidth + 10, objectY + objectHeight / 2 + 20);

    // 显示浸入比例
    if (isFloating) {
      ctx.font = 'bold 12px system-ui';
      ctx.fillStyle = '#059669';
      ctx.fillText(`浸入比例: ${(densityRatio * 100).toFixed(0)}%`, objectX, objectY - 10);
    }
  }, [objectVolume, objectDensity, liquidDensity, externalForce, isFloating, isSinking, isSuspended, densityRatio, actualImmersionRatio, buoyantForce, gravityForce]);

  return (
    <div className="space-y-4">
      {/* 状态卡片 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">浮力</p>
          <p className="text-2xl font-bold text-blue-600">{buoyantForce.toFixed(1)} N</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">重力</p>
          <p className="text-2xl font-bold text-red-600">{gravityForce.toFixed(1)} N</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">状态</p>
          <p className={`text-lg font-bold ${status.color}`}>{status.text}</p>
        </div>
      </div>

      {/* 可视化 */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200">
        <canvas ref={canvasRef} width={560} height={280} className="w-full" />
        <div className="text-center mt-2">
          <span className={`px-4 py-1 rounded-full text-sm font-medium ${status.bg} ${status.color}`}>
            {isFloating ? '✓ 物体上浮（密度 < 液体）' : isSinking ? '✗ 物体下沉（密度 > 液体）' : '○ 物体悬浮（密度 = 液体）'}
          </span>
        </div>
      </div>

      {/* 参数控制 */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200">
        <h3 className="font-bold text-gray-800 mb-4">参数调节</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">物体体积</span>
              <span className="font-medium text-blue-600">{objectVolume} cm³</span>
            </div>
            <input type="range" min="10" max="200" value={objectVolume} onChange={(e) => setObjectVolume(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">物体密度 (ρ物)</span>
              <span className="font-medium text-blue-600">{objectDensity} kg/m³</span>
            </div>
            <input type="range" min="200" max="2000" step="50" value={objectDensity} onChange={(e) => setObjectDensity(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500" />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>200 (软木)</span>
              <span>1000 (水)</span>
              <span>2000 (金属)</span>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">液体密度 (ρ液)</span>
              <span className="font-medium text-blue-600">{liquidDensity} kg/m³</span>
            </div>
            <input type="range" min="800" max="13600" step="100" value={liquidDensity} onChange={(e) => setLiquidDensity(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500" />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>800 (油)</span>
              <span>1000 (水)</span>
              <span>13600 (汞)</span>
            </div>
          </div>
          {!isFloating && (
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">外力 (按压)</span>
                <span className="font-medium text-blue-600">{externalForce.toFixed(1)} N</span>
              </div>
              <input type="range" min="0" max="10" step="0.1" value={externalForce} onChange={(e) => setExternalForce(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500" />
              <p className="text-xs text-gray-400 mt-1">对下沉物体施加外力可改变浸入深度</p>
            </div>
          )}
          {isFloating && (
            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <p className="text-sm text-green-700">物体密度 &lt; 液体密度，自动上浮至平衡位置</p>
              <p className="text-xs text-green-600 mt-1">浸入比例 = ρ物/ρ液 = {objectDensity}/{liquidDensity} = {(densityRatio * 100).toFixed(1)}%</p>
            </div>
          )}
        </div>
      </div>

      {/* 公式卡片 */}
      <div className="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-2xl p-5 border border-blue-200">
        <h3 className="font-bold text-blue-800 mb-3 text-center">阿基米德原理</h3>
        <div className="bg-white/60 rounded-xl p-3 text-center">
          <span className="text-lg font-mono font-bold text-blue-700">F浮 = ρ液 × g × V排</span>
        </div>
        <p className="text-center text-sm text-blue-700 mt-3">浮力 = 液体密度 × 重力加速度 × 排开液体体积</p>
      </div>
    </div>
  );
}