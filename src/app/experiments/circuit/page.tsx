'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';

export default function CircuitExperimentPage() {
  const [circuitType, setCircuitType] = useState<'series' | 'parallel' | 'both'>('series');
  const [batteryVoltage, setBatteryVoltage] = useState(12);
  const [resistances, setResistances] = useState([10, 20, 30]);
  const [isPowered, setIsPowered] = useState(true);

  // 计算电路参数
  const calculations = useMemo(() => {
    if (circuitType === 'series') {
      const totalR = resistances.reduce((a, b) => a + b, 0);
      const current = batteryVoltage / totalR;
      const voltages = resistances.map(r => current * r);
      const powers = resistances.map((r, i) => current * current * r);
      return {
        totalR,
        totalI: current,
        totalV: batteryVoltage,
        totalP: current * current * totalR,
        branchI: [current],
        voltages,
        powers,
      };
    } else if (circuitType === 'parallel') {
      const totalR = 1 / resistances.reduce((a, r) => a + 1 / r, 0);
      const totalI = batteryVoltage / totalR;
      const branchCurrents = resistances.map(r => batteryVoltage / r);
      const powers = resistances.map(r => batteryVoltage * batteryVoltage / r);
      return {
        totalR,
        totalI,
        totalV: batteryVoltage,
        totalP: batteryVoltage * totalI,
        branchI: branchCurrents,
        voltages: resistances.map(() => batteryVoltage),
        powers,
      };
    } else {
      // 混联: R1与R2串联，再与R3并联
      const r1 = resistances[0] || 10;
      const r2 = resistances[1] || 10;
      const r3 = resistances[2] || 10;
      const seriesR = r1 + r2;
      const totalR = (seriesR * r3) / (seriesR + r3);
      const totalI = batteryVoltage / totalR;
      const iBranch = totalI * seriesR / (seriesR + r3); // 流过R3的电流
      const iSeries = totalI - iBranch; // 流过串联部分的电流
      const vSeries = iSeries * seriesR;
      const vR3 = batteryVoltage;
      const powers = [iSeries * iSeries * r1, iSeries * iSeries * r2, iBranch * iBranch * r3];
      return {
        totalR,
        totalI,
        totalV: batteryVoltage,
        totalP: batteryVoltage * totalI,
        branchI: [iSeries, iSeries, iBranch],
        voltages: [iSeries * r1, iSeries * r2, vR3],
        powers,
      };
    }
  }, [circuitType, batteryVoltage, resistances]);

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
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                <span className="text-xl">⚡</span>
              </div>
              <div>
                <h1 className="font-bold text-gray-800">电路串并联</h1>
                <p className="text-sm text-gray-500">交互模拟</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>收藏 0</span>
            <span>|</span>
            <span>Lv.3</span>
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
                  <span>串联电路特点</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-1">•</span>
                  <span>并联电路特点</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-1">•</span>
                  <span>欧姆定律 I=U/R</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-1">•</span>
                  <span>功率公式 P=UI</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-200">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">标</span>
                学习目标
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                理解串并联电路的电流、电压分配规律，掌握欧姆定律和功率计算
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
                  <span>串联分压、并联分流</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500">⚠️</span>
                  <span>并联总电阻小于任一分电阻</span>
                </li>
              </ul>
            </div>
          </div>

          {/* 右侧实验区 */}
          <div className="lg:col-span-2 space-y-4">
            {/* 状态卡片 */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-3 border border-gray-200">
                <p className="text-xs text-gray-500 mb-1">总电压</p>
                <p className="text-lg font-bold text-yellow-600">{calculations.totalV}V</p>
              </div>
              <div className="bg-white rounded-2xl p-3 border border-gray-200">
                <p className="text-xs text-gray-500 mb-1">总电流</p>
                <p className="text-lg font-bold text-orange-600">{calculations.totalI.toFixed(2)}A</p>
              </div>
              <div className="bg-white rounded-2xl p-3 border border-gray-200">
                <p className="text-xs text-gray-500 mb-1">总电阻</p>
                <p className="text-lg font-bold text-blue-600">{calculations.totalR.toFixed(1)}Ω</p>
              </div>
              <div className="bg-white rounded-2xl p-3 border border-gray-200">
                <p className="text-xs text-gray-500 mb-1">总功率</p>
                <p className="text-lg font-bold text-purple-600">{calculations.totalP.toFixed(1)}W</p>
              </div>
            </div>

            {/* 电路图可视化 */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex justify-center">
                {/* SVG 电路图 */}
                <svg width="400" height="200" viewBox="0 0 400 200">
                  {circuitType === 'series' && (
                    <>
                      {/* 串联电路：标准矩形回路 */}
                      {/* 
                        电池竖在左侧，正极(上)→右→R1→R2→右侧向下→底部向左→回到电池负极(下)
                        左侧 x=40, 右侧 x=300, 上方 y=30, 下方 y=160
                      */}

                      {/* 电池 - 左侧竖直放置 */}
                      {/* 正极标记(+) */}
                      <text x="18" y="55" fontSize="12" fill="#E74C3C" fontWeight="bold">+</text>
                      {/* 负极标记(-) */}
                      <text x="20" y="155" fontSize="14" fill="#3498DB" fontWeight="bold">-</text>
                      {/* 电池长线(正极) */}
                      <line x1="30" y1="55" x2="50" y2="55" stroke="#333" strokeWidth="3" />
                      {/* 电池短线(负极) */}
                      <line x1="35" y1="65" x2="45" y2="65" stroke="#333" strokeWidth="2" />
                      {/* 电池长线 */}
                      <line x1="30" y1="75" x2="50" y2="75" stroke="#333" strokeWidth="3" />
                      {/* 电池短线 */}
                      <line x1="35" y1="85" x2="45" y2="85" stroke="#333" strokeWidth="2" />
                      {/* 电池长线 */}
                      <line x1="30" y1="95" x2="50" y2="95" stroke="#333" strokeWidth="3" />
                      {/* 电池电压标注 */}
                      <text x="60" y="80" fontSize="12" fill="#666">{batteryVoltage}V</text>
                      
                      {/* 左侧上方导线：电池正极到顶部 */}
                      <line x1="40" y1="55" x2="40" y2="30" stroke="#333" strokeWidth="2" />
                      {/* 顶部导线：左上角到 R1 */}
                      <line x1="40" y1="30" x2="100" y2="30" stroke="#333" strokeWidth="2" />
                      
                      {/* R1 */}
                      <g transform="translate(100, 15)">
                        <rect x="0" y="0" width="80" height="30" fill={isPowered ? '#E74C3C' : '#ccc'} rx="4" />
                        <text x="40" y="20" textAnchor="middle" fontSize="12" fill="white" fontWeight="bold">{resistances[0]}Ω</text>
                        <text x="40" y="-5" textAnchor="middle" fontSize="10" fill="#666">I={calculations.branchI[0].toFixed(2)}A</text>
                      </g>
                      
                      {/* R1 到 R2 导线 */}
                      <line x1="180" y1="30" x2="210" y2="30" stroke="#333" strokeWidth="2" />
                      
                      {/* R2 */}
                      <g transform="translate(210, 15)">
                        <rect x="0" y="0" width="80" height="30" fill={isPowered ? '#27AE60' : '#ccc'} rx="4" />
                        <text x="40" y="20" textAnchor="middle" fontSize="12" fill="white" fontWeight="bold">{resistances[1]}Ω</text>
                        <text x="40" y="-5" textAnchor="middle" fontSize="10" fill="#666">I={calculations.branchI[0].toFixed(2)}A</text>
                      </g>
                      
                      {/* 顶部导线：R2 到右上角 */}
                      <line x1="290" y1="30" x2="330" y2="30" stroke="#333" strokeWidth="2" />
                      {/* 右侧竖直导线 */}
                      <line x1="330" y1="30" x2="330" y2="160" stroke="#333" strokeWidth="2" />
                      {/* 底部导线：右下角到左下角 */}
                      <line x1="330" y1="160" x2="40" y2="160" stroke="#333" strokeWidth="2" />
                      {/* 左侧下方导线：底部到电池负极 */}
                      <line x1="40" y1="160" x2="40" y2="95" stroke="#333" strokeWidth="2" />

                      {/* 电压标注 */}
                      <text x="200" y="65" textAnchor="middle" fontSize="10" fill="#666">
                        U₁={calculations.voltages[0].toFixed(1)}V
                      </text>
                      <text x="250" y="65" textAnchor="middle" fontSize="10" fill="#666">
                        U₂={calculations.voltages[1].toFixed(1)}V
                      </text>
                    </>
                  )}
                  {circuitType === 'parallel' && (
                    <>
                      {/* 并联电路：标准矩形回路 */}
                      {/*
                        电池竖在左侧，正极(上)→右上到分流节点→上支路R1/下支路R2→汇流节点→右侧向下→底部→回到负极(下)
                        左侧 x=40, 右侧 x=340, 上方 y=30, 下方 y=160
                      */}

                      {/* 电池 - 左侧竖直放置 */}
                      <text x="18" y="55" fontSize="12" fill="#E74C3C" fontWeight="bold">+</text>
                      <text x="20" y="155" fontSize="14" fill="#3498DB" fontWeight="bold">-</text>
                      <line x1="30" y1="55" x2="50" y2="55" stroke="#333" strokeWidth="3" />
                      <line x1="35" y1="65" x2="45" y2="65" stroke="#333" strokeWidth="2" />
                      <line x1="30" y1="75" x2="50" y2="75" stroke="#333" strokeWidth="3" />
                      <line x1="35" y1="85" x2="45" y2="85" stroke="#333" strokeWidth="2" />
                      <line x1="30" y1="95" x2="50" y2="95" stroke="#333" strokeWidth="3" />
                      <text x="60" y="80" fontSize="12" fill="#666">{batteryVoltage}V</text>
                      
                      {/* 左侧上方导线：电池正极到顶部 */}
                      <line x1="40" y1="55" x2="40" y2="30" stroke="#333" strokeWidth="2" />
                      {/* 顶部导线：左上角到分流节点 */}
                      <line x1="40" y1="30" x2="120" y2="30" stroke="#333" strokeWidth="2" />
                      
                      {/* 分流节点 */}
                      <circle cx="120" cy="30" r="4" fill="#333" />
                      
                      {/* 上支路：分流节点到 R1 */}
                      <line x1="120" y1="30" x2="160" y2="30" stroke="#333" strokeWidth="2" />
                      
                      {/* R1 - 上支路 */}
                      <g transform="translate(160, 15)">
                        <rect x="0" y="0" width="80" height="30" fill={isPowered ? '#E74C3C' : '#ccc'} rx="4" />
                        <text x="40" y="20" textAnchor="middle" fontSize="12" fill="white" fontWeight="bold">{resistances[0]}Ω</text>
                        <text x="40" y="-5" textAnchor="middle" fontSize="10" fill="#666">I={calculations.branchI[0].toFixed(2)}A</text>
                      </g>
                      
                      {/* 上支路：R1 到汇流节点 */}
                      <line x1="240" y1="30" x2="280" y2="30" stroke="#333" strokeWidth="2" />

                      {/* 下支路：分流节点向下 */}
                      <line x1="120" y1="30" x2="120" y2="100" stroke="#333" strokeWidth="2" />
                      <line x1="120" y1="100" x2="160" y2="100" stroke="#333" strokeWidth="2" />
                      
                      {/* R2 - 下支路 */}
                      <g transform="translate(160, 85)">
                        <rect x="0" y="0" width="80" height="30" fill={isPowered ? '#27AE60' : '#ccc'} rx="4" />
                        <text x="40" y="20" textAnchor="middle" fontSize="12" fill="white" fontWeight="bold">{resistances[1]}Ω</text>
                        <text x="40" y="45" textAnchor="middle" fontSize="10" fill="#666">I={calculations.branchI[1].toFixed(2)}A</text>
                      </g>

                      {/* 下支路：R2 到汇流节点 */}
                      <line x1="240" y1="100" x2="280" y2="100" stroke="#333" strokeWidth="2" />
                      
                      {/* 汇流节点 */}
                      <circle cx="280" cy="30" r="4" fill="#333" />
                      <line x1="280" y1="30" x2="280" y2="100" stroke="#333" strokeWidth="2" />
                      
                      {/* 顶部导线：汇流节点到右上角 */}
                      <line x1="280" y1="30" x2="340" y2="30" stroke="#333" strokeWidth="2" />
                      {/* 右侧竖直导线 */}
                      <line x1="340" y1="30" x2="340" y2="160" stroke="#333" strokeWidth="2" />
                      {/* 底部导线 */}
                      <line x1="340" y1="160" x2="40" y2="160" stroke="#333" strokeWidth="2" />
                      {/* 左侧下方导线：底部到电池负极 */}
                      <line x1="40" y1="160" x2="40" y2="95" stroke="#333" strokeWidth="2" />
                    </>
                  )}

                  {circuitType === 'both' && (
                    <>
                      {/* 混联电路：R1+R2串联（上支路），再与R3（下支路）并联 */}
                      {/*
                        电池竖在左侧，正极(上)→右上到分流节点→上支路R1+R2/下支路R3→汇流节点→右侧向下→底部→回到负极(下)
                        左侧 x=40, 右侧 x=360, 上方 y=25, 下方 y=160
                      */}

                      {/* 电池 - 左侧竖直放置 */}
                      <text x="18" y="55" fontSize="12" fill="#E74C3C" fontWeight="bold">+</text>
                      <text x="20" y="155" fontSize="14" fill="#3498DB" fontWeight="bold">-</text>
                      <line x1="30" y1="55" x2="50" y2="55" stroke="#333" strokeWidth="3" />
                      <line x1="35" y1="65" x2="45" y2="65" stroke="#333" strokeWidth="2" />
                      <line x1="30" y1="75" x2="50" y2="75" stroke="#333" strokeWidth="3" />
                      <line x1="35" y1="85" x2="45" y2="85" stroke="#333" strokeWidth="2" />
                      <line x1="30" y1="95" x2="50" y2="95" stroke="#333" strokeWidth="3" />
                      <text x="60" y="80" fontSize="12" fill="#666">{batteryVoltage}V</text>
                      
                      {/* 左侧上方导线：电池正极到顶部 */}
                      <line x1="40" y1="55" x2="40" y2="25" stroke="#333" strokeWidth="2" />
                      {/* 顶部导线：左上角到分流节点 */}
                      <line x1="40" y1="25" x2="110" y2="25" stroke="#333" strokeWidth="2" />
                      
                      {/* 分流节点 */}
                      <circle cx="110" cy="25" r="4" fill="#333" />
                      
                      {/* 上支路：分流节点到 R1 */}
                      <line x1="110" y1="25" x2="130" y2="25" stroke="#333" strokeWidth="2" />
                      
                      {/* R1 */}
                      <g transform="translate(130, 10)">
                        <rect x="0" y="0" width="60" height="24" fill={isPowered ? '#E74C3C' : '#ccc'} rx="4" />
                        <text x="30" y="17" textAnchor="middle" fontSize="11" fill="white" fontWeight="bold">{resistances[0]}Ω</text>
                      </g>
                      
                      {/* R1 到 R2 */}
                      <line x1="190" y1="22" x2="210" y2="22" stroke="#333" strokeWidth="2" />
                      
                      {/* R2 */}
                      <g transform="translate(210, 10)">
                        <rect x="0" y="0" width="60" height="24" fill={isPowered ? '#27AE60' : '#ccc'} rx="4" />
                        <text x="30" y="17" textAnchor="middle" fontSize="11" fill="white" fontWeight="bold">{resistances[1]}Ω</text>
                      </g>
                      
                      {/* 上支路：R2 到汇流节点 */}
                      <line x1="270" y1="22" x2="310" y2="22" stroke="#333" strokeWidth="2" />
                      
                      {/* 下支路：分流节点向下 */}
                      <line x1="110" y1="25" x2="110" y2="100" stroke="#333" strokeWidth="2" />
                      <line x1="110" y1="100" x2="150" y2="100" stroke="#333" strokeWidth="2" />
                      
                      {/* R3 */}
                      <g transform="translate(150, 85)">
                        <rect x="0" y="0" width="80" height="24" fill={isPowered ? '#3498DB' : '#ccc'} rx="4" />
                        <text x="40" y="17" textAnchor="middle" fontSize="11" fill="white" fontWeight="bold">{resistances[2]}Ω</text>
                      </g>
                      
                      {/* 下支路：R3 到汇流节点 */}
                      <line x1="230" y1="97" x2="310" y2="97" stroke="#333" strokeWidth="2" />
                      
                      {/* 汇流节点 */}
                      <circle cx="310" cy="22" r="4" fill="#333" />
                      <line x1="310" y1="22" x2="310" y2="97" stroke="#333" strokeWidth="2" />
                      
                      {/* 顶部导线：汇流节点到右上角 */}
                      <line x1="310" y1="22" x2="360" y2="22" stroke="#333" strokeWidth="2" />
                      {/* 右侧竖直导线 */}
                      <line x1="360" y1="22" x2="360" y2="160" stroke="#333" strokeWidth="2" />
                      {/* 底部导线 */}
                      <line x1="360" y1="160" x2="40" y2="160" stroke="#333" strokeWidth="2" />
                      {/* 左侧下方导线：底部到电池负极 */}
                      <line x1="40" y1="160" x2="40" y2="95" stroke="#333" strokeWidth="2" />
                      
                      {/* 标注 */}
                      <text x="200" y="135" textAnchor="middle" fontSize="10" fill="#666">
                        R1+R2串联，再与R3并联
                      </text>
                    </>
                  )}

                  {/* 电流方向指示 */}
                  {isPowered && (
                    <g>
                      <circle cx="60" cy="100" r="6" fill="#FF6B6B">
                        <animate attributeName="r" values="4;6;4" dur="1s" repeatCount="indefinite" />
                      </circle>
                    </g>
                  )}
                </svg>
              </div>
            </div>

            {/* 参数控制 */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200">
              <h3 className="font-bold text-gray-800 mb-4">参数调节</h3>
              
              <div className="space-y-4">
                {/* 电路类型 */}
                <div>
                  <span className="text-gray-600 text-sm">电路类型</span>
                  <div className="flex gap-3 mt-2">
                    {(['series', 'parallel', 'both'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setCircuitType(type)}
                        className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                          circuitType === type
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {type === 'series' ? '🔗 串联' : type === 'parallel' ? '⚡ 并联' : '🔀 混联'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 电源电压 */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">电源电压</span>
                    <span className="font-medium text-yellow-600">{batteryVoltage}V</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="24"
                    value={batteryVoltage}
                    onChange={(e) => setBatteryVoltage(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                  />
                </div>

                {/* 电阻调节 */}
                {resistances.map((r, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">电阻 R{i + 1}</span>
                      <span className="font-medium text-blue-600">{r}Ω</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={r}
                      onChange={(e) => {
                        const newResistances = [...resistances];
                        newResistances[i] = Number(e.target.value);
                        setResistances(newResistances);
                      }}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>
                ))}

                {/* 开关 */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-gray-600">电源开关</span>
                  <button
                    onClick={() => setIsPowered(!isPowered)}
                    className={`w-14 h-8 rounded-full transition-colors ${
                      isPowered ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full shadow transition-transform ${
                      isPowered ? 'translate-x-7' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            </div>

            {/* 各元件参数 */}
            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl p-5 border border-yellow-200">
              <h3 className="font-bold text-yellow-800 mb-3 text-center">各元件参数</h3>
              <div className="grid grid-cols-3 gap-3">
                {resistances.map((r, i) => (
                  <div key={i} className="bg-white/60 rounded-xl p-3 text-center">
                    <div className="font-bold text-gray-800 mb-2">R{i + 1} = {r}Ω</div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>电流: {calculations.branchI[i]?.toFixed(2)}A</div>
                      <div>电压: {calculations.voltages[i]?.toFixed(1)}V</div>
                      <div>功率: {calculations.powers[i]?.toFixed(1)}W</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
