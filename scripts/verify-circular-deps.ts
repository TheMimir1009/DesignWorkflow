/**
 * Circular Dependency Verification Script
 * SPEC-DOCEDIT-002: Verify no circular dependencies exist
 */

import fs from 'fs';
import path from 'path';

interface ImportMap {
  [file: string]: string[];
}

function extractImports(filePath: string): string[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const imports: string[] = [];

  // Match ES6 imports from local files
  const importRegex = /from ['"]\.\/([^'"]+)['"]/g;
  let match;

  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }

  return imports;
}

function buildImportMap(dir: string): ImportMap {
  const importMap: ImportMap = {};
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.ts') || f.endsWith('.tsx'));

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const imports = extractImports(filePath);
    importMap[file] = imports;
  });

  return importMap;
}

function detectCircularDependencies(importMap: ImportMap): string[][] {
  const circles: string[][] = [];
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function dfs(file: string, path: string[]): void {
    if (recursionStack.has(file)) {
      const cycleStart = path.indexOf(file);
      circles.push([...path.slice(cycleStart), file]);
      return;
    }

    if (visited.has(file)) {
      return;
    }

    visited.add(file);
    recursionStack.add(file);

    const imports = importMap[file] || [];
    imports.forEach((imp) => {
      const importedFile = imp.endsWith('.ts') || imp.endsWith('.tsx') ? imp : `${imp}.ts`;
      dfs(importedFile, [...path, file]);
    });

    recursionStack.delete(file);
  }

  Object.keys(importMap).forEach((file) => {
    dfs(file, []);
  });

  return circles;
}

function main() {
  const componentsDir = path.join(process.cwd(), 'src/components/document');
  const importMap = buildImportMap(componentsDir);
  const circles = detectCircularDependencies(importMap);

  console.log('=== SPEC-DOCEDIT-002: Circular Dependency Verification ===\n');
  console.log('Checking files in:', componentsDir);
  console.log('\nImport Map:');
  Object.entries(importMap).forEach(([file, imports]) => {
    console.log(`  ${file}:`, imports.length > 0 ? imports.join(', ') : 'No local imports');
  });

  console.log('\n--- Results ---');
  if (circles.length === 0) {
    console.log('✅ No circular dependencies detected!');
    console.log('\n✅ SPEC-DOCEDIT-002 implementation is successful.');
    process.exit(0);
  } else {
    console.log('❌ Circular dependencies detected:');
    circles.forEach((circle, index) => {
      console.log(`\n  Circle ${index + 1}:`, circle.join(' → '));
    });
    console.log('\n❌ SPEC-DOCEDIT-002 implementation has issues.');
    process.exit(1);
  }
}

main();
