'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';

export default function CircuitExperimentPage() {
  const [circuitType, setCircuitType] = useState<'series' | 'parallel' | 'both'>('series');
  const [batteryVoltage, setBatteryVoltage] = useState(12);
  const [resistances, setResistances] = useState([10, 20]);
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
      // 混联: R1与R2并联
      const r1 = resistances[0] || 10;
      const r2 = resistances[1] || 10;
      const totalR = 1 / (1/r1 + 1/r2);
      const totalI = batteryVoltage / totalR;
      const i1 = batteryVoltage / r1;
      const i2 = batteryVoltage / r2;
      const powers = [i1 * i1 * r1, i2 * i2 * r2];
      return {
        totalR,
        totalI,
        totalV: batteryVoltage,
        totalP: batteryVoltage * totalI,
        branchI: [i1, i2],
        voltages: [batteryVoltage, batteryVoltage],
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
                  {/* 
                    标准教学电路图样式
                    - 电源在左侧，电池符号（长短线）
                    - 电阻为3段锯齿波形
                    - 标注：R=XXΩ在上方，I(红)在下方，U(蓝)在下方
                  */}

                  {circuitType === 'series' && (
                    <>
                      {/* 串联电路 - 水平线性布局 */}
                      {/* 电源 */}
                      <g transform="translate(40, 70)">
                        {/* 正极（长线） */}
                        <line x1="0" y1="0" x2="0" y2="-20" stroke="#333" strokeWidth="2" />
                        <line x1="-5" y1="-20" x2="5" y2="-20" stroke="#E74C3C" strokeWidth="3" />
                        <text x="8" y="-17" fontSize="10" fill="#E74C3C">+</text>
                        {/* 负极（短线） */}
                        <line x1="-5" y1="-8" x2="5" y2="-8" stroke="#333" strokeWidth="2" />
                        <line x1="0" y1="-8" x2="0" y2="0" stroke="#333" strokeWidth="2" />
                        <text x="0" y="15" textAnchor="middle" fontSize="11" fill="#666">{batteryVoltage}V</text>
                      </g>

                      {/* 顶部导线：电源正极 → R1 → R2 → 右侧 */}
                      <line x1="40" y1="50" x2="120" y2="50" stroke="#333" strokeWidth="2" />

                      {/* R1 - 3段锯齿 */}
                      <g transform="translate(120, 35)">
                        <text x="35" y="-5" textAnchor="middle" fontSize="11" fill="#333" fontWeight="bold">R₁={resistances[0]}Ω</text>
                        {/* 连接线 */}
                        <line x1="0" y1="15" x2="8" y2="15" stroke="#333" strokeWidth="2" />
                        {/* 3段锯齿 */}
                        <polyline points="8,15 13,8 18,22 23,8 28,22 33,8 38,22 43,8 48,22 53,8 58,22 62,15" fill="none" stroke={isPowered ? '#E74C3C' : '#ccc'} strokeWidth="2" />
                        {/* 连接线 */}
                        <line x1="62" y1="15" x2="70" y2="15" stroke="#333" strokeWidth="2" />
                        {/* 电流电压标注 */}
                        <text x="35" y="32" textAnchor="middle" fontSize="10" fill="#E74C3C">I={calculations.branchI[0].toFixed(2)}A</text>
                        <text x="35" y="44" textAnchor="middle" fontSize="10" fill="#3498DB">U={calculations.voltages[0].toFixed(1)}V</text>
                      </g>

                      {/* 导线：R1 → R2 */}
                      <line x1="190" y1="50" x2="220" y2="50" stroke="#333" strokeWidth="2" />

                      {/* R2 - 3段锯齿 */}
                      <g transform="translate(220, 35)">
                        <text x="35" y="-5" textAnchor="middle" fontSize="11" fill="#333" fontWeight="bold">R₂={resistances[1]}Ω</text>
                        {/* 连接线 */}
                        <line x1="0" y1="15" x2="8" y2="15" stroke="#333" strokeWidth="2" />
                        {/* 3段锯齿 */}
                        <polyline points="8,15 13,8 18,22 23,8 28,22 33,8 38,22 43,8 48,22 53,8 58,22 62,15" fill="none" stroke={isPowered ? '#27AE60' : '#ccc'} strokeWidth="2" />
                        {/* 连接线 */}
                        <line x1="62" y1="15" x2="70" y2="15" stroke="#333" strokeWidth="2" />
                        {/* 电流电压标注 */}
                        <text x="35" y="32" textAnchor="middle" fontSize="10" fill="#E74C3C">I={calculations.branchI[0].toFixed(2)}A</text>
                        <text x="35" y="44" textAnchor="middle" fontSize="10" fill="#3498DB">U={calculations.voltages[1].toFixed(1)}V</text>
                      </g>

                      {/* 右侧导线向下 */}
                      <line x1="290" y1="50" x2="290" y2="70" stroke="#333" strokeWidth="2" />

                      {/* 底部导线回到电源负极 */}
                      <line x1="290" y1="70" x2="40" y2="70" stroke="#333" strokeWidth="2" />

                      {/* 电流方向箭头 */}
                      {isPowered && (
                        <>
                          <polygon points="80,45 75,42 75,48" fill="#E74C3C" />
                          <polygon points="180,45 175,42 175,48" fill="#E74C3C" />
                          <polygon points="250,45 245,42 245,48" fill="#E74C3C" />
                        </>
                      )}
                    </>
                  )}
                  {circuitType === 'parallel' && (
                    <>
                      {/* Parallel circuit - H-topology */}
                      {/* Battery on left vertical rail */}
                      <g transform="translate(40, 80)">
                        {/* Positive terminal (long line) */}
                        <line x1="0" y1="-18" x2="0" y2="18" stroke="#333" strokeWidth="2" />
                        <line x1="-5" y1="-18" x2="5" y2="-18" stroke="#E74C3C" strokeWidth="3" />
                        <text x="8" y="-15" fontSize="10" fill="#E74C3C">+</text>
                        {/* Negative terminal (short line) */}
                        <line x1="-5" y1="18" x2="5" y2="18" stroke="#333" strokeWidth="2" />
                        <text x="0" y="35" textAnchor="middle" fontSize="11" fill="#666">{batteryVoltage}V</text>
                      </g>

                      {/* Left rail: battery top → split junction */}
                      <line x1="40" y1="62" x2="40" y2="25" stroke="#333" strokeWidth="2" />
                      <line x1="40" y1="25" x2="90" y2="25" stroke="#333" strokeWidth="2" />

                      {/* Left split junction */}
                      <circle cx="90" cy="25" r="4" fill="#333" />
                      <circle cx="90" cy="115" r="4" fill="#333" />
                      {/* Left vertical rail connecting split points */}
                      <line x1="90" y1="25" x2="90" y2="115" stroke="#333" strokeWidth="2" />

                      {/* Top branch: R1 */}
                      <g transform="translate(110, 10)">
                        <text x="40" y="0" textAnchor="middle" fontSize="11" fill="#333" fontWeight="bold">R₁={resistances[0]}Ω</text>
                        <line x1="0" y1="15" x2="10" y2="15" stroke="#333" strokeWidth="2" />
                        <polyline points="10,15 15,8 20,22 25,8 30,22 35,8 40,22 45,8 50,22 55,8 60,22 65,8 70,15" fill="none" stroke={isPowered ? '#E74C3C' : '#ccc'} strokeWidth="2" />
                        <line x1="70" y1="15" x2="80" y2="15" stroke="#333" strokeWidth="2" />
                        <text x="40" y="33" textAnchor="middle" fontSize="10" fill="#E74C3C">I₁={calculations.branchI[0].toFixed(2)}A</text>
                        <text x="40" y="45" textAnchor="middle" fontSize="10" fill="#3498DB">U={batteryVoltage}V</text>
                      </g>

                      {/* Bottom branch: R2 */}
                      <g transform="translate(110, 100)">
                        <text x="40" y="0" textAnchor="middle" fontSize="11" fill="#333" fontWeight="bold">R₂={resistances[1]}Ω</text>
                        <line x1="0" y1="15" x2="10" y2="15" stroke="#333" strokeWidth="2" />
                        <polyline points="10,15 15,8 20,22 25,8 30,22 35,8 40,22 45,8 50,22 55,8 60,22 65,8 70,15" fill="none" stroke={isPowered ? '#27AE60' : '#ccc'} strokeWidth="2" />
                        <line x1="70" y1="15" x2="80" y2="15" stroke="#333" strokeWidth="2" />
                        <text x="40" y="33" textAnchor="middle" fontSize="10" fill="#E74C3C">I₂={calculations.branchI[1].toFixed(2)}A</text>
                        <text x="40" y="45" textAnchor="middle" fontSize="10" fill="#3498DB">U={batteryVoltage}V</text>
                      </g>

                      {/* Right merge junction */}
                      <circle cx="280" cy="25" r="4" fill="#333" />
                      <circle cx="280" cy="115" r="4" fill="#333" />
                      {/* Right vertical rail connecting merge points */}
                      <line x1="280" y1="25" x2="280" y2="115" stroke="#333" strokeWidth="2" />

                      {/* Top branch wires: split → R1 → merge */}
                      <line x1="90" y1="25" x2="110" y2="25" stroke="#333" strokeWidth="2" />
                      <line x1="190" y1="25" x2="280" y2="25" stroke="#333" strokeWidth="2" />

                      {/* Bottom branch wires: split → R2 → merge */}
                      <line x1="90" y1="115" x2="110" y2="115" stroke="#333" strokeWidth="2" />
                      <line x1="190" y1="115" x2="280" y2="115" stroke="#333" strokeWidth="2" />

                      {/* Right rail: merge → right edge → bottom → back to battery */}
                      <line x1="280" y1="70" x2="330" y2="70" stroke="#333" strokeWidth="2" />
                      <line x1="330" y1="70" x2="330" y2="155" stroke="#333" strokeWidth="2" />
                      <line x1="330" y1="155" x2="40" y2="155" stroke="#333" strokeWidth="2" />
                      <line x1="40" y1="155" x2="40" y2="98" stroke="#333" strokeWidth="2" />

                      {/* Current direction arrows */}
                      {isPowered && (
                        <>
                          <polygon points="160,20 155,17 155,23" fill="#E74C3C" />
                          <polygon points="160,110 155,107 155,113" fill="#E74C3C" />
                          <polygon points="300,65 297,60 303,60" fill="#E74C3C" />
                          <polygon points="185,150 180,147 180,153" fill="#E74C3C" />
                        </>
                      )}
                    </>
                  )}

                  {circuitType === 'both' && (
                    <>
                      {/* 混联电路 - 标准锯齿符号 */}
                      {/* 电源 */}
                      <g transform="translate(40, 70)">
                        <line x1="0" y1="0" x2="0" y2="-20" stroke="#333" strokeWidth="2" />
                        <line x1="-5" y1="-20" x2="5" y2="-20" stroke="#E74C3C" strokeWidth="3" />
                        <text x="8" y="-17" fontSize="10" fill="#E74C3C">+</text>
                        <line x1="-5" y1="-8" x2="5" y2="-8" stroke="#333" strokeWidth="2" />
                        <line x1="0" y1="-8" x2="0" y2="0" stroke="#333" strokeWidth="2" />
                        <text x="0" y="15" textAnchor="middle" fontSize="11" fill="#666">{batteryVoltage}V</text>
                      </g>

                      {/* 电源正极到顶部 */}
                      <line x1="40" y1="50" x2="40" y2="20" stroke="#333" strokeWidth="2" />
                      <line x1="40" y1="20" x2="320" y2="20" stroke="#333" strokeWidth="2" />

                      {/* 分流点 */}
                      <circle cx="120" cy="20" r="4" fill="#333" />
                      <circle cx="260" cy="20" r="4" fill="#333" />
                      <circle cx="320" cy="20" r="4" fill="#333" />

                      {/* 上支路：R1串联R2 */}
                      <g transform="translate(80, 5)">
                        <text x="35" y="-5" textAnchor="middle" fontSize="10" fill="#333">R₁={resistances[0]}Ω</text>
                        <line x1="0" y1="15" x2="8" y2="15" stroke="#333" strokeWidth="2" />
                        <polyline points="8,15 13,8 18,22 23,8 28,22 33,8 38,22 43,8 48,22 53,8 58,22 62,15" fill="none" stroke={isPowered ? '#E74C3C' : '#ccc'} strokeWidth="2" />
                        <line x1="62" y1="15" x2="70" y2="15" stroke="#333" strokeWidth="2" />
                      </g>
                      <line x1="150" y1="20" x2="160" y2="20" stroke="#333" strokeWidth="2" />
                      <g transform="translate(160, 5)">
                        <text x="35" y="-5" textAnchor="middle" fontSize="10" fill="#333">R₂={resistances[1]}Ω</text>
                        <line x1="0" y1="15" x2="8" y2="15" stroke="#333" strokeWidth="2" />
                        <polyline points="8,15 13,8 18,22 23,8 28,22 33,8 38,22 43,8 48,22 53,8 58,22 62,15" fill="none" stroke={isPowered ? '#27AE60' : '#ccc'} strokeWidth="2" />
                        <line x1="62" y1="15" x2="70" y2="15" stroke="#333" strokeWidth="2" />
                      </g>

                      {/* 下支路 R3 */}
                      <g transform="translate(80, 50)">
                        <text x="35" y="55" textAnchor="middle" fontSize="10" fill="#333">R₃={resistances[0]}Ω</text>
                        <line x1="0" y1="40" x2="8" y2="40" stroke="#333" strokeWidth="2" />
                        <polyline points="8,40 13,33 18,47 23,33 28,47 33,33 38,47 43,33 48,47 53,33 58,47 62,40" fill="none" stroke={isPowered ? '#3498DB' : '#ccc'} strokeWidth="2" />
                        <line x1="62" y1="40" x2="70" y2="40" stroke="#333" strokeWidth="2" />
                      </g>

                      {/* 下支路导线 */}
                      <line x1="100" y1="60" x2="100" y2="70" stroke="#333" strokeWidth="2" />
                      <circle cx="120" cy="70" r="4" fill="#333" />
                      <circle cx="260" cy="70" r="4" fill="#333" />
                      <line x1="120" y1="70" x2="260" y2="70" stroke="#333" strokeWidth="2" />
                      <line x1="260" y1="70" x2="260" y2="20" stroke="#333" strokeWidth="2" />

                      {/* 汇流节点到右侧 */}
                      <line x1="260" y1="20" x2="320" y2="20" stroke="#333" strokeWidth="2" />

                      {/* 右侧导线向下到底部 */}
                      <line x1="320" y1="20" x2="320" y2="70" stroke="#333" strokeWidth="2" />
                      <line x1="320" y1="70" x2="40" y2="70" stroke="#333" strokeWidth="2" />

                      {/* 电流标注 */}
                      {isPowered && (
                        <>
                          <text x="150" y="38" textAnchor="middle" fontSize="9" fill="#E74C3C">I={calculations.branchI[0].toFixed(2)}A</text>
                          <text x="150" y="88" textAnchor="middle" fontSize="9" fill="#E74C3C">I={calculations.branchI[1].toFixed(2)}A</text>
                        </>
                      )}
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
