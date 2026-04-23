'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  ExperimentConfig,
  ExperimentParameter,
  StatusItem,
} from '@/lib/experiment-types';
import type { ExperimentSchema } from '@/lib/experiment-schema';
import { experimentSchemaToLegacy } from './DynamicExperiment';
import {
  presetExperiments,
  getExperimentById,
} from '@/lib/experiments';
import { getExperimentResults } from '@/lib/calculations-browser';
import { useMediaPipeHands } from '@/hooks/useMediaPipeHands';
import ExperimentCanvas from '@/components/experiment-canvas';
import {
  AlertCircle,
  Info,
  CheckCircle,
  ChevronRight,
  Hand,
  MousePointer,
  RotateCcw,
  Play,
  Pause,
  Lightbulb,
  FlaskConical,
  Target,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ExperimentLayoutProps {
  experimentId?: string;
  className?: string;
  onExperimentChange?: (experiment: ExperimentConfig | ExperimentSchema) => void;
}

// 手势模式图标
const GestureIcon = ({ mode }: { mode: 'mouse' | 'gesture' }) => {
  if (mode === 'gesture') {
    return <Hand className="w-4 h-4" />;
  }
  return <MousePointer className="w-4 h-4" />;
};

// 提示图标映射
const TipIcon = ({ type }: { type: 'info' | 'warning' | 'success' }) => {
  switch (type) {
    case 'warning':
      return <AlertCircle className="w-4 h-4 text-amber-500" />;
    case 'success':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    default:
      return <Info className="w-4 h-4 text-blue-500" />;
  }
};

const ExperimentLayout: React.FC<ExperimentLayoutProps> = ({
  experimentId = 'convex-lens-imaging',
  className = '',
  onExperimentChange,
}) => {
  // 状态
  const [currentExperiment, setCurrentExperiment] = useState<ExperimentConfig | null>(
    getExperimentById(experimentId) || presetExperiments[0]
  );
  const [params, setParams] = useState<Record<string, number>>({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [controlMode, setControlMode] = useState<'mouse' | 'gesture'>('mouse');
  const [activeTab, setActiveTab] = useState('theory');

  // 初始化参数
  useEffect(() => {
    if (currentExperiment) {
      const initialParams: Record<string, number> = {};
      currentExperiment.params.forEach((param) => {
        initialParams[param.key] = param.default;
      });
      setParams(initialParams);
    }
  }, [currentExperiment]);

  // 切换实验
  const handleExperimentChange = useCallback(
    (newExperimentId: string) => {
      const experiment = getExperimentById(newExperimentId);
      if (experiment) {
        setCurrentExperiment(experiment);
        onExperimentChange?.(experiment);
      }
    },
    [onExperimentChange]
  );

  // 参数更新
  const handleParamChange = useCallback((key: string, value: number) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  }, []);

  // 重置参数
  const handleReset = useCallback(() => {
    if (currentExperiment) {
      const initialParams: Record<string, number> = {};
      currentExperiment.params.forEach((param) => {
        initialParams[param.key] = param.default;
      });
      setParams(initialParams);
    }
  }, [currentExperiment]);

  // 获取计算结果
  const results = currentExperiment
    ? getExperimentResults(currentExperiment.id, params)
    : {};

  // 渲染参数滑块
  const renderParameterSlider = (param: ExperimentParameter) => {
    const value = params[param.key] ?? param.default;

    return (
      <div key={param.key} className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            {param.name}
            {param.gestureControl && (
              <Badge variant="outline" className="text-xs">
                <Hand className="w-3 h-3 mr-1" />
                手势
              </Badge>
            )}
          </label>
          <span className="text-sm font-mono text-gray-600">
            {value.toFixed(param.step < 1 ? 1 : 0)} {param.unit}
          </span>
        </div>
        <Slider
          value={[value]}
          min={param.min}
          max={param.max}
          step={param.step}
          onValueChange={([v]) => handleParamChange(param.key, v)}
          className="w-full"
        />
        <p className="text-xs text-gray-500">{param.description}</p>
      </div>
    );
  };

  // 渲染状态项
  const renderStatusItem = (item: StatusItem) => {
    const resultValue = results[item.label];
    const displayValue =
      resultValue?.value !== undefined
        ? typeof resultValue.value === 'number'
          ? resultValue.value.toFixed(2)
          : resultValue.value
        : typeof item.value === 'number'
        ? item.value.toFixed(2)
        : item.value;

    return (
      <div
        key={item.label}
        className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 shadow-sm"
      >
        <span className="text-sm text-gray-600">{item.label}</span>
        <span
          className="text-lg font-semibold font-mono"
          style={{ color: item.color }}
        >
          {displayValue}
          {item.unit}
        </span>
      </div>
    );
  };

  // 手势识别
  const mediaPipe = useMediaPipeHands({
    onResults: () => {},
  });

  const { isReady: isHandDetected, currentGesture } = mediaPipe;

  // 应用手势控制参数（暂时禁用）
  useEffect(() => {
    if (controlMode !== 'gesture' || !currentExperiment || !isHandDetected) return;

    // 查找支持手势控制的参数
    const gestureParam = currentExperiment.params.find(
      (p) => p.gestureControl?.finger === 'index'
    );

    // 手势控制逻辑需要摄像头支持，暂时不启用
    // if (gestureParam && currentGesture) {
    //   // 根据手势调整参数
    // }
  }, [currentGesture, isHandDetected, controlMode, currentExperiment, handleParamChange]);

  if (!currentExperiment) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500">
        <p>未找到实验配置</p>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br from-slate-50 to-blue-50 ${className}`}>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* 头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <FlaskConical className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {currentExperiment.title}
              </h1>
              <p className="text-sm text-gray-600">
                {currentExperiment.description}
              </p>
            </div>
          </div>

          {/* 实验选择 */}
          <div className="flex items-center gap-2">
            <select
              value={currentExperiment.id}
              onChange={(e) => handleExperimentChange(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {presetExperiments.map((exp) => (
                <option key={exp.id} value={exp.id}>
                  {exp.title}
                </option>
              ))}
            </select>

            {/* 控制模式切换 */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={controlMode === 'gesture' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() =>
                      setControlMode((m) => (m === 'mouse' ? 'gesture' : 'mouse'))
                    }
                  >
                    <GestureIcon mode={controlMode} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {controlMode === 'mouse'
                      ? '切换到手势控制'
                      : '切换到鼠标控制'}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* 重置按钮 */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={handleReset}>
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>重置参数</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* 手势状态指示 */}
        {controlMode === 'gesture' && (
          <div
            className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${
              isHandDetected
                ? 'bg-green-100 text-green-700'
                : 'bg-amber-100 text-amber-700'
            }`}
          >
            <Hand className="w-4 h-4" />
            <span>
              {isHandDetected
                ? '检测到手势 - 使用食指控制参数'
                : '等待手势...'}
            </span>
          </div>
        )}

        {/* 主内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：画布和状态 */}
          <div className="lg:col-span-2 space-y-4">
            {/* 实验画布 */}
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <ExperimentCanvas
                  experiment={currentExperiment}
                  params={params}
                  width={800}
                  height={500}
                />
              </CardContent>
            </Card>

            {/* 状态显示 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {currentExperiment.statusItems.map((item) => renderStatusItem(item))}
            </div>
          </div>

          {/* 右侧：控制面板 */}
          <div className="space-y-4">
            {/* 参数控制 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="w-5 h-5 text-indigo-500" />
                  参数控制
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {currentExperiment.params.map((param) =>
                  renderParameterSlider(param)
                )}
              </CardContent>
            </Card>

            {/* 公式 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  物理公式
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-xl font-mono text-gray-800 mb-2">
                    {currentExperiment.formula}
                  </p>
                  <p className="text-sm text-gray-600">
                    {currentExperiment.formulaExplanation}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 标签页 */}
            <Card>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <CardHeader className="pb-2">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="theory" className="text-xs">
                      理论
                    </TabsTrigger>
                    <TabsTrigger value="tips" className="text-xs">
                      提示
                    </TabsTrigger>
                    <TabsTrigger value="examples" className="text-xs">
                      示例
                    </TabsTrigger>
                  </TabsList>
                </CardHeader>
                <CardContent>
                  <TabsContent value="theory" className="mt-0">
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <BookOpen className="w-4 h-4 text-indigo-500 mt-1 flex-shrink-0" />
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {currentExperiment.theory}
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="tips" className="mt-0 space-y-3">
                    {currentExperiment.tips.map((tip, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 p-2 rounded-lg bg-gray-50"
                      >
                        <TipIcon type={tip.icon} />
                        <p className="text-sm text-gray-700">{tip.text}</p>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="examples" className="mt-0 space-y-3">
                    {currentExperiment.examples.map((example, index) => (
                      <div
                        key={index}
                        className="p-3 rounded-lg border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-colors cursor-pointer"
                        onClick={() => setActiveTab('theory')}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <ChevronRight className="w-4 h-4 text-indigo-500" />
                          <span className="font-medium text-sm text-gray-900">
                            {example.title}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 pl-6">
                          {example.desc}
                        </p>
                      </div>
                    ))}
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExperimentLayout;
