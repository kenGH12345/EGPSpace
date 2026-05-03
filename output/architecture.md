## Architecture Scorecard
| Attribute | Status | Explanation |
|---|---|---|
| Scalability | **PASS** | 引入动态模板按需加载机制，避免一次性加载过多资源。 |
| Maintainability | **PASS** | `concept-to-template` 严格按照学科领域 (biology, physics, chemistry) 进行子模块划分，易于后续更新。 |
| Performance | **PASS** | Iframe 沙盒天然隔离，不会导致主 Next.js 线程内存泄漏。 |

## Failure Model
如果新的实验模板（比如极度依赖 CPU 计算的物理碰撞实验或大量微观粒子运算的化学反应）加载或渲染失败：
- **场景 1（网络/路径找不到）**：`IframeExperiment` 将侦测到 `<iframe>` 加载错误，并自动回退为文本展示模式，保障核心内容展示不断层。
- **场景 2（白屏/JS报错）**：触发预设的 10 秒超时渲染监控，超时后提示“模板维护中”并平滑回退。
- **缓解策略**：在模板发布前必须经过严格的 Triple-Lock 测试，并且 `isApprovedTemplate` 提供开关，出现问题可热下线。

## Migration Safety Case
对于 `concept-to-template.ts` 新增加大量学科词条的迁移：
- 不会影响现有的可用映射（后置追加）。
- 对于新创建但并未落地的模板，我们可以在注册表中设置为 `pending` 状态，这样就算大模型命中了概念，也不会路由到不存在的空模板页面。这是安全的增量迭代模型。

## Module Breakdown
未来扩展阶段需引入的架构增强：
1. **`src/lib/concept-to-template.ts`**：继续解耦为 `physics-router.ts`、`chemistry-router.ts`、`biology-router.ts`。
2. **`public/templates/biology`**：新增基础生物学 UI 组件系统（专门用于处理显微镜视场、细胞染色动画等），扩展 `ui-core.css`。
3. **`public/templates/_shared/physics-engine.js`**：引入轻量级物理引擎 `matter.js`。针对高中力学的碰撞实验、平抛运动等缺乏强交互和动态演化的场景，利用外部引擎的刚体计算能力，突破原生 HTML DOM 动画的帧率与精度瓶颈。
4. **`public/templates/_shared/webgl-renderer.js`**：引入特定 WebGL 方案（如基于 Three.js 或纯 WebGL 封装的轻量组件）。针对高中化学中有机微观结构（甲烷、乙酸乙酯等的立体空间构型及断键/成键动态演化）渲染需求，用以弥补 2D Canvas 和 DOM 在三维空间展示上的短板。

## API Contracts
无需修改后端的 REST 接口。大模型返回的 schema 结构依然符合预期。扩展主要发生在前端路由词库扩展。

## Consumer Adoption Design / 下游消费方案
下游的 `ExperimentRenderer` 组件将无缝接管新的模板 ID。无需更改核心消费端逻辑，只需保证所有新增加的模板能够正确注册进 `isApprovedTemplate` 白名单即可。对于大语言模型，随着路由配置的丰富，能够精确命中的概念将呈几何级数增加。

在实际的业务落地中，我们的 AI 代理将直接根据新增的字典返回更加丰富的 `schema._templateId`，并由首页的拦截策略安全地写入 SessionStorage 供消费方读取。这种模式对下游消费者（前端渲染组件和 UI 展示逻辑）是完全透明且平滑的，实现了零侵入扩展。

## Scenario Coverage / 场景覆盖
本架构扩展指引涵盖以下几大核心应用场景：
1. **初高中物理综合实验**：解决目前系统缺乏复杂光学（折射/透镜）、力学动态沙盒（滑轮/碰撞）的问题。
2. **初高中化学实操及微观模拟**：填补气体发生装置互动及高中微观晶体/有机分子立体结构的展示场景。
3. **生物全流程空白填补**：支持显微镜交互观察、宏观生命周期循环及微观生理现象模拟的全新领域覆盖。