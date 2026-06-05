import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const workspace = path.resolve(root, "..", "..");
const manifestPath = path.join(root, ".codex-plugin", "plugin.json");
const marketplacePath = path.join(workspace, ".agents", "plugins", "marketplace.json");
const expectedAgents = [
  "analyst",
  "architect",
  "code-reviewer",
  "code-simplifier",
  "critic",
  "debugger",
  "designer",
  "document-specialist",
  "executor",
  "explore",
  "git-master",
  "planner",
  "qa-tester",
  "scientist",
  "security-reviewer",
  "test-engineer",
  "tracer",
  "verifier",
  "writer",
];

const errors = [];

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    errors.push(`${file}: invalid JSON: ${error.message}`);
    return null;
  }
}

function requireString(object, key, label) {
  if (!object || typeof object[key] !== "string" || object[key].trim() === "") {
    errors.push(`${label}.${key} must be a non-empty string`);
  }
}

function assertNoTodo(value, label) {
  const text = JSON.stringify(value);
  if (text.includes("[TODO:") || text.includes("TODO")) {
    errors.push(`${label} still contains scaffold TODO placeholders`);
  }
}

const manifest = readJson(manifestPath);
if (manifest) {
  assertNoTodo(manifest, "plugin.json");
  for (const key of ["name", "version", "description", "license", "skills"]) {
    requireString(manifest, key, "plugin.json");
  }
  if (!/^\d+\.\d+\.\d+$/.test(manifest.version ?? "")) {
    errors.push("plugin.json.version should be semantic version x.y.z");
  }
  if (manifest.name !== path.basename(root)) {
    errors.push(`plugin.json.name must match plugin folder '${path.basename(root)}'`);
  }

  const skillsDir = path.resolve(root, manifest.skills ?? "");
  if (!fs.existsSync(skillsDir) || !fs.statSync(skillsDir).isDirectory()) {
    errors.push(`skills directory does not exist: ${skillsDir}`);
  } else {
    const skillDirs = fs
      .readdirSync(skillsDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();

    if (skillDirs.length === 0) {
      errors.push("skills directory must contain at least one skill");
    }

    const names = new Set();
    for (const dir of skillDirs) {
      const skillPath = path.join(skillsDir, dir, "SKILL.md");
      if (!fs.existsSync(skillPath)) {
        errors.push(`${dir}: missing SKILL.md`);
        continue;
      }
      const body = fs.readFileSync(skillPath, "utf8");
      const frontmatter = body.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      if (!frontmatter) {
        errors.push(`${dir}: missing YAML frontmatter`);
        continue;
      }
      const name = frontmatter[1].match(/^name:\s*(.+)$/m)?.[1]?.trim();
      const description = frontmatter[1].match(/^description:\s*(.+)$/m)?.[1]?.trim();
      if (!name) errors.push(`${dir}: frontmatter missing name`);
      if (!description) errors.push(`${dir}: frontmatter missing description`);
      if (name && name !== dir) errors.push(`${dir}: frontmatter name must match folder`);
      if (name && names.has(name)) errors.push(`${dir}: duplicate skill name '${name}'`);
      if (name) names.add(name);
    }
  }

  const prompts = manifest.interface?.defaultPrompt ?? [];
  if (!Array.isArray(prompts) || prompts.length > 3) {
    errors.push("interface.defaultPrompt must be an array of at most 3 entries");
  } else {
    prompts.forEach((prompt, index) => {
      if (typeof prompt !== "string" || prompt.length > 128) {
        errors.push(`interface.defaultPrompt[${index}] must be a string <= 128 chars`);
      }
    });
  }
}

const marketplace = readJson(marketplacePath);
if (marketplace) {
  assertNoTodo(marketplace, "marketplace.json");
  requireString(marketplace, "name", "marketplace.json");
  const entry = marketplace.plugins?.find((plugin) => plugin.name === path.basename(root));
  if (!entry) {
    errors.push(`marketplace missing plugin entry '${path.basename(root)}'`);
  } else {
    const resolved = path.resolve(workspace, entry.source?.path ?? "");
    if (resolved !== root) {
      errors.push(`marketplace source path resolves to ${resolved}, expected ${root}`);
    }
    if (entry.source?.source !== "local") errors.push("marketplace source.source must be local");
    if (!entry.policy?.installation) errors.push("marketplace policy.installation is required");
    if (!entry.policy?.authentication) errors.push("marketplace policy.authentication is required");
    if (!entry.category) errors.push("marketplace category is required");
  }
}

for (const file of ["README.md", "NOTICE.md"]) {
  if (!fs.existsSync(path.join(root, file))) {
    errors.push(`${file} is required for usage and attribution`);
  }
}

if (!fs.existsSync(path.join(root, "scripts", "role-prompt.mjs"))) {
  errors.push("scripts/role-prompt.mjs is required for role inspection");
}
if (!fs.existsSync(path.join(root, "scripts", "install-global.mjs"))) {
  errors.push("scripts/install-global.mjs is required for OMC-like global install");
}
if (!fs.existsSync(path.join(root, "scripts", "omc-orchestrator.mjs"))) {
  errors.push("scripts/omc-orchestrator.mjs is required for OMC runtime orchestration");
}

const agentsDir = path.join(root, "agents");
if (!fs.existsSync(agentsDir) || !fs.statSync(agentsDir).isDirectory()) {
  errors.push(`agents directory does not exist: ${agentsDir}`);
} else {
  if (!fs.existsSync(path.join(agentsDir, "AGENTS.md"))) {
    errors.push("agents/AGENTS.md catalog is required");
  }
  for (const name of expectedAgents) {
    const file = path.join(agentsDir, `${name}.md`);
    if (!fs.existsSync(file)) {
      errors.push(`agents/${name}.md is required`);
      continue;
    }
    const body = fs.readFileSync(file, "utf8");
    if (!body.includes("Native type:")) {
      errors.push(`agents/${name}.md must declare a Native type`);
    }
    if (!body.includes("## Mission")) {
      errors.push(`agents/${name}.md must include Mission`);
    }
    if (!body.includes("## Prompt Addendum")) {
      errors.push(`agents/${name}.md must include Prompt Addendum`);
    }
  }
}

if (errors.length > 0) {
  console.error("Plugin validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Plugin validation passed.");
console.log(`Validated ${manifest.name} ${manifest.version}`);
