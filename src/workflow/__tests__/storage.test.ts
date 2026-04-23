import { InMemoryStorage, StorageFactory, StorageManager } from '../storage';
import { WorkflowExecution, WorkflowDefinition, ExecutionError } from '../types';

describe('InMemoryStorage', () => {
  let storage: InMemoryStorage;

  const validExecution: WorkflowExecution = {
    id: 'exec-1',
    workflowId: 'test-workflow',
    status: 'pending',
    stepHistory: [],
    variables: {},
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const validDefinition: WorkflowDefinition = {
    id: 'test-workflow',
    name: 'Test Workflow',
    version: '1.0.0',
    steps: [
      { id: 'step1', name: 'First Step', type: 'action', component: 'comp' }
    ]
  };

  beforeEach(() => {
    storage = new InMemoryStorage();
  });

  describe('saveExecution / getExecution', () => {
    test('should save and retrieve an execution', async () => {
      await storage.saveExecution(validExecution);
      const retrieved = await storage.getExecution(validExecution.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe('exec-1');
      expect(retrieved?.workflowId).toBe('test-workflow');
      expect(retrieved?.status).toBe('pending');
    });

    test('should return null for non-existent execution', async () => {
      const result = await storage.getExecution('non-existent');
      expect(result).toBeNull();
    });

    test('should return a copy (not a reference)', async () => {
      await storage.saveExecution(validExecution);
      const retrieved = await storage.getExecution(validExecution.id);

      retrieved!.status = 'running';
      const original = await storage.getExecution(validExecution.id);
      expect(original?.status).toBe('pending');
    });

    test('should throw for execution without id', async () => {
      const invalid = { ...validExecution, id: '' };
      await expect(storage.saveExecution(invalid)).rejects.toThrow(ExecutionError);
    });

    test('should throw for execution without workflowId', async () => {
      const invalid = { ...validExecution, workflowId: '' };
      await expect(storage.saveExecution(invalid)).rejects.toThrow(ExecutionError);
    });

    test('should throw when createdAt > updatedAt', async () => {
      const now = new Date();
      const invalid = {
        ...validExecution,
        createdAt: new Date(now.getTime() + 1000),
        updatedAt: now
      };
      await expect(storage.saveExecution(invalid)).rejects.toThrow(ExecutionError);
    });
  });

  describe('updateExecution', () => {
    test('should update an existing execution', async () => {
      await storage.saveExecution(validExecution);
      
      const updated = { ...validExecution, status: 'running' as const, startedAt: new Date() };
      updated.updatedAt = new Date();
      await storage.updateExecution(updated);

      const retrieved = await storage.getExecution(validExecution.id);
      expect(retrieved?.status).toBe('running');
    });

    test('should throw when updating non-existent execution', async () => {
      await expect(storage.updateExecution(validExecution)).rejects.toThrow(ExecutionError);
    });
  });

  describe('deleteExecution', () => {
    test('should delete an existing execution', async () => {
      await storage.saveExecution(validExecution);
      await storage.deleteExecution(validExecution.id);
      
      const result = await storage.getExecution(validExecution.id);
      expect(result).toBeNull();
    });

    test('should throw when deleting non-existent execution', async () => {
      await expect(storage.deleteExecution('non-existent')).rejects.toThrow(ExecutionError);
    });
  });

  describe('listExecutions', () => {
    beforeEach(async () => {
      await storage.saveExecution({ ...validExecution, id: 'exec-1', workflowId: 'wf-A' });
      await storage.saveExecution({ ...validExecution, id: 'exec-2', workflowId: 'wf-A' });
      await storage.saveExecution({ ...validExecution, id: 'exec-3', workflowId: 'wf-B' });
    });

    test('should list all executions', async () => {
      const executions = await storage.listExecutions();
      expect(executions).toHaveLength(3);
    });

    test('should filter by workflowId', async () => {
      const executions = await storage.listExecutions('wf-A');
      expect(executions).toHaveLength(2);
      expect(executions.every(e => e.workflowId === 'wf-A')).toBe(true);
    });

    test('should support pagination', async () => {
      const page1 = await storage.listExecutions(undefined, 2, 0);
      const page2 = await storage.listExecutions(undefined, 2, 2);
      
      expect(page1).toHaveLength(2);
      expect(page2).toHaveLength(1);
    });
  });

  describe('definition CRUD', () => {
    test('should save and retrieve a definition', async () => {
      await storage.saveDefinition(validDefinition);
      const retrieved = await storage.getDefinition('test-workflow');

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe('test-workflow');
      expect(retrieved?.name).toBe('Test Workflow');
    });

    test('should update a definition', async () => {
      await storage.saveDefinition(validDefinition);
      
      const updated = { ...validDefinition, name: 'Updated Workflow' };
      await storage.updateDefinition(updated);

      const retrieved = await storage.getDefinition('test-workflow');
      expect(retrieved?.name).toBe('Updated Workflow');
    });

    test('should delete a definition', async () => {
      await storage.saveDefinition(validDefinition);
      await storage.deleteDefinition('test-workflow');
      
      const result = await storage.getDefinition('test-workflow');
      expect(result).toBeNull();
    });

    test('should throw when updating non-existent definition', async () => {
      await expect(storage.updateDefinition(validDefinition)).rejects.toThrow(ExecutionError);
    });

    test('should throw when deleting non-existent definition', async () => {
      await expect(storage.deleteDefinition('non-existent')).rejects.toThrow(ExecutionError);
    });
  });

  describe('searchExecutions', () => {
    beforeEach(async () => {
      await storage.saveExecution({ ...validExecution, id: 'exec-1', workflowId: 'wf-A', status: 'completed', variables: { env: 'prod' } });
      await storage.saveExecution({ ...validExecution, id: 'exec-2', workflowId: 'wf-A', status: 'failed', variables: { env: 'dev' } });
      await storage.saveExecution({ ...validExecution, id: 'exec-3', workflowId: 'wf-B', status: 'pending', variables: { env: 'prod' } });
    });

    test('should filter by workflowId', async () => {
      const results = await storage.searchExecutions({ workflowId: 'wf-A' });
      expect(results).toHaveLength(2);
    });

    test('should filter by status', async () => {
      const results = await storage.searchExecutions({ status: 'completed' });
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('exec-1');
    });

    test('should filter by variables', async () => {
      const results = await storage.searchExecutions({ variables: { env: 'prod' } });
      expect(results).toHaveLength(2);
    });

    test('should combine multiple filters', async () => {
      const results = await storage.searchExecutions({ workflowId: 'wf-A', status: 'failed' });
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('exec-2');
    });
  });

  describe('getExecutionStats', () => {
    beforeEach(async () => {
      await storage.saveExecution({ ...validExecution, id: 'exec-1', status: 'completed', startedAt: new Date(), completedAt: new Date() });
      await storage.saveExecution({ ...validExecution, id: 'exec-2', status: 'failed' });
      await storage.saveExecution({ ...validExecution, id: 'exec-3', status: 'pending' });
    });

    test('should calculate total count', async () => {
      const stats = await storage.getExecutionStats();
      expect(stats.total).toBe(3);
    });

    test('should calculate success rate', async () => {
      const stats = await storage.getExecutionStats();
      expect(stats.successRate).toBeCloseTo(1 / 3);
    });

    test('should count by status', async () => {
      const stats = await storage.getExecutionStats();
      expect(stats.byStatus['completed']).toBe(1);
      expect(stats.byStatus['failed']).toBe(1);
      expect(stats.byStatus['pending']).toBe(1);
    });

    test('should filter stats by workflowId', async () => {
      const stats = await storage.getExecutionStats('non-existent');
      expect(stats.total).toBe(0);
    });
  });

  describe('backup and restore', () => {
    test('should backup and restore data', async () => {
      await storage.saveExecution(validExecution);
      await storage.saveDefinition(validDefinition);

      const backup = await storage.backup();
      expect(backup.executions).toHaveLength(1);
      expect(backup.definitions).toHaveLength(1);
      expect(backup.timestamp).toBeInstanceOf(Date);

      const newStorage = new InMemoryStorage();
      await newStorage.restore(backup);

      const execution = await newStorage.getExecution('exec-1');
      expect(execution).toBeDefined();

      const definition = await newStorage.getDefinition('test-workflow');
      expect(definition).toBeDefined();
    });
  });

  describe('cleanupExpiredExecutions', () => {
    test('should remove expired executions', async () => {
      const oldExecution: WorkflowExecution = {
        ...validExecution,
        id: 'exec-old',
        createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 25 * 60 * 60 * 1000)
      };
      await storage.saveExecution(oldExecution);

      const removed = await storage.cleanupExpiredExecutions(24 * 60 * 60 * 1000);
      expect(removed).toBe(1);

      const result = await storage.getExecution('exec-old');
      expect(result).toBeNull();
    });

    test('should keep non-expired executions', async () => {
      await storage.saveExecution(validExecution);
      const removed = await storage.cleanupExpiredExecutions(24 * 60 * 60 * 1000);
      expect(removed).toBe(0);
    });
  });

  describe('getStorageStats', () => {
    test('should return correct storage stats', async () => {
      await storage.saveExecution(validExecution);
      await storage.saveDefinition(validDefinition);

      const stats = await storage.getStorageStats();
      expect(stats.executionCount).toBe(1);
      expect(stats.definitionCount).toBe(1);
      expect(stats.memoryUsage).toBeGreaterThan(0);
      expect(stats.lastBackup).toBeNull();
    });
  });
});

describe('StorageFactory', () => {
  test('should create InMemoryStorage for development', () => {
    const storage = StorageFactory.createStorage('development');
    expect(storage).toBeInstanceOf(InMemoryStorage);
  });

  test('should create InMemoryStorage for test', () => {
    const storage = StorageFactory.createStorage('test');
    expect(storage).toBeInstanceOf(InMemoryStorage);
  });

  test('should create FileSystemStorage for production', () => {
    const storage = StorageFactory.createStorage('production');
    expect(storage.constructor.name).toBe('FileSystemStorage');
  });
});

describe('StorageManager', () => {
  let storage: InMemoryStorage;
  let manager: StorageManager;

  const validExecution: WorkflowExecution = {
    id: 'exec-1',
    workflowId: 'test-workflow',
    status: 'pending',
    stepHistory: [],
    variables: {},
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    storage = new InMemoryStorage();
    manager = new StorageManager(storage);
  });

  test('should save executions in batch', async () => {
    const executions = [
      { ...validExecution, id: 'exec-1' },
      { ...validExecution, id: 'exec-2' },
      { ...validExecution, id: 'exec-3' }
    ];

    await manager.saveExecutionsBatch(executions);
    const all = await storage.listExecutions();
    expect(all).toHaveLength(3);
  });

  test('should delete executions in batch', async () => {
    await storage.saveExecution({ ...validExecution, id: 'exec-1' });
    await storage.saveExecution({ ...validExecution, id: 'exec-2' });

    await manager.deleteExecutionsBatch(['exec-1', 'exec-2']);
    const all = await storage.listExecutions();
    expect(all).toHaveLength(0);
  });

  test('should export executions as JSON', async () => {
    await storage.saveExecution(validExecution);
    const json = await manager.exportExecutions('json');
    
    const parsed = JSON.parse(json);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed).toHaveLength(1);
  });

  test('should export executions as CSV', async () => {
    await storage.saveExecution(validExecution);
    const csv = await manager.exportExecutions('csv');
    
    expect(csv).toContain('id');
    expect(csv).toContain('workflowId');
    expect(csv).toContain('exec-1');
  });
});