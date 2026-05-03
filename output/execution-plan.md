## Task List / 任务列表

- **T-1: 前置阻力清除 - TickEngine 升级 (Fixed Timestep & Max Substeps)**
  - **Description**: 验证和加固 `src/lib/framework/core/TickEngine.ts` 中的调度逻辑，确保 `fixedDeltaTime` 累加器模式与 `maxSubsteps` 中断保护机制坚不可摧，防止物理运算拖垮主线程。
  - **Acceptance Criteria**:
    - [ ] `accumulator >= fixedDeltaTime` 能够按正确的整数次扣除时间。
    - [ ] 当计算超时时，`substepCount` 正确达到 `maxSubsteps` 阀值并主动 `break` 丢弃剩余积压时间，避免死亡螺旋。
  - **Files**: `src/lib/framework/core/TickEngine.ts`
  - **Dependencies**: None

- **T-2: 第一阶段 (高优) - 力学 MVP (Mechanics MVP)**
  - **Description**: 将 `src/lib/framework/domains/mechanics/solver.ts` 改写为真正的“质点-弹簧模型”，引入半隐式欧拉积分算法，作为 Fixed Timestep 最好的试金石。
  - **Acceptance Criteria**:
    - [ ] `MechanicsSolver.performUpdate` 实现对内部 Nodes 和 Springs 的遍历，根据胡克定律施加力，计算加速度，并使用半隐式欧拉法推演新的速度和位置。
    - [ ] 向外发射序列化后的快照数据以便测试观察。
  - **Files**: `src/lib/framework/domains/mechanics/solver.ts`, `src/lib/framework/domains/mechanics/components.ts`
  - **Dependencies**: T-1

- **T-3: 第二阶段 (中优) - 光学 MVP (Optics MVP)**
  - **Description**: 将 `src/lib/framework/domains/optics/solver.ts` 改写为基础的光线追踪或传递矩阵，用于验证大量纯数据对象在 EventBus 上的通信压力。
  - **Acceptance Criteria**:
    - [ ] `OpticsSolver.performUpdate` 追踪光线路径并计算至少 1 次界面折射或反射。
    - [ ] 针对高耗时，内部写死 `MAX_BOUNCE`，光线数据组装为 Snapshot 发射。
  - **Files**: `src/lib/framework/domains/optics/solver.ts`
  - **Dependencies**: T-1

- **T-4: 第二阶段 (中优) - 生物 MVP (Biology MVP)**
  - **Description**: 将 `src/lib/framework/domains/biology/solver.ts` 改写为基于时间序列模型或状态机演化的生命系统模拟。验证非高频动画的长周期逻辑演化。
  - **Acceptance Criteria**:
    - [ ] 根据累积时间计算生物群体/状态增量方程。
    - [ ] 生成生命周期状态变更快照。
  - **Files**: `src/lib/framework/domains/biology/solver.ts`
  - **Dependencies**: T-1

## Dependency Graph / 依赖关系图

```mermaid
graph TD
  T1[T-1: TickEngine Upgrade] --> T2[T-2: Mechanics MVP (High Priority)]
  T1 --> T3[T-3: Optics MVP (Medium Priority)]
  T1 --> T4[T-4: Biology MVP (Medium Priority)]
```

## Risk Assessment / 风险评估

- **最高风险任务**: T-2 (Mechanics MVP)。
- **风险描述**: 力学积分是最容易因为参数过载或 `deltaTime` 抖动而导致坐标计算变成 `NaN` 的地方。如果 T-1 的时间锁扣不住，T-2 就会引发数值爆炸。
- **缓解策略**: 在 T-2 实现中，加入严格的合法性校验：如果计算出的坐标是 NaN 或超过绝对空间大小阈值，强制重置速度和加速度为 0。同时限制弹簧系数的最大容许值。
- **前端渲染风险**: 待 T-3 完成后，产生的大量光线数据可能会严重拖累现有 React Virtual DOM 渲染机制，未来需考虑向 Canvas 迁移。