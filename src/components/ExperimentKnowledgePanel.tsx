'use client';

import React from 'react';

interface TeachingVariables {
  independent?: string;
  dependent?: string;
  controlled?: string[];
}

interface TeachingErrors {
  concept?: string[];
}

interface ExperimentKnowledgePanelProps {
  coreQuestion?: string;
  variables?: TeachingVariables;
  errors?: TeachingErrors;
  discussion?: string[];
  knowledge?: string[];
}

export function ExperimentKnowledgePanel({
  coreQuestion,
  variables,
  errors,
  discussion,
  knowledge,
}: ExperimentKnowledgePanelProps) {
  return (
    <div className="space-y-4">
      {/* 核心问题 */}
      {coreQuestion && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-200">
          <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
            <span className="text-xl">🎯</span>
            核心问题
          </h3>
          <p className="text-sm text-amber-900 leading-relaxed">{coreQuestion}</p>
        </div>
      )}

      {/* 变量分析 */}
      {variables && (
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 border border-blue-200">
          <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
            <span className="text-xl">📊</span>
            变量分析
          </h3>
          <div className="space-y-2 text-sm">
            {variables.independent && (
              <div className="flex items-start gap-2">
                <span className="text-red-500 font-medium">自变量:</span>
                <span className="text-gray-700">{variables.independent}</span>
              </div>
            )}
            {variables.dependent && (
              <div className="flex items-start gap-2">
                <span className="text-green-500 font-medium">因变量:</span>
                <span className="text-gray-700">{variables.dependent}</span>
              </div>
            )}
            {variables.controlled && variables.controlled.length > 0 && (
              <div className="flex items-start gap-2">
                <span className="text-gray-500 font-medium">控制量:</span>
                <span className="text-gray-700">{variables.controlled.join(', ')}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 常见错误 */}
      {errors?.concept && errors.concept.length > 0 && (
        <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-5 border border-red-200">
          <h3 className="font-bold text-red-800 mb-3 flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            常见错误
          </h3>
          <ul className="space-y-1">
            {errors.concept.map((mistake, i) => (
              <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                <span>•</span>
                <span>{mistake}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 观察讨论点 */}
      {discussion && discussion.length > 0 && (
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-5 border border-purple-200">
          <h3 className="font-bold text-purple-800 mb-3 flex items-center gap-2">
            <span className="text-xl">💡</span>
            观察与讨论
          </h3>
          <ul className="space-y-1">
            {discussion.map((item, i) => (
              <li key={i} className="text-xs text-gray-600">• {item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 核心知识点（备用） */}
      {!coreQuestion && knowledge && knowledge.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-gray-200">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs">知</span>
            核心知识点
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            {knowledge.map((k, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-purple-500 mt-1">•</span>
                <span>{k}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}