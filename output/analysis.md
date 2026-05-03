## 根因
当前的 EGPSpace 核心框架虽然已经实现了物理、光学、生物学等基础求解器，并且拥有基本的 EventBus 类型契约测试和 TickEngine 预算饿死拦截。但是，由于实验容器是通过 iframe 进行沙箱隔离和模板加载的，在面对第三方或复杂用户组合输入时，存在两个严重缺陷：
1. **安全拦截盲区**：缺乏针对恶意 `postMessage` 荷载的测试。如果没有严格的验证机制，攻击者可以通过复杂的对象层次（Prototype Pollution）或包含函数字符串的 JSON 绕过沙箱的安全屏障。
2. **性能底线不明**：目前框架没有关于数千节点的虚拟装配结构的大图渲染、序列化和首帧运算基准测试（large graph benchmark）。在未来允许学生或教师通过编辑器构建复杂实验时，缺乏明确的性能天花板和熔断度量。
同时，调度公平性（Fairness）、注册表配置一致性以及宏导出映射的可靠性均未被系统化测试覆盖，可能导致系统崩溃或静默失败。

## 修改范围
| 文件 | 位置 | 修改说明 |
|------|------|---------|
| `jest.config.js` | `roots` 数组 | 新增 `<rootDir>/tests` 以扫描外部测试文件夹。 |
| `tests/postmessage-security.test.ts` | 新增 | 构造包含恶意层级与函数的 postMessage Payload 测试，验证 Iframe 中间件安全拦截与丢弃逻辑。 |
| `tests/large-graph.benchmark.ts` | 新增 | 构造 >10,000 节点的微元图结构测试 AssemblyParser 的解析和首帧装配性能。 |
| `src/lib/framework/core/__tests__/TickEngine.test.ts` | 现有文件 | 增加针对多求解器的 `fairness test`。 |
| `tests/registry-consistency.test.ts` | 新增 | 验证所有 `*-registry.ts` 和 `public/templates` 中 HTML 的匹配一致性。 |
| `tests/macro-export.test.ts` | 新增 | 测试 `AssemblyParser` 当引入的宏组件导出无效或挂载点拼写错误时的容错表现。 |

## 下游消费影响
- **核心实验引擎 (Engine)**：引入这些测试后，如果相关引擎实现（TickEngine 等）无法通过基准和安全测试，将被要求同步进行底层安全和性能的防御修复。
- **Iframe 沙箱容器**：`postMessage` 的通讯契约需要遵守测试确定的严格 Schema 校验，确保恶意输入被直接在边界层抛弃。
- **模板注册系统**：未正确在模板目录下放置真实 HTML 而在 Registry 中空定义的项将无法通过 CI。

## 风险评估
- **P0 测试误报风险**：基准测试 (`large graph benchmark`) 可能在配置较低的 CI 机器上偶尔超时导致流水线阻塞。对策：测试中使用均值和较宽松的阈值判定，避免阻塞正常开发。
- **P1 严格校验导致正常逻辑受阻**：在强化 `postMessage` 和无效宏导出的防御时，可能会误杀一部分嵌套层级过深但合法的正常通信 Payload。对策：设立合理的 Schema 递归限制，并在测试中验证正常的复杂边界值依然能通过。
