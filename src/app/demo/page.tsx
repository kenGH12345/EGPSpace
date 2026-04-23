'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Play,
  RotateCcw,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  FlaskConical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  generationRules,
  matchGenerationRule,
  generateFromRule,
  ExperimentSchema,
  qualityCriteria,
} from '@/lib/experiment-methodology';

// ========== 演示数据 ==========
const demoConcepts = [
  {
    concept: '自由落体运动',
    domain: 'physics.mechanics',
    knowledgePoints: ['自由落体运动的定义', '重力加速度', '速度公式'],
    formulas: ['h = ½gt²', 'v = gt', 'v² = 2gh'],
  },
  {
    concept: '凸透镜成像',
    domain: 'physics.optics',
    knowledgePoints: ['物距与像距的关系', '成像规律', '放大率'],
    formulas: ['1/u + 1/v = 1/f', 'm = -v/u'],
  },
  {
    concept: '欧姆定律',
    domain: 'physics.electromagnetism',
    knowledgePoints: ['电压、电流、电阻关系', '欧姆定律', '功率计算'],
    formulas: ['V = IR', 'P = UI'],
  },
];

// ========== 通用实验画布组件 ==========
interface ExperimentCanvasProps {
  experiment: ExperimentSchema;
  params: Record<string, number>;
  computed: Record<string, number>;
  isPlaying: boolean;
  onParamChange: (key: string, value: number) => void;
  onStart: () => void;
  onReset: () => void;
  onUpdate: () => void;
}

const ExperimentCanvas: React.FC<ExperimentCanvasProps> = ({
  experiment,
  params,
  computed,
  isPlaying,
  onParamChange,
  onStart,
  onReset,
  onUpdate,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const [time, setTime] = useState(0);

  // 绘制实验
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // 清空
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, w, h);

    // 绘制刻度尺
    ctx.strokeStyle = '#E0E0E0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const y = h - 50 - i * 30;
      ctx.beginPath();
      ctx.moveTo(50, y);
      ctx.lineTo(w - 20, y);
      ctx.stroke();
      ctx.fillStyle = '#888';
      ctx.font = '11px system-ui';
      ctx.textAlign = 'right';
      ctx.fillText(`${i * 10}m`, 45, y + 4);
    }

    // 绘制地面
    ctx.fillStyle = '#E8E8E8';
    ctx.fillRect(0, h - 50, w, 50);

    // 根据实验类型绘制不同内容
    const topic = experiment.meta.topic ?? '';
    const name = experiment.meta.name ?? '';
    
    if ((topic.includes('mechanics') || topic.includes('落体') || name.includes('落体'))) {
      // 绘制小球
      const ballY = h - 50 - computed.currentHeight;
      const ballX = w / 2;
      const ballR = 18;

      // 阴影
      ctx.beginPath();
      ctx.ellipse(ballX + 3, h - 47, ballR, 6, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      ctx.fill();

      // 小球
      const gradient = ctx.createRadialGradient(ballX - 4, ballY - 4, 0, ballX, ballY, ballR);
      gradient.addColorStop(0, '#FFB366');
      gradient.addColorStop(1, '#FF8C00');
      ctx.beginPath();
      ctx.arc(ballX, ballY, ballR, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // 高光
      ctx.beginPath();
      ctx.arc(ballX - 5, ballY - 5, 5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fill();

      // 拖拽提示
      if (!isPlaying) {
        ctx.fillStyle = '#555';
        ctx.beginPath();
        ctx.roundRect(ballX - 65, ballY - 50, 130, 28, 6);
        ctx.fill();
        ctx.fillStyle = '#FFF';
        ctx.font = '12px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('拖动改变高度', ballX, ballY - 31);
      }
    }

    // v-t 图表
    const chartX = w - 160;
    const chartY = 20;
    const chartW = 140;
    const chartH = 100;

    ctx.fillStyle = '#FAFAFA';
    ctx.beginPath();
    ctx.roundRect(chartX, chartY, chartW, chartH, 8);
    ctx.fill();
    ctx.strokeStyle = '#DDD';
    ctx.stroke();

    ctx.fillStyle = '#666';
    ctx.font = '10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('v-t', chartX + chartW / 2, chartY + 14);

    // 坐标轴
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(chartX + 20, chartY + 20);
    ctx.lineTo(chartX + 20, chartY + chartH - 15);
    ctx.lineTo(chartX + chartW - 10, chartY + chartH - 15);
    ctx.stroke();

    // 绘制速度曲线（简化的直线 v = gt）
    if (time > 0) {
      const maxV = Math.sqrt(2 * params.height * params.gravity);
      const maxT = Math.sqrt(2 * params.height / params.gravity);
      
      ctx.strokeStyle = '#FF8C00';
      ctx.lineWidth = 2;
      ctx.beginPath();
      const startX = chartX + 20;
      const startY = chartY + chartH - 15;
      const endX = chartX + 20 + ((chartW - 30) * time) / maxT;
      const endY = startY - ((chartH - 35) * computed.velocity) / maxV;
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, Math.max(endY, chartY + 20));
      ctx.stroke();
    }
  }, [experiment, params, computed, time, isPlaying]);

  // 动画循环
  useEffect(() => {
    if (!isPlaying) {
      draw();
      return;
    }

    let lastTime = 0;
    const animate = (timestamp: number) => {
      if (!lastTime) lastTime = timestamp;
      const dt = (timestamp - lastTime) / 1000;
      lastTime = timestamp;

      const g = params.gravity;
      const h0 = params.height;
      const t = Math.sqrt((2 * h0) / g);

      setTime((prev) => {
        const newTime = prev + dt;
        if (newTime >= t) {
          return t;
        }
        return newTime;
      });

      onUpdate();
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, params, onUpdate]);

  // 持续绘制
  useEffect(() => {
    draw();
  }, [draw, time]);

  // 拖拽处理
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isPlaying) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    const ballX = canvas.width / 2;
    const ballY = canvas.height - 50 - computed.currentHeight;

    const dist = Math.sqrt((mouseX - ballX) ** 2 + (mouseY - ballY) ** 2);
    if (dist < 30) {
      const handleMove = (moveE: MouseEvent) => {
        const y = (moveE.clientY - rect.top) * scaleY;
        const newH = Math.max(0, Math.min(100, (canvas.height - 50 - y) / (canvas.height - 80) * 100));
        onParamChange('height', Math.round(newH));
      };
      const handleUp = () => {
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('mouseup', handleUp);
      };
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleUp);
    }
  }, [isPlaying, computed.currentHeight, onParamChange]);

  return (
    <Card className="rounded-2xl overflow-hidden shadow-lg">
      <canvas
        ref={canvasRef}
        width={560}
        height={380}
        className="w-full cursor-pointer"
        style={{ maxHeight: 380 }}
        onMouseDown={handleMouseDown}
      />
    </Card>
  );
};

// ========== 主页面 ==========
export default function UniversalExperimentDemo() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnalysis, setShowAnalysis] = useState(true);
  const [experiment, setExperiment] = useState<ExperimentSchema | null>(null);
  
  // 参数状态
  const [params, setParams] = useState({
    height: 80,
    gravity: 9.8,
  });
  const [computed, setComputed] = useState({
    currentHeight: 80,
    velocity: 0,
    time: 0,
  });
  const [isPlaying, setIsPlaying] = useState(false);

  const currentConcept = demoConcepts[currentIndex];

  // 生成实验配置
  useEffect(() => {
    const rule = matchGenerationRule(currentConcept.concept);
    if (rule) {
      const exp = generateFromRule(currentConcept.concept, rule);
      setExperiment(exp);
    } else {
      // 默认生成
      setExperiment({
        meta: {
          name: currentConcept.concept,
          subject: 'physics',
          topic: currentConcept.domain,
          description: '交互实验',
          icon: '🔬',
          gradient: 'from-blue-500 to-cyan-500',
          physicsType: 'generic',
        },
        params: [
          { name: 'height', label: '高度', unit: 'm', defaultValue: 80, min: 0, max: 100, step: 1, category: 'input', description: '' },
          { name: 'gravity', label: '重力', unit: 'm/s²', defaultValue: 9.8, min: 1, max: 20, step: 0.1, category: 'input', description: '' },
        ],
        formulas: currentConcept.formulas.map((f, i) => ({
          name: `公式${i + 1}`,
          expression: f,
          description: '',
          variables: [],
          resultVariable: `result${i}`,
        })),
        canvas: { layout: { width: 560, height: 280, background: '#ffffff' }, elements: [] },
        physics: { engine: 'generic', equations: [] },
        interactions: { sliders: [] },
        teaching: {},
        scenes: [],
      });
    }
  }, [currentConcept]);

  const handleParamChange = useCallback((key: string, value: number) => {
    setParams((prev) => ({ ...prev, [key]: value }));
    if (key === 'height') {
      setComputed((prev) => ({ ...prev, currentHeight: value }));
    }
  }, []);

  const handleStart = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setComputed({ currentHeight: params.height, velocity: 0, time: 0 });
  }, [params.height]);

  const handleUpdate = useCallback(() => {
    const g = params.gravity;
    const h0 = params.height;
    const t = Math.sqrt((2 * h0) / g);
    const currentTime = computed.time;
    
    const newHeight = Math.max(0, h0 - 0.5 * g * currentTime * currentTime);
    const newVelocity = g * currentTime;
    
    setComputed({
      currentHeight: newHeight,
      velocity: newVelocity,
      time: currentTime,
    });
  }, [params, computed.time]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + demoConcepts.length) % demoConcepts.length);
    handleReset();
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % demoConcepts.length);
    handleReset();
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAF7' }}>
      {/* 顶部导航 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => setShowAnalysis(!showAnalysis)} className="text-gray-600">
                {showAnalysis ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                {showAnalysis ? '隐藏' : '显示'}分析
              </Button>
              <div className="h-6 w-px bg-gray-200" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{currentConcept.concept}</h1>
                  <p className="text-sm text-gray-500">通用实验生成演示</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePrev}>上一个</Button>
              <Badge className="bg-indigo-50 text-indigo-600">{currentIndex + 1}/{demoConcepts.length}</Badge>
              <Button variant="outline" size="sm" onClick={handleNext}>下一个</Button>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容 */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-6">
          {/* 左侧：知识分析 */}
          {showAnalysis && (
            <div className="w-80 flex-shrink-0 space-y-4">
              <Card className="border-2 border-blue-100 rounded-2xl overflow-hidden">
                <CardHeader className="bg-blue-50 py-3">
                  <CardTitle className="text-blue-800 text-sm">核心知识点</CardTitle>
                </CardHeader>
                <CardContent className="pt-3 space-y-2">
                  {currentConcept.knowledgePoints.map((p, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs">{i + 1}</span>
                      {p}
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-2 border-orange-100 rounded-2xl overflow-hidden">
                <CardHeader className="bg-orange-50 py-3">
                  <CardTitle className="text-orange-800 text-sm flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" /> 公式
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-3 space-y-2">
                  {currentConcept.formulas.map((f, i) => (
                    <div key={i} className="bg-white rounded-xl p-2 text-center font-mono text-orange-500 font-bold text-sm shadow-sm">
                      {f}
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-2 border-green-100 rounded-2xl overflow-hidden">
                <CardHeader className="bg-green-50 py-3">
                  <CardTitle className="text-green-800 text-sm">生成规则</CardTitle>
                </CardHeader>
                <CardContent className="pt-3">
                  <p className="text-xs text-gray-600">
                    基于规则库自动匹配：{experiment?.meta.topic}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 右侧：实验区域 */}
          <div className="flex-1 space-y-4">
            {/* 实验画布 */}
            <ExperimentCanvas
              experiment={experiment!}
              params={params}
              computed={computed}
              isPlaying={isPlaying}
              onParamChange={handleParamChange}
              onStart={handleStart}
              onReset={handleReset}
              onUpdate={handleUpdate}
            />

            {/* 实时数据 */}
            <div className="grid grid-cols-4 gap-3">
              <Card className="rounded-xl">
                <CardContent className="p-3 text-center">
                  <div className="text-xs text-gray-500">时间</div>
                  <div className="text-xl font-bold text-orange-500">{computed.time.toFixed(2)} s</div>
                </CardContent>
              </Card>
              <Card className="rounded-xl">
                <CardContent className="p-3 text-center">
                  <div className="text-xs text-gray-500">高度</div>
                  <div className="text-xl font-bold text-orange-500">{computed.currentHeight.toFixed(1)} m</div>
                </CardContent>
              </Card>
              <Card className="rounded-xl">
                <CardContent className="p-3 text-center">
                  <div className="text-xs text-gray-500">速度</div>
                  <div className="text-xl font-bold text-orange-500">{computed.velocity.toFixed(2)} m/s</div>
                </CardContent>
              </Card>
              <Card className="rounded-xl">
                <CardContent className="p-3 text-center">
                  <div className="text-xs text-gray-500">重力</div>
                  <div className="text-xl font-bold text-orange-500">{params.gravity.toFixed(1)} m/s²</div>
                </CardContent>
              </Card>
            </div>

            {/* 参数控制 */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">初始高度</span>
                    <span className="text-sm font-bold text-orange-500">{params.height} m</span>
                  </div>
                  <Slider
                    value={[params.height]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={([v]) => handleParamChange('height', v)}
                    className="[&_[role=slider]]:bg-orange-500"
                  />
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">重力加速度</span>
                    <span className="text-sm font-bold text-orange-500">{params.gravity.toFixed(1)} m/s²</span>
                  </div>
                  <Slider
                    value={[params.gravity]}
                    min={1}
                    max={20}
                    step={0.1}
                    onValueChange={([v]) => handleParamChange('gravity', v)}
                    className="[&_[role=slider]]:bg-orange-500"
                  />
                </CardContent>
              </Card>
            </div>

            {/* 按钮 */}
            <div className="flex gap-3 justify-center">
              <Button
                onClick={handleStart}
                disabled={isPlaying}
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg"
              >
                <Play className="w-5 h-5 mr-2" /> 释放
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                className="px-8 py-6 text-lg font-semibold rounded-xl border-2"
              >
                <RotateCcw className="w-5 h-5 mr-2" /> 重置
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
