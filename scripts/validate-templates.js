/**
 * Template Validation Script — Build-time guard
 *
 * Scans all HTML templates in public/templates/ and validates:
 *  - Complete HTML5 document structure (DOCTYPE, html, head, body)
 *  - Proper opening/closing tags
 *  - Presence of <template-metadata> block
 *
 * Exit code 0 = all templates valid
 * Exit code 1 = one or more templates failed validation
 *
 * Usage:
 *   node scripts/validate-templates.js
 *   node scripts/validate-templates.js --fix  (attempts to auto-fix simple issues)
 */

const fs = require('fs');
const path = require('path');

const TEMPLATES_DIR = path.join(__dirname, '..', 'public', 'templates');

// Simple structural checks (mirrors validateTemplateFile in template-registry.ts)
function validateTemplateFile(content, filePath) {
  const errors = [];

  if (!content || typeof content !== 'string') {
    errors.push('Template content is empty or not a string');
    return errors;
  }

  const trimmed = content.trim();

  if (!/<!DOCTYPE\s+html/i.test(trimmed)) {
    errors.push('Missing or invalid <!DOCTYPE html> declaration');
  }

  if (!/<html[\s>]/i.test(trimmed)) {
    errors.push('Missing <html> tag');
  }

  if (!/<\/html>/i.test(trimmed)) {
    errors.push('Missing </html> closing tag');
  }

  if (!/<head[\s>]/i.test(trimmed)) {
    errors.push('Missing <head> tag');
  }

  if (!/<\/head>/i.test(trimmed)) {
    errors.push('Missing </head> closing tag');
  }

  if (!/<body[\s>]/i.test(trimmed)) {
    errors.push('Missing <body> tag');
  }

  if (!/<\/body>/i.test(trimmed)) {
    errors.push('Missing </body> closing tag');
  }

  if (!/<template-metadata>/i.test(trimmed)) {
    errors.push('Missing <template-metadata> block (optional but recommended)');
  }

  return errors;
}

function findHtmlFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findHtmlFiles(fullPath, files);
    } else if (entry.name.endsWith('.html')) {
      files.push(fullPath);
    }
  }
  return files;
}

function main() {
  console.log('\n🔍 Validating HTML templates...\n');

  if (!fs.existsSync(TEMPLATES_DIR)) {
    console.error(`❌ Templates directory not found: ${TEMPLATES_DIR}`);
    process.exit(1);
  }

  const htmlFiles = findHtmlFiles(TEMPLATES_DIR);
  console.log(`Found ${htmlFiles.length} HTML template(s)\n`);

  let totalErrors = 0;
  let totalWarnings = 0;
  let failedFiles = 0;
  let warnFiles = 0;

  for (const filePath of htmlFiles) {
    const relativePath = path.relative(process.cwd(), filePath);
    const content = fs.readFileSync(filePath, 'utf-8');
    const errors = validateTemplateFile(content, filePath);

    const criticalErrors = errors.filter((e) => !e.includes('optional'));
    const warnings = errors.filter((e) => e.includes('optional'));

    if (errors.length === 0) {
      console.log(`  ✅ ${relativePath}`);
    } else if (criticalErrors.length === 0) {
      console.log(`  ⚠️  ${relativePath}`);
      for (const err of warnings) {
        console.log(`      → ${err}`);
      }
      totalWarnings += warnings.length;
      warnFiles++;
    } else {
      console.log(`  ❌ ${relativePath}`);
      for (const err of criticalErrors) {
        console.log(`      → ${err}`);
      }
      totalErrors += criticalErrors.length;
      failedFiles++;
    }
  }

  console.log('');

  if (totalErrors === 0 && totalWarnings === 0) {
    console.log(`✅ All ${htmlFiles.length} template(s) passed validation.`);
    process.exit(0);
  }

  if (totalErrors === 0 && totalWarnings > 0) {
    console.log(`⚠️  All ${htmlFiles.length} template(s) structurally valid, ${warnFiles} file(s) have ${totalWarnings} optional warning(s).`);
    process.exit(0);
  }

  console.log(`❌ Validation failed: ${failedFiles} file(s) with ${totalErrors} critical error(s).`);
  console.log('   Fix the issues above before building.');
  process.exit(1);
}

main();
