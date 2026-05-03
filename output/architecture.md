## Structural Design / 结构设计
针对这三个阶段的实施计划，架构在结构上做出如下设计：
- `TickEngine` (`src/lib/framework/core/TickEngine.ts`) 必须充当时间墙：无论 `MechanicsSolver` 计算多耗时，`accumulator >= fixedDeltaTime` 与 `substepCount < maxSubsteps` 必须同时满足，否则强行截断，这是保证架构生存的最底线。
- `MechanicsSolver` (`src/lib/framework/domains/mechanics/solver.ts`)：内部划分为节点（Node）管理器和弹簧（Spring）管理器。`performUpdate` 将遍历所有的边，计算力，并在节点上应用半隐式欧拉积分推进状态。
- `OpticsSolver` (`src/lib/framework/domains/optics/solver.ts`)：基于几何光学的 `RaySegment` 模型，追踪每条光线经过界面的折射与反射，将其序列化到 EventBus。
- `BiologySolver` (`src/lib/framework/domains/biology/solver.ts`)：状态机管理框架。根据时间流逝计算每个生物个体的成长周期（如种群公式迭代）。

## Interfaces Contracts / 接口契约
- **引擎层契约**：现有的 `ITickSolver` 保持不变，接受 `deltaTime`。但引入真实解算后，`lastResults` 必须使用强类型 `ComponentSolvedValues` 输出每一帧的确切物理量。
- **Stamp 层契约**：各个 Component 的 Stamp Entry 必须拓展真实的物理参数（如 `mass`, `friction`, `springConstant`, `refractionIndex`）。如果缺失，Solver 需要注入默认回退值以防止计算奔溃。
- **UI消费契约**：渲染层不应直接依赖内部物理对象，只能监听 `domain:mechanics:updated` 获取一份序列化快照（Snapshot）进行重绘。

## Security Performance / 安全与性能
- **时间复杂度墙**：力学碰撞和光学反射是典型的 O(n²) 或指数级计算。必须在 Optics 中写死 `MAX_BOUNCE = 10`。在 Mechanics 中设置空间网格划分或暴力的硬节点数限制（`MAX_NODES = 100`）。
- **精度发散防御**：积分方程需要限制 `deltaTime` 不得超过一个上限值，一旦超时导致位置变异，直接丢弃该帧并回滚。

## Consumer Adoption Design / 下游消费方案
- **React Frontend 适配**：对于 Optics 等能产生海量光线路径段（几百条直线）的模块，React 的 Virtual DOM diff 极大概率掉帧。建议通过 EventBus 转发给一个独立的 Canvas / WebGL Renderer 层来直接执行渲染指令。
- **LayoutSpec 同步**：用户拖拽产生的新组件必须通过统一的 `TemplateRegistry` 进行组件状态（Stamp）更新，Solver 在下一次 Tick 时将自动读取新参数，实现热重载。

## Architecture Scorecard / 架构计分卡
| 维度 | 分数 | 评估理由 |
|---|---|---|
| 可扩展性 | 4/5 | TickEngine 的领域插槽（Map）设计优秀，解耦良好。但未来扩展到流体等复杂计算时可能需要 Worker 支持。 |
| 容错性 | 3/5 | Max Substeps 能保护浏览器主线程，但代价是时间“慢动作”甚至系统级的数据撕裂。 |
| 隔离性 | 5/5 | 领域之间完全依靠纯数据 Stamp 及 EventBus 隔离，物理引擎不需要知道渲染引擎的存在。 |

## Failure Model / 故障模型
- **积分爆炸 (Integration Blow-up)**：在 `src/lib/framework/domains/mechanics/solver.ts` 中，弹簧张力极大时积分结果为 NaN 或 Infinity。检测：校验位置是否超出视口坐标范围外；恢复：抛出警告，抛弃故障帧，降级或锁定组件。
- **光线风暴 (Ray Windup)**：两面平行镜子会产生无限循环反射。检测：`optics/solver.ts` 设置严格的单根光线反射跳数限制（Bounce Limit）；恢复：截断追踪。
- **主线程超时 (Thread Lock)**：物理计算占用超过 50ms。检测：`TickEngine.ts` 的 `maxBudgetMs` 控制与 `Max Substeps` 共同作用；恢复：推迟至下一次 RAF。

## Migration Safety Case / 迁移安全案例
- **渐进式迁移 (Incremental)**：在改写 `MechanicsSolver` 时，其他两个仍可保持 Stub 状态，不受影响，因为 EventBus 通信机制是完全平行的。
- **后向兼容 (Backwards-Compatible)**：现有的存根数据结构通过拓展接口属性即可完成真实化，无需推翻现有 React 渲染层（暂时），待瓶颈出现再优化为 Canvas。
- **配置回退 (Fallback)**：由于 TemplateRegistry 控制 Stamp 的生成，若新的真实化组件计算报错，可以轻易降级，将 `Component.solverDomain` 软回退到旧有的 mock domain。

## Scenario Coverage / 场景覆盖
- 支持杠杆、单摆、滑轮、弹簧振子等力学教学仿真实验。
- 支持小孔成像、透镜折射、反射定律等几何光学实验。
- 支持种群繁衍、生物反馈循环等长周期实验演示。