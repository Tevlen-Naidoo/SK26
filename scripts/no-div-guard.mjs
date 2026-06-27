// Fails the build if a <div> or <span> appears in source or index.html.
// Constraint C1 from plan.md: semantic HTML only.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOTS = ['src', 'index.html'];
const EXT = /\.(ts|js|html|mjs)$/;
const BANNED = [/<div\b/i, /<span\b/i];

/** @param {string} p */
function walk(p) {
  const out = [];
  const st = statSync(p);
  if (st.isDirectory()) {
    for (const name of readdirSync(p)) out.push(...walk(join(p, name)));
  } else if (EXT.test(p)) {
    out.push(p);
  }
  return out;
}

const files = ROOTS.flatMap((r) => {
  try {
    return walk(r);
  } catch {
    return [];
  }
});

let failures = 0;
for (const file of files) {
  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    for (const rx of BANNED) {
      if (rx.test(line)) {
        console.error(`✘ ${file}:${i + 1}  ${line.trim()}`);
        failures++;
      }
    }
  });
}

if (failures > 0) {
  console.error(`\nno-div-guard: found ${failures} banned element(s). Use semantic HTML.`);
  process.exit(1);
}
console.log(`no-div-guard: clean (${files.length} files scanned).`);
