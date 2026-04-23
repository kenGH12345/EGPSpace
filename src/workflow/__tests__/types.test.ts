import {
  WorkflowDefinition,
  WorkflowStep,
  WorkflowExecution,
  ValidationError,
  ExecutionError,
  TimeoutError,
  WorkflowStepType,
  WorkflowExecutionStatus,
  DEFAULT_TIMEOUT,
  DEFAULT_RETRY_CONFIG,
  WORKFLOW_EVENTS
} from '../types';

describe('Workflow Types', () => {
  describe('WorkflowDefinition', () => {
    test('should create a valid WorkflowDefinition', () => {
      const definition: WorkflowDefinition = {
        id: 'test-workflow',
        name: 'Test Workflow',
        version: '1.0.0',
        steps: []
      };

      expect(definition.id).toBe('test-workflow');
      expect(definition.name).toBe('Test Workflow');
      expect(definition.version).toBe('1.0.0');
      expect(definition.steps).toEqual([]);
    });

    test('should support optional fields', () => {
      const definition: WorkflowDefinition = {
        id: 'test-workflow',
        name: 'Test Workflow',
        version: '1.0.0',
        steps: [],
        description: 'A test workflow',
        metadata: { priority: 'high' }
      };

      expect(definition.description).toBe('A test workflow');
      expect(definition.metadata?.priority).toBe('high');
    });
  });

  describe('WorkflowStep', () => {
    test('should create a valid action step', () => {
      const step: WorkflowStep = {
        id: 'step1',
        name: 'First Step',
        type: 'action',
        component: 'test-component'
      };

      expect(step.id).toBe('step1');
      expect(step.type).toBe('action');
      expect(step.component).toBe('test-component');
    });

    test('should create a decision step with conditions', () => {
      const step: WorkflowStep = {
        id: 'decision1',
        name: 'Check Condition',
        type: 'decision',
        component: 'condition-checker',
        conditions: [
          { condition: 'x > 10', nextStep: 'step2' },
          { condition: 'x <= 10', nextStep: 'step3' }
        ]
      };

      expect(step.type).toBe('decision');
      expect(step.conditions).toHaveLength(2);
      expect(step.conditions![0].nextStep).toBe('step2');
    });

    test('should support all step types', () => {
      const types: WorkflowStepType[] = ['action', 'decision', 'parallel', 'experiment', 'condition'];
      
      types.forEach(type => {
        const step: WorkflowStep = {
          id: `step-${type}`,
          name: `${type} step`,
          type,
          component: 'test-component'
        };
        expect(step.type).toBe(type);
      });
    });
  });

  describe('WorkflowExecution', () => {
    test('should create a valid WorkflowExecution', () => {
      const execution: WorkflowExecution = {
        id: 'exec-123',
        workflowId: 'test-workflow',
        status: 'pending',
        stepHistory: [],
        variables: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(execution.id).toBe('exec-123');
      expect(execution.status).toBe('pending');
      expect(execution.stepHistory).toEqual([]);
    });

    test('should support all execution statuses', () => {
      const statuses: WorkflowExecutionStatus[] = [
        'pending', 'running', 'completed', 'failed', 'paused', 'cancelled'
      ];

      statuses.forEach(status => {
        const execution: WorkflowExecution = {
          id: 'exec-123',
          workflowId: 'test-workflow',
          status,
          stepHistory: [],
          variables: {},
          createdAt: new Date(),
          updatedAt: new Date()
        };
        expect(execution.status).toBe(status);
      });
    });
  });

  describe('Error types', () => {
    test('ValidationError should have correct name and message', () => {
      const error = new ValidationError('Invalid workflow');
      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe('Invalid workflow');
      expect(error).toBeInstanceOf(Error);
    });

    test('ValidationError should support details', () => {
      const error = new ValidationError('Invalid step', { stepId: 'step1' });
      expect(error.details).toEqual({ stepId: 'step1' });
    });

    test('ExecutionError should have correct name and stepId', () => {
      const error = new ExecutionError('Step failed', 'step1');
      expect(error.name).toBe('ExecutionError');
      expect(error.stepId).toBe('step1');
      expect(error.message).toBe('Step failed');
    });

    test('TimeoutError should have correct name and timeout', () => {
      const error = new TimeoutError('Operation timed out', 30000);
      expect(error.name).toBe('TimeoutError');
      expect(error.timeout).toBe(30000);
    });
  });

  describe('Constants', () => {
    test('DEFAULT_TIMEOUT should be 30000', () => {
      expect(DEFAULT_TIMEOUT).toBe(30000);
    });

    test('DEFAULT_RETRY_CONFIG should have correct values', () => {
      expect(DEFAULT_RETRY_CONFIG.maxAttempts).toBe(3);
      expect(DEFAULT_RETRY_CONFIG.backoffMultiplier).toBe(2);
      expect(DEFAULT_RETRY_CONFIG.maxDelay).toBe(60000);
    });

    test('WORKFLOW_EVENTS should have all event types', () => {
      expect(WORKFLOW_EVENTS.EXECUTION_STARTED).toBe('execution.started');
      expect(WORKFLOW_EVENTS.EXECUTION_COMPLETED).toBe('execution.completed');
      expect(WORKFLOW_EVENTS.EXECUTION_FAILED).toBe('execution.failed');
      expect(WORKFLOW_EVENTS.STEP_STARTED).toBe('step.started');
      expect(WORKFLOW_EVENTS.STEP_COMPLETED).toBe('step.completed');
      expect(WORKFLOW_EVENTS.STEP_FAILED).toBe('step.failed');
    });
  });
});