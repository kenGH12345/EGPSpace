// EGPSpace工作流存储实现
import { 
  WorkflowExecution, 
  WorkflowDefinition, 
  WorkflowStorage,
  ExecutionError
} from './types';

/**
 * 内存存储实现 - 用于开发和测试环境
 */
export class InMemoryStorage implements WorkflowStorage {
  private executions: Map<string, WorkflowExecution> = new Map();
  private definitions: Map<string, WorkflowDefinition> = new Map();

  /**
   * 保存执行实例
   */
  async saveExecution(execution: WorkflowExecution): Promise<void> {
    this.validateExecution(execution);
    this.executions.set(execution.id, { ...execution });
  }

  /**
   * 获取执行实例
   */
  async getExecution(executionId: string): Promise<WorkflowExecution | null> {
    const execution = this.executions.get(executionId);
    return execution ? { ...execution } : null;
  }

  /**
   * 更新执行实例
   */
  async updateExecution(execution: WorkflowExecution): Promise<void> {
    if (!this.executions.has(execution.id)) {
      throw new ExecutionError(`Execution ${execution.id} not found`);
    }
    
    this.validateExecution(execution);
    this.executions.set(execution.id, { ...execution });
  }

  /**
   * 删除执行实例
   */
  async deleteExecution(executionId: string): Promise<void> {
    if (!this.executions.has(executionId)) {
      throw new ExecutionError(`Execution ${executionId} not found`);
    }
    
    this.executions.delete(executionId);
  }

  /**
   * 列出执行实例
   */
  async listExecutions(
    workflowId?: string, 
    limit: number = 100, 
    offset: number = 0
  ): Promise<WorkflowExecution[]> {
    let executions = Array.from(this.executions.values());
    
    if (workflowId) {
      executions = executions.filter(exec => exec.workflowId === workflowId);
    }
    
    // 按更新时间倒序排序
    executions.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    
    return executions.slice(offset, offset + limit).map(exec => ({ ...exec }));
  }

  /**
   * 保存工作流定义
   */
  async saveDefinition(definition: WorkflowDefinition): Promise<void> {
    this.validateDefinition(definition);
    this.definitions.set(definition.id, { ...definition });
  }

  /**
   * 获取工作流定义
   */
  async getDefinition(workflowId: string): Promise<WorkflowDefinition | null> {
    const definition = this.definitions.get(workflowId);
    return definition ? { ...definition } : null;
  }

  /**
   * 更新工作流定义
   */
  async updateDefinition(definition: WorkflowDefinition): Promise<void> {
    if (!this.definitions.has(definition.id)) {
      throw new ExecutionError(`Workflow definition ${definition.id} not found`);
    }
    
    this.validateDefinition(definition);
    this.definitions.set(definition.id, { ...definition });
  }

  /**
   * 删除工作流定义
   */
  async deleteDefinition(workflowId: string): Promise<void> {
    if (!this.definitions.has(workflowId)) {
      throw new ExecutionError(`Workflow definition ${workflowId} not found`);
    }
    
    this.definitions.delete(workflowId);
  }

  /**
   * 列出工作流定义
   */
  async listDefinitions(limit: number = 100, offset: number = 0): Promise<WorkflowDefinition[]> {
    const definitions = Array.from(this.definitions.values());
    
    // 按更新时间倒序排序
    definitions.sort((a, b) => {
      const aTime = a.updatedAt?.getTime() || a.createdAt?.getTime() || 0;
      const bTime = b.updatedAt?.getTime() || b.createdAt?.getTime() || 0;
      return bTime - aTime;
    });
    
    return definitions.slice(offset, offset + limit).map(def => ({ ...def }));
  }

  /**
   * 搜索执行实例
   */
  async searchExecutions(
    criteria: ExecutionSearchCriteria,
    limit: number = 100,
    offset: number = 0
  ): Promise<WorkflowExecution[]> {
    let executions = Array.from(this.executions.values());
    
    if (criteria.workflowId) {
      executions = executions.filter(exec => exec.workflowId === criteria.workflowId);
    }
    
    if (criteria.status) {
      executions = executions.filter(exec => exec.status === criteria.status);
    }
    
    if (criteria.createdAfter) {
      const after = criteria.createdAfter;
      executions = executions.filter(exec => exec.createdAt >= after);
    }
    
    if (criteria.createdBefore) {
      const before = criteria.createdBefore;
      executions = executions.filter(exec => exec.createdAt <= before);
    }
    
    if (criteria.variables) {
      executions = executions.filter(exec => {
        return Object.entries(criteria.variables!).every(([key, value]) => {
          return exec.variables[key] === value;
        });
      });
    }
    
    // 按更新时间倒序排序
    executions.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    
    return executions.slice(offset, offset + limit).map(exec => ({ ...exec }));
  }

  /**
   * 获取执行统计信息
   */
  async getExecutionStats(workflowId?: string): Promise<ExecutionStats> {
    let executions = Array.from(this.executions.values());
    
    if (workflowId) {
      executions = executions.filter(exec => exec.workflowId === workflowId);
    }
    
    const stats: ExecutionStats = {
      total: executions.length,
      byStatus: {},
      averageDuration: 0,
      successRate: 0
    };
    
    const statusCounts = new Map<string, number>();
    let totalDuration = 0;
    let completedCount = 0;
    let successCount = 0;
    
    for (const exec of executions) {
      // 统计状态分布
      statusCounts.set(exec.status, (statusCounts.get(exec.status) || 0) + 1);
      
      // 计算平均持续时间
      if (exec.completedAt && exec.startedAt) {
        const duration = exec.completedAt.getTime() - exec.startedAt.getTime();
        totalDuration += duration;
        completedCount++;
      }
      
      // 计算成功率
      if (exec.status === 'completed') {
        successCount++;
      }
    }
    
    // 设置状态统计
    for (const [status, count] of statusCounts.entries()) {
      stats.byStatus[status] = count;
    }
    
    // 计算平均值
    stats.averageDuration = completedCount > 0 ? totalDuration / completedCount : 0;
    stats.successRate = executions.length > 0 ? successCount / executions.length : 0;
    
    return stats;
  }

  /**
   * 清理过期的执行实例
   */
  async cleanupExpiredExecutions(maxAge: number = 24 * 60 * 60 * 1000): Promise<number> {
    const now = new Date();
    const expiredExecutions: string[] = [];
    
    for (const [id, execution] of this.executions.entries()) {
      const age = now.getTime() - execution.createdAt.getTime();
      if (age > maxAge) {
        expiredExecutions.push(id);
      }
    }
    
    for (const id of expiredExecutions) {
      this.executions.delete(id);
    }
    
    return expiredExecutions.length;
  }

  /**
   * 备份存储数据
   */
  async backup(): Promise<StorageBackup> {
    return {
      timestamp: new Date(),
      executions: Array.from(this.executions.values()).map(exec => ({ ...exec })),
      definitions: Array.from(this.definitions.values()).map(def => ({ ...def }))
    };
  }

  /**
   * 从备份恢复数据
   */
  async restore(backup: StorageBackup): Promise<void> {
    this.executions.clear();
    this.definitions.clear();
    
    for (const execution of backup.executions) {
      this.executions.set(execution.id, execution);
    }
    
    for (const definition of backup.definitions) {
      this.definitions.set(definition.id, definition);
    }
  }

  /**
   * 获取存储统计信息
   */
  async getStorageStats(): Promise<StorageStats> {
    return {
      executionCount: this.executions.size,
      definitionCount: this.definitions.size,
      memoryUsage: this.calculateMemoryUsage(),
      lastBackup: null
    };
  }

  /**
   * 验证执行实例
   */
  private validateExecution(execution: WorkflowExecution): void {
    if (!execution.id) {
      throw new ExecutionError('Execution must have an id');
    }
    
    if (!execution.workflowId) {
      throw new ExecutionError('Execution must have a workflowId');
    }
    
    if (!execution.status) {
      throw new ExecutionError('Execution must have a status');
    }
    
    if (!execution.createdAt) {
      throw new ExecutionError('Execution must have a createdAt timestamp');
    }
    
    if (!execution.updatedAt) {
      throw new ExecutionError('Execution must have an updatedAt timestamp');
    }
    
    if (execution.createdAt > execution.updatedAt) {
      throw new ExecutionError('createdAt cannot be after updatedAt');
    }
  }

  /**
   * 验证工作流定义
   */
  private validateDefinition(definition: WorkflowDefinition): void {
    if (!definition.id) {
      throw new ExecutionError('Workflow definition must have an id');
    }
    
    if (!definition.name) {
      throw new ExecutionError('Workflow definition must have a name');
    }
    
    if (!definition.version) {
      throw new ExecutionError('Workflow definition must have a version');
    }
    
    if (!definition.steps || definition.steps.length === 0) {
      throw new ExecutionError('Workflow definition must have at least one step');
    }
  }

  /**
   * 计算内存使用量
   */
  private calculateMemoryUsage(): number {
    const executionsSize = JSON.stringify(Array.from(this.executions.values())).length;
    const definitionsSize = JSON.stringify(Array.from(this.definitions.values())).length;
    return executionsSize + definitionsSize;
  }
}

/**
 * 文件系统存储实现 - 用于生产环境
 */
export class FileSystemStorage implements WorkflowStorage {
  constructor(private storagePath: string) {
    // 确保存储目录存在
    // 实际实现中需要创建目录和初始化文件
  }

  async saveExecution(_execution: WorkflowExecution): Promise<void> {
    throw new Error('FileSystemStorage not implemented yet');
  }

  async getExecution(_executionId: string): Promise<WorkflowExecution | null> {
    throw new Error('FileSystemStorage not implemented yet');
  }

  async updateExecution(_execution: WorkflowExecution): Promise<void> {
    throw new Error('FileSystemStorage not implemented yet');
  }

  async deleteExecution(_executionId: string): Promise<void> {
    throw new Error('FileSystemStorage not implemented yet');
  }

  async listExecutions(
    _workflowId?: string, 
    _limit: number = 100, 
    _offset: number = 0
  ): Promise<WorkflowExecution[]> {
    throw new Error('FileSystemStorage not implemented yet');
  }
}

// 搜索条件接口
export interface ExecutionSearchCriteria {
  workflowId?: string;
  status?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  variables?: Record<string, any>;
}

// 执行统计接口
export interface ExecutionStats {
  total: number;
  byStatus: Record<string, number>;
  averageDuration: number;
  successRate: number;
}

// 存储备份接口
export interface StorageBackup {
  timestamp: Date;
  executions: WorkflowExecution[];
  definitions: WorkflowDefinition[];
}

// 存储统计接口
export interface StorageStats {
  executionCount: number;
  definitionCount: number;
  memoryUsage: number;
  lastBackup: Date | null;
}

/**
 * 存储工厂 - 根据环境选择合适的存储实现
 */
export class StorageFactory {
  static createStorage(environment: string = 'development'): WorkflowStorage {
    switch (environment) {
      case 'production':
        return new FileSystemStorage('/data/workflows');
      case 'test':
      case 'development':
      default:
        return new InMemoryStorage();
    }
  }
}

/**
 * 存储管理器 - 提供高级存储操作
 */
export class StorageManager {
  constructor(private storage: InMemoryStorage) {}

  /**
   * 批量保存执行实例
   */
  async saveExecutionsBatch(executions: WorkflowExecution[]): Promise<void> {
    for (const execution of executions) {
      await this.storage.saveExecution(execution);
    }
  }

  /**
   * 批量删除执行实例
   */
  async deleteExecutionsBatch(executionIds: string[]): Promise<void> {
    for (const executionId of executionIds) {
      await this.storage.deleteExecution(executionId);
    }
  }

  /**
   * 迁移执行实例到新存储
   */
  async migrateExecutions(
    sourceStorage: WorkflowStorage,
    targetStorage: WorkflowStorage,
    batchSize: number = 100
  ): Promise<number> {
    let migratedCount = 0;
    let offset = 0;
    
    while (true) {
      const executions = await sourceStorage.listExecutions(undefined, batchSize, offset);
      
      if (executions.length === 0) {
        break;
      }
      
      for (const execution of executions) {
        await targetStorage.saveExecution(execution);
        migratedCount++;
      }
      
      offset += batchSize;
    }
    
    return migratedCount;
  }

  /**
   * 导出执行数据
   */
  async exportExecutions(
    format: 'json' | 'csv' = 'json',
    criteria?: ExecutionSearchCriteria
  ): Promise<string> {
    const executions = await this.storage.searchExecutions(criteria || {}, 1000, 0);
    
    if (format === 'csv') {
      return this.convertToCSV(executions);
    } else {
      return JSON.stringify(executions, null, 2);
    }
  }

  /**
   * 转换为CSV格式
   */
  private convertToCSV(executions: WorkflowExecution[]): string {
    if (executions.length === 0) {
      return '';
    }
    
    const headers = ['id', 'workflowId', 'status', 'createdAt', 'updatedAt', 'variables'];
    const csvRows = [headers.join(',')];
    
    for (const exec of executions) {
      const row = [
        exec.id,
        exec.workflowId,
        exec.status,
        exec.createdAt.toISOString(),
        exec.updatedAt.toISOString(),
        JSON.stringify(exec.variables)
      ].map(field => `"${field}"`);
      
      csvRows.push(row.join(','));
    }
    
    return csvRows.join('\n');
  }
}