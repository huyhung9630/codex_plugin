import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const codexHome = process.env.CODEX_HOME
  ? path.resolve(process.env.CODEX_HOME)
  : path.join(os.homedir(), ".codex");

const installs = [
  ["skills", path.join(codexHome, "skills")],
  ["agents", path.join(codexHome, "agents")],
  ["scripts", path.join(codexHome, "scripts")],
];

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(from, to);
      continue;
    }
    if (entry.isFile()) {
      fs.copyFileSync(from, to);
    }
  }
}

for (const [relative, dest] of installs) {
  const src = path.join(root, relative);
  if (!fs.existsSync(src)) {
    console.error(`Missing source directory: ${src}`);
    process.exit(1);
  }
  copyDir(src, dest);
}

console.log(`Installed Oh My Codex workflows into ${codexHome}`);
console.log("- skills -> skills/omc-*");
console.log("- role contracts -> agents/");
console.log("- helper scripts -> scripts/");
console.log("Restart Codex to load the newly installed skills.");
