import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const forbiddenDirectories = new Set([
  "contracts",
  "migrations",
  "packages",
  "server",
  "src",
  "trigger",
]);

const forbiddenPatterns = [
  /DATABASE_URL|TRIGGER_SECRET_KEY|STRIPE_SECRET_KEY/,
  /from\s+["']@\/src\//,
  /from\s+["']@\/lib\//,
  /adminRecovery|AdminRecovery|\/admin\/recovery\//,
  /workspace:/,
];

const rootEntries = await readdir(".", { withFileTypes: true });
const failures = [];

for (const entry of rootEntries) {
  if (entry.isDirectory() && forbiddenDirectories.has(entry.name)) {
    failures.push(`Unexpected private-source directory: ${entry.name}`);
  }
}

async function listFiles({ directory }) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name === ".git" || entry.name === "dist" || entry.name === "node_modules") {
      continue;
    }
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFiles({ directory: path })));
      continue;
    }
    if (/\.(json|md|mjs|ts|yml)$/.test(entry.name)) {
      files.push(path);
    }
  }

  return files;
}

for (const file of await listFiles({ directory: "." })) {
  if (file === "scripts/check-boundary.mjs") {
    continue;
  }
  const content = await readFile(file, "utf8");
  for (const pattern of forbiddenPatterns) {
    if (pattern.test(content)) {
      failures.push(`${file}: matched ${pattern}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Eve-only source boundary violations found:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exitCode = 1;
}
