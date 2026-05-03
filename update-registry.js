const fs = require('fs');
const path = require('path');

const filePath = path.resolve('src/lib/template-registry.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Regex to find template entries that don't have atomVersion
// Match: `tags: ['...'],\n  },` -> `tags: ['...'],\n    atomVersion: 'v3-component',\n  },`
// We need to be careful not to match ones that already have it.
content = content.replace(/(tags:\s*\[[^\]]+\](?:,\s*)?)\n\s*\}/g, "$1\n    atomVersion: 'v3-component',\n  }");

fs.writeFileSync(filePath, content, 'utf8');
console.log('Registry updated successfully.');
