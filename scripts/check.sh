#!/usr/bin/env bash
#
# scripts/check.sh — 统一质量闸门（E 阶段 · AC-E11）
#
# 每次 /wf TEST 阶段必跑；本地开发 commit 前推荐手动跑。
# 依次执行：tsc --noEmit / jest / eslint
# 任一非零退出码视为 TEST 失败。
#
# Usage:
#   bash ./scripts/check.sh
#
# Exit codes:
#   0 = 全部通过
#   1 = TSC 失败
#   2 = Jest 失败
#   3 = ESLint 失败

set -e

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  Quality Check (tsc + jest + eslint)"
echo "═══════════════════════════════════════════════════════════════"

echo ""
echo "▶ Step 1/3: TypeScript strict check (npx tsc --noEmit)"
echo "---------------------------------------------------------------"
if ! npx tsc --noEmit; then
  echo ""
  echo "✗ TSC FAILED — fix type errors before proceeding"
  exit 1
fi
echo "✓ TSC: 0 errors"

echo ""
echo "▶ Step 2/3: Unit/integration tests (npx jest)"
echo "---------------------------------------------------------------"
if ! npx jest --passWithNoTests --silent; then
  echo ""
  echo "✗ JEST FAILED — fix test failures before proceeding"
  exit 2
fi
echo "✓ Jest: all tests passed"

echo ""
echo "▶ Step 3/3: Lint (npx eslint)"
echo "---------------------------------------------------------------"
if ! npx eslint . --max-warnings=0 --quiet; then
  echo ""
  echo "✗ ESLINT FAILED — fix lint issues before proceeding"
  exit 3
fi
echo "✓ ESLint: 0 warnings"

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  ✓ All quality gates passed"
echo "═══════════════════════════════════════════════════════════════"
exit 0
