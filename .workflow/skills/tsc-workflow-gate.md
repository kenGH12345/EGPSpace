---
name: tsc-workflow-gate
version: 1.0.0
type: standards
domains: [workflow, quality-gate, typescript]
dependencies: []
load_level: project
max_tokens: 400
triggers:
  keywords: [tsc, typescript, type-check, check.sh, quality-gate, workflow, TEST stage]
  roles: [developer, reviewer, tester]
description: "E 阶段新增强约束：每次 /wf TEST 阶段必跑 scripts/check.sh（tsc + jest + eslint）"
origin: E 阶段 AC-E11
---

# Skill: tsc-workflow-gate

> **E 阶段 AC-E11 强约束** · 防止 TSC 技术债再次堆积（FM-4 基线回归信号失灵）

## 背景 · Why

D 阶段 review 发现：B/C/D 三轮 /wf TEST 阶段只跑 `jest`，不跑 `npx tsc --noEmit`，导致 **53 个 pre-existing TSC errors** 在 4 轮工作流中未被发现。

根因：
- `ts-jest --isolated-modules` 只做**每文件内部**类型检查
- `npx tsc --noEmit` 才做**跨模块约束**检查
- Jest 绿 ≠ TSC 绿

## 规则 · Rules

### 🛑 每次 /wf TEST 阶段强制

在 TEST 阶段，**必须**执行 `bash ./scripts/check.sh` 作为 quality gate：

```bash
bash ./scripts/check.sh
```

脚本依次跑 **tsc → jest → eslint**。任一非零退出码 = TEST 失败。

### 💡 本地开发建议

Commit 前手动跑 `bash ./scripts/check.sh`，在变更推送前本地兜底。

### 等价命令（若 check.sh 不可用）

```bash
npx tsc --noEmit        # 必跑
npx jest                # 必跑
npx eslint . --max-warnings=0  # 推荐
```

## 为什么不用 `npm test` 或 `jest` 单跑？

因为它们**不包含 tsc**。`check.sh` 是单一入口，强制三件套齐跑，防止遗漏。

## 依赖

- `package.json` devDependencies 已含 typescript / jest / eslint（零新依赖）
- 需要 bash 环境（Windows 下用 git bash / WSL；Linux/Mac 原生支持）

## 违反后果

- 本轮 E 阶段修 53 errors 的工作白费
- TSC 债务再次攒起来（FM-4 再次发生）
- 下次 /wf 又要花 3h 清债
