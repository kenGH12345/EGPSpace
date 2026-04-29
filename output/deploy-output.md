# F 阶段 · Deploy Output

> Session: wf-20260429132738. · 基线 e12560f → F 阶段末

## 变更清单（53 git 变更）

### 新建目录 + 文件（9）

| # | 路径 | 作用 |
|---|------|------|
| 1 | `src/lib/framework/contracts/` | 🔒 硬边界 type-dominant 层（9 文件 + index.ts）|
| 2 | `src/lib/framework/runtime/` | 🟡 impl-dominant 层（5 文件 + index.ts）|
| 3 | `src/lib/framework/builders/` | 🟢 user-facing DSL 层（1 文件 + index.ts）|
| 4 | `scripts/arch-audit.sh` | 硬约束守护脚本（零依赖 · 60 行）|
| 5 | `.workflow/skills/framework-boundary.md` | 项目级 skill（100+ 行 · 未来 /wf 必读）|

### git mv 迁移（15 核心文件）

| 原 | 新 |
|----|----|
| `components/base.ts` | `contracts/component.ts` |
| `components/graph.ts` | `contracts/graph.ts` |
| `components/port.ts` | `contracts/port.ts` |
| `components/union-find.ts` | `runtime/union-find.ts` |
| `components/registry.ts` | `runtime/registry.ts` |
| `solvers/base.ts` | `contracts/solver.ts` |
| `interactions/rule.ts` | `contracts/rule.ts` |
| `interactions/events.ts` | `contracts/events.ts` |
| `interactions/engine.ts` | `runtime/engine.ts` |
| `assembly/spec.ts` | `contracts/assembly.ts` |
| `assembly/layout.ts` | `contracts/layout.ts` |
| `assembly/errors.ts` | `contracts/errors.ts` |
| `assembly/validator.ts` | `runtime/validator.ts` |
| `assembly/assembler.ts` | `runtime/assembler.ts` |
| `assembly/fluent.ts` | `builders/fluent.ts` |

### 删除目录（4 空目录）

- `src/lib/framework/components/` （含 `assembly/index.ts` 孤儿 barrel）
- `src/lib/framework/solvers/`
- `src/lib/framework/interactions/`
- `src/lib/framework/assembly/`

### 内容修改（16 文件）

| 类别 | 文件 | 变更 |
|------|------|------|
| barrel | `framework/index.ts` | 全部 re-export 路径指向新位置 |
| barrel | `contracts/index.ts` | 新建聚合 9 exports |
| barrel | `runtime/index.ts` | 新建聚合 5 exports |
| barrel | `builders/index.ts` | 新建聚合 1 export |
| import | `domains/chemistry/*.ts`（5 文件）| 相对路径跟随 |
| import | `domains/chemistry/reactions/*.ts`（5 文件）| 相对路径跟随 |
| import | `domains/chemistry/assembly/chemistry-spec.ts` | 相对路径跟随 |
| import | `domains/circuit/*.ts`（2 文件）| 相对路径跟随 |
| import | `domains/circuit/assembly/circuit-spec.ts` | 相对路径跟随 |
| ESLint | `eslint.config.mjs` | 追加 F 阶段 no-restricted-imports rule block |
| 测试 | `framework/__tests__/assembly.test.ts` | AC-A/AC-D 目录扫描 `assembly/` → `{runtime, builders}` |
| 测试 | `framework/__tests__/layout-spec.test.ts` | AC-D1 fs path `assembly/` → `contracts/` · 删 `/s` flag |
| 测试 | `chemistry/__tests__/type-guards.test.ts` | 修 FlaskShape 字面量（E 阶段遗留）|
| 文档 | `docs/architecture-constraints.md` | C-1 物理边界写入 + E 条款归档 + 记录表第 7 条 |
| 文档 | `docs/editor-framework.md` | 加 constraints + framework-boundary 链接 |

## 验证结果

```bash
$ npx tsc --noEmit           # ✅ 0 errors
$ npx jest --no-colors       # ✅ Test Suites: 28/28 · Tests: 563/563
$ bash scripts/arch-audit.sh # ✅ contracts/ 10 files / runtime/ 6 files / builders/ 2 files / external 122 files - all clean
$ npx eslint src/lib/{editor,engines} src/components  # ✅ 0 errors, 0 warnings
```

## commit 建议（推荐 Wave 粒度，3-4 commits）

```
refactor(framework): 物理分层 W2-W5 · 15 文件迁移到 contracts/runtime/builders/（F 阶段）
feat(arch): scripts/arch-audit.sh + ESLint 规则 · 硬约束机器守护
docs(arch): architecture-constraints.md 更新 + framework-boundary.md 新建
test(framework): AC-A/AC-D/AC-D1 path 跟随 + E 遗留修（regex /s + FlaskShape）
```

或合并为 **1 个大 commit（推荐 · 保持 F 阶段作为一个原子事件）**：
```
refactor(framework): F 阶段物理分层 · 15 files mv + 硬约束四件套兑现

- 物理分层：contracts/ (9) + runtime/ (5) + builders/ (1) + domains/（零改）
- 删除 4 空目录：components/ solvers/ interactions/ assembly/
- ESLint no-restricted-imports：外部代码 barrel-only 硬规则
- scripts/arch-audit.sh：零新依赖 · 4 维度依赖方向检查 · CI-ready
- docs/architecture-constraints.md：E 软条款归档 + F 物理边界写入 + 使用记录 #7
- .workflow/skills/framework-boundary.md：100+ 行新建 · 未来 /wf 必读
- AC-F13 位移守护：单文件内容 ≤ 5 行
- 顺手修 E 阶段遗留 3 tsc errors（regex /s flag × 2 + FlaskShape 'round'）

验证：TSC 0 · Jest 563/563 · arch-audit pass · ESLint 0 · 零新依赖
```

## 回滚方案（如需）

**整体回滚**：
```bash
git reset --hard e12560f  # 回到 E 阶段末尾
```
零副作用：framework 对外 API 100% 兼容 · 下游（editor/engines/components）零依赖 F 阶段新增物。

**部分回滚**（Wave 粒度）：本轮未分 Wave commit · 若需要粒度回滚，先 commit 后按 git log 选取，但由于已全绿，无回滚必要。

## Runbook（部署流程）

1. `git add -A`
2. `git commit -m "..."` （见上 commit msg 建议）
3. `git push origin main`
4. （可选）开发中 `bash scripts/check.sh` + `bash scripts/arch-audit.sh` 作为本地提交前 gate
5. （未来）在 CI 里加 `bash scripts/arch-audit.sh` 作为 PR check

## 硬约束兑现四件套状态

| # | 件套 | 状态 | 位置 |
|---|------|------|------|
| 1 | 物理目录分层 | ✅ live | `src/lib/framework/{contracts,runtime,builders,domains}/` |
| 2 | ESLint no-restricted-imports | ✅ live | `eslint.config.mjs` |
| 3 | arch-audit.sh 零依赖守护 | ✅ live | `scripts/arch-audit.sh` |
| 4 | 文档归档 + boundary skill | ✅ live | `docs/architecture-constraints.md` + `.workflow/skills/framework-boundary.md` |

## F+1 路线图建议（非本轮）

| 选项 | 内容 | 预估 |
|------|------|------|
| G 阶段：`DomainGraph` 拆分 | 把 class 从 `contracts/graph.ts` 分离到 `runtime/graph.ts`（消除 allowlist 例外）| ~1h |
| G 阶段：`arch-audit.sh` 强化 | 加完整循环检测（DFS 或引入 madge dev dep）| ~1h |
| G 阶段：git pre-commit hook | 强制 `scripts/check.sh` + `arch-audit.sh` 作为本地 commit gate | ~30min |
| H 阶段：新 domain（physics-full）接入 | 按 framework-boundary.md 模板创建 · 验证物理边界有效性 | ~3h |
| H 阶段：触屏/多选/Drawer DDL | 历史积压功能需求 | 8-14h |

---

**F 阶段 DEPLOY READY** · 请 commit + push。
