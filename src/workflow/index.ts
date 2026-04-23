// EGPSpace workflow system main entry
export * from './types';
export { WorkflowEngine } from './engine';
export type { ValidationReport, ValidationIssue } from './validator';
export { WorkflowValidator } from './validator';
export type { ExecutionSearchCriteria, ExecutionStats, StorageBackup, StorageStats } from './storage';
export { InMemoryStorage, FileSystemStorage, StorageFactory, StorageManager } from './storage';
export * from './utils';

import { WorkflowDefinition, WorkflowStep, WorkflowStepType, WorkflowCondition, WorkflowExecution } from './types';
import { WorkflowEngine } from './engine';
import { WorkflowValidator, ValidationReport } from './validator';
import { InMemoryStorage, ExecutionSearchCriteria, ExecutionStats, StorageBackup, StorageStats } from './storage';

export const WORKFLOW_VERSION = '1.0.0';
export const SUPPORTED_STEP_TYPES = ['action', 'decision', 'parallel', 'experiment', 'condition'] as const;
export const SUPPORTED_STATUSES = ['pending', 'running', 'completed', 'failed', 'paused', 'cancelled'] as const;

export interface WorkflowSystemConfig {
  storage?: 'memory' | 'filesystem';
  storagePath?: string;
  maxConcurrentExecutions?: number;
  defaultTimeout?: number;
  enableValidation?: boolean;
  enableMetrics?: boolean;
  enableEvents?: boolean;
}

export class WorkflowSystem {
  private engine: WorkflowEngine;
  private validator: WorkflowValidator;
  private storage: InMemoryStorage;
  private config: WorkflowSystemConfig;
  private startTime = Date.now();

  constructor(config: WorkflowSystemConfig = {}) {
    this.config = {
      storage: 'memory',
      maxConcurrentExecutions: 10,
      defaultTimeout: 30000,
      enableValidation: true,
      enableMetrics: true,
      enableEvents: true,
      ...config
    };

    this.storage = new InMemoryStorage();
    this.engine = new WorkflowEngine(this.storage);
    this.validator = new WorkflowValidator();
    this.setupEventListeners();
  }

  async createDefinition(definition: WorkflowDefinition): Promise<void> {
    if (this.config.enableValidation) {
      this.validator.validateDefinition(definition);
    }
    await this.storage.saveDefinition(definition);
  }

  async getDefinition(workflowId: string): Promise<WorkflowDefinition | null> {
    return await this.storage.getDefinition(workflowId);
  }

  async updateDefinition(definition: WorkflowDefinition): Promise<void> {
    if (this.config.enableValidation) {
      this.validator.validateDefinition(definition);
    }
    await this.storage.updateDefinition(definition);
  }

  async deleteDefinition(workflowId: string): Promise<void> {
    await this.storage.deleteDefinition(workflowId);
  }

  async listDefinitions(limit?: number, offset?: number): Promise<WorkflowDefinition[]> {
    return await this.storage.listDefinitions(limit, offset);
  }

  async createExecution(workflowId: string, initialVariables: Record<string, any> = {}): Promise<WorkflowExecution> {
    const definition = await this.getDefinition(workflowId);
    if (!definition) {
      throw new Error(`Workflow definition ${workflowId} not found`);
    }
    return await this.engine.createExecution(definition, initialVariables);
  }

  async startExecution(executionId: string): Promise<void> {
    await this.engine.startExecution(executionId);
  }

  async pauseExecution(executionId: string): Promise<void> {
    await this.engine.pauseExecution(executionId);
  }

  async resumeExecution(executionId: string): Promise<void> {
    await this.engine.resumeExecution(executionId);
  }

  async cancelExecution(executionId: string): Promise<void> {
    await this.engine.cancelExecution(executionId);
  }

  getExecution(executionId: string): WorkflowExecution | null {
    return this.engine.getExecution(executionId);
  }

  async getExecutionsByWorkflow(workflowId: string): Promise<WorkflowExecution[]> {
    return await this.engine.getExecutionsByWorkflow(workflowId);
  }

  async searchExecutions(criteria: ExecutionSearchCriteria, limit?: number, offset?: number): Promise<WorkflowExecution[]> {
    return await this.storage.searchExecutions(criteria, limit, offset);
  }

  async getExecutionStats(workflowId?: string): Promise<ExecutionStats> {
    return await this.storage.getExecutionStats(workflowId);
  }

  getSystemStatus(): SystemStatus {
    const engineStatus = this.engine.getStatus();
    return {
      version: WORKFLOW_VERSION,
      isRunning: engineStatus.isRunning,
      executionCount: engineStatus.executionCount,
      maxConcurrentExecutions: this.config.maxConcurrentExecutions!,
      storageType: this.config.storage!,
      uptime: Date.now() - this.startTime
    };
  }

  validateDefinition(definition: WorkflowDefinition): ValidationReport {
    return this.validator.getValidationReport(definition);
  }

  async cleanupExpiredExecutions(maxAge?: number): Promise<number> {
    return await this.storage.cleanupExpiredExecutions(maxAge);
  }

  async backup(): Promise<StorageBackup> {
    return await this.storage.backup();
  }

  async restore(backup: StorageBackup): Promise<void> {
    await this.storage.restore(backup);
  }

  async getStorageStats(): Promise<StorageStats> {
    return await this.storage.getStorageStats();
  }

  private setupEventListeners(): void {
    if (!this.config.enableEvents) return;

    this.engine.on('execution.started', (execution: WorkflowExecution) => {
      console.log(`Execution ${execution.id} started for workflow ${execution.workflowId}`);
    });
    this.engine.on('execution.completed', (execution: WorkflowExecution) => {
      console.log(`Execution ${execution.id} completed successfully`);
    });
    this.engine.on('execution.failed', (execution: WorkflowExecution) => {
      console.error(`Execution ${execution.id} failed`);
    });
  }
}

export interface SystemStatus {
  version: string;
  isRunning: boolean;
  executionCount: number;
  maxConcurrentExecutions: number;
  storageType: string;
  uptime: number;
}

export function createWorkflowSystem(config?: WorkflowSystemConfig): WorkflowSystem {
  return new WorkflowSystem(config);
}

export const defaultWorkflowSystem = createWorkflowSystem();

export function createWorkflowTemplate(id: string, name: string, steps: WorkflowStep[]): WorkflowDefinition {
  return { id, name, version: '1.0.0', steps, createdAt: new Date(), updatedAt: new Date() };
}

export function validateWorkflowDefinition(definition: WorkflowDefinition): ValidationReport {
  const validator = new WorkflowValidator();
  return validator.getValidationReport(definition);
}

export function createStep(id: string, name: string, type: WorkflowStepType, component: string, config?: Record<string, any>): WorkflowStep {
  return { id, name, type, component, config };
}

export function createDecisionStep(id: string, name: string, component: string, conditions: WorkflowCondition[]): WorkflowStep {
  return { id, name, type: 'decision', component, conditions };
}

export default WorkflowSystem;