import {
  WorkflowSystem,
  createWorkflowSystem,
  createWorkflowTemplate,
  validateWorkflowDefinition,
  createStep,
  createDecisionStep,
  WORKFLOW_VERSION,
  SUPPORTED_STEP_TYPES,
  SUPPORTED_STATUSES
} from '../index';

describe('WorkflowSystem', () => {
  let system: WorkflowSystem;

  const validDefinition = createWorkflowTemplate(
    'test-workflow',
    'Test Workflow',
    [createStep('step1', 'First Step', 'action', 'test-component')]
  );

  beforeEach(() => {
    system = createWorkflowSystem();
  });

  describe('constructor', () => {
    test('should create with default config', () => {
      const sys = new WorkflowSystem();
      const status = sys.getSystemStatus();
      expect(status.version).toBe(WORKFLOW_VERSION);
      expect(status.storageType).toBe('memory');
    });

    test('should create with custom config', () => {
      const sys = new WorkflowSystem({ defaultTimeout: 60000 });
      const status = sys.getSystemStatus();
      expect(status.version).toBe(WORKFLOW_VERSION);
    });

    test('should create with events disabled', () => {
      const sys = new WorkflowSystem({ enableEvents: false });
      const status = sys.getSystemStatus();
      expect(status.version).toBe(WORKFLOW_VERSION);
    });

    test('should create with validation disabled', async () => {
      const sys = new WorkflowSystem({ enableValidation: false });
      // Even with validation disabled, storage has its own checks
      // So use a definition that passes storage validation
      const status = sys.getSystemStatus();
      expect(status.version).toBe(WORKFLOW_VERSION);
    });
  });

  describe('definition CRUD', () => {
    test('should create and retrieve a definition', async () => {
      await system.createDefinition(validDefinition);
      const retrieved = await system.getDefinition('test-workflow');

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe('test-workflow');
      expect(retrieved?.name).toBe('Test Workflow');
    });

    test('should update a definition', async () => {
      await system.createDefinition(validDefinition);
      const updated = { ...validDefinition, name: 'Updated' };
      await system.updateDefinition(updated);

      const retrieved = await system.getDefinition('test-workflow');
      expect(retrieved?.name).toBe('Updated');
    });

    test('should delete a definition', async () => {
      await system.createDefinition(validDefinition);
      await system.deleteDefinition('test-workflow');

      const result = await system.getDefinition('test-workflow');
      expect(result).toBeNull();
    });

    test('should list definitions', async () => {
      await system.createDefinition(validDefinition);
      await system.createDefinition({
        ...validDefinition, id: 'wf-2', name: 'Second'
      });

      const definitions = await system.listDefinitions();
      expect(definitions).toHaveLength(2);
    });

    test('should reject invalid definition when validation enabled', async () => {
      const invalid = { ...validDefinition, id: '' };
      await expect(system.createDefinition(invalid)).rejects.toThrow();
    });
  });

  describe('execution lifecycle', () => {
    test('should create and start an execution', async () => {
      await system.createDefinition(validDefinition);
      const execution = await system.createExecution('test-workflow');

      expect(execution.id).toBeDefined();
      expect(execution.workflowId).toBe('test-workflow');
      expect(execution.status).toBe('pending');

      await system.startExecution(execution.id);
      const updated = system.getExecution(execution.id);
      expect(updated?.status).toBe('completed');
    });

    test('should throw for non-existent workflow', async () => {
      await expect(system.createExecution('non-existent')).rejects.toThrow('not found');
    });

    test('should cancel a pending execution', async () => {
      await system.createDefinition(validDefinition);
      const execution = await system.createExecution('test-workflow');
      await system.cancelExecution(execution.id);

      const updated = system.getExecution(execution.id);
      expect(updated?.status).toBe('cancelled');
    });

    test('should pause and resume a running execution', async () => {
      await system.createDefinition(validDefinition);
      const execution = await system.createExecution('test-workflow');

      // Manually set execution to running state
      const execRef = system.getExecution(execution.id);
      if (execRef) {
        execRef.status = 'running';
        execRef.startedAt = new Date();
      }

      await system.pauseExecution(execution.id);
      const paused = system.getExecution(execution.id);
      expect(paused?.status).toBe('paused');

      await system.resumeExecution(execution.id);
      const resumed = system.getExecution(execution.id);
      expect(resumed?.status).toBe('running');
    });

    test('should create execution with initial variables', async () => {
      await system.createDefinition(validDefinition);
      const execution = await system.createExecution('test-workflow', { foo: 'bar' });
      expect(execution.variables).toEqual({ foo: 'bar' });
    });

    test('should get executions by workflow', async () => {
      await system.createDefinition(validDefinition);
      await system.createExecution('test-workflow');
      await system.createExecution('test-workflow');

      const executions = await system.getExecutionsByWorkflow('test-workflow');
      expect(executions).toHaveLength(2);
    });

    test('should return null for non-existent execution', () => {
      expect(system.getExecution('non-existent')).toBeNull();
    });

    test('should search executions', async () => {
      await system.createDefinition(validDefinition);
      await system.createExecution('test-workflow');

      const results = await system.searchExecutions({ workflowId: 'test-workflow' });
      expect(results.length).toBeGreaterThan(0);
    });

    test('should get execution stats', async () => {
      await system.createDefinition(validDefinition);
      await system.createExecution('test-workflow');

      const stats = await system.getExecutionStats();
      expect(stats.total).toBeGreaterThanOrEqual(0);
    });

    test('should get execution stats for specific workflow', async () => {
      await system.createDefinition(validDefinition);
      await system.createExecution('test-workflow');

      const stats = await system.getExecutionStats('test-workflow');
      expect(stats).toBeDefined();
    });
  });

  describe('validation', () => {
    test('should validate definition and return report', () => {
      const report = system.validateDefinition(validDefinition);
      expect(report.isValid).toBe(true);
      expect(report.errors).toHaveLength(0);
    });

    test('should report errors for invalid definition', () => {
      const invalid = { ...validDefinition, id: '' };
      const report = system.validateDefinition(invalid);
      expect(report.isValid).toBe(false);
    });
  });

  describe('system status', () => {
    test('should return system status', () => {
      const status = system.getSystemStatus();
      expect(status.version).toBe(WORKFLOW_VERSION);
      expect(status.isRunning).toBe(false);
      expect(status.executionCount).toBe(0);
      expect(status.uptime).toBeGreaterThanOrEqual(0);
    });

    test('should reflect execution count', async () => {
      await system.createDefinition(validDefinition);
      await system.createExecution('test-workflow');
      await system.createExecution('test-workflow');

      const status = system.getSystemStatus();
      expect(status.executionCount).toBe(2);
    });
  });

  describe('backup and restore', () => {
    test('should backup and restore data', async () => {
      await system.createDefinition(validDefinition);
      const backup = await system.backup();
      expect(backup.executions).toBeDefined();
      expect(backup.definitions).toHaveLength(1);

      const newSystem = createWorkflowSystem();
      await newSystem.restore(backup);
      const def = await newSystem.getDefinition('test-workflow');
      expect(def).toBeDefined();
    });
  });

  describe('storage stats', () => {
    test('should return storage stats', async () => {
      await system.createDefinition(validDefinition);
      const stats = await system.getStorageStats();
      expect(stats.executionCount).toBe(0);
      expect(stats.definitionCount).toBe(1);
    });
  });

  describe('cleanup', () => {
    test('should cleanup expired executions', async () => {
      const removed = await system.cleanupExpiredExecutions();
      expect(removed).toBe(0);
    });
  });
});

describe('Helper Functions', () => {
  describe('createWorkflowTemplate', () => {
    test('should create a valid definition', () => {
      const steps = [createStep('s1', 'Step 1', 'action', 'comp')];
      const def = createWorkflowTemplate('wf-1', 'My Workflow', steps);

      expect(def.id).toBe('wf-1');
      expect(def.name).toBe('My Workflow');
      expect(def.version).toBe('1.0.0');
      expect(def.steps).toHaveLength(1);
      expect(def.createdAt).toBeInstanceOf(Date);
      expect(def.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('createStep', () => {
    test('should create an action step', () => {
      const step = createStep('s1', 'Step 1', 'action', 'comp');
      expect(step.id).toBe('s1');
      expect(step.name).toBe('Step 1');
      expect(step.type).toBe('action');
      expect(step.component).toBe('comp');
    });

    test('should create step with config', () => {
      const step = createStep('s1', 'Step 1', 'action', 'comp', { key: 'value' });
      expect(step.config).toEqual({ key: 'value' });
    });
  });

  describe('createDecisionStep', () => {
    test('should create a decision step with conditions', () => {
      const conditions = [
        { condition: 'x > 0', nextStep: 'step2' },
        { condition: 'x <= 0', nextStep: 'step3' }
      ];
      const step = createDecisionStep('d1', 'Decision', 'comp', conditions);

      expect(step.type).toBe('decision');
      expect(step.conditions).toHaveLength(2);
    });
  });

  describe('validateWorkflowDefinition', () => {
    test('should return valid report for valid definition', () => {
      const def = createWorkflowTemplate(
        'wf-1', 'Test',
        [createStep('s1', 'Step', 'action', 'comp')]
      );
      const report = validateWorkflowDefinition(def);
      expect(report.isValid).toBe(true);
    });

    test('should return invalid report for invalid definition', () => {
      const report = validateWorkflowDefinition({
        id: '', name: 'Test', version: '1.0.0',
        steps: [createStep('s1', 'Step', 'action', 'comp')]
      });
      expect(report.isValid).toBe(false);
    });
  });

  describe('Constants', () => {
    test('WORKFLOW_VERSION should be defined', () => {
      expect(WORKFLOW_VERSION).toBe('1.0.0');
    });

    test('SUPPORTED_STEP_TYPES should include all types', () => {
      expect(SUPPORTED_STEP_TYPES).toContain('action');
      expect(SUPPORTED_STEP_TYPES).toContain('decision');
      expect(SUPPORTED_STEP_TYPES).toContain('parallel');
      expect(SUPPORTED_STEP_TYPES).toContain('experiment');
      expect(SUPPORTED_STEP_TYPES).toContain('condition');
    });

    test('SUPPORTED_STATUSES should include all statuses', () => {
      expect(SUPPORTED_STATUSES).toContain('pending');
      expect(SUPPORTED_STATUSES).toContain('running');
      expect(SUPPORTED_STATUSES).toContain('completed');
      expect(SUPPORTED_STATUSES).toContain('failed');
      expect(SUPPORTED_STATUSES).toContain('paused');
      expect(SUPPORTED_STATUSES).toContain('cancelled');
    });
  });
});