import { WorkflowValidator } from '../validator';
import { WorkflowDefinition, ValidationError } from '../types';

describe('WorkflowValidator', () => {
  let validator: WorkflowValidator;

  const validDefinition: WorkflowDefinition = {
    id: 'test-workflow',
    name: 'Test Workflow',
    version: '1.0.0',
    steps: [
      { id: 'step1', name: 'First Step', type: 'action', component: 'comp1' },
      { id: 'step2', name: 'Second Step', type: 'action', component: 'comp2' }
    ]
  };

  beforeEach(() => {
    validator = new WorkflowValidator();
  });

  describe('validateDefinition - required fields', () => {
    test('should pass for a valid definition', () => {
      expect(() => validator.validateDefinition(validDefinition)).not.toThrow();
    });

    test('should throw ValidationError for missing id', () => {
      const invalid = { ...validDefinition, id: '' };
      expect(() => validator.validateDefinition(invalid)).toThrow(ValidationError);
      expect(() => validator.validateDefinition(invalid)).toThrow(/id/);
    });

    test('should throw ValidationError for missing name', () => {
      const invalid = { ...validDefinition, name: '' };
      expect(() => validator.validateDefinition(invalid)).toThrow(ValidationError);
      expect(() => validator.validateDefinition(invalid)).toThrow(/name/);
    });

    test('should throw ValidationError for missing version', () => {
      const invalid = { ...validDefinition, version: '' };
      expect(() => validator.validateDefinition(invalid)).toThrow(ValidationError);
    });

    test('should throw ValidationError for empty steps', () => {
      const invalid = { ...validDefinition, steps: [] };
      expect(() => validator.validateDefinition(invalid)).toThrow(ValidationError);
    });
  });

  describe('validateDefinition - step validation', () => {
    test('should throw for step without id', () => {
      const invalid: WorkflowDefinition = {
        ...validDefinition,
        steps: [{ id: '', name: 'Step', type: 'action', component: 'comp' }]
      };
      expect(() => validator.validateDefinition(invalid)).toThrow(ValidationError);
    });

    test('should throw for step without name', () => {
      const invalid: WorkflowDefinition = {
        ...validDefinition,
        steps: [{ id: 's1', name: '', type: 'action', component: 'comp' }]
      };
      expect(() => validator.validateDefinition(invalid)).toThrow(ValidationError);
    });

    test('should throw for step without type', () => {
      const invalid: WorkflowDefinition = {
        ...validDefinition,
        steps: [{ id: 's1', name: 'Step', type: '' as any, component: 'comp' }]
      };
      expect(() => validator.validateDefinition(invalid)).toThrow(ValidationError);
    });

    test('should throw for step without component', () => {
      const invalid: WorkflowDefinition = {
        ...validDefinition,
        steps: [{ id: 's1', name: 'Step', type: 'action', component: '' }]
      };
      expect(() => validator.validateDefinition(invalid)).toThrow(ValidationError);
    });

    test('should throw for invalid step type', () => {
      const invalid: WorkflowDefinition = {
        ...validDefinition,
        steps: [{ id: 's1', name: 'Step', type: 'invalid' as any, component: 'comp' }]
      };
      expect(() => validator.validateDefinition(invalid)).toThrow(/Invalid step type/);
    });
  });

  describe('validateDefinition - duplicate step IDs', () => {
    test('should throw for duplicate step ids', () => {
      const invalid: WorkflowDefinition = {
        id: 'test', name: 'Test', version: '1.0.0',
        steps: [
          { id: 'step1', name: 'Step A', type: 'action', component: 'comp' },
          { id: 'step1', name: 'Step B', type: 'action', component: 'comp' }
        ]
      };
      expect(() => validator.validateDefinition(invalid)).toThrow(/Duplicate/);
    });
  });

  describe('validateDefinition - step references', () => {
    test('should throw when next references non-existent step', () => {
      const invalid: WorkflowDefinition = {
        id: 'test', name: 'Test', version: '1.0.0',
        steps: [
          { id: 'step1', name: 'Step', type: 'action', component: 'comp', next: 'non-existent' }
        ]
      };
      expect(() => validator.validateDefinition(invalid)).toThrow(/not found/);
    });

    test('should throw when condition nextStep references non-existent step', () => {
      const invalid: WorkflowDefinition = {
        id: 'test', name: 'Test', version: '1.0.0',
        steps: [
          {
            id: 'step1', name: 'Step', type: 'decision', component: 'comp',
            conditions: [{ condition: 'x > 0', nextStep: 'non-existent' }]
          }
        ]
      };
      expect(() => validator.validateDefinition(invalid)).toThrow(/not found/);
    });

    test('should pass when next references a valid step', () => {
      const valid: WorkflowDefinition = {
        id: 'test', name: 'Test', version: '1.0.0',
        steps: [
          { id: 'step1', name: 'Step 1', type: 'action', component: 'comp', next: 'step2' },
          { id: 'step2', name: 'Step 2', type: 'action', component: 'comp' }
        ]
      };
      expect(() => validator.validateDefinition(valid)).not.toThrow();
    });
  });

  describe('validateDefinition - cycle detection', () => {
    test('should detect direct cycle (step1 -> step2 -> step1)', () => {
      const cyclic: WorkflowDefinition = {
        id: 'test', name: 'Test', version: '1.0.0',
        steps: [
          { id: 'step1', name: 'Step 1', type: 'action', component: 'comp', next: 'step2' },
          { id: 'step2', name: 'Step 2', type: 'action', component: 'comp', next: 'step1' }
        ]
      };
      expect(() => validator.validateDefinition(cyclic)).toThrow(/Cycle detected/);
    });

    test('should detect self-referencing step', () => {
      const selfRef: WorkflowDefinition = {
        id: 'test', name: 'Test', version: '1.0.0',
        steps: [
          { id: 'step1', name: 'Step 1', type: 'action', component: 'comp', next: 'step1' }
        ]
      };
      expect(() => validator.validateDefinition(selfRef)).toThrow(/Cycle detected/);
    });

    test('should detect indirect cycle (step1 -> step2 -> step3 -> step1)', () => {
      const indirect: WorkflowDefinition = {
        id: 'test', name: 'Test', version: '1.0.0',
        steps: [
          { id: 'step1', name: 'Step 1', type: 'action', component: 'comp', next: 'step2' },
          { id: 'step2', name: 'Step 2', type: 'action', component: 'comp', next: 'step3' },
          { id: 'step3', name: 'Step 3', type: 'action', component: 'comp', next: 'step1' }
        ]
      };
      expect(() => validator.validateDefinition(indirect)).toThrow(/Cycle detected/);
    });

    test('should allow acyclic workflow', () => {
      const acyclic: WorkflowDefinition = {
        id: 'test', name: 'Test', version: '1.0.0',
        steps: [
          { id: 'step1', name: 'Step 1', type: 'action', component: 'comp', next: 'step2' },
          { id: 'step2', name: 'Step 2', type: 'action', component: 'comp', next: 'step3' },
          { id: 'step3', name: 'Step 3', type: 'action', component: 'comp' }
        ]
      };
      expect(() => validator.validateDefinition(acyclic)).not.toThrow();
    });
  });

  describe('validateDefinition - decision step', () => {
    test('should throw for decision step without conditions', () => {
      const invalid: WorkflowDefinition = {
        id: 'test', name: 'Test', version: '1.0.0',
        steps: [
          { id: 'step1', name: 'Decision', type: 'decision', component: 'comp' }
        ]
      };
      expect(() => validator.validateDefinition(invalid)).toThrow(/conditions/);
    });

    test('should throw for condition without nextStep', () => {
      const invalid: WorkflowDefinition = {
        id: 'test', name: 'Test', version: '1.0.0',
        steps: [
          {
            id: 'step1', name: 'Decision', type: 'decision', component: 'comp',
            conditions: [{ condition: 'x > 0', nextStep: '' }]
          }
        ]
      };
      expect(() => validator.validateDefinition(invalid)).toThrow(/nextStep/);
    });

    test('should throw for condition without expression', () => {
      const invalid: WorkflowDefinition = {
        id: 'test', name: 'Test', version: '1.0.0',
        steps: [
          {
            id: 'step1', name: 'Decision', type: 'decision', component: 'comp',
            conditions: [{ condition: '', nextStep: 'step2' }]
          },
          { id: 'step2', name: 'Step 2', type: 'action', component: 'comp' }
        ]
      };
      expect(() => validator.validateDefinition(invalid)).toThrow(/condition expression/);
    });
  });

  describe('validateDefinition - parallel step', () => {
    test('should throw for parallel step without parallel config', () => {
      const invalid: WorkflowDefinition = {
        id: 'test', name: 'Test', version: '1.0.0',
        steps: [
          { id: 'step1', name: 'Parallel', type: 'parallel', component: 'comp' }
        ]
      };
      expect(() => validator.validateDefinition(invalid)).toThrow(/parallel/);
    });

    test('should throw for parallel step without next step', () => {
      const invalid: WorkflowDefinition = {
        id: 'test', name: 'Test', version: '1.0.0',
        steps: [
          { id: 'step1', name: 'Parallel', type: 'parallel', component: 'comp', parallel: true }
        ]
      };
      expect(() => validator.validateDefinition(invalid)).toThrow(/next step/);
    });
  });

  describe('validateDefinition - timeout and retry', () => {
    test('should throw for zero or negative timeout', () => {
      const invalid: WorkflowDefinition = {
        id: 'test', name: 'Test', version: '1.0.0',
        steps: [
          { id: 'step1', name: 'Step', type: 'action', component: 'comp', timeout: 0 }
        ]
      };
      expect(() => validator.validateDefinition(invalid)).toThrow(/positive/);
    });

    test('should throw for timeout exceeding 24 hours', () => {
      const invalid: WorkflowDefinition = {
        id: 'test', name: 'Test', version: '1.0.0',
        steps: [
          { id: 'step1', name: 'Step', type: 'action', component: 'comp', timeout: 25 * 60 * 60 * 1000 }
        ]
      };
      expect(() => validator.validateDefinition(invalid)).toThrow(/24 hours/);
    });

    test('should throw for retry with maxAttempts < 1', () => {
      const invalid: WorkflowDefinition = {
        id: 'test', name: 'Test', version: '1.0.0',
        steps: [
          { id: 'step1', name: 'Step', type: 'action', component: 'comp', retry: { maxAttempts: 0, backoffMultiplier: 2, maxDelay: 1000 } }
        ]
      };
      expect(() => validator.validateDefinition(invalid)).toThrow(/maxAttempts/);
    });

    test('should throw for retry with backoffMultiplier < 1', () => {
      const invalid: WorkflowDefinition = {
        id: 'test', name: 'Test', version: '1.0.0',
        steps: [
          { id: 'step1', name: 'Step', type: 'action', component: 'comp', retry: { maxAttempts: 3, backoffMultiplier: 0.5, maxDelay: 1000 } }
        ]
      };
      expect(() => validator.validateDefinition(invalid)).toThrow(/backoffMultiplier/);
    });

    test('should throw for retry with negative maxDelay', () => {
      const invalid: WorkflowDefinition = {
        id: 'test', name: 'Test', version: '1.0.0',
        steps: [
          { id: 'step1', name: 'Step', type: 'action', component: 'comp', retry: { maxAttempts: 3, backoffMultiplier: 2, maxDelay: -1 } }
        ]
      };
      expect(() => validator.validateDefinition(invalid)).toThrow(/maxDelay/);
    });

    test('should accept valid timeout and retry config', () => {
      const valid: WorkflowDefinition = {
        id: 'test', name: 'Test', version: '1.0.0',
        steps: [
          {
            id: 'step1', name: 'Step', type: 'action', component: 'comp',
            timeout: 60000,
            retry: { maxAttempts: 3, backoffMultiplier: 2, maxDelay: 30000 }
          }
        ]
      };
      expect(() => validator.validateDefinition(valid)).not.toThrow();
    });
  });

  describe('validateExecution', () => {
    test('should pass for a valid execution', () => {
      const execution = {
        id: 'exec-1',
        workflowId: 'test-workflow',
        status: 'pending' as const,
        stepHistory: [],
        variables: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };
      expect(() => validator.validateExecution(execution)).not.toThrow();
    });

    test('should throw for execution without id', () => {
      const execution = {
        id: '',
        workflowId: 'test-workflow',
        status: 'pending' as const,
        stepHistory: [],
        variables: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };
      expect(() => validator.validateExecution(execution)).toThrow(ValidationError);
    });

    test('should throw for completed execution without completedAt', () => {
      const execution = {
        id: 'exec-1',
        workflowId: 'test-workflow',
        status: 'completed' as const,
        stepHistory: [],
        variables: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };
      expect(() => validator.validateExecution(execution)).toThrow(/completedAt/);
    });

    test('should throw when createdAt > updatedAt', () => {
      const now = new Date();
      const execution = {
        id: 'exec-1',
        workflowId: 'test-workflow',
        status: 'pending' as const,
        stepHistory: [],
        variables: {},
        createdAt: new Date(now.getTime() + 1000),
        updatedAt: now
      };
      expect(() => validator.validateExecution(execution)).toThrow(/createdAt/);
    });
  });

  describe('validateDefinition - experiment step', () => {
    test('should throw for experiment step without variants', () => {
      const invalid: WorkflowDefinition = {
        id: 'test', name: 'Test', version: '1.0.0',
        steps: [
          { id: 'step1', name: 'Experiment', type: 'experiment', component: 'comp', config: {} }
        ]
      };
      expect(() => validator.validateDefinition(invalid)).toThrow(/variants/);
    });

    test('should throw for experiment step with variant weights not summing to 100', () => {
      const invalid: WorkflowDefinition = {
        id: 'test', name: 'Test', version: '1.0.0',
        steps: [
          {
            id: 'step1', name: 'Experiment', type: 'experiment', component: 'comp',
            config: { variants: [{ weight: 30 }, { weight: 30 }] }
          }
        ]
      };
      expect(() => validator.validateDefinition(invalid)).toThrow(/100/);
    });

    test('should accept valid experiment step', () => {
      const valid: WorkflowDefinition = {
        id: 'test', name: 'Test', version: '1.0.0',
        steps: [
          {
            id: 'step1', name: 'Experiment', type: 'experiment', component: 'comp',
            config: { variants: [{ weight: 60 }, { weight: 40 }] }
          }
        ]
      };
      expect(() => validator.validateDefinition(valid)).not.toThrow();
    });
  });

  describe('validateDefinition - duplicate conditions', () => {
    test('should throw for duplicate condition expressions in decision step', () => {
      const invalid: WorkflowDefinition = {
        id: 'test', name: 'Test', version: '1.0.0',
        steps: [
          {
            id: 'step1', name: 'Decision', type: 'decision', component: 'comp',
            conditions: [
              { condition: 'x > 0', nextStep: 'step2' },
              { condition: 'x > 0', nextStep: 'step3' }
            ]
          },
          { id: 'step2', name: 'Step 2', type: 'action', component: 'comp' },
          { id: 'step3', name: 'Step 3', type: 'action', component: 'comp' }
        ]
      };
      expect(() => validator.validateDefinition(invalid)).toThrow(/Duplicate condition/);
    });
  });

  describe('validateExecution - status validation', () => {
    test('should throw for running execution without startedAt', () => {
      const execution = {
        id: 'exec-1',
        workflowId: 'test-workflow',
        status: 'running' as const,
        stepHistory: [],
        variables: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };
      expect(() => validator.validateExecution(execution)).toThrow(/startedAt/);
    });

    test('should throw for invalid execution status', () => {
      const execution = {
        id: 'exec-1',
        workflowId: 'test-workflow',
        status: 'invalid' as any,
        stepHistory: [],
        variables: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };
      expect(() => validator.validateExecution(execution)).toThrow(/Invalid execution status/);
    });
  });

  describe('validateExecution - timestamp validation', () => {
    test('should throw when startedAt is before createdAt', () => {
      const now = new Date();
      const execution = {
        id: 'exec-1',
        workflowId: 'test-workflow',
        status: 'running' as const,
        stepHistory: [],
        variables: {},
        createdAt: now,
        updatedAt: now,
        startedAt: new Date(now.getTime() - 1000)
      };
      expect(() => validator.validateExecution(execution)).toThrow(/startedAt/);
    });

    test('should throw when completedAt is before createdAt', () => {
      const now = new Date();
      const execution = {
        id: 'exec-1',
        workflowId: 'test-workflow',
        status: 'completed' as const,
        stepHistory: [],
        variables: {},
        createdAt: now,
        updatedAt: now,
        startedAt: now,
        completedAt: new Date(now.getTime() - 1000)
      };
      expect(() => validator.validateExecution(execution)).toThrow(/completedAt/);
    });

    test('should throw when completedAt is before startedAt', () => {
      const now = new Date();
      const execution = {
        id: 'exec-1',
        workflowId: 'test-workflow',
        status: 'completed' as const,
        stepHistory: [],
        variables: {},
        createdAt: new Date(now.getTime() - 2000),
        updatedAt: now,
        startedAt: new Date(now.getTime() - 1000),
        completedAt: new Date(now.getTime() - 1500)
      };
      expect(() => validator.validateExecution(execution)).toThrow(/completedAt/);
    });
  });

  describe('validateExecution - step history', () => {
    test('should throw for step history without stepId', () => {
      const execution = {
        id: 'exec-1',
        workflowId: 'test-workflow',
        status: 'pending' as const,
        stepHistory: [{ status: 'completed' as const, startedAt: new Date(), attempts: 1 }] as any,
        variables: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };
      expect(() => validator.validateExecution(execution)).toThrow(/stepId/);
    });

    test('should throw for step history without status', () => {
      const execution = {
        id: 'exec-1',
        workflowId: 'test-workflow',
        status: 'pending' as const,
        stepHistory: [{ stepId: 'step1', startedAt: new Date(), attempts: 1 }] as any,
        variables: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };
      expect(() => validator.validateExecution(execution)).toThrow(/status/);
    });

    test('should throw for step history without startedAt', () => {
      const execution = {
        id: 'exec-1',
        workflowId: 'test-workflow',
        status: 'pending' as const,
        stepHistory: [{ stepId: 'step1', status: 'completed' as const, attempts: 1 }] as any,
        variables: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };
      expect(() => validator.validateExecution(execution)).toThrow(/startedAt/);
    });

    test('should throw for invalid step history status', () => {
      const execution = {
        id: 'exec-1',
        workflowId: 'test-workflow',
        status: 'pending' as const,
        stepHistory: [{ stepId: 'step1', status: 'invalid' as any, startedAt: new Date(), attempts: 1 }],
        variables: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };
      expect(() => validator.validateExecution(execution)).toThrow(/Invalid step history status/);
    });

    test('should throw when step history completedAt is before startedAt', () => {
      const now = new Date();
      const execution = {
        id: 'exec-1',
        workflowId: 'test-workflow',
        status: 'pending' as const,
        stepHistory: [{
          stepId: 'step1',
          status: 'completed' as const,
          startedAt: now,
          completedAt: new Date(now.getTime() - 1000),
          attempts: 1
        }],
        variables: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };
      expect(() => validator.validateExecution(execution)).toThrow(/completedAt/);
    });

    test('should pass for valid step history', () => {
      const now = new Date();
      const execution = {
        id: 'exec-1',
        workflowId: 'test-workflow',
        status: 'pending' as const,
        stepHistory: [{
          stepId: 'step1',
          status: 'completed' as const,
          startedAt: now,
          completedAt: new Date(now.getTime() + 1000),
          attempts: 1
        }],
        variables: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };
      expect(() => validator.validateExecution(execution)).not.toThrow();
    });
  });

  describe('validateExecution - missing fields', () => {
    test('should throw for execution without workflowId', () => {
      const execution = {
        id: 'exec-1',
        workflowId: '',
        status: 'pending' as const,
        stepHistory: [],
        variables: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };
      expect(() => validator.validateExecution(execution)).toThrow(ValidationError);
    });

    test('should throw for execution without status', () => {
      const execution = {
        id: 'exec-1',
        workflowId: 'test-workflow',
        status: '' as any,
        stepHistory: [],
        variables: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };
      expect(() => validator.validateExecution(execution)).toThrow(ValidationError);
    });

    test('should throw for execution without createdAt', () => {
      const execution = {
        id: 'exec-1',
        workflowId: 'test-workflow',
        status: 'pending' as const,
        stepHistory: [],
        variables: {},
        createdAt: undefined as any,
        updatedAt: new Date()
      };
      expect(() => validator.validateExecution(execution)).toThrow(/createdAt/);
    });

    test('should throw for execution without updatedAt', () => {
      const execution = {
        id: 'exec-1',
        workflowId: 'test-workflow',
        status: 'pending' as const,
        stepHistory: [],
        variables: {},
        createdAt: new Date(),
        updatedAt: undefined as any
      };
      expect(() => validator.validateExecution(execution)).toThrow(/updatedAt/);
    });
  });

  describe('getValidationReport', () => {
    test('should return valid report for valid definition', () => {
      const report = validator.getValidationReport(validDefinition);
      expect(report.isValid).toBe(true);
      expect(report.errors).toHaveLength(0);
    });

    test('should return invalid report with errors for invalid definition', () => {
      const invalid = { ...validDefinition, id: '' };
      const report = validator.getValidationReport(invalid);
      expect(report.isValid).toBe(false);
      expect(report.errors.length).toBeGreaterThan(0);
      expect(report.errors[0].severity).toBe('error');
    });
  });
});