# 实验模板格式规范

> 所有位于 `public/templates/` 下的 HTML 实验模板必须遵循本文档定义的格式规范。

## 概述

实验模板是独立的 HTML5 文档，通过 iframe 嵌入到主应用中。完整的 HTML 文档结构是模板能够被浏览器正确渲染的**基本要求**。

## 强制要求

每个 `.html` 模板文件必须是**完整的 HTML5 文档**，包含以下结构：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>实验标题</title>
</head>
<body>
  <!-- 实验内容 -->
</body>
</html>
```

### 校验清单

| 检查项 | 状态 | 说明 |
|--------|------|------|
| `<!DOCTYPE html>` | 强制 | 文档类型声明 |
| `<html>` 标签 | 强制 | 根元素 |
| `</html>` 闭合标签 | 强制 | 根元素闭合 |
| `<head>` 标签 | 强制 | 头部区域 |
| `</head>` 闭合标签 | 强制 | 头部区域闭合 |
| `<body>` 标签 | 强制 | 主体区域 |
| `</body>` 闭合标签 | 强制 | 主体区域闭合 |
| `<template-metadata>` | 推荐 | 实验元数据块 |

## 为什么必须完整

缺少 HTML 文档结构会导致：

1. **浏览器无法识别为有效 HTML** — `template-metadata` 中的 JSON 会被当作纯文本渲染
2. **iframe 渲染异常** — 模板内容在 iframe 中显示为乱码或空白
3. **postMessage 通信失败** — 实验结果无法回传到父页面

## 自动化校验

### 构建时校验

`pnpm build` 会自动运行模板校验：

```bash
node scripts/validate-templates.js
```

- 所有**强制**检查项未通过 → 构建失败
- 仅**推荐**检查项未通过 → 警告但不阻塞

### 运行时校验

`IframeExperiment` 组件在加载模板前会通过网络请求获取模板内容并执行相同的校验。如果校验失败，会显示错误状态而非渲染异常内容。

## 参考模板

已审核通过的完整模板示例：

- `public/templates/chemistry/acid-base-titration.html`

## 历史教训

> 2026-04-26: 5 个化学实验模板（acid-base-titration, electrolysis, combustion-conditions, reaction-rate, iron-rusting）因缺少 `<!DOCTYPE html>` 和基本 HTML 结构导致在 iframe 中渲染失败。此后添加本规范和自动化校验机制防止同类问题复发。
