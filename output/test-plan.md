# EGPSpace工作流系统测试计划

## 测试概览

### 测试目标
验证EGPSpace工作流系统的核心功能，确保系统稳定、可靠、性能达标。

### 测试范围
- **工作流引擎**：状态机执行、错误处理、事件系统
- **类型系统**：TypeScript类型定义和接口兼容性
- **验证器**：工作流定义验证和循环检测
- **存储接口**：数据持久化和查询功能

### 测试策略
- **分层测试**：单元测试→集成测试→端到端测试
- **风险导向**：优先测试高风险核心模块
- **自动化优先**：所有测试可自动化执行
- **持续集成**：测试结果与CI/CD流水线集成

## 测试用例矩阵

| 测试类别 | 测试用例 | 优先级 | 测试方法 | 验收标准 |
|---------|---------|--------|----------|----------|
| **单元测试** | | | | |
| 工作流类型定义 | 验证所有类型接口定义 | 高 | Jest单元测试 | 类型编译通过，无类型错误 |
| 工作流引擎 | 测试状态机转换逻辑 | 高 | Jest单元测试 | 状态转换正确，错误处理正常 |
| 工作流验证器 | 验证定义验证逻辑 | 高 | Jest单元测试 | 验证规则正确执行 |
| 存储接口 | 测试数据持久化功能 | 中 | Jest单元测试 | 数据CRUD操作正常 |
| **集成测试** | | | | |
| 引擎-存储集成 | 测试引擎与存储的交互 | 高 | Jest集成测试 | 数据同步正常，无数据丢失 |
| 事件系统集成 | 测试事件监听和触发 | 中 | Jest集成测试 | 事件正确传递，监听器正常响应 |
| **端到端测试** | | | | |
| 完整工作流执行 | 测试端到端工作流流程 | 高 | Jest端到端测试 | 工作流完整执行，结果正确 |
| 错误恢复流程 | 测试错误处理和恢复 | 高 | Jest端到端测试 | 错误正确捕获，系统可恢复 |
| **性能测试** | | | | |
| 并发执行测试 | 测试多工作流并发执行 | 中 | 性能测试工具 | 系统稳定，响应时间达标 |
| 内存泄漏测试 | 测试长时间运行的内存使用 | 低 | 内存分析工具 | 无内存泄漏，内存使用稳定 |

## 详细测试用例

### 1. 工作流类型定义测试

```typescript
// tests/unit/types.test.ts
describe('Workflow Types', () => {
  test('should define valid WorkflowDefinition interface', () => {
    const definition: WorkflowDefinition = {
      id: 'test-workflow',
      name: 'Test Workflow',
      version: '1.0.0',
      steps: []
    };
    
    expect(definition.id).toBe('test-workflow');
    expect(definition.steps).toBeInstanceOf(Array);
  });
  
  test('should define valid WorkflowExecution interface', () => {
    const execution: WorkflowExecution = {
      id: 'test-execution',
      workflowId: 'test-workflow',
      status: 'pending',
      stepHistory: [],
      variables: {},
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    expect(execution.status).toBe('pending');
    expect(execution.stepHistory).toBeInstanceOf(Array);
  });
});
```

### 2. 工作流引擎测试

```typescript
// tests/unit/engine.test.ts
describe('WorkflowEngine', () => {
  let engine: WorkflowEngine;
  
  beforeEach(() => {
    engine = new WorkflowEngine();
  });
  
  test('should create workflow execution', async () => {
    const definition: WorkflowDefinition = {
      id: 'test-workflow',
      name: 'Test Workflow',
      version: '1.0.0',
      steps: [
        {
          id: 'step1',
          name: 'First Step',
          type: 'action',
          component: 'test-component'
        }
      ]
    };
    
    const execution = await engine.createExecution(definition);
    
    expect(execution.id).toBeDefined();
    expect(execution.status).toBe('pending');
    expect(execution.workflowId).toBe('test-workflow');
  });
  
  test('should start execution and transition steps', async () => {
    const definition: WorkflowDefinition = {
      id: 'test-workflow',
      name: 'Test Workflow',
      version: '1.0.0',
      steps: [
        {
          id: 'step1',
          name: 'First Step',
          type: 'action',
          component: 'test-component',
          next: 'step2'
        },
        {
          id: 'step2',
          name: 'Second Step',
          type: 'action',
          component: 'test-component'
        }
      ]
    };
    
    const execution = await engine.createExecution(definition);
    await engine.startExecution(execution.id);
    
    const updatedExecution = await engine.getExecution(execution.id);
    expect(updatedExecution?.status).toBe('running');
    expect(updatedExecution?.currentStep).toBe('step1');
  });
  
  test('should handle step execution errors', async () => {
    const definition: WorkflowDefinition = {
      id: 'test-workflow',
      name: 'Test Workflow',
      version: '1.0.0',
      steps: [
        {
          id: 'step1',
          name: 'Error Step',
          type: 'action',
          component: 'error-component'
        }
      ]
    };
    
    const execution = await engine.createExecution(definition);
    
    // 模拟错误步骤执行
    jest.spyOn(engine as any, 'executeStepLogic').mockRejectedValue(new Error('Step execution failed'));
    
    await engine.startExecution(execution.id);
    
    const updatedExecution = await engine.getExecution(execution.id);
    expect(updatedExecution?.status).toBe('failed');
    expect(updatedExecution?.stepHistory[0].status).toBe('failed');
  });
});
```

### 3. 工作流验证器测试

```typescript
// tests/unit/validator.test.ts
describe('WorkflowValidator', () => {
  test('should validate valid workflow definition', () => {
    const definition: WorkflowDefinition = {
      id: 'test-workflow',
      name: 'Test Workflow',
      version: '1.0.0',
      steps: [
        {
          id: 'step1',
          name: 'First Step',
          type: 'action',
          component: 'test-component'
        }
      ]
    };
    
    expect(() => WorkflowValidator.validateDefinition(definition)).not.toThrow();
  });
  
  test('should reject workflow with missing required fields', () => {
    const invalidDefinition = {
      id: 'test-workflow',
      // 缺少name和version
      steps: []
    } as any;
    
    expect(() => WorkflowValidator.validateDefinition(invalidDefinition)).toThrow();
  });
  
  test('should detect cycles in workflow definition', () => {
    const cyclicDefinition: WorkflowDefinition = {
      id: 'test-workflow',
      name: 'Test Workflow',
      version: '1.0.0',
      steps: [
        {
          id: 'step1',
          name: 'First Step',
          type: 'action',
          component: 'test-component',
          next: 'step2'
        },
        {
          id: 'step2',
          name: 'Second Step',
          type: 'action',
          component: 'test-component',
          next: 'step1' // 循环引用
        }
      ]
    };
    
    expect(() => WorkflowValidator.validateDefinition(cyclicDefinition)).toThrow(/Cycle detected/);
  });
});
```

### 4. 集成测试

```typescript
// tests/integration/engine-storage.test.ts
describe('Engine-Storage Integration', () => {
  let engine: WorkflowEngine;
  let storage: InMemoryStorage;
  
  beforeEach(() => {
    storage = new InMemoryStorage();
    engine = new WorkflowEngine(storage);
  });
  
  test('should persist execution state to storage', async () => {
    const definition: WorkflowDefinition = {
      id: 'test-workflow',
      name: 'Test Workflow',
      version: '1.0.0',
      steps: [
        {
          id: 'step1',
          name: 'First Step',
          type: 'action',
          component: 'test-component'
        }
      ]
    };
    
    const execution = await engine.createExecution(definition);
    
    // 验证执行状态已保存到存储
    const storedExecution = await storage.getExecution(execution.id);
    expect(storedExecution).toBeDefined();
    expect(storedExecution?.id).toBe(execution.id);
  });
  
  test('should synchronize execution updates with storage', async () => {
    const definition: WorkflowDefinition = {
      id: 'test-workflow',
      name: 'Test Workflow',
      version: '1.0.0',
      steps: [
        {
          id: 'step1',
          name: 'First Step',
          type: 'action',
          component: 'test-component'
        }
      ]
    };
    
    const execution = await engine.createExecution(definition);
    await engine.startExecution(execution.id);
    
    // 验证更新后的状态已同步到存储
    const updatedExecution = await storage.getExecution(execution.id);
    expect(updatedExecution?.status).toBe('running');
    expect(updatedExecution?.currentStep).toBe('step1');
  });
});
```

### 5. 端到端测试

```typescript
// tests/e2e/full-workflow.test.ts
describe('Full Workflow Execution', () => {
  let engine: WorkflowEngine;
  
  beforeEach(() => {
    engine = new WorkflowEngine();
  });
  
  test('should execute complete workflow successfully', async () => {
    const definition: WorkflowDefinition = {
      id: 'test-workflow',
      name: 'Test Workflow',
      version: '1.0.0',
      steps: [
        {
          id: 'step1',
          name: 'First Step',
          type: 'action',
          component: 'test-component',
          next: 'step2'
        },
        {
          id: 'step2',
          name: 'Second Step',
          type: 'action',
          component: 'test-component',
          next: 'step3'
        },
        {
          id: 'step3',
          name: 'Final Step',
          type: 'action',
          component: 'test-component'
        }
      ]
    };
    
    const execution = await engine.createExecution(definition);
    await engine.startExecution(execution.id);
    
    // 等待执行完成
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const finalExecution = await engine.getExecution(execution.id);
    expect(finalExecution?.status).toBe('completed');
    expect(finalExecution?.stepHistory).toHaveLength(3);
    expect(finalExecution?.stepHistory.every(step => step.status === 'completed')).toBe(true);
  });
  
  test('should handle conditional branching', async () => {
    const definition: WorkflowDefinition = {
      id: 'test-workflow',
      name: 'Test Workflow',
      version: '1.0.0',
      steps: [
        {
          id: 'step1',
          name: 'Condition Step',
          type: 'condition',
          component: 'test-component',
          conditions: [
            {
              condition: '${variables.condition} === true',
              nextStep: 'step2'
            },
            {
              condition: '${variables.condition} === false',
              nextStep: 'step3'
            }
          ]
        },
        {
          id: 'step2',
          name: 'True Branch',
          type: 'action',
          component: 'test-component'
        },
        {
          id: 'step3',
          name: 'False Branch',
          type: 'action',
          component: 'test-component'
        }
      ]
    };
    
    const execution = await engine.createExecution(definition, { condition: true });
    await engine.startExecution(execution.id);
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const finalExecution = await engine.getExecution(execution.id);
    expect(finalExecution?.currentStep).toBe('step2');
  });
});
```

## 测试执行流程

### 1. 环境准备
```bash
# 安装测试依赖
npm install --save-dev jest @types/jest ts-jest

# 配置Jest
npx ts-jest config:init
```

### 2. 测试配置
```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  collectCoverageFrom: ['src/**/*.ts'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

### 3. 测试执行命令
```bash
# 运行所有测试
npm test

# 运行单元测试
npm test -- --testPathPattern="tests/unit"

# 运行集成测试
npm test -- --testPathPattern="tests/integration"

# 运行端到端测试
npm test -- --testPathPattern="tests/e2e"

# 生成覆盖率报告
npm test -- --coverage
```

## 验收标准

### 功能验收标准
- ✅ 所有单元测试通过率100%
- ✅ 集成测试验证模块间交互正常
- ✅ 端到端测试验证完整流程执行正确
- ✅ 错误处理测试验证系统容错能力

### 性能验收标准
- ✅ 单工作流执行时间 < 100ms
- ✅ 并发10个工作流执行时间 < 500ms
- ✅ 内存使用稳定，无内存泄漏

### 质量验收标准
- ✅ 代码覆盖率 > 80%
- ✅ TypeScript编译无错误
- ✅ ESLint检查通过
- ✅ 所有测试用例可重复执行

## 测试报告格式

测试完成后生成详细的测试报告：

```json
{
  "summary": {
    "totalTests": 25,
    "passed": 25,
    "failed": 0,
    "skipped": 0,
    "coverage": 85.5
  },
  "categories": {
    "unit": { "total": 15, "passed": 15, "failed": 0 },
    "integration": { "total": 5, "passed": 5, "failed": 0 },
    "e2e": { "total": 5, "passed": 5, "failed": 0 }
  },
  "performance": {
    "avgExecutionTime": "45ms",
    "maxMemoryUsage": "128MB",
    "concurrentWorkflows": "10 workflows in 320ms"
  },
  "quality": {
    "typescriptErrors": 0,
    "eslintErrors": 0,
    "codeDuplication": "2.3%"
  }
}
```

## 风险缓解

### 测试风险
- **风险**：测试环境与生产环境差异
- **缓解**：使用Docker容器确保环境一致性

### 性能风险
- **风险**：性能测试结果不准确
- **缓解**：多次测试取平均值，排除异常值

### 覆盖风险
- **风险**：测试用例覆盖不全面
- **缓解**：定期审查测试用例，补充边界条件测试

该测试计划为EGPSpace工作流系统提供了全面的测试保障，确保系统质量和稳定性。