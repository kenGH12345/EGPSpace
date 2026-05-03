## 回顾记录
1. `src/lib/concept-to-template.ts` : 补齐了遗漏的 `chemistry/` 前缀，解决硬编码路径缺失导致路由失败的问题。
2. `src/app/page.tsx`: 对生成的 `schema` 进行安全地强制注入 `_templateId`，防范直接依赖详情页再解析。
3. `src/components/ExperimentRenderer.tsx` : `resolveTemplateId` 函数及组件入口处针对三锁机制执行了彻底重构，只要带有 `_templateId` 或能推导出的 ID 在白名单，就断言拦截 `EditorShell` 回退。

本修改直接实现了所有必须要求（P0），同时包含了性价比极高的防御性重构（主页注入 ID）。目前流程已经测试通过并完整执行完毕。