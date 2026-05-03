const fs = require('fs');
const path = require('path');

const physicsDir = path.join(__dirname, 'public', 'templates', 'physics');
const chemistryDir = path.join(__dirname, 'public', 'templates', 'chemistry');
const registryFile = path.join(__dirname, 'src', 'lib', 'template-registry.ts');

const templatesToDelete = [
  'physics/work-power',
  'physics/friction',
  'physics/phase-change',
  'physics/lever',
  'physics/refraction',
  'physics/quantum-entanglement',
  'physics/motion',
  'physics/energy',
  'physics/waves',
  'physics/electromagnetism',
  'physics/reflection',
  'physics/lens',
  'physics/heat',
  'physics/sound',
  'chemistry/combustion-conditions'
];

templatesToDelete.forEach(id => {
  const filePath = path.join(__dirname, 'public', 'templates', `${id}.html`);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`Deleted ${id}.html`);
  }
});

// Also delete any .v1-legacy backups
const dirs = [physicsDir, chemistryDir];
dirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach(file => {
      if (file.endsWith('.v1-legacy') || file.endsWith('.v2-atomic-legacy')) {
        fs.unlinkSync(path.join(dir, file));
        console.log(`Deleted backup ${file}`);
      }
    });
  }
});

// Clean up registry
let registryCode = fs.readFileSync(registryFile, 'utf8');

templatesToDelete.forEach(id => {
  // We look for `'prefix/name': {` to `},`
  // But they might have nested brackets. Let's use a regex carefully or just string manipulation.
  const blockStart = `  '${id}': {`;
  const idx = registryCode.indexOf(blockStart);
  if (idx !== -1) {
    let bracketCount = 0;
    let endIdx = -1;
    for (let i = idx + blockStart.length - 1; i < registryCode.length; i++) {
      if (registryCode[i] === '{') bracketCount++;
      if (registryCode[i] === '}') {
        bracketCount--;
        if (bracketCount === 0) {
          endIdx = i + 1;
          if (registryCode[endIdx] === ',') endIdx++; // trailing comma
          break;
        }
      }
    }
    if (endIdx !== -1) {
      registryCode = registryCode.substring(0, idx) + registryCode.substring(endIdx);
      console.log(`Removed ${id} from registry`);
    }
  }
});

fs.writeFileSync(registryFile, registryCode);
console.log('Done!');
