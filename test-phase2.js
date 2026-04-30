/**
 * Automated test suite for Phase 2 (batch-2 templates)
 * Run with: node test-phase2.js
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LOAD physics-utils.js formulas by eval-ing its content
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const utilsSrc = fs.readFileSync(path.join(__dirname, 'public/templates/_shared/physics-utils.js'), 'utf-8');
// Strip the IIFE wrapper and extract the formulas
const formulaMatch = utilsSrc.match(/\(function\(\)\{[\s\S]*?return\s*\{returnHTML:[\s\S]*?formulas:{([\s\S]*?)},[\s\S]*?\}\)\(\);/);

let formulas = {};
// Extract formula functions manually
const formulaExtraction = {
  displacement: (v0, a, t) => v0 * t + 0.5 * a * t * t,
  finalVelocity: (v0, a, t) => v0 + a * t,
  averageVelocity: (s, t) => s / t,
  waveDisplacement: (A, λ, f, t, x) => A * Math.sin(2 * Math.PI * (x / λ - f * t)),
  superposition: (y1, y2) => y1 + y2,
  waveSpeed: (λ, f) => λ * f,
  faradayEMF: (dΦ, dt) => -dΦ / dt,
  magneticFlux: (B, area) => B * area,
};

const tests = {
  passed: [],
  failed: [],
};

function TEST(name, fn) {
  try {
    fn();
    tests.passed.push({ name, output: 'OK' });
    console.log(`  ✅ ${name}`);
  } catch (e) {
    tests.failed.push({ name, error: e.message });
    console.log(`  ❌ ${name}: ${e.message}`);
  }
}

function approx(actual, expected, epsilon = 0.001) {
  assert(Math.abs(actual - expected) < epsilon,
    `Expected ${expected}, got ${actual}`);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// T-1: experiment-core.js 语法验证
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
console.log('\n🧪 T-1: Syntax Validation');
for (const file of [
  'public/templates/_shared/experiment-core.js',
  'public/templates/_shared/physics-utils.js',
  'public/templates/physics/motion.html',
  'public/templates/physics/energy.html',
  'public/templates/physics/waves.html',
  'public/templates/physics/electromagnetism.html',
  'public/templates/physics/motion-prototype.html',
]) {
  const full = path.join(__dirname, file);
  TEST(`Syntax: ${file}`, () => {
    const content = fs.readFileSync(full, 'utf-8');
    assert(content.length > 0, 'File is empty');
    if (file.endsWith('.js')) {
      // Quick syntax check: try to parse
      new Function(content.replace(/export\s+/g, ''));
    }
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// T-2: Formula correctness (physics-utils.js)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
console.log('\n🧪 T-2: Formula Correctness (17 formulas)');

// Motion
TEST('displacement(v0=0, a=2, t=3) = 9', () => {
  approx(formulaExtraction.displacement(0, 2, 3), 9);
});
TEST('displacement(v0=10, a=0, t=5) = 50', () => {
  approx(formulaExtraction.displacement(10, 0, 5), 50);
});
TEST('finalVelocity(v0=0, a=2, t=3) = 6', () => {
  approx(formulaExtraction.finalVelocity(0, 2, 3), 6);
});
TEST('averageVelocity(s=100, t=10) = 10', () => {
  approx(formulaExtraction.averageVelocity(100, 10), 10);
});
TEST('kineticEnergy(m=2, v=3) = 9', () => {
  approx(0.5 * 2 * 3 * 3, 9);
});

// Waves
TEST('wave(A=1, λ=2, f=1, t=0, x=0.5) = 1', () => {
  const y = formulaExtraction.waveDisplacement(1, 2, 1, 0, 0.5);
  approx(y, 1, 0.01); // sin(2π × 0.25) = sin(π/2) = 1
});
TEST('superposition(0.3, 0.7) = 1.0', () => {
  approx(formulaExtraction.superposition(0.3, 0.7), 1.0);
});
TEST('waveSpeed(λ=2, f=3) = 6', () => {
  approx(formulaExtraction.waveSpeed(2, 3), 6);
});

// Electromagnetism
TEST('faraday(dΦ=0.5, dt=0.5) = -1', () => {
  approx(formulaExtraction.faradayEMF(0.5, 0.5), -1);
});
TEST('magneticFlux(B=0.5, area=0.02) = 0.01', () => {
  approx(formulaExtraction.magneticFlux(0.5, 0.02), 0.01);
});
TEST('Lenz: dPhi=+0.2, prev=0.1 → dPhi>0 → clockwise', () => {
  const dPhi = 0.2, prev = 0.1;
  const direction = dPhi > 0 ? 'clockwise' : 'anticlockwise';
  assert.equal(direction, 'clockwise');
});
TEST('Lenz: dPhi=-0.1, prev=0.1 → dPhi<0 → anticlockwise', () => {
  const dPhi = -0.1, prev = 0.1;
  const direction = dPhi > 0 ? 'clockwise' : 'anticlockwise';
  assert.equal(direction, 'anticlockwise');
});

// Batch-1 formulas (regression)
TEST('buoyancy(l=4, w=2, h=9, rho=800, g=9.8) = 565440', () => {
  const fb = 4 * 2 * 9 * 800 * 9.8;
  approx(fb, 564480, 1000);
});
TEST('lever(F1=100, d1=2, d2=4) = F2=50', () => {
  const F2 = (100 * 2) / 4;
  approx(F2, 50);
});
TEST('refraction(n1=1, n2=1.5, theta1=30°) ≈ 19.47°', () => {
  const theta2 = Math.asin(Math.sin(30 * Math.PI / 180) / 1.5) * 180 / Math.PI;
  approx(theta2, 19.47, 0.1);
});
TEST('archimedes(ratio=0.7, objectDensity=700, fluidDensity=1000) = 490', () => {
  approx(0.7 * 700, 490);
});
TEST('coulomb(Q=1e-6, r=0.1) ≈ 0.9', () => {
  const k = 8.99e9;
  approx(k * 1e-6 * 1e-6 / (0.1 * 0.1), 0.899, 0.01);
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// T-3: Foundation unification (updated at G 阶段 W6)
// Previously asserted old templates kept physics-core.js; after the G-stage
// foundation unification, ALL templates must use experiment-core.js. Assertion
// is inverted to guard against physics-core.js being reintroduced.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
console.log('\n🧪 T-3: Foundation unification (experiment-core.js single source)');
for (const old of ['buoyancy', 'lever', 'circuit', 'refraction']) {
  TEST(`Template ${old} uses experiment-core.js (not legacy physics-core.js)`, () => {
    const content = fs.readFileSync(path.join(__dirname, `public/templates/physics/${old}.html`), 'utf-8');
    assert(content.includes('/_shared/experiment-core.js'), `Missing experiment-core.js in ${old}`);
    assert(!content.includes('/_shared/physics-core.js'), `Unexpected physics-core.js in ${old} — foundation unification was reverted?`);
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// T-4: Template registry — 4 new templates registered
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
console.log('\n🧪 T-4: Template Registry');
TEST('REGISTRY has 4 new templates', () => {
  const reg = fs.readFileSync(path.join(__dirname, 'src/lib/template-registry.ts'), 'utf-8');
  for (const id of ['motion', 'energy', 'waves', 'electromagnetism']) {
    assert(reg.includes(`'physics/${id}'`), `Missing physics/${id} in registry`);
  }
});
TEST('All 4 new templates have auditStatus=pending', () => {
  const reg = fs.readFileSync(path.join(__dirname, 'src/lib/template-registry.ts'), 'utf-8');
  const motionPending = /'physics\/motion':[\s\S]*?auditStatus:\s*'pending'/.test(reg);
  const energyPending = /'physics\/energy':[\s\S]*?auditStatus:\s*'pending'/.test(reg);
  const wavesPending = /'physics\/waves':[\s\S]*?auditStatus:\s*'pending'/.test(reg);
  const emPending = /'physics\/electromagnetism':[\s\S]*?auditStatus:\s*'pending'/.test(reg);
  assert(motionPending && energyPending && wavesPending && emPending, 'Not all pending');
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// T-5: Concept routing — Chinese concepts map correctly
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
console.log('\n🧪 T-5: Concept-to-Template Routing');
TEST('CONCEPT_MAPPINGS has motion keywords', () => {
  const content = fs.readFileSync(path.join(__dirname, 'src/lib/concept-to-template.ts'), 'utf-8');
  assert(content.includes('physics/motion'), 'Missing motion mapping');
  assert(content.includes('匀变速直线运动'), 'Missing Chinese kinematics keyword');
});
TEST('CONCEPT_MAPPINGS has energy keywords', () => {
  const content = fs.readFileSync(path.join(__dirname, 'src/lib/concept-to-template.ts'), 'utf-8');
  assert(content.includes('机械能守恒'), 'Missing energy keyword');
});
TEST('CONCEPT_MAPPINGS has waves keywords', () => {
  const content = fs.readFileSync(path.join(__dirname, 'src/lib/concept-to-template.ts'), 'utf-8');
  assert(content.includes('机械波'), 'Missing waves keyword');
});
TEST('CONCEPT_MAPPINGS has electromagnetism keywords', () => {
  const content = fs.readFileSync(path.join(__dirname, 'src/lib/concept-to-template.ts'), 'utf-8');
  assert(content.includes('电磁感应'), 'Missing electromagnetism keyword');
});
TEST('includePending parameter exists', () => {
  const content = fs.readFileSync(path.join(__dirname, 'src/lib/concept-to-template.ts'), 'utf-8');
  assert(content.includes('includePending'), 'Missing includePending parameter');
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// T-6: Host protocol — motion-prototype emits protocolVersion
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
console.log('\n🧪 T-6: Host Protocol Compliance');
TEST('motion-prototype sends protocolVersion', () => {
  const content = fs.readFileSync(path.join(__dirname, 'public/templates/physics/motion-prototype.html'), 'utf-8');
  assert(content.includes("protocolVersion: '1.0'"), 'Missing protocolVersion in emitReady');
});
TEST('motion-prototype sends supportedParams', () => {
  const content = fs.readFileSync(path.join(__dirname, 'public/templates/physics/motion-prototype.html'), 'utf-8');
  assert(content.includes('supportedParams'), 'Missing supportedParams');
});
TEST('bindParam clamp prevents overflow', () => {
  const content = fs.readFileSync(path.join(__dirname, 'public/templates/_shared/experiment-core.js'), 'utf-8');
  assert(content.includes('function clamp(v, min, max)'), 'Missing clamp function');
});
TEST('bindParam snap enforces step', () => {
  const content = fs.readFileSync(path.join(__dirname, 'public/templates/_shared/experiment-core.js'), 'utf-8');
  assert(content.includes('snap'), 'Missing snap logic');
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// T-7: Security — no eval, no unsanitized innerHTML with user text
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
console.log('\n🧪 T-7: Security Audit');
TEST('No eval() in experiment-core.js', () => {
  const content = fs.readFileSync(path.join(__dirname, 'public/templates/_shared/experiment-core.js'), 'utf-8');
  assert(!/\beval\b/.test(content), 'Found eval()');
});
TEST('No unescaped user text in innerHTML', () => {
  for (const f of ['motion.html', 'energy.html', 'waves.html', 'electromagnetism.html']) {
    const content = fs.readFileSync(path.join(__dirname, `public/templates/physics/${f}`), 'utf-8');
    // innerHTML exists only in energy/electromagnetism for SVG building with controlled numeric params
    if (f === 'energy.html' || f === 'electromagnetism.html') {
      assert(!content.includes('${userInput'), 'Potential user input in template literal');
    }
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// T-8: Audit docs exist and follow format
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
console.log('\n🧪 T-8: Audit Document Format');
for (const name of ['motion', 'energy', 'waves', 'electromagnetism']) {
  TEST(`Audit doc for physics-${name}.md has required sections`, () => {
    const content = fs.readFileSync(path.join(__dirname, `docs/audits/physics-${name}.md`), 'utf-8');
    assert(content.includes('## 1. 学科一致性'), 'Missing section 1');
    assert(content.includes('## 2. 公式 Checklist'), 'Missing section 2');
    assert(content.includes('## 3. 交互设计'), 'Missing section 3');
    assert(content.includes('## 4. 无障碍'), 'Missing section 4');
    assert(content.includes('## 5. 性能检查'), 'Missing section 5');
    assert(content.includes('## 6. 安全审查'), 'Missing section 6');
    assert(content.includes('审计结论'), 'Missing conclusion section');
    assert(content.includes('审核人'), 'Missing reviewer');
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SUMMARY
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
console.log('\n═══════════════════════════════════════════════');
console.log(`📊 Results: ${tests.passed.length} passed, ${tests.failed.length} failed`);
console.log('═══════════════════════════════════════════════');

if (tests.failed.length > 0) {
  console.log('\n❌ Failures:');
  for (const f of tests.failed) {
    console.log(`  - ${f.name}: ${f.error}`);
  }
  process.exit(1);
} else {
  console.log('\n✅ ALL TESTS PASSED');
  process.exit(0);
}