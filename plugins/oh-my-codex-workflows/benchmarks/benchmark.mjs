import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const workspace = path.resolve(root, "..", "..");
const sourceRoot = path.join(workspace, "_source", "oh-my-claudecode");
const sourceSkillsDir = path.join(sourceRoot, "skills");
const sourceAgentsDir = path.join(sourceRoot, "agents");
const skillsDir = path.join(root, "skills");
const agentsDir = path.join(root, "agents");

const args = new Set(process.argv.slice(2));
const json = args.has("--json");
const strict = args.has("--strict");

const expectedCoreSourceSkills = [
  "ask",
  "autopilot",
  "cancel",
  "ccg",
  "debug",
  "deep-dive",
  "deep-interview",
  "external-context",
  "learner",
  "omc-reference",
  "plan",
  "ralph",
  "ralplan",
  "release",
  "sciomc",
  "skill",
  "skillify",
  "team",
  "trace",
  "ultraqa",
  "ultrawork",
  "verify",
  "visual-verdict",
];

const optionalRuntimeSourceSkills = [
  "ai-slop-cleaner",
  "autoresearch",
  "configure-notifications",
  "deepinit",
  "hud",
  "mcp-setup",
  "omc-doctor",
  "omc-setup",
  "omc-teams",
  "project-session-manager",
  "remember",
  "self-improve",
  "setup",
  "wiki",
  "writer-memory",
];

const expectedRoles = [
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

const workflowReferenceChecks = [
  ["omc-keywords", "omc-autopilot"],
  ["omc-keywords", "omc-ralph"],
  ["omc-keywords", "omc-ultrawork"],
  ["omc-keywords", "omc-team"],
  ["omc-keywords", "omc-plan"],
  ["omc-keywords", "omc-deep-interview"],
  ["omc-keywords", "omc-verify"],
  ["omc-keywords", "omc-review"],
  ["omc-autopilot", "omc-ultraqa"],
  ["omc-autopilot", "omc-agents"],
  ["omc-autopilot", "verifier"],
  ["omc-autopilot", "code-reviewer"],
  ["omc-team", "omc-agents"],
  ["omc-ultrawork", "omc-agents"],
  ["omc-ralph", "verifier"],
  ["omc-review", "code-reviewer"],
  ["omc-review", "security-reviewer"],
  ["omc-verify", "verifier"],
];

const codexCompatibilityPatterns = [
  {
    pattern: /Task\(/,
    message: "Claude Code Task(...) invocation",
    allowedFiles: new Set(["BENCHMARKS.md", "EVALUATION.md"]),
  },
  {
    pattern: /TeamCreate|AgentTask|SubagentType/i,
    message: "Claude-specific agent API",
    allowedFiles: new Set(["EVALUATION.md"]),
  },
  {
    pattern: /CLAUDE_PLUGIN_ROOT|CLAUDE_CODE|ANTHROPIC_API_KEY/,
    message: "Claude runtime environment reference",
    allowedFiles: new Set(["README.md", "EVALUATION.md"]),
  },
  {
    pattern: /(^|[\s`])\/(team|autopilot|ralph)\b/m,
    message: "Claude slash-command reference",
    allowedFiles: new Set(["README.md", "EVALUATION.md"]),
  },
  {
    pattern: /\[TODO:|TODO/,
    message: "TODO placeholder",
    allowedFiles: new Set(["BENCHMARKS.md", "EVALUATION.md", "scripts/validate-plugin.mjs"]),
  },
];

function existsDir(dir) {
  return fs.existsSync(dir) && fs.statSync(dir).isDirectory();
}

function listDirs(dir) {
  if (!existsDir(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function listFilesRecursive(dir) {
  if (!existsDir(dir)) return [];
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...listFilesRecursive(full));
    if (entry.isFile()) files.push(full);
  }
  return files.sort();
}

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function relative(file) {
  return path.relative(root, file).replaceAll(path.sep, "/");
}

function parseFrontmatter(body) {
  const match = body.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) return null;
  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (kv) data[kv[1]] = kv[2].trim().replace(/^["']|["']$/g, "");
  }
  return data;
}

function ratioScore(passed, total) {
  if (total === 0) return 0;
  return Math.round((passed / total) * 1000) / 10;
}

function scoreCheck(name, weight, passed, total, details = []) {
  const score = ratioScore(passed, total);
  return {
    name,
    weight,
    passed,
    total,
    score,
    weighted: Math.round(score * weight) / 100,
    details,
  };
}

function normalizeSourceSkillName(name) {
  const aliases = new Map([
    ["ask", "omc-ask"],
    ["autopilot", "omc-autopilot"],
    ["cancel", "omc-cancel"],
    ["ccg", "omc-ccg"],
    ["debug", "omc-debug"],
    ["deep-dive", "omc-deep-dive"],
    ["deep-interview", "omc-deep-interview"],
    ["external-context", "omc-external-context"],
    ["learner", "omc-learner"],
    ["plan", "omc-plan"],
    ["ralph", "omc-ralph"],
    ["ralplan", "omc-ralplan"],
    ["release", "omc-release"],
    ["sciomc", "omc-sciomc"],
    ["skill", "omc-skill"],
    ["skillify", "omc-skillify"],
    ["team", "omc-team"],
    ["trace", "omc-trace"],
    ["ultraqa", "omc-ultraqa"],
    ["ultrawork", "omc-ultrawork"],
    ["verify", "omc-verify"],
    ["visual-verdict", "omc-visual-verdict"],
  ]);
  return aliases.get(name) ?? name;
}

function skillCoverageCheck() {
  const sourceSkills = listDirs(sourceSkillsDir);
  const codexSkills = new Set(listDirs(skillsDir));
  const coreSourceSkills = expectedCoreSourceSkills.filter((name) => sourceSkills.includes(name));
  const optionalSourceSkills = optionalRuntimeSourceSkills.filter((name) => sourceSkills.includes(name));
  const covered = coreSourceSkills.filter((name) => codexSkills.has(normalizeSourceSkillName(name)));
  const missingCore = coreSourceSkills.filter((name) => !codexSkills.has(normalizeSourceSkillName(name)));
  const intentionallyExcludedRuntime = optionalSourceSkills.filter(
    (name) => !codexSkills.has(normalizeSourceSkillName(name)),
  );

  return scoreCheck("skill coverage vs source core", 20, covered.length, coreSourceSkills.length, [
    `covered core skills: ${covered.length}/${coreSourceSkills.length}`,
    `missing core skills: ${missingCore.join(", ") || "none"}`,
    `excluded runtime skills: ${intentionallyExcludedRuntime.join(", ") || "none"}`,
  ]);
}

function frontmatterCheck() {
  const skillDirs = listDirs(skillsDir);
  const failures = [];
  let passed = 0;

  for (const dir of skillDirs) {
    const file = path.join(skillsDir, dir, "SKILL.md");
    if (!fs.existsSync(file)) {
      failures.push(`${dir}: missing SKILL.md`);
      continue;
    }

    const body = read(file);
    const frontmatter = parseFrontmatter(body);
    if (!frontmatter) {
      failures.push(`${dir}: missing frontmatter`);
      continue;
    }

    const errors = [];
    if (frontmatter.name !== dir) errors.push("name must match directory");
    if (!frontmatter.description) errors.push("description is required");
    if (frontmatter.description && frontmatter.description.length > 240) {
      errors.push("description should be concise");
    }
    if (errors.length > 0) failures.push(`${dir}: ${errors.join("; ")}`);
    else passed += 1;
  }

  return scoreCheck("frontmatter validity", 15, passed, skillDirs.length, failures);
}

function codexCompatibilityCheck() {
  const files = listFilesRecursive(root).filter((file) => {
    const rel = relative(file);
    if (rel.startsWith("benchmarks/")) return false;
    return /\.(md|mjs|json)$/.test(file);
  });
  const findings = [];

  for (const file of files) {
    const rel = relative(file);
    const text = read(file);
    for (const check of codexCompatibilityPatterns) {
      if (check.allowedFiles?.has(rel)) continue;
      if (check.pattern.test(text)) findings.push(`${rel}: ${check.message}`);
    }
  }

  return scoreCheck("Codex compatibility scan", 20, files.length - findings.length, files.length, findings);
}

function roleCoverageCheck() {
  const sourceRoles = existsDir(sourceAgentsDir) ? listFilesRecursive(sourceAgentsDir)
    .filter((file) => path.basename(file) !== "AGENTS.md" && file.endsWith(".md"))
    .map((file) => path.basename(file, ".md"))
    .sort() : expectedRoles;
  const expected = expectedRoles.filter((role) => sourceRoles.includes(role));
  const failures = [];
  let passed = 0;

  for (const role of expected) {
    const file = path.join(agentsDir, `${role}.md`);
    if (!fs.existsSync(file)) {
      failures.push(`${role}: missing role file`);
      continue;
    }

    const body = read(file);
    const errors = [];
    if (!body.includes("Native type:")) errors.push("missing Native type");
    if (!body.includes("## Mission")) errors.push("missing Mission");
    if (!body.includes("## Prompt Addendum")) errors.push("missing Prompt Addendum");
    if (!/(worker|explorer|default)/.test(body)) errors.push("missing Codex native type mapping");

    if (errors.length > 0) failures.push(`${role}: ${errors.join("; ")}`);
    else passed += 1;
  }

  return scoreCheck("role coverage", 20, passed, expected.length, failures);
}

function workflowIntegrationCheck() {
  const failures = [];
  let passed = 0;

  for (const [skill, reference] of workflowReferenceChecks) {
    const file = path.join(skillsDir, skill, "SKILL.md");
    if (!fs.existsSync(file)) {
      failures.push(`${skill}: missing skill file`);
      continue;
    }

    const body = read(file);
    if (body.includes(reference)) passed += 1;
    else failures.push(`${skill}: missing reference to ${reference}`);
  }

  return scoreCheck("workflow integration references", 15, passed, workflowReferenceChecks.length, failures);
}

function asciiCheck() {
  const files = listFilesRecursive(root).filter((file) => /\.(md|mjs|json)$/.test(file));
  const failures = [];

  for (const file of files) {
    const text = read(file);
    if (/[^\x09\x0A\x0D\x20-\x7E]/.test(text)) failures.push(`${relative(file)}: non-ASCII text`);
  }

  return scoreCheck("ASCII content", 10, files.length - failures.length, files.length, failures);
}

const checks = [
  skillCoverageCheck(),
  frontmatterCheck(),
  codexCompatibilityCheck(),
  roleCoverageCheck(),
  workflowIntegrationCheck(),
  asciiCheck(),
];

const totalWeight = checks.reduce((sum, check) => sum + check.weight, 0);
const totalScore = Math.round(
  checks.reduce((sum, check) => sum + check.score * check.weight, 0) / totalWeight,
);
const threshold = strict ? 95 : 90;
const status = totalScore >= threshold ? "pass" : "fail";

const result = {
  benchmark: "oh-my-codex-workflows-content-quality",
  status,
  score: totalScore,
  threshold,
  strict,
  checks,
  controls: {
    apiKeysRequired: false,
    dependencies: "Node built-ins only",
    sourceRoot: path.relative(workspace, sourceRoot).replaceAll(path.sep, "/"),
  },
};

if (json) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log(`Benchmark: ${result.benchmark}`);
  console.log(`Status: ${status}`);
  console.log(`Score: ${totalScore}/100 (threshold ${threshold})`);
  console.log("");
  for (const check of checks) {
    console.log(`- ${check.name}: ${check.score}/100 (${check.passed}/${check.total})`);
    for (const detail of check.details.slice(0, 8)) console.log(`  - ${detail}`);
    if (check.details.length > 8) console.log(`  - ... ${check.details.length - 8} more`);
  }
  console.log("");
  console.log("Controls: no API keys, Node built-ins only, deterministic file scans.");
}

if (status !== "pass") {
  process.exitCode = 1;
}
