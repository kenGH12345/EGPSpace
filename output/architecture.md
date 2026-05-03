## Architecture Scorecard
| 维度 | 分数 (1-5) | 评估理由 |
|------|-----------|---------|
| 健壮性 | 4 | 通过增加 `postMessage` 防御性测试与大图性能测试，大幅提高了在应对不可信第三方输入和极端规模装配体时的系统健壮性。 |
| 扩展性 | 4 | 新增的各种测试基于现有的 Jest 框架，且易于通过添加不同的 Payload 字典和宏定义配置文件扩展覆盖场景。 |
| 安全性 | 5 | Iframe 的消息安全是沙箱的核心，补齐此测试能实质提升整个体系的防护评级。 |
| 可维护性 | 4 | 测试代码职责单一、边界清晰，易于维护。 |

## Failure Model
- **Failure Mode 1**: `postMessage` Payload 中的死循环或者极度嵌套引发的栈溢出。
  - **Mitigation**: 设计测试用例验证我们在 `EventBus` 中的 Payload Schema Validator 会配置 `depth` 限制，直接拒绝超深层级对象，防止主线程栈溢出。
- **Failure Mode 2**: 大图基准测试在不同性能机器上由于执行环境波动导致误报失败。
  - **Mitigation**: 测试中应设计预热（Warm-up）阶段，且以多次采样的均值为准，并保留一定的允许抖动区间（如 ±20%），甚至对于只用于 CI/CD 卡点的测试以 `console.warn` 形式输出软失败而不是硬抛出 `Error` 阻塞构建。

## Component Boundaries
- **测试执行层 (Test Execution Layer)**：包含所有新增的 Jest 测试文件（`tests/*.test.ts`, `tests/*.benchmark.ts`），作为发起探测的一方。
- **核心框架层 (Core Framework Layer)**：
  - `TickEngine`：测试调度器分时复用能力的端点。
  - `AssemblyParser`：大图解析和宏导出的端点。
  - `EventBus`：Iframe Message 通信的安全校验端点。
- **外围资源 (Peripheral Resources)**：包括所有的 `registry.ts` 与静态文件 `public/templates`。

## Migration Safety Case
- 本次均为新增测试代码与测试配置修改，不会改变生产环境的主分支执行逻辑。
- 对 `jest.config.js` 的修改也仅扩充了扫描路径（加入 `<rootDir>/tests`），不会影响现有 `src/` 下已有的测试运行。对流水线为纯加法，无迁移破坏风险。
- 在后续合并代码时，如果在 CI 环境中因为资源不足引起大图基准测试（large graph benchmark）抖动，可以随时通过 `--testPathIgnorePatterns` 暂时将其旁路，保证集成流水线不阻断。

## API Contracts
对于新增的基准测试和大图测试，不直接暴露 API 供外部调用，但会设定严格的测试阈值作为内部约束契约：
- **Large Graph Benchmark**:
  - `Input`: 自动生成的包含 10000 节点和 10000 边的结构描述 JSON。
  - `Constraint`: 解析和首帧 Tick 必须在 < 500ms 内收敛（具体阈值视实际测试跑分校准）。
- **PostMessage Payload**:
  - `Constraint`: 如果消息含有 `__proto__` 或者函数字符串定义，验证器返回并终止。

## Scenario Coverage
- **场景 1**：攻击者通过 Iframe 注入原型污染攻击结构。
  - **覆盖**：`tests/postmessage-security.test.ts`
- **场景 2**：用户构造万级组件节点，试图卡死计算线程。
  - **覆盖**：`tests/large-graph.benchmark.ts`
- **场景 3**：后续开发者添加了一个耗时较长的重型计算求解器。
  - **覆盖**：`TickEngine fairness test` 保证该求解器不会饿死同时间运行的其他轻量求解器。
- **场景 4**：模板开发者误删除了 HTML 或编写了未定义的宏端口映射。
  - **覆盖**：`registry consistency test` 和 `macro invalid export map test`。

## Consumer Adoption Design / 下游消费方案
- **CI 流水线整合**：新增的测试会自动由现有的 `pnpm test` 和 `pnpm test:e2e`（若适用）覆盖，下游基础设施无须修改即可直接享用更强的回归防线。
- **开发者日常指引**：开发者可以单独运行 `npx jest tests/large-graph.benchmark.ts` 来测量其底层逻辑改动对大图解析性能的影响。
