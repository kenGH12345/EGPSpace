# Deploy Output · B 阶段 · 编辑器 framework

> Session: `wf-20260428234611.` · 本地落盘部署完成

## 文件清单（23 新 + 1 改 + 7 工作流 = 31 文件）

### 新增（23）

**数据层 `src/lib/editor/` (8)**
- `editor-state.ts`, `editor-state-reducer.ts`, `port-layout.ts`, `bundle-from-state.ts`
- `persistence.ts`, `editor-config.ts`, `engine-dispatch.ts`, `index.ts`

**Drawer 镜像 (2)**
- `drawers/circuit-drawers.ts`, `drawers/chemistry-drawers.ts`

**Domain config (3)**
- `domain-configs/circuit.ts`, `domain-configs/chemistry.ts`, `domain-configs/index.ts`

**React UI `src/components/editor/` (5)**
- `EditorShell.tsx`, `ComponentPalette.tsx`, `EditorCanvas.tsx`, `PropertyPanel.tsx`, `RunControls.tsx`

**路由 (1)**
- `src/app/editor/page.tsx`

**测试 (1)**
- `src/lib/editor/__tests__/editor-data-layer.test.ts`

**文档 (3)**
- `docs/editor-framework.md`
- `docs/component-framework.md`（修改 · 索引）
- `docs/domains/chemistry.md`（已存在，仅新 editor 文档被引用）

### 修改（1）

- `docs/component-framework.md` — Sibling documents 索引加入 editor-framework.md

### 工作流产出（7）

- `output/analysis.md`
- `output/architecture.md`
- `output/execution-plan.md`
- `output/code.diff`
- `output/test-report.md`
- `output/review-output.md`
- `output/deploy-output.md`

## 部署验证

| 验证 | 命令 | 结果 |
|------|------|------|
| TypeScript | `npx tsc --noEmit` | ✅ 零错 |
| Unit tests | `npx jest` | ✅ 493/493 |
| Lint | IDE diagnostics | ✅ 零错 |
| AC-B5 老模板零改 | `git diff --stat -- public/templates/...` | ✅ 空 |
| AC-B6 framework 零改 | `git diff --shortstat -- src/lib/framework/{components,solvers,interactions,assembly}` | ✅ 空 |

## Runbook · 浏览器人工验证

```bash
bash ./scripts/dev.sh        # 端口 5000
# 访问 http://localhost:5000/editor
```

**11 步人工验证场景**（见 test-report.md 详细）：
1. 拖 battery 到画布
2. 拖 resistor + bulb
3. 连 battery.positive → resistor.a
4. 完成闭合回路
5. 运行 → 显示电流数值
6. 修改 resistance → 再次运行
7. 保存 circuit-1 到 localStorage
8. 刷新页面 → 加载
9. 导出 JSON → 清空 → 导入
10. 切换到 chemistry 领域
11. 拖 flask + reagent → 连接

## 回滚方案

每波独立回滚：

| 阶段 | 文件 | 回滚 |
|------|------|------|
| M-1 基础画布 | `src/lib/editor/{editor-state,editor-state-reducer,port-layout,bundle-from-state,persistence,editor-config,index}.ts` + 测试 | `rm -rf src/lib/editor` |
| M-2 连线 + UI | `src/components/editor/` | `rm -rf src/components/editor` |
| M-3 运行 + 持久化 | `engine-dispatch.ts` + `RunControls.tsx` | 单文件回滚 |
| M-4 Domain 扩展 + 路由 | `domain-configs/` + `src/app/editor/page.tsx` | 单目录 + 单文件回滚 |

**全部回滚**一行命令：
```bash
git checkout HEAD -- src/lib/editor src/components/editor src/app/editor docs/editor-framework.md docs/component-framework.md
# 手动删除上述新建目录
rm -rf src/lib/editor src/components/editor src/app/editor docs/editor-framework.md
```

## 依赖变更

**零新依赖**。使用的库都已在 `package.json`：
- `react` / `react-dom` · Next.js
- `tailwindcss` · 已用
- `@/lib/framework` · 项目内部

## Commit Message 建议

**选项 A — 单 commit**：
```
feat(editor): 交互式实验搭建器 framework (B 阶段)

引入 /editor 路由提供拖拽+连线+持久化的实验搭建界面。
数据层纯 TS (zero React · jest-testable)，UI 层 React Client Component。

核心交付：
- EditorState + 15 action reducer (src/lib/editor/)
- EditorDomainConfig 插件点（circuit + chemistry 两个实例）
- Canvas drawer + DOM 端口 hotspot 混合渲染
- AssemblyBundle 导出 / localStorage 持久化 / JSON import-export
- 按 domain 动态 import engine (code-split friendly)

Tests: 28 新增 · 493/493 总绿
Framework 核心零改 · 老模板零改 · 零新依赖
Session: wf-20260428234611
```

**选项 B — 分波 commit**（推荐保留历史粒度）：
```
W0: feat(editor/data): 纯 TS 数据层 + 28 单测（EditorState/reducer/port-layout/persistence/bundle-from-state）
W1: feat(editor/ui): React UI 层（EditorShell + Palette + Canvas + drawers）
W3: feat(editor/run): 引擎分派 + RunControls + 导入导出
W4: feat(editor/chemistry): chemistry domain config 扩展 + /editor 路由 + 文档
```

## 后续建议

✅ **B 阶段交付完毕**。C 阶段可根据优先级选择启动方向：

1. **自动布局 + 正交布线**（体验质量） · ~8h
2. **撤销/重做 undo/redo**（低成本，reducer 已就位） · ~3h
3. **服务端持久化 + 分享**（C 端可用） · ~15h
4. **Drawer DDL（声明式绘图语言）**（消除 JS/TS 双端漂移风险） · ~10h
5. **性能优化**（大规模元件下的虚拟化渲染） · ~6h
6. **触屏支持**（移动端体验） · ~4h
7. **新 domain 扩展**（optics / mechanics / biology） · 每个 ~3h

## 总结

| 指标 | 数值 |
|------|------|
| 任务完成 | 22/22 |
| 测试 | 493/493 PASS |
| 新增测试 | 28 |
| 新文件 | 23 |
| 改动文件 | 1 |
| 工作流产出 | 7 |
| TSC 错误 | 0 |
| 新依赖 | 0 |
| 实际耗时 | ~1.5h（预估 3.5h） |
| framework 核心改动 | 0 |
| 老实验模板改动 | 0 byte |
