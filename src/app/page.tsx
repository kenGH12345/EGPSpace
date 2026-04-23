'use client';

import React, { useState, useRef, useEffect } from 'react';

// 学科分类数据
const subjects = [
  { id: 'physics', name: '物理', icon: '🔬', color: 'amber', gradient: 'from-amber-500 to-orange-500' },
  { id: 'chemistry', name: '化学', icon: '⚗️', color: 'emerald', gradient: 'from-emerald-500 to-teal-500' },
  { id: 'biology', name: '生物', icon: '🧬', color: 'rose', gradient: 'from-rose-500 to-pink-500' },
  { id: 'math', name: '数学', icon: '📐', color: 'violet', gradient: 'from-violet-500 to-purple-500' },
  { id: 'geography', name: '地理', icon: '🌍', color: 'cyan', gradient: 'from-cyan-500 to-blue-500' },
  { id: 'more', name: '更多', icon: '✨', color: 'slate', gradient: 'from-slate-500 to-gray-500' },
];

// 实验卡片数据 (物理学科示例)
const physicsExperiments = [
  { id: 'lever', title: '杠杆原理', description: '调力臂、改重量，直观看懂杠杆平衡', icon: '⚖️', gradient: 'from-amber-500 to-orange-500' },
  { id: 'refraction', title: '光的折射', description: '换介质、变角度，看清光线曲折', icon: '💡', gradient: 'from-cyan-500 to-blue-500' },
  { id: 'circuit', title: '电路串并联', description: '搭电路、换元件，秒懂串并联', icon: '⚡', gradient: 'from-emerald-500 to-teal-500' },
];

// 各学科实验数据
const subjectExperiments: Record<string, typeof physicsExperiments> = {
  physics: [
    { id: 'lever', title: '杠杆原理', description: '调力臂、改重量，直观看懂杠杆平衡', icon: '⚖️', gradient: 'from-amber-500 to-orange-500' },
    { id: 'refraction', title: '光的折射', description: '换介质、变角度，看清光线曲折', icon: '💡', gradient: 'from-cyan-500 to-blue-500' },
    { id: 'circuit', title: '电路串并联', description: '搭电路、换元件，秒懂串并联', icon: '⚡', gradient: 'from-emerald-500 to-teal-500' },
  ],
  chemistry: [
    { id: 'acid-base', title: '酸碱滴定', description: '滴定操作、指示剂变色', icon: '🧪', gradient: 'from-red-500 to-orange-500' },
    { id: 'electrolyte', title: '电解原理', description: '电解池反应、金属析出', icon: '⚗️', gradient: 'from-yellow-500 to-amber-500' },
    { id: 'combustion', title: '燃烧反应', description: '燃烧条件、灭火原理', icon: '🔥', gradient: 'from-orange-500 to-red-500' },
  ],
  biology: [
    { id: 'cell', title: '细胞结构', description: '细胞器功能、物质运输', icon: '🧬', gradient: 'from-pink-500 to-rose-500' },
    { id: 'photosynthesis', title: '光合作用', description: '光反应、暗反应过程', icon: '🌱', gradient: 'from-green-500 to-emerald-500' },
    { id: 'inheritance', title: '遗传规律', description: '基因分离、自由组合', icon: '🧗', gradient: 'from-violet-500 to-purple-500' },
  ],
  math: [
    { id: 'function', title: '函数图像', description: '一次函数、二次函数', icon: '📈', gradient: 'from-blue-500 to-indigo-500' },
    { id: 'geometry', title: '几何证明', description: '全等、相似三角形', icon: '📐', gradient: 'from-cyan-500 to-blue-500' },
    { id: 'calculus', title: '微积分入门', description: '导数、积分概念', icon: '∞', gradient: 'from-purple-500 to-pink-500' },
  ],
  geography: [
    { id: 'plate', title: '板块运动', description: '大陆漂移、地震火山', icon: '🌋', gradient: 'from-orange-500 to-red-500' },
    { id: 'atmosphere', title: '大气环流', description: '风带、气压带形成', icon: '💨', gradient: 'from-sky-500 to-blue-500' },
    { id: 'water', title: '水循环', description: '蒸发、降水、径流', icon: '💧', gradient: 'from-cyan-500 to-blue-500' },
  ],
};

// 功能标签
const tabs = [
  { id: 'qa', label: '问一问' },
  { id: 'simulate', label: '交互模拟' },
  { id: '3d', label: '3D学习' },
  { id: 'ar', label: 'AR手势实验室' },
  { id: 'chart', label: '图表生成' },
];

// 生成结果类型
interface GeneratedExperiment {
  name: string;
  description: string;
  subject: string;
  icon: string;
  gradient: string;
  knowledge: string[];
}

export default function HomePage() {
  const [activeSubject, setActiveSubject] = useState('physics');
  const [activeTab, setActiveTab] = useState('simulate');
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [generatedExp, setGeneratedExp] = useState<GeneratedExperiment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentExperiments = subjectExperiments[activeSubject] || physicsExperiments;

  const handleExperimentClick = (id: string) => {
    window.location.href = `/experiments/${id}`;
  };

  const handleGenerate = async () => {
    if (!inputValue.trim() || isGenerating) return;

    setIsGenerating(true);
    setError(null);
    setShowResult(true);
    setGeneratedExp(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concept: inputValue.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '生成失败');
      }

      if (data.success && data.experiment) {
        setGeneratedExp(data.experiment);
        // 生成完成后自动跳转到实验页面
        const experimentId = mapConceptToExperiment(data.experiment);
        // 使用 sessionStorage 存储配置，避免 URL 长度限制
        sessionStorage.setItem('eureka_experiment_config', JSON.stringify(data.experiment));
        window.location.href = `/experiments/${experimentId}`;
      } else {
        throw new Error('未能生成有效实验');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败，请重试');
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  // 将概念映射到实验ID
  const mapConceptToExperiment = (exp: GeneratedExperiment): string => {
    const name = exp.name.toLowerCase();
    const desc = (exp.description + ' ' + (exp.knowledge?.join(' ') || '')).toLowerCase();
    
    if (name.includes('浮力') || desc.includes('浮力') || desc.includes('阿基米德') || name.includes('物体')) {
      return 'buoyancy';
    }
    if (name.includes('杠杆') || desc.includes('杠杆')) {
      return 'lever';
    }
    if (name.includes('折射') || desc.includes('折射') || desc.includes('光线')) {
      return 'refraction';
    }
    if (name.includes('电路') || desc.includes('串并联') || desc.includes('欧姆') || desc.includes('电流')) {
      return 'circuit';
    }
    if (name.includes('酸碱') || desc.includes('滴定') || desc.includes('指示剂') || desc.includes('ph')) {
      return 'acid-base';
    }
    return 'buoyancy';
  };

  const handleGoToExperiment = () => {
    if (generatedExp) {
      setShowResult(false);
      setInputValue('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #FFF8F0 0%, #FFF5E6 100%)' }}>
      {/* 主内容区 */}
      <div className="flex-1 pb-24">
        <div className="max-w-4xl mx-auto px-6 pt-8">
          {/* 头部标识 */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-xl">🤖</span>
            </div>
            <span className="text-sm text-amber-600 bg-amber-100 px-3 py-1 rounded-full font-medium">AI生成</span>
          </div>

          {/* 欢迎语 */}
          <h1 className="text-2xl font-bold text-gray-800 mb-3">
            欢迎来到Eureka！
          </h1>
          <p className="text-gray-600 mb-6 leading-relaxed">
            输入任意概念，快速生成可交互虚拟实验，亲手调参数、直观懂原理。
          </p>

          {/* 学科快捷入口 */}
          <div className="mb-6">
            <p className="text-gray-700 mb-4 flex items-center gap-2">
              <span>🍀</span>
              <span>选择学科，开始探索</span>
            </p>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {subjects.map((subject) => (
                <button
                  key={subject.id}
                  onClick={() => setActiveSubject(subject.id)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-300 ${
                    activeSubject === subject.id
                      ? `bg-gradient-to-br ${subject.gradient} border-transparent text-white shadow-lg scale-105`
                      : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <span className={`text-3xl ${activeSubject === subject.id ? 'filter brightness-0 invert' : ''}`}>
                    {subject.icon}
                  </span>
                  <span className="font-medium text-sm">{subject.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 实验卡片 */}
          <div className="mt-8">
            <p className="text-gray-700 mb-4 flex items-center gap-2">
              <span>📚</span>
              <span>{subjects.find(s => s.id === activeSubject)?.name}实验</span>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {currentExperiments.map((exp) => (
                <button
                  key={exp.id}
                  onClick={() => handleExperimentClick(exp.id)}
                  className="bg-white rounded-2xl p-5 text-left border border-gray-200 hover:border-amber-300 hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${exp.gradient} rounded-xl flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform flex-shrink-0`}>
                      {exp.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800 mb-1 group-hover:text-amber-600 transition-colors">{exp.title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{exp.description}</p>
                    </div>
                    <div className="flex items-center text-gray-400 group-hover:text-amber-500 transition-colors flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14" />
                        <path d="m12 5 7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 底部功能栏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-4xl mx-auto px-6 py-4">
          {/* 功能标签 */}
          <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-amber-100 text-amber-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 输入区域 */}
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="今天想弄懂什么"
                className="w-full h-12 px-4 pr-12 rounded-xl border border-gray-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none text-gray-800 placeholder-gray-400"
              />
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !inputValue.trim()}
                className={`absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  isGenerating || !inputValue.trim()
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-amber-500 hover:bg-amber-600'
                }`}
              >
                {isGenerating ? (
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 2L11 13" />
                    <path d="M22 2L15 22 11 13 2 9 22 2Z" />
                  </svg>
                )}
              </button>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" x2="20" y1="12" y2="12" />
                  <line x1="4" x2="20" y1="6" y2="6" />
                  <line x1="4" x2="20" y1="18" y2="18" />
                </svg>
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" x2="12" y1="3" y2="15" />
                </svg>
              </button>
              <div className="flex items-center gap-2 border-l border-gray-300 pl-4">
                <div className="text-xs text-gray-500">
                  <div className="font-medium">MiniMax M2.7</div>
                  <div className="text-gray-400">↵ 发送 | Shift+↵ 换行</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 生成结果弹窗 */}
      {showResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-auto">
            {/* 弹窗头部 */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                  <span className="text-xl">🤖</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">AI 实验生成器</h3>
                  <p className="text-xs text-gray-500">正在为「{inputValue}」生成内容</p>
                </div>
              </div>
              <button
                onClick={() => setShowResult(false)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18" /><path d="M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 弹窗内容 */}
            <div className="p-4">
              {isGenerating && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
                    <span className="text-3xl">🧪</span>
                  </div>
                  <p className="text-gray-600">正在分析「{inputValue}」...</p>
                  <p className="text-sm text-gray-400 mt-2">设计交互式实验方案</p>
                </div>
              )}

              {error && !isGenerating && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-3xl">❌</span>
                  </div>
                  <p className="text-red-600 font-medium">{error}</p>
                  <button
                    onClick={handleGenerate}
                    className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                  >
                    重试
                  </button>
                </div>
              )}

              {generatedExp && !isGenerating && (
                <div className="space-y-4">
                  {/* 生成的实验卡片 */}
                  <div className={`bg-gradient-to-br ${generatedExp.gradient || 'from-amber-500 to-orange-500'} rounded-xl p-4 text-white`}>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-4xl">{generatedExp.icon || '🔬'}</span>
                      <div>
                        <h4 className="font-bold text-lg">{generatedExp.name}</h4>
                        <p className="text-sm opacity-90">{generatedExp.subject?.toUpperCase() || '科学实验'}</p>
                      </div>
                    </div>
                    <p className="text-sm opacity-90 leading-relaxed">{generatedExp.description}</p>
                  </div>

                  {/* 知识点 */}
                  {generatedExp.knowledge && generatedExp.knowledge.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h5 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                        <span className="text-purple-500">📚</span>
                        核心知识点
                      </h5>
                      <ul className="space-y-1">
                        {generatedExp.knowledge.map((k, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-purple-500 mt-0.5">•</span>
                            <span>{k}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 操作按钮 */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowResult(false)}
                      className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                    >
                      关闭
                    </button>
                    <button
                      onClick={handleGoToExperiment}
                      className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                    >
                      开始实验 →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
