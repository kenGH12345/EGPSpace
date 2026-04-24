# EGPSpace 架构转向：HTML 模板 + 三重锁 —— 根因诊断分析

> **会话**：wf-20260424091211. · **需求 fingerprint**：`后续要继续完成全部所有学科所有实验 折射 接受三重锁方案 杠杆 模板技术栈参考对方`
> **本文档仅限诊断性分析**（根因/受影响位置/变更范围/风险评估）。需求规约、用户故事、验收标准等内容写入 `output/requirement.md`。

---

## 根因 / Root Cause

### 核心根因：LLM 参与"画面生成"导致不确定性

**EGPSpace 当前实验系统的本质缺陷**：将"LLM 生成内容"与"实验画面渲染"耦合在同一条数据流中，LLM 输出的 `ExperimentSchema` 会**直接**驱动 Canvas 绘制，任何概率性失误（参数错误、拓扑错误、坐标错位）都会**直接投影到用户看到的画面上**。

**对比 EurekaFinder 的关键差异**（基于对 `output/eureka2-page.js` bundle 第 48/106/107/173 行的反向分析）：

| 维度 | EGPSpace 现状 | EurekaFinder 实际做法 |
|-----|-----|-----|
| LLM 输出内容 | 完整 `ExperimentSchema`（meta+params+formulas+canvas elements） | 只输出 `physicsType` 关键词 或 `:::artifact{type=…}` 标记 |
| 画面来源 | Canvas 动态绘制（每次打开都现画） | iframe 加载 `/templates/physics/physics-mechanics-lever.html`（固定 HTML） |
| LLM 犯错的后果 | 电路接错、杠杆方向反、参数飘忽 | 最差只是选错模板，画面本身永远不会画错 |
| 代码中对 LLM 的约束 | 无硬性禁令 | system prompt 明文：「**不要**生成任何 playground / sketchfab / AR 实验类的 artifact」+ 路由白名单 `Yn={...}` 校验 |

**用户本次诉求的本质**（"不犯常识性错误 + 功能正常性 + 确定性"）= **要求画面层与 LLM 输出解耦**。LLM 的概率性和用户要的确定性**在数学上互斥**，解耦是唯一路径。

### 次级根因

1. **合规规则不严密**：`.gitignore` 当前只排除 `output/eureka-*.js` / `output/eureka-*.html`，而实际 bundle 文件名是 `output/eureka2-page.js`，**glob 模式 `eureka-*` 不能匹配 `eureka2-`**（`eureka-` 后面强制要求 `-`，但实际字符是 `2-`）。这导致外部参考材料仍可能进入 git 历史，需要修复为更严格的排除规则。
2. **现有渲染栈的"扩展性承诺"是虚假安全**：Canvas 声明式渲染器（`src/lib/declarative-renderer.ts`、21 种元素类型）看起来"能画任何东西"，但每新增一个学科/实验类型，就要扩展元素类型、物理引擎、表达式求值器，最终 LLM 仍然可以组合出**语法合法但物理错误**的配置（例：浮力实验中物体质量为负数，或电路中电压箭头反向）。声明式 DSL 本身**无法表达"常识正确性"**。

---

## 受影响位置

### 将被"限定用途"的现有代码（保留但不再作为主路径）
| 文件 | 现状用途 | 转向后用途 |
|-----|-----|-----|
| `src/lib/experiment-schema.ts` | LLM 生成的实验主数据结构 | 仅供 4 个预置实验的遗留适配层；新概念走 HTML 模板路径 |
| `src/lib/declarative-renderer.ts` | Canvas 动态绘制所有实验 | 仅用于"已人工审核"的预置 schema；禁止 LLM 新输出直接进入此处 |
| `src/lib/experiment-dynamics.ts` | 弹簧阻尼/浸没动力学积分 | 保留，但物理运算从 HTML 模板内部调用（模板可以内嵌此模块的简化版） |
| `src/lib/ambient-animations.ts` | 波纹/气泡环境动画 | 同上，保留为可选的视觉增强库 |
| `src/lib/physics-engine.ts` | 公式驱动计算 | 保留为**JSON 接口**，HTML 模板可 postMessage 调用此接口做计算 |
| `src/lib/preset-templates.ts` | 4 个预置实验的 Canvas schema | 将被废弃，由 `public/templates/physics/*.html` 取代 |
| `src/components/DynamicExperiment.tsx` | Canvas 实验组件 | 仅为兜底组件；新 UI 默认走 `IframeExperiment` |

### 将被"架构禁令"的现有代码（LLM 路径改造）
| 文件 | 改造内容 |
|-----|-----|
| `src/app/api/generate/route.ts` | system prompt 新增硬禁令："禁止输出 canvas.elements / canvas.shapes / canvas 坐标 / 图形实体定义"；响应字段从 `schema` 改为 `{ templateId?, lesson: markdown, flashcards?}`；未命中模板时只返回文字讲解，绝不生成实验画面 |
| `src/app/experiments/[id]/page.tsx` | 将 `<DynamicExperiment schema=…>` 替换为 `<IframeExperiment templateId=…>` 作为主路径 |
| `src/components/ExperimentChatPanel.tsx` | 增加当前 `templateId` 作为 artifactContext 上下文传给 LLM |

### 将被新增的代码
| 新文件/目录 | 职责 |
|-----|-----|
| `public/templates/` | HTML 实验模板根目录，按学科子目录组织 |
| `public/templates/physics/buoyancy.html` | 浮力实验（首批） |
| `public/templates/physics/lever.html` | 杠杆实验（首批） |
| `public/templates/physics/refraction.html` | 折射实验（首批） |
| `public/templates/physics/circuit.html` | 串并联电路实验（首批） |
| `public/templates/_shared/physics-core.js` | 模板共用的物理常量、单位转换、边界检查工具 |
| `public/templates/_shared/ui-core.css` | 模板共用的参数滑杆/按钮样式 |
| `src/lib/template-registry.ts` | 模板 ID → 文件路径/元数据 的**白名单**（三重锁中的第 3 锁） |
| `src/lib/concept-to-template.ts` | 关键词 → 模板 ID 的路由表（三重锁中的第 2 锁） |
| `src/components/IframeExperiment.tsx` | 统一 iframe 承载组件（loading/error/resize/postMessage 桥） |
| `docs/template-authoring-guide.md` | 模板开发规范 + 物理常识审核清单（电气/力学/光学/电路各一份） |

### 合规与规则更新
| 文件 | 修改 |
|-----|-----|
| `.gitignore` | `output/eureka-*.js` → `output/eureka*.js`（去掉中间的 `-`，兼容 `eureka2-page.js`）；同理 `.html`。追加 `output/reference-bundles/` 目录规则作为未来沉淀位置 |
| `docs/external-reference-policy.md` | 补充："参考对方实现逻辑必须落地为抽象设计决策，禁止直接抄写对方代码片段" |

---

## 修改范围

<!-- change_scope -->
本次变更范围分为**短期（首批 4 个物理实验 + 基础设施）**和**中期（全学科扩展）**两个阶段。短期范围在本次 /wf 内交付，中期范围作为后续迭代规划。核心变更是将实验画面来源从 **LLM 动态生成 Canvas schema** 切换为 **人工预构建 HTML 模板 + iframe 加载**，同时改造 LLM API 加入三重锁禁令。涉及新增文件 8 个、改造文件 3 个、修复文件 1 个。
1. **基础设施层**（T-1 ~ T-3）
   - 建 `public/templates/` 目录骨架 + 共用 CSS/JS
   - 实现 `IframeExperiment` 组件（含 postMessage 双向通信协议）
   - 实现 `template-registry.ts` 白名单与 `concept-to-template.ts` 路由

2. **首批 4 个物理模板**（T-4 ~ T-7）
   - `physics/buoyancy.html`（浮力）
   - `physics/lever.html`（杠杆）
   - `physics/refraction.html`（折射）
   - `physics/circuit.html`（串并联电路）
   - 每个模板必须通过**物理常识审核清单**后才能合并

3. **LLM 生成 API 改造**（T-8）
   - 改写 `/api/generate/route.ts` 的 system prompt 加入三重锁禁令
   - 响应字段从 `schema` 切换为 `{ templateId, lesson }`
   - 未命中白名单时降级为"文字讲解"而非"动态生成实验"

4. **预置实验页面切换**（T-9）
   - `src/app/experiments/[id]/page.tsx` 切换主路径为 `IframeExperiment`
   - 保留 `DynamicExperiment` 作为特殊情况的 fallback

5. **合规修复**（T-10）
   - 修复 `.gitignore` glob 漏洞
   - 补充外部参考政策文档

### 中期范围（后续迭代，不在本次 /wf 内交付）
- 化学模板（酸碱中和、氧化还原、电解）—— 新增 3-5 个
- 生物模板（光合作用、有丝分裂、DNA 复制）—— 新增 3-5 个
- 数学模板（函数图像、几何证明、概率分布）—— 新增 3-5 个
- 地理模板（板块运动、水循环、气候带）—— 新增 3-5 个
- Canvas 渲染栈的最终退役（确认无遗留依赖后删除）

### 明确排除（本次不做）
- ❌ 不做 Three.js / 3D 模板（对方也是单独通道，按用户诉求"确定性"优先，3D 首批跳过）
- ❌ 不做 AR / MediaPipe 交互（高不确定性）
- ❌ 不做多模型切换 UI（对方有但非用户核心诉求，推迟）
- ❌ 不做流式生成（对方的 `:::artifact` 流式解析复杂度高，推迟）
- ❌ 不做对方模板代码的反向抄袭（合规约束，也无源码可抄）

---

## 风险评估

<!-- risk_assessment -->
共识别 8 条风险（R1-R8），其中高风险 3 条、中风险 3 条、低风险 2 条。最高优先级风险是 **R1（对方模板源码不可见）** 和 **R2（物理常识审核依赖人工）**，均有具体缓解措施。R8（postMessage XSS）虽然优先级低但必须在首批模板上线前解决。

**R1 · 对方模板源码不可见，"参考对方技术栈"只能基于 bundle 反推**
- 影响：我们设计的 HTML 模板规范可能在细节上与对方不同
- 缓解：
  1. 明确核心技术栈（原生 HTML + Canvas 2D + SVG + 原生 JS + postMessage）已由 bundle 证据支撑，**架构层无风险**
  2. 细节如滑杆样式、加载动画、错误提示 UI 属于"视觉美学"，我们自己设计即可
  3. 保留能力扩展点：首批模板用 vanilla，若后续发现需要 Three.js（3D）、p5.js（可视化），在 `template-registry` 的 metadata 中加字段 `runtime: "vanilla" | "three" | "p5"`

**R2 · 物理常识审核依赖人工，规模化后会成为瓶颈**
- 影响：每个学科每个实验都要人工过审，可能拖慢交付速度
- 缓解：
  1. 首批 4 个做透做稳，沉淀"学科通用审核清单"（物理有电气/力学/光学/热学 4 张表）
  2. 建立**单元测试级别的物理约束检查**：模板内置自测脚本（例：电路模板自动验证欧姆定律 U=IR 在所有参数组合下成立）
  3. 长期：引入社区/教师审核流程（非本次交付范围）

**R3 · LLM 的 "未命中模板降级为文字讲解" 会让用户感知"AI 变弱了"**
- 影响：用户输入"抛体运动"等未覆盖概念时，没有交互实验，体验倒退
- 缓解：
  1. UI 明确提示："此概念暂无交互实验，以下是文字讲解 + 闪卡"
  2. 文字讲解质量要高（保留现有学段感知 prompt）
  3. 提供"建议模板"按钮让用户反馈需求，驱动后续模板开发

### 中风险项

**R4 · iframe 首屏加载延迟**
- 影响：用户感觉"卡一下"
- 缓解：模板文件控制在 <50KB，使用 `loading="eager"` + skeleton UI 占位

**R5 · Canvas 栈代码的沉没成本**
- 影响：5 个文件 ~2500 行代码由主路径降级为兜底路径，团队可能觉得"白写了"
- 缓解：明确定位"Canvas 栈 = 实验性新概念兜底通道"，不删除，让其自然退化直到完全替代

**R6 · 现有 4 个预置实验从 Canvas schema 迁移到 HTML 模板，存在行为差异**
- 影响：用户可能抱怨"原来能调的参数现在不能调了"
- 缓解：逐个实验做**功能对等性测试**，保证参数数量、范围、计算结果完全一致

### 低风险项

**R7 · `.gitignore` 修复会误排除其他 `eureka*` 命名文件**
- 影响：如果未来有 `eureka-config.ts` 之类文件，会被误排除
- 缓解：用更精确的规则 `output/eureka*-page.js` 和 `output/eureka*-page.html`，只针对对方 bundle 命名模式

**R8 · postMessage 通信协议设计不当导致 XSS**
- 影响：恶意模板可能 postMessage 注入主应用
- 缓解：主应用只接受 `event.origin === window.location.origin`，且 message 结构必须通过 JSON Schema 白名单校验

---

## 思考摘要

| 问题 | 我的回答 |
|-----|-----|
| Q1: 用户真实诉求 | 短期交付 4 个物理 + 长期扩展全学科，架构必须通用 |
| Q2: "参考对方技术栈" 的落地 | 原生 HTML + Canvas 2D + SVG + 原生 JS（无框架），按学科子目录组织 |
| Q3: 最大矛盾 | 沉没成本 vs 架构转向，选择"Canvas 栈降级为兜底，不删除" |
| Q4: 对方真的是 iframe+HTML 吗 | bundle 证据支撑，预置实验走 iframe，深度学习走 playground（首批只实现 iframe 路径） |
| Q5: 不犯常识错误的根本保证 | 每个模板必须通过人工物理审核清单（流程约束，非代码约束） |
| Q6: 长期工作量 | 模板代码量与现有 LLM 路径相当，真正成本是审核时间 |
| Q7: 遗漏的假设 | 对方模板的物理正确性未知；"所有学科"范围需确认；iframe 首屏性能需验证 |
| Q8: 合规风险 | `.gitignore` 存在漏洞（`eureka-*` 未命中 `eureka2-page.js`），必须修复 |

### CoVe 验证结果
所有关键断言（对方 iframe 机制、LLM 禁令、.gitignore 漏洞、首批实验可行性）均通过 bundle 实际代码或文件内容交叉验证，无未支撑声明。
