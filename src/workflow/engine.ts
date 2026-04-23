// EGPSpace工作流引擎实现
import { 
  WorkflowDefinition, 
  WorkflowExecution, 
  WorkflowContext, 
  NodeExecutionResult, 
  WorkflowError, 
  StepExecutionHistory,
  ValidationError,
  WORKFLOW_EVENTS
} from './types';

export class WorkflowEngine {
  private executions: Map<string, WorkflowExecution> = new Map();
  private eventListeners: Map<string, Function[]> = new Map();
  private isRunning: boolean = false;

  constructor(private storage?: any) {}

  /**
   * 创建工作流执行实例
   */
  async createExecution(
    definition: WorkflowDefinition, 
    initialVariables: Record<string, any> = {}
  ): Promise<WorkflowExecution> {
    this.validateDefinition(definition);

    const execution: WorkflowExecution = {
      id: this.generateExecutionId(),
      workflowId: definition.id,
      status: 'pending',
      stepHistory: [],
      variables: { ...initialVariables },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.executions.set(execution.id, execution);
    
    if (this.storage) {
      await this.storage.saveExecution(execution);
    }

    this.emitEvent(WORKFLOW_EVENTS.EXECUTION_STARTED, execution);
    
    return execution;
  }

  /**
   * 开始执行工作流
   */
  async startExecution(executionId: string): Promise<void> {
    const execution = this.getExecution(executionId);
    if (!execution) {
      throw new Error(`Execution ${executionId} not found`);
    }

    if (execution.status !== 'pending') {
      throw new Error(`Execution ${executionId} is already ${execution.status}`);
    }

    execution.status = 'running';
    execution.startedAt = new Date();
    execution.updatedAt = new Date();

    // 开始执行第一个步骤
    const firstStep = execution.workflowId;
    await this.executeStep(executionId, firstStep);

    this.updateExecution(execution);
  }

  /**
   * 执行单个步骤
   */
  private async executeStep(executionId: string, stepId: string): Promise<void> {
    const execution = this.getExecution(executionId);
    if (!execution) {
      throw new Error(`Execution ${executionId} not found`);
    }

    const stepHistory: StepExecutionHistory = {
      stepId,
      status: 'running',
      startedAt: new Date(),
      attempts: 1
    };

    execution.currentStep = stepId;
    execution.stepHistory.push(stepHistory);
    execution.updatedAt = new Date();

    this.updateExecution(execution);
    this.emitEvent(WORKFLOW_EVENTS.STEP_STARTED, execution, stepId);

    try {
      const result = await this.executeStepLogic(execution, stepId);
      
      stepHistory.status = 'completed';
      stepHistory.completedAt = new Date();
      stepHistory.duration = stepHistory.completedAt.getTime() - stepHistory.startedAt.getTime();
      stepHistory.result = result.data;

      if (result.nextStep) {
        await this.executeStep(executionId, result.nextStep);
      } else {
        // 没有下一步骤，执行完成
        execution.status = 'completed';
        execution.completedAt = new Date();
        execution.result = result.data;
        execution.updatedAt = new Date();
        
        this.updateExecution(execution);
        this.emitEvent(WORKFLOW_EVENTS.EXECUTION_COMPLETED, execution);
      }
    } catch (error) {
      stepHistory.status = 'failed';
      stepHistory.completedAt = new Date();
      stepHistory.duration = stepHistory.completedAt.getTime() - stepHistory.startedAt.getTime();
      stepHistory.error = this.createError(error, stepId);

      execution.status = 'failed';
      execution.error = stepHistory.error;
      execution.completedAt = new Date();
      execution.updatedAt = new Date();

      this.updateExecution(execution);
      this.emitEvent(WORKFLOW_EVENTS.STEP_FAILED, execution, stepId, error);
      this.emitEvent(WORKFLOW_EVENTS.EXECUTION_FAILED, execution);
      
      throw error;
    }
  }

  /**
   * 执行步骤逻辑
   */
  private async executeStepLogic(
    execution: WorkflowExecution, 
    stepId: string
  ): Promise<NodeExecutionResult> {
    const _context: WorkflowContext = {
      executionId: execution.id,
      workflowId: execution.workflowId,
      currentStep: stepId,
      variables: execution.variables,
      metadata: {}
    };

    // 模拟步骤执行
    await new Promise(resolve => setTimeout(resolve, 100));

    // 这里应该根据步骤类型调用相应的处理器
    const result: NodeExecutionResult = {
      success: true,
      data: { message: `Step ${stepId} executed successfully` },
      nextStep: this.getNextStep(execution.workflowId, stepId)
    };

    return result;
  }

  /**
   * 获取下一步骤
   */
  private getNextStep(_workflowId: string, _currentStepId: string): string | undefined {
    // 这里应该根据工作流定义获取下一步骤
    // 暂时返回undefined表示结束
    return undefined;
  }

  /**
   * 暂停执行
   */
  async pauseExecution(executionId: string): Promise<void> {
    const execution = this.getExecution(executionId);
    if (!execution) {
      throw new Error(`Execution ${executionId} not found`);
    }

    if (execution.status !== 'running') {
      throw new Error(`Cannot pause execution in ${execution.status} state`);
    }

    execution.status = 'paused';
    execution.updatedAt = new Date();
    
    this.updateExecution(execution);
  }

  /**
   * 恢复执行
   */
  async resumeExecution(executionId: string): Promise<void> {
    const execution = this.getExecution(executionId);
    if (!execution) {
      throw new Error(`Execution ${executionId} not found`);
    }

    if (execution.status !== 'paused') {
      throw new Error(`Cannot resume execution in ${execution.status} state`);
    }

    execution.status = 'running';
    execution.updatedAt = new Date();
    
    this.updateExecution(execution);
    
    // 继续执行当前步骤
    if (execution.currentStep) {
      await this.executeStep(executionId, execution.currentStep);
    }
  }

  /**
   * 取消执行
   */
  async cancelExecution(executionId: string): Promise<void> {
    const execution = this.getExecution(executionId);
    if (!execution) {
      throw new Error(`Execution ${executionId} not found`);
    }

    execution.status = 'cancelled';
    execution.completedAt = new Date();
    execution.updatedAt = new Date();
    
    this.updateExecution(execution);
  }

  /**
   * 获取执行实例
   */
  getExecution(executionId: string): WorkflowExecution | null {
    return this.executions.get(executionId) || null;
  }

  /**
   * 根据工作流ID获取执行列表
   */
  async getExecutionsByWorkflow(workflowId: string): Promise<WorkflowExecution[]> {
    const executions: WorkflowExecution[] = [];
    
    for (const execution of this.executions.values()) {
      if (execution.workflowId === workflowId) {
        executions.push(execution);
      }
    }

    return executions;
  }

  /**
   * 验证工作流定义
   */
  private validateDefinition(definition: WorkflowDefinition): void {
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

    // 验证步骤定义
    for (const step of definition.steps) {
      if (!step.id) {
        throw new ValidationError('Step must have an id');
      }

      if (!step.name) {
        throw new ValidationError('Step must have a name');
      }

      if (!step.type) {
        throw new ValidationError('Step must have a type');
      }

      if (!step.component) {
        throw new ValidationError('Step must have a component');
      }
    }
  }

  /**
   * 生成执行ID
   */
  private generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 创建错误对象
   */
  private createError(error: any, stepId?: string): WorkflowError {
    return {
      code: error.code || 'UNKNOWN_ERROR',
      message: error.message || 'Unknown error occurred',
      details: error.details,
      stepId,
      timestamp: new Date()
    };
  }

  /**
   * 更新执行实例
   */
  private updateExecution(execution: WorkflowExecution): void {
    this.executions.set(execution.id, execution);
    
    if (this.storage) {
      this.storage.updateExecution(execution).catch(console.error);
    }
  }

  /**
   * 注册事件监听器
   */
  on(event: string, listener: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }

  /**
   * 触发事件
   */
  private emitEvent(event: string, ...args: any[]): void {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(listener => {
      try {
        listener(...args);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }

  /**
   * 获取引擎状态
   */
  getStatus(): { isRunning: boolean; executionCount: number } {
    return {
      isRunning: this.isRunning,
      executionCount: this.executions.size
    };
  }

  /**
   * 清理过期的执行实例
   */
  cleanupExpiredExecutions(maxAge: number = 24 * 60 * 60 * 1000): void {
    const now = Date.now();
    
    for (const [id, execution] of this.executions.entries()) {
      const age = now - execution.createdAt.getTime();
      if (age > maxAge) {
        this.executions.delete(id);
      }
    }
  }
}