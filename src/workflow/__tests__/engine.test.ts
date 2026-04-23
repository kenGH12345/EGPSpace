import { WorkflowEngine } from '../engine';
import { WorkflowDefinition, ValidationError } from '../types';

describe('WorkflowEngine', () => {
  let engine: WorkflowEngine;

  const validDefinition: WorkflowDefinition = {
    id: 'test-workflow',
    name: 'Test Workflow',
    version: '1.0.0',
    steps: [
      { id: 'step1', name: 'First Step', type: 'action', component: 'test-component' }
    ]
  };

  beforeEach(() => {
    engine = new WorkflowEngine();
  });

  describe('createExecution', () => {
    test('should create a new execution from a valid definition', async () => {
      const execution = await engine.createExecution(validDefinition);

      expect(execution.id).toBeDefined();
      expect(execution.id).toMatch(/^exec_\d+_/);
      expect(execution.workflowId).toBe('test-workflow');
      expect(execution.status).toBe('pending');
      expect(execution.stepHistory).toEqual([]);
      expect(execution.variables).toEqual({});
      expect(execution.createdAt).toBeInstanceOf(Date);
      expect(execution.updatedAt).toBeInstanceOf(Date);
    });

    test('should create execution with initial variables', async () => {
      const variables = { userId: '123', mode: 'test' };
      const execution = await engine.createExecution(validDefinition, variables);

      expect(execution.variables).toEqual({ userId: '123', mode: 'test' });
    });

    test('should not modify the original variables object', async () => {
      const variables = { key: 'value' };
      const execution = await engine.createExecution(validDefinition, variables);

      execution.variables.key = 'modified';
      expect(variables.key).toBe('value');
    });

    test('should throw ValidationError for definition without id', async () => {
      const invalid = { ...validDefinition, id: '' };
      await expect(engine.createExecution(invalid)).rejects.toThrow(ValidationError);
    });

    test('should throw ValidationError for definition without name', async () => {
      const invalid = { ...validDefinition, name: '' };
      await expect(engine.createExecution(invalid)).rejects.toThrow(ValidationError);
    });

    test('should throw ValidationError for definition without version', async () => {
      const invalid = { ...validDefinition, version: '' };
      await expect(engine.createExecution(invalid)).rejects.toThrow(ValidationError);
    });

    test('should throw ValidationError for definition with empty steps', async () => {
      const invalid = { ...validDefinition, steps: [] };
      await expect(engine.createExecution(invalid)).rejects.toThrow(ValidationError);
    });

    test('should throw ValidationError for step without id', async () => {
      const invalid: WorkflowDefinition = {
        id: 'test', name: 'Test', version: '1.0.0',
        steps: [{ id: '', name: 'Step', type: 'action', component: 'comp' }]
      };
      await expect(engine.createExecution(invalid)).rejects.toThrow(ValidationError);
    });

    test('should throw ValidationError for step without component', async () => {
      const invalid: WorkflowDefinition = {
        id: 'test', name: 'Test', version: '1.0.0',
        steps: [{ id: 'step1', name: 'Step', type: 'action', component: '' }]
      };
      await expect(engine.createExecution(invalid)).rejects.toThrow(ValidationError);
    });
  });

  describe('startExecution', () => {
    test('should throw error for non-existent execution', async () => {
      await expect(engine.startExecution('non-existent')).rejects.toThrow('not found');
    });

    test('should execute workflow and transition to completed', async () => {
      const execution = await engine.createExecution(validDefinition);
      await engine.startExecution(execution.id);

      const updated = engine.getExecution(execution.id);
      expect(updated?.status).toBe('completed');
      expect(updated?.startedAt).toBeInstanceOf(Date);
      expect(updated?.completedAt).toBeInstanceOf(Date);
    });

    test('should throw error when starting a completed execution', async () => {
      const execution = await engine.createExecution(validDefinition);
      await engine.startExecution(execution.id);

      await expect(engine.startExecution(execution.id)).rejects.toThrow('already');
    });
  });

  describe('pauseExecution', () => {
    test('should throw error for non-existent execution', async () => {
      await expect(engine.pauseExecution('non-existent')).rejects.toThrow('not found');
    });

    test('should throw error when pausing a pending execution', async () => {
      const execution = await engine.createExecution(validDefinition);
      await expect(engine.pauseExecution(execution.id)).rejects.toThrow('Cannot pause');
    });

    test('should transition running execution to paused', async () => {
      const execution = await engine.createExecution(validDefinition);
      // Manually set execution to running state for pause test
      const execRef = engine.getExecution(execution.id);
      if (execRef) {
        execRef.status = 'running';
        execRef.startedAt = new Date();
      }

      await engine.pauseExecution(execution.id);

      const updated = engine.getExecution(execution.id);
      expect(updated?.status).toBe('paused');
    });
  });

  describe('cancelExecution', () => {
    test('should throw error for non-existent execution', async () => {
      await expect(engine.cancelExecution('non-existent')).rejects.toThrow('not found');
    });

    test('should cancel a pending execution', async () => {
      const execution = await engine.createExecution(validDefinition);
      await engine.cancelExecution(execution.id);

      const updated = engine.getExecution(execution.id);
      expect(updated?.status).toBe('cancelled');
      expect(updated?.completedAt).toBeInstanceOf(Date);
    });

    test('should cancel a completed execution', async () => {
      const execution = await engine.createExecution(validDefinition);
      await engine.startExecution(execution.id);
      await engine.cancelExecution(execution.id);

      const updated = engine.getExecution(execution.id);
      expect(updated?.status).toBe('cancelled');
    });
  });

  describe('getExecution', () => {
    test('should return null for non-existent execution', () => {
      expect(engine.getExecution('non-existent')).toBeNull();
    });

    test('should return execution after creation', async () => {
      const execution = await engine.createExecution(validDefinition);
      const retrieved = engine.getExecution(execution.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(execution.id);
    });
  });

  describe('getExecutionsByWorkflow', () => {
    test('should return empty array for workflow with no executions', async () => {
      const executions = await engine.getExecutionsByWorkflow('non-existent');
      expect(executions).toEqual([]);
    });

    test('should return all executions for a workflow', async () => {
      await engine.createExecution(validDefinition);
      await engine.createExecution(validDefinition);

      const executions = await engine.getExecutionsByWorkflow('test-workflow');
      expect(executions).toHaveLength(2);
    });

    test('should only return executions for the specified workflow', async () => {
      const otherDefinition = { ...validDefinition, id: 'other-workflow' };
      await engine.createExecution(validDefinition);
      await engine.createExecution(otherDefinition);

      const executions = await engine.getExecutionsByWorkflow('test-workflow');
      expect(executions).toHaveLength(1);
    });
  });

  describe('event system', () => {
    test('should register and trigger event listeners', async () => {
      const listener = jest.fn();
      engine.on('execution.started', listener);

      const execution = await engine.createExecution(validDefinition);
      expect(listener).toHaveBeenCalledWith(expect.objectContaining({
        id: execution.id
      }));
    });

    test('should support multiple listeners for the same event', async () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      engine.on('execution.started', listener1);
      engine.on('execution.started', listener2);

      await engine.createExecution(validDefinition);
      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });

    test('should handle listener errors gracefully', async () => {
      const errorListener = jest.fn(() => { throw new Error('Listener error'); });
      const normalListener = jest.fn();
      engine.on('execution.started', errorListener);
      engine.on('execution.started', normalListener);

      await engine.createExecution(validDefinition);
      expect(errorListener).toHaveBeenCalled();
      expect(normalListener).toHaveBeenCalled();
    });
  });

  describe('getStatus', () => {
    test('should return initial status', () => {
      const status = engine.getStatus();
      expect(status.isRunning).toBe(false);
      expect(status.executionCount).toBe(0);
    });

    test('should reflect execution count', async () => {
      await engine.createExecution(validDefinition);
      await engine.createExecution(validDefinition);

      const status = engine.getStatus();
      expect(status.executionCount).toBe(2);
    });
  });

  describe('cleanupExpiredExecutions', () => {
    test('should remove old executions', async () => {
      const execution = await engine.createExecution(validDefinition);
      
      // Manually set createdAt to 25 hours ago
      const executionRef = engine.getExecution(execution.id);
      if (executionRef) {
        executionRef.createdAt = new Date(Date.now() - 25 * 60 * 60 * 1000);
      }

      engine.cleanupExpiredExecutions(24 * 60 * 60 * 1000);
      expect(engine.getExecution(execution.id)).toBeNull();
    });

    test('should keep recent executions', async () => {
      const execution = await engine.createExecution(validDefinition);
      engine.cleanupExpiredExecutions(24 * 60 * 60 * 1000);
      expect(engine.getExecution(execution.id)).toBeDefined();
    });
  });

  describe('with storage', () => {
    let storage: any;

    beforeEach(() => {
      storage = {
        saveExecution: jest.fn().mockResolvedValue(undefined),
        updateExecution: jest.fn().mockResolvedValue(undefined)
      };
      engine = new WorkflowEngine(storage);
    });

    test('should persist execution to storage on creation', async () => {
      await engine.createExecution(validDefinition);
      expect(storage.saveExecution).toHaveBeenCalledTimes(1);
    });

    test('should update storage on execution state changes', async () => {
      const execution = await engine.createExecution(validDefinition);
      await engine.startExecution(execution.id);
      expect(storage.updateExecution).toHaveBeenCalled();
    });
  });
});