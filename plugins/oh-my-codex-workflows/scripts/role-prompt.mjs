import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const agentsDir = path.join(root, "agents");
const command = process.argv[2] ?? "list";

function roles() {
  return fs
    .readdirSync(agentsDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md") && entry.name !== "AGENTS.md")
    .map((entry) => entry.name.replace(/\.md$/, ""))
    .sort();
}

if (command === "list") {
  console.log(roles().join("\n"));
  process.exit(0);
}

if (command === "show") {
  const role = process.argv[3];
  if (!role) {
    console.error("Usage: node scripts/role-prompt.mjs show <role>");
    process.exit(2);
  }
  const file = path.join(agentsDir, `${role}.md`);
  if (!fs.existsSync(file)) {
    console.error(`Unknown role: ${role}`);
    console.error(`Available roles: ${roles().join(", ")}`);
    process.exit(1);
  }
  console.log(fs.readFileSync(file, "utf8"));
  process.exit(0);
}

console.error("Usage: node scripts/role-prompt.mjs [list|show <role>]");
process.exit(2);

