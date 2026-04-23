// EGPSpace工作流系统核心类型定义
// 这个文件定义了工作流引擎的核心接口和类型

export interface WorkflowDefinition {
  id: string;
  name: string;
  version: string;
  description?: string;
  steps: WorkflowStep[];
  metadata?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: WorkflowStepType;
  component: string;
  description?: string;
  config?: Record<string, any>;
  next?: string;
  conditions?: WorkflowCondition[];
  parallel?: boolean;
  timeout?: number;
  retry?: RetryConfig;
}

export type WorkflowStepType = 'action' | 'decision' | 'parallel' | 'experiment' | 'condition';

export interface WorkflowCondition {
  condition: string;
  nextStep: string;
  description?: string;
}

export interface RetryConfig {
  maxAttempts: number;
  backoffMultiplier: number;
  maxDelay: number;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: WorkflowExecutionStatus;
  currentStep?: string;
  stepHistory: StepExecutionHistory[];
  variables: Record<string, any>;
  result?: any;
  error?: WorkflowError;
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export type WorkflowExecutionStatus = 
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'paused'
  | 'cancelled';

export interface StepExecutionHistory {
  stepId: string;
  status: StepExecutionStatus;
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  result?: any;
  error?: WorkflowError;
  attempts: number;
}

export type StepExecutionStatus = 
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'skipped';

export interface WorkflowError {
  code: string;
  message: string;
  details?: any;
  stepId?: string;
  timestamp: Date;
}

export interface WorkflowContext {
  executionId: string;
  workflowId: string;
  currentStep: string;
  variables: Record<string, any>;
  metadata: Record<string, any>;
}

export interface NodeExecutionResult {
  success: boolean;
  data?: any;
  error?: WorkflowError;
  nextStep?: string;
  variables?: Record<string, any>;
}

export interface WorkflowEngine {
  createExecution(definition: WorkflowDefinition, initialVariables?: Record<string, any>): Promise<WorkflowExecution>;
  startExecution(executionId: string): Promise<void>;
  pauseExecution(executionId: string): Promise<void>;
  resumeExecution(executionId: string): Promise<void>;
  cancelExecution(executionId: string): Promise<void>;
  getExecution(executionId: string): Promise<WorkflowExecution | null>;
  getExecutionsByWorkflow(workflowId: string): Promise<WorkflowExecution[]>;
}

export interface WorkflowValidator {
  validateDefinition(definition: WorkflowDefinition): void;
  validateExecution(execution: WorkflowExecution): void;
}

export interface WorkflowStorage {
  saveExecution(execution: WorkflowExecution): Promise<void>;
  getExecution(executionId: string): Promise<WorkflowExecution | null>;
  updateExecution(execution: WorkflowExecution): Promise<void>;
  deleteExecution(executionId: string): Promise<void>;
  listExecutions(workflowId?: string, limit?: number, offset?: number): Promise<WorkflowExecution[]>;
}

export interface ActionHandler {
  execute(context: WorkflowContext): Promise<NodeExecutionResult>;
}

export interface DecisionEvaluator {
  evaluate(context: WorkflowContext, conditions: WorkflowCondition[]): Promise<string | null>;
}

export interface ExperimentConfig {
  enabled: boolean;
  variants: ExperimentVariant[];
  allocationStrategy: 'random' | 'weighted' | 'sticky';
}

export interface ExperimentVariant {
  name: string;
  weight: number;
  config: Record<string, any>;
}

export interface WorkflowEvent {
  type: string;
  executionId: string;
  stepId?: string;
  data?: any;
  timestamp: Date;
}

export interface WorkflowMetrics {
  executionCount: number;
  successRate: number;
  averageDuration: number;
  errorRate: number;
  stepMetrics: Record<string, StepMetrics>;
}

export interface StepMetrics {
  executionCount: number;
  averageDuration: number;
  successRate: number;
  errorRate: number;
}

export interface TimeoutConfig {
  stepTimeout: number;
  executionTimeout: number;
}

// 错误类型定义
export class ValidationError extends Error {
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class ExecutionError extends Error {
  constructor(message: string, public stepId?: string, public details?: any) {
    super(message);
    this.name = 'ExecutionError';
  }
}

export class TimeoutError extends Error {
  constructor(message: string, public timeout: number) {
    super(message);
    this.name = 'TimeoutError';
  }
}

// 辅助类型
export type WorkflowStatus = WorkflowExecutionStatus;
export type StepStatus = StepExecutionStatus;

// 常量定义
export const DEFAULT_TIMEOUT = 30000; // 30秒
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  backoffMultiplier: 2,
  maxDelay: 60000, // 1分钟
};

export const WORKFLOW_EVENTS = {
  EXECUTION_STARTED: 'execution.started',
  EXECUTION_COMPLETED: 'execution.completed',
  EXECUTION_FAILED: 'execution.failed',
  STEP_STARTED: 'step.started',
  STEP_COMPLETED: 'step.completed',
  STEP_FAILED: 'step.failed',
} as const;