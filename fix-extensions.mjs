// fix-extensions.mjs
// Recursively fix .js extensions in local imports/exports for ESM compatibility
import { promises as fs } from 'fs';
import path from 'path';

const TARGET_DIR = './netlify/framework';
const importExportRegex = /(import|export)\s+(?:[\s\S]*?\s+from\s+)?['"](\.?\.\/[^'"\s]+)['"]/g;

async function fixFile(filePath) {
  let content = await fs.readFile(filePath, 'utf8');
  let changed = false;

  content = content.replace(importExportRegex, (match, type, importPath) => {
    if (importPath.endsWith('.js') || importPath.endsWith('.json')) return match;
    if (importPath.match(/[\?#]/)) return match;
    if (importPath.startsWith('.')) {
      // Remove .ts/.mts/.cts/.d.ts and add .js
      const fixed = importPath.replace(/\.(ts|mts|cts|d\.ts)$/, '') + '.js';
      changed = true;
      return match.replace(importPath, fixed);
    }
    return match;
  });

  if (changed) {
    await fs.writeFile(filePath, content, 'utf8');
    console.log(`Fixed: ${filePath}`);
  }
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(fullPath);
    } else if (entry.isFile() && /\.(ts|mts|cts)$/.test(entry.name)) {
      await fixFile(fullPath);
    }
  }
}

walk(TARGET_DIR).then(() => {
  console.log('All files processed.');
});
