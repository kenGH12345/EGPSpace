// EGPSpace工作流验证器实现
import { 
  WorkflowDefinition, 
  WorkflowStep, 
  WorkflowCondition, 
  ValidationError,
  WorkflowExecution
} from './types';

export class WorkflowValidator {
  
  /**
   * 验证工作流定义
   */
  validateDefinition(definition: WorkflowDefinition): void {
    this.validateRequiredFields(definition);
    this.validateSteps(definition.steps);
    this.validateStepIds(definition.steps);
    this.validateStepReferences(definition.steps);
    this.validateCycles(definition.steps);
    this.validateConditionalLogic(definition.steps);
    this.validateTimeoutConfigurations(definition.steps);
    this.validateRetryConfigurations(definition.steps);
  }

  /**
   * 验证必需字段
   */
  private validateRequiredFields(definition: WorkflowDefinition): void {
    if (!definition.id) {
      throw new ValidationError('Workflow definition must have an id');
    }

    if (!definition.name) {
      throw new ValidationError('Workflow definition must have a name');
    }

    if (!definition.version) {
      throw new ValidationError('Workflow definition must have a version');
    }

    if (!definition.steps || definition.steps.length === 0) {
      throw new ValidationError('Workflow definition must have at least one step');
    }
  }

  /**
   * 验证步骤定义
   */
  private validateSteps(steps: WorkflowStep[]): void {
    for (const step of steps) {
      this.validateStep(step);
    }
  }

  /**
   * 验证单个步骤
   */
  private validateStep(step: WorkflowStep): void {
    if (!step.id) {
      throw new ValidationError('Step must have an id', { step });
    }

    if (!step.name) {
      throw new ValidationError('Step must have a name', { step });
    }

    if (!step.type) {
      throw new ValidationError('Step must have a type', { step });
    }

    if (!step.component) {
      throw new ValidationError('Step must have a component', { step });
    }

    this.validateStepType(step);
    this.validateStepConfiguration(step);
  }

  /**
   * 验证步骤类型
   */
  private validateStepType(step: WorkflowStep): void {
    const validTypes = ['action', 'decision', 'parallel', 'experiment', 'condition'];
    if (!validTypes.includes(step.type)) {
      throw new ValidationError(
        `Invalid step type: ${step.type}. Valid types are: ${validTypes.join(', ')}`,
        { step }
      );
    }

    // 特定类型的验证
    switch (step.type) {
      case 'decision':
        this.validateDecisionStep(step);
        break;
      case 'parallel':
        this.validateParallelStep(step);
        break;
      case 'experiment':
        this.validateExperimentStep(step);
        break;
    }
  }

  /**
   * 验证决策步骤
   */
  private validateDecisionStep(step: WorkflowStep): void {
    if (!step.conditions || step.conditions.length === 0) {
      throw new ValidationError('Decision step must have conditions', { step });
    }

    for (const condition of step.conditions) {
      this.validateCondition(condition, step.id);
    }
  }

  /**
   * 验证并行步骤
   */
  private validateParallelStep(step: WorkflowStep): void {
    if (!step.parallel) {
      throw new ValidationError('Parallel step must have parallel configuration', { step });
    }

    if (!step.next) {
      throw new ValidationError('Parallel step must specify next step after parallel execution', { step });
    }
  }

  /**
   * 验证实验步骤
   */
  private validateExperimentStep(step: WorkflowStep): void {
    if (!step.config?.variants || step.config.variants.length === 0) {
      throw new ValidationError('Experiment step must have variants configuration', { step });
    }

    const totalWeight = step.config.variants.reduce((sum: number, variant: any) => sum + variant.weight, 0);
    if (totalWeight !== 100) {
      throw new ValidationError('Experiment variants weights must sum to 100', { step });
    }
  }

  /**
   * 验证步骤配置
   */
  private validateStepConfiguration(step: WorkflowStep): void {
    if (step.timeout !== undefined && step.timeout <= 0) {
      throw new ValidationError('Step timeout must be positive', { step });
    }

    if (step.retry) {
      this.validateRetryConfiguration(step.retry, step.id);
    }
  }

  /**
   * 验证重试配置
   */
  private validateRetryConfiguration(retry: any, stepId: string): void {
    if (retry.maxAttempts < 1) {
      throw new ValidationError('Retry maxAttempts must be at least 1', { stepId, retry });
    }

    if (retry.backoffMultiplier < 1) {
      throw new ValidationError('Retry backoffMultiplier must be at least 1', { stepId, retry });
    }

    if (retry.maxDelay < 0) {
      throw new ValidationError('Retry maxDelay must be non-negative', { stepId, retry });
    }
  }

  /**
   * 验证条件
   */
  private validateCondition(condition: WorkflowCondition, stepId: string): void {
    if (!condition.condition) {
      throw new ValidationError('Condition must have a condition expression', { stepId, condition });
    }

    if (!condition.nextStep) {
      throw new ValidationError('Condition must specify nextStep', { stepId, condition });
    }
  }

  /**
   * 验证步骤ID唯一性
   */
  private validateStepIds(steps: WorkflowStep[]): void {
    const stepIds = new Set<string>();
    
    for (const step of steps) {
      if (stepIds.has(step.id)) {
        throw new ValidationError(`Duplicate step id: ${step.id}`, { step });
      }
      stepIds.add(step.id);
    }
  }

  /**
   * 验证步骤引用
   */
  private validateStepReferences(steps: WorkflowStep[]): void {
    const stepIds = new Set(steps.map(step => step.id));
    
    for (const step of steps) {
      if (step.next && !stepIds.has(step.next)) {
        throw new ValidationError(`Next step ${step.next} not found for step ${step.id}`, { step });
      }

      if (step.conditions) {
        for (const condition of step.conditions) {
          if (!stepIds.has(condition.nextStep)) {
            throw new ValidationError(
              `Condition nextStep ${condition.nextStep} not found for step ${step.id}`,
              { step, condition }
            );
          }
        }
      }
    }
  }

  /**
   * 验证循环引用
   */
  private validateCycles(steps: WorkflowStep[]): void {
    const graph = this.buildStepGraph(steps);
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    for (const stepId of graph.keys()) {
      if (!visited.has(stepId)) {
        if (this.detectCycle(graph, stepId, visited, recursionStack)) {
          throw new ValidationError(`Cycle detected in workflow steps`, { cycle: Array.from(recursionStack) });
        }
      }
    }
  }

  /**
   * 构建步骤图
   */
  private buildStepGraph(steps: WorkflowStep[]): Map<string, string[]> {
    const graph = new Map<string, string[]>();
    
    for (const step of steps) {
      const neighbors: string[] = [];
      
      if (step.next) {
        neighbors.push(step.next);
      }
      
      if (step.conditions) {
        for (const condition of step.conditions) {
          neighbors.push(condition.nextStep);
        }
      }
      
      graph.set(step.id, neighbors);
    }
    
    return graph;
  }

  /**
   * 检测循环
   */
  private detectCycle(
    graph: Map<string, string[]>,
    stepId: string,
    visited: Set<string>,
    recursionStack: Set<string>
  ): boolean {
    if (recursionStack.has(stepId)) {
      return true;
    }

    if (visited.has(stepId)) {
      return false;
    }

    visited.add(stepId);
    recursionStack.add(stepId);

    const neighbors = graph.get(stepId) || [];
    for (const neighbor of neighbors) {
      if (this.detectCycle(graph, neighbor, visited, recursionStack)) {
        return true;
      }
    }

    recursionStack.delete(stepId);
    return false;
  }

  /**
   * 验证条件逻辑
   */
  private validateConditionalLogic(steps: WorkflowStep[]): void {
    for (const step of steps) {
      if (step.type === 'decision' && step.conditions) {
        this.validateDecisionConditions(step.conditions, step.id);
      }
    }
  }

  /**
   * 验证决策条件
   */
  private validateDecisionConditions(conditions: WorkflowCondition[], stepId: string): void {
    // 检查是否有重复的条件表达式
    const conditionExpressions = new Set<string>();
    
    for (const condition of conditions) {
      if (conditionExpressions.has(condition.condition)) {
        throw new ValidationError(
          `Duplicate condition expression in decision step ${stepId}`,
          { stepId, condition }
        );
      }
      conditionExpressions.add(condition.condition);
    }

    // 检查是否有互斥的条件
    this.validateMutuallyExclusiveConditions(conditions, stepId);
  }

  /**
   * 验证互斥条件
   */
  private validateMutuallyExclusiveConditions(conditions: WorkflowCondition[], stepId: string): void {
    // 这里可以添加更复杂的逻辑来验证条件是否互斥
    // 目前只检查是否有完全相同的条件表达式
    const seenExpressions = new Set<string>();
    
    for (const condition of conditions) {
      if (seenExpressions.has(condition.condition)) {
        throw new ValidationError(
          `Duplicate condition expression found in decision step ${stepId}`,
          { stepId, condition }
        );
      }
      seenExpressions.add(condition.condition);
    }
  }

  /**
   * 验证超时配置
   */
  private validateTimeoutConfigurations(steps: WorkflowStep[]): void {
    for (const step of steps) {
      if (step.timeout !== undefined) {
        if (step.timeout <= 0) {
          throw new ValidationError('Timeout must be positive', { step });
        }
        
        if (step.timeout > 24 * 60 * 60 * 1000) {
          throw new ValidationError('Timeout cannot exceed 24 hours', { step });
        }
      }
    }
  }

  /**
   * 验证重试配置
   */
  private validateRetryConfigurations(steps: WorkflowStep[]): void {
    for (const step of steps) {
      if (step.retry) {
        this.validateRetryConfiguration(step.retry, step.id);
      }
    }
  }

  /**
   * 验证工作流执行
   */
  validateExecution(execution: WorkflowExecution): void {
    if (!execution.id) {
      throw new ValidationError('Execution must have an id');
    }

    if (!execution.workflowId) {
      throw new ValidationError('Execution must have a workflowId');
    }

    if (!execution.status) {
      throw new ValidationError('Execution must have a status');
    }

    if (!execution.createdAt) {
      throw new ValidationError('Execution must have a createdAt timestamp');
    }

    if (!execution.updatedAt) {
      throw new ValidationError('Execution must have an updatedAt timestamp');
    }

    this.validateExecutionStatus(execution);
    this.validateExecutionTimestamps(execution);
    this.validateStepHistory(execution);
  }

  /**
   * 验证执行状态
   */
  private validateExecutionStatus(execution: WorkflowExecution): void {
    const validStatuses = ['pending', 'running', 'completed', 'failed', 'paused', 'cancelled'];
    if (!validStatuses.includes(execution.status)) {
      throw new ValidationError(`Invalid execution status: ${execution.status}`);
    }

    // 状态转换验证
    if (execution.status === 'completed' && !execution.completedAt) {
      throw new ValidationError('Completed execution must have completedAt timestamp');
    }

    if (execution.status === 'running' && !execution.startedAt) {
      throw new ValidationError('Running execution must have startedAt timestamp');
    }
  }

  /**
   * 验证时间戳
   */
  private validateExecutionTimestamps(execution: WorkflowExecution): void {
    if (execution.createdAt > execution.updatedAt) {
      throw new ValidationError('createdAt cannot be after updatedAt');
    }

    if (execution.startedAt && execution.startedAt < execution.createdAt) {
      throw new ValidationError('startedAt cannot be before createdAt');
    }

    if (execution.completedAt && execution.completedAt < execution.createdAt) {
      throw new ValidationError('completedAt cannot be before createdAt');
    }

    if (execution.completedAt && execution.startedAt && execution.completedAt < execution.startedAt) {
      throw new ValidationError('completedAt cannot be before startedAt');
    }
  }

  /**
   * 验证步骤历史
   */
  private validateStepHistory(execution: WorkflowExecution): void {
    if (!execution.stepHistory) {
      return;
    }

    for (const stepHistory of execution.stepHistory) {
      this.validateStepHistoryEntry(stepHistory);
    }
  }

  /**
   * 验证步骤历史条目
   */
  private validateStepHistoryEntry(stepHistory: any): void {
    if (!stepHistory.stepId) {
      throw new ValidationError('Step history entry must have stepId');
    }

    if (!stepHistory.status) {
      throw new ValidationError('Step history entry must have status');
    }

    if (!stepHistory.startedAt) {
      throw new ValidationError('Step history entry must have startedAt');
    }

    const validStatuses = ['pending', 'running', 'completed', 'failed', 'skipped'];
    if (!validStatuses.includes(stepHistory.status)) {
      throw new ValidationError(`Invalid step history status: ${stepHistory.status}`);
    }

    if (stepHistory.completedAt && stepHistory.completedAt < stepHistory.startedAt) {
      throw new ValidationError('completedAt cannot be before startedAt in step history');
    }
  }

  /**
   * 获取验证报告
   */
  getValidationReport(definition: WorkflowDefinition): ValidationReport {
    const report: ValidationReport = {
      isValid: false,
      errors: [],
      warnings: [],
      suggestions: []
    };

    try {
      this.validateDefinition(definition);
      report.isValid = true;
    } catch (error) {
      if (error instanceof ValidationError) {
        report.errors.push({
          message: error.message,
          details: error.details,
          severity: 'error'
        });
      } else {
        report.errors.push({
          message: 'Unknown validation error',
          details: error,
          severity: 'error'
        });
      }
    }

    return report;
  }
}

// 验证报告接口
export interface ValidationReport {
  isValid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  suggestions: ValidationIssue[];
}

export interface ValidationIssue {
  message: string;
  details?: any;
  severity: 'error' | 'warning' | 'suggestion';
}