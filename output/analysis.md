## 根因
当前系统中 `MechanicsSolver`、`OpticsSolver`、`BiologySolver` 均只有存根（Stub）实现，无法提供真实的物理、光学或生物仿真能力。

用户需求是按照既定策略（三步走）补齐这三大领域的实际结算能力，并将 `TickEngine` 的防死锁、稳态保障机制（Fixed Timestep、Max Substeps）作为前置条件。

因为如果没有这个前置条件，一旦引入耗时的真实仿真计算，系统将面临主线程卡死和帧率雪崩的危险。完成这一系列升级后，EGPSpace 将具备真正意义上的跨域科学仿真底层驱动力。

## 受影响位置
1. `src/lib/framework/core/TickEngine.ts`：确认并验证 Fixed Timestep 和 Max Substeps 的生效和容错情况。
2. `src/lib/framework/domains/mechanics/solver.ts`：将改写为具有节点（Nodes）和弹簧（Springs）的力学引擎。
3. `src/lib/framework/domains/optics/solver.ts`：将改写为光线追踪和折射/反射计算模块。
4. `src/lib/framework/domains/biology/solver.ts`：将改写为具备时间序列和状态流转的生命周期模块。
5. 各个 Domain 的 `components.ts`：必须补充相对应的物理参数（如 mass, stiffness，光线折射率等）。

## 修改范围
| 领域 | 修改点 | 预期结果 |
|---|---|---|
| **核心层** | 升级 TickEngine 调度策略 | 保障系统在计算超时时不会“死亡螺旋”，保证每一帧 deltaTime 的稳定性。 |
| **力学** | 实现 Mass-Spring 和 半隐式 Euler | 力学仿真对象产生真实弹性和重力受力表现，支持真实物理交互。 |
| **光学** | 实现 2D 光线追踪（Ray Tracing） | 能够产生反射/折射路径节点，用于前端 Canvas 或 SVG 渲染光束。 |
| **生物** | 实现状态机（State Machine）模型 | 根据流逝时间自动演化生物属性（如生长阶段），输出缓慢变动的状态数据。 |

## 下游消费影响
- **UI 渲染器 (React Frontend)**：目前主要依赖存根的简单输出，一旦真实化，输出的将是具体的物理坐标、长光线路径和复杂的属性集，渲染组件需做响应适配，并处理高频的 `EventBus` 更新。
- **配置注入 (TemplateRegistry)**：需要在创建组件时，真实下发诸如 `mass`, `springConstant`, `refractionIndex` 等物理量，否则真实求解器无法工作。

## 风险评估
1. **P0 性能与死锁风险**：即便 `TickEngine` 升级了 Max Substeps，但在单帧内运行 Optic 光线追踪和 Mechanics 积分时，如果计算规模剧增，依然极大概率导致帧率下降（FPS 暴跌）。
2. **P1 坐标发散风险**：力学引擎中的半隐式 Euler 积分在弹簧劲度系数（Stiffness）过高或质量过小的情况下，极易发生数值爆炸，需要为输入参数做好安全范围限制。
3. **P2 状态割裂风险**：当触发 Max Substeps 强行中止计算时，可能出现力学世界的时间更新了 1 帧，但光学世界被中断未更新，造成两者的短暂不一致（状态撕裂）。
