#!/usr/bin/env bash
# scripts/arch-audit.sh — F 阶段物理边界审计
# 零新 npm 依赖 · 纯 node fs + 正则 · CI 可直接接入
#
# Checks:
#   1. contracts/ 不 import runtime | builders | domains
#   2. runtime/   不 import builders | domains
#   3. builders/  不 import domains
#   4. 外部代码（editor | engines | components）不伸进 framework 内部分层
#
# Exit: 0 = all pass · 1 = violations found

set -e

cd "$(dirname "$0")/.."

node - <<'EOF'
const fs = require('fs');
const path = require('path');

let totalViolations = 0;

function walk(dir, out) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name === '__tests__') continue;
      walk(p, out);
    } else if (p.endsWith('.ts') || p.endsWith('.tsx')) {
      out.push(p);
    }
  }
}

function checkDir(dir, forbidden, label, allowlist = []) {
  const files = [];
  walk(dir, files);
  let violations = 0;
  for (const f of files) {
    const code = fs.readFileSync(f, 'utf8');
    for (const forb of forbidden) {
      const re = new RegExp(`from ['"][^'"]*\\/${forb}\\/([^'"\\/]+)`, 'g');
      for (const m of code.matchAll(re)) {
        const importedFile = m[1];
        // Check allowlist: { dirPattern, importedFile } escape hatch
        const allowed = allowlist.some(a => f.includes(a.file) && a.allows.includes(importedFile));
        if (allowed) continue;
        console.error(`❌ ${label}: ${f.replace(/\\/g, '/')} → ${m[0]}`);
        violations++;
      }
    }
  }
  if (violations === 0) console.log(`✅ [${label}] ${files.length} files clean`);
  totalViolations += violations;
}

// 1. contracts/ must not import runtime | builders | domains
//    EXCEPTION (F 阶段明示): contracts/graph.ts 的 DomainGraph class 本身是 reference impl，
//    使用 runtime/union-find（pure util class）是合理的。未来重构可把 DomainGraph 整体搬入 runtime。
//    此例外记录在 docs/architecture-constraints.md · 不是隐藏违规，是明示妥协。
checkDir('src/lib/framework/contracts',
  ['runtime', 'builders', 'domains'],
  'contracts/ → forbidden downstream',
  [{ file: 'graph.ts', allows: ['union-find'] }]);

// 2. runtime/ must not import builders | domains
checkDir('src/lib/framework/runtime',
  ['builders', 'domains'],
  'runtime/ → forbidden downstream');

// 3. builders/ must not import domains
checkDir('src/lib/framework/builders',
  ['domains'],
  'builders/ → forbidden downstream');

// 4. External code (editor/engines/components) must not reach into
//    framework/contracts|runtime|builders internal paths (barrel only)
function checkExternal() {
  const dirs = ['src/lib/editor', 'src/lib/engines', 'src/components'];
  let violations = 0;
  const all = [];
  for (const d of dirs) walk(d, all);
  for (const f of all) {
    const code = fs.readFileSync(f, 'utf8');
    const re = /from ['"]@\/lib\/framework\/(contracts|runtime|builders)[^'"]+['"]/g;
    for (const m of code.matchAll(re)) {
      console.error(`❌ external-bypass: ${f.replace(/\\/g, '/')} → ${m[0]}`);
      violations++;
    }
  }
  if (violations === 0) console.log(`✅ [external barrel-only] ${all.length} files clean`);
  totalViolations += violations;
}
checkExternal();

console.log('');
if (totalViolations > 0) {
  console.error(`\n❌ arch-audit FAILED: ${totalViolations} violation(s)`);
  process.exit(1);
}
console.log('✅ arch-audit all checks passed');
EOF
